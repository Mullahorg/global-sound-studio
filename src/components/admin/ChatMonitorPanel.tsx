import { useState, useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageSquare,
  Search,
  Users,
  Flag,
  Send,
  Eye,
  Filter,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
    profile?: { full_name: string | null; avatar_url: string | null; email: string | null };
  }[];
  last_message?: { content: string; created_at: string };
  message_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  message_type: string | null;
  file_url: string | null;
  file_name: string | null;
  sender?: { full_name: string | null; avatar_url: string | null; email: string | null };
}

interface ChatFlag {
  id: string;
  message_id: string;
  flagged_by: string;
  reason: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  message?: Message;
  flagger?: { full_name: string | null; email: string | null };
}

export const ChatMonitorPanel = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [flags, setFlags] = useState<ChatFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("conversations");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
    fetchFlags();

    const channel = supabase
      .channel("chat-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        if (selectedConversation) fetchMessages(selectedConversation.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_flags" }, () => {
        fetchFlags();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id]);

  const fetchConversations = async () => {
    setLoading(true);
    const { data: convData, error } = await supabase
      .from("conversations")
      .select(`
        *,
        conversation_participants (
          user_id,
          profiles:user_id (full_name, avatar_url, email)
        )
      `)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Transform data
      const conversations = (convData || []).map((conv: any) => ({
        ...conv,
        participants: conv.conversation_participants?.map((p: any) => ({
          user_id: p.user_id,
          profile: p.profiles,
        })),
      }));

      // Fetch last message for each conversation
      const enrichedConvs = await Promise.all(
        conversations.map(async (conv) => {
          const { data: msgData, count } = await supabase
            .from("messages")
            .select("content, created_at", { count: "exact" })
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            last_message: msgData || null,
            message_count: count || 0,
          };
        })
      );

      setConversations(enrichedConvs);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Fetch sender profiles
      const enrichedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, email")
            .eq("id", msg.sender_id)
            .single();
          return { ...msg, sender: profile };
        })
      );
      setMessages(enrichedMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setMessagesLoading(false);
  };

  const fetchFlags = async () => {
    const { data, error } = await supabase
      .from("chat_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Enrich with message and flagger data
      const enrichedFlags = await Promise.all(
        (data || []).map(async (flag) => {
          const [msgRes, flaggerRes] = await Promise.all([
            supabase.from("messages").select("*").eq("id", flag.message_id).single(),
            supabase.from("profiles").select("full_name, email").eq("id", flag.flagged_by).single(),
          ]);

          let sender = null;
          if (msgRes.data) {
            const senderRes = await supabase
              .from("profiles")
              .select("full_name, avatar_url, email")
              .eq("id", msgRes.data.sender_id)
              .single();
            sender = senderRes.data;
          }

          return {
            ...flag,
            message: msgRes.data ? { ...msgRes.data, sender } : null,
            flagger: flaggerRes.data,
          };
        })
      );
      setFlags(enrichedFlags);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
  };

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedConversation || !user) return;

    setSendingMessage(true);

    // First check if admin is a participant
    const isParticipant = selectedConversation.participants?.some((p) => p.user_id === user.id);

    if (!isParticipant) {
      // Add admin as participant
      await supabase.from("conversation_participants").insert({
        conversation_id: selectedConversation.id,
        user_id: user.id,
      });
    }

    // Send message
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: `[Admin] ${adminMessage}`,
      message_type: "text",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAdminMessage("");
      fetchMessages(selectedConversation.id);
    }
    setSendingMessage(false);
  };

  const handleUpdateFlag = async (flagId: string, status: string, adminNotes?: string) => {
    const { error } = await supabase
      .from("chat_flags")
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq("id", flagId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Flag updated" });
      fetchFlags();
    }
  };

  const getParticipantNames = (conv: Conversation) => {
    if (conv.title) return conv.title;
    return (
      conv.participants
        ?.map((p) => p.profile?.full_name || p.profile?.email || "Unknown")
        .join(", ") || "No participants"
    );
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const filteredConversations = conversations.filter((conv) => {
    const names = getParticipantNames(conv).toLowerCase();
    return names.includes(searchQuery.toLowerCase());
  });

  const pendingFlags = flags.filter((f) => f.status === "pending");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conversations.length}</p>
              <p className="text-sm text-muted-foreground">Conversations</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(conversations.flatMap((c) => c.participants?.map((p) => p.user_id) || [])).size}
              </p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Flag className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingFlags.length}</p>
              <p className="text-sm text-muted-foreground">Pending Flags</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flags.filter((f) => f.status === "resolved").length}</p>
              <p className="text-sm text-muted-foreground">Resolved Flags</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Flagged Messages
            {pendingFlags.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                {pendingFlags.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1 rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-colors mb-1",
                          selectedConversation?.id === conv.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {conv.participants?.slice(0, 2).map((p, i) => (
                              <Avatar key={i} className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={p.profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {(p.profile?.full_name || p.profile?.email || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{getParticipantNames(conv)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message?.content || "No messages"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {conv.last_message ? formatTime(conv.last_message.created_at) : ""}
                            </p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {conv.message_count} msgs
                            </Badge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Messages View */}
            <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card overflow-hidden flex flex-col h-[500px]">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to monitor</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{getParticipantNames(selectedConversation)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.participants?.length || 0} participants
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-48" />
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={msg.sender?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {(msg.sender?.full_name || "?").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {msg.sender?.full_name || msg.sender?.email || "Unknown"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(msg.created_at), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Admin Message Input */}
                  <div className="p-4 border-t border-border/50">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Send message as admin..."
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendAdminMessage()}
                        disabled={sendingMessage}
                      />
                      <Button onClick={handleSendAdminMessage} disabled={sendingMessage || !adminMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Messages will be prefixed with [Admin] and visible to all participants
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Flagged Messages Tab */}
        <TabsContent value="flags">
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <ScrollArea className="h-[500px]">
              {flags.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No flagged messages</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {flags.map((flag) => (
                    <div key={flag.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={flag.status === "pending" ? "destructive" : "secondary"}
                              className="capitalize"
                            >
                              {flag.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Flagged {format(new Date(flag.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3 mb-2">
                            <p className="text-sm font-medium mb-1">Message:</p>
                            <p className="text-sm text-muted-foreground">
                              {flag.message?.content || "Message deleted"}
                            </p>
                            {flag.message?.sender && (
                              <p className="text-xs text-muted-foreground mt-2">
                                From: {flag.message.sender.full_name || flag.message.sender.email}
                              </p>
                            )}
                          </div>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            {flag.reason}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Flagged by: {flag.flagger?.full_name || flag.flagger?.email || "Unknown"}
                          </p>
                          {flag.admin_notes && (
                            <p className="text-sm mt-2">
                              <span className="text-muted-foreground">Admin notes: </span>
                              {flag.admin_notes}
                            </p>
                          )}
                        </div>
                        {flag.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateFlag(flag.id, "dismissed")}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateFlag(flag.id, "resolved", "Action taken")}
                            >
                              Take Action
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
