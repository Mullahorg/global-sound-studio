import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageSquare, Plus, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Conversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({
  conversations,
  loading,
  selectedId,
  onSelect,
  onNewChat,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.title) return conv.title;
    
    const otherParticipants = conv.participants?.filter(
      (p) => p.user_id !== user?.id
    );
    
    if (otherParticipants && otherParticipants.length > 0) {
      return otherParticipants
        .map((p) => p.profile?.full_name || "Unknown")
        .join(", ");
    }
    
    return "New Conversation";
  };

  const getConversationAvatar = (conv: Conversation) => {
    const otherParticipant = conv.participants?.find(
      (p) => p.user_id !== user?.id
    );
    return otherParticipant?.profile?.avatar_url;
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv).toLowerCase();
    const lastMessage = conv.last_message?.content.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || lastMessage.includes(query);
  });

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages
          </h2>
          <Button size="sm" onClick={onNewChat} className="gap-1">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to collaborate</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    selectedId === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getConversationAvatar(conv) || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getConversationName(conv).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {(conv.unread_count || 0) > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                        variant="destructive"
                      >
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {getConversationName(conv)}
                      </span>
                      {conv.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
