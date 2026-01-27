import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { useConversations, useMessages } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const Chat = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
  } = useConversations();
  
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useMessages(selectedConversationId);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  ) || null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageMeta
        title="Chat - BeatBridge Pro"
        description="Real-time chat with artists and producers for seamless project collaboration."
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with artists and producers in real-time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden shadow-lg"
          style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
        >
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 shrink-0 hidden md:block">
              <ChatSidebar
                conversations={conversations}
                loading={conversationsLoading}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
                onNewChat={() => setNewChatOpen(true)}
              />
            </div>

            {/* Mobile Sidebar Toggle + Chat */}
            <div className="flex-1 flex flex-col md:hidden">
              {!selectedConversationId ? (
                <ChatSidebar
                  conversations={conversations}
                  loading={conversationsLoading}
                  selectedId={selectedConversationId}
                  onSelect={setSelectedConversationId}
                  onNewChat={() => setNewChatOpen(true)}
                />
              ) : (
                <>
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    className="p-4 text-left text-sm text-primary hover:underline border-b border-border"
                  >
                    ← Back to conversations
                  </button>
                  <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    loading={messagesLoading}
                    onSendMessage={sendMessage}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                  />
                </>
              )}
            </div>

            {/* Desktop Chat Window */}
            <div className="flex-1 hidden md:block">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                loading={messagesLoading}
                onSendMessage={sendMessage}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* New Chat Dialog */}
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onCreateChat={async (participantIds, title) => {
          const conv = await createConversation(participantIds, title);
          if (conv) {
            setSelectedConversationId(conv.id);
          }
        }}
      />
    </div>
  );
};

export default Chat;
