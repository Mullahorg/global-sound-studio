import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("useChat");

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  project_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
  participants?: {
    user_id: string;
    profile?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  }[];
  last_message?: Message;
  unread_count?: number;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch conversations with participants
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select(`
          *,
          conversation_participants (
            user_id,
            last_read_at
          )
        `)
        .order("updated_at", { ascending: false });

      if (convError) {
        logDatabaseError(convError, "conversations", "select");
        throw convError;
      }

      // Fetch participant profiles and last messages
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get participant profiles
          const participantIds = conv.conversation_participants?.map((p: { user_id: string }) => p.user_id) || [];
          
          const { data: profiles } = await supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url")
            .in("id", participantIds);

          // Get last message
          const { data: lastMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Calculate unread count
          const myParticipation = conv.conversation_participants?.find(
            (p: { user_id: string }) => p.user_id === user.id
          );
          
          let unreadCount = 0;
          if (myParticipation?.last_read_at) {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .gt("created_at", myParticipation.last_read_at)
              .neq("sender_id", user.id);
            unreadCount = count || 0;
          }

          return {
            ...conv,
            participants: conv.conversation_participants?.map((p: { user_id: string; last_read_at: string }) => ({
              ...p,
              profile: profiles?.find((pr) => pr.id === p.user_id),
            })),
            last_message: lastMessages?.[0],
            unread_count: unreadCount,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      logger.error(error, "fetchConversations");
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createConversation = async (participantIds: string[], title?: string, projectId?: string) => {
    if (!user) return null;

    try {
      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({
          title,
          project_id: projectId,
        })
        .select()
        .single();

      if (convError) {
        logDatabaseError(convError, "conversations", "insert");
        throw convError;
      }

      // Add all participants including current user
      const allParticipants = [...new Set([user.id, ...participantIds])];
      
      const { error: partError } = await supabase
        .from("conversation_participants")
        .insert(
          allParticipants.map((userId) => ({
            conversation_id: conv.id,
            user_id: userId,
          }))
        );

      if (partError) {
        logDatabaseError(partError, "conversation_participants", "insert");
        throw partError;
      }

      await fetchConversations();
      return conv;
    } catch (error) {
      logger.error(error, "createConversation");
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        logDatabaseError(error, "messages", "select");
        throw error;
      }

      // Fetch sender profiles
      const senderIds = [...new Set(data?.map((m) => m.sender_id) || [])];
      
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const messagesWithSenders = data?.map((msg) => ({
        ...msg,
        sender: profiles?.find((p) => p.id === msg.sender_id),
      })) || [];

      setMessages(messagesWithSenders);

      // Update last_read_at
      if (user) {
        await supabase
          .from("conversation_participants")
          .update({ last_read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id);
      }
    } catch (error) {
      logger.error(error, "fetchMessages");
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, toast]);

  const sendMessage = async (content: string, messageType = "text", fileUrl?: string, fileName?: string) => {
    if (!conversationId || !user || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
        })
        .select()
        .single();

      if (error) {
        logDatabaseError(error, "messages", "insert");
        throw error;
      }

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    } catch (error) {
      logger.error(error, "sendMessage");
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return null;
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent, is_edited: true })
        .eq("id", messageId);

      if (error) {
        logDatabaseError(error, "messages", "update");
        throw error;
      }
    } catch (error) {
      logger.error(error, "editMessage");
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) {
        logDatabaseError(error, "messages", "delete");
        throw error;
      }
    } catch (error) {
      logger.error(error, "deleteMessage");
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch sender profile for new message
            const { data: profile } = await supabase
              .from("public_profiles")
              .select("id, full_name, avatar_url")
              .eq("id", payload.new.sender_id)
              .single();

            const newMessage = {
              ...payload.new,
              sender: profile,
            } as Message;

            setMessages((prev) => [...prev, newMessage]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    fetchMessages,
  };
};

export const useTypingIndicator = (conversationId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter((p: any) => p.user_id !== user.id && p.is_typing)
          .map((p: any) => p.user_name);
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const setTyping = useCallback(
    async (isTyping: boolean, userName: string) => {
      if (!conversationId || !user) return;

      const channel = supabase.channel(`typing:${conversationId}`);
      await channel.track({
        user_id: user.id,
        user_name: userName,
        is_typing: isTyping,
      });
    },
    [conversationId, user]
  );

  return { typingUsers, setTyping };
};
