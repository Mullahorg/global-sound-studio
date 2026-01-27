import { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  MoreVertical,
  Phone,
  Video,
  Info,
  Send,
  Smile,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Message, Conversation, useTypingIndicator } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { FileUploadButton, uploadFile, ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from "./FileUploadButton";
import { FileMessage } from "./FileMessage";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useToast } from "@/hooks/use-toast";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (content: string, messageType?: string, fileUrl?: string, fileName?: string) => Promise<any>;
  onEditMessage: (id: string, content: string) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
}

export const ChatWindow = ({
  conversation,
  messages,
  loading,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [sending, setSending] = useState(false);
  const [isUploadingDrop, setIsUploadingDrop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { typingUsers, setTyping } = useTypingIndicator(conversation?.id || null);

  const handleFileDrop = async (file: File) => {
    if (!user || !conversation) return;
    
    setIsUploadingDrop(true);
    try {
      const result = await uploadFile(file, user.id, conversation.id);
      await onSendMessage(`Shared a ${result.fileType}`, result.fileType, result.url, result.fileName);
      toast({
        title: "File uploaded",
        description: `${result.fileName} shared successfully`,
      });
    } catch (error) {
      console.error("Drop upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDrop(false);
    }
  };

  const { isDragging, dragError, dragProps, clearError } = useDragAndDrop({
    onFileDrop: handleFileDrop,
    acceptedTypes: ACCEPTED_MIME_TYPES,
    maxFileSize: MAX_FILE_SIZE,
  });

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    await onSendMessage(message, "text");
    setMessage("");
    setSending(false);
    setTyping(false, user?.email || "User");
    inputRef.current?.focus();
  };

  const handleFileUploaded = async (fileUrl: string, fileName: string, fileType: string) => {
    await onSendMessage(`Shared a ${fileType}`, fileType, fileUrl, fileName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTyping(e.target.value.length > 0, user?.email || "User");
  };

  const handleEditStart = (msg: Message) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleEditSave = async () => {
    if (editingId && editContent.trim()) {
      await onEditMessage(editingId, editContent);
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDateDivider = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const getOtherParticipantName = () => {
    const other = conversation?.participants?.find((p) => p.user_id !== user?.id);
    return other?.profile?.full_name || "Unknown User";
  };

  const getOtherParticipantAvatar = () => {
    const other = conversation?.participants?.find((p) => p.user_id !== user?.id);
    return other?.profile?.avatar_url;
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
          <p className="text-sm">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    
    if (!lastGroup || !isSameDay(lastGroup.date, msgDate)) {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      lastGroup.messages.push(msg);
    }
  });

  return (
    <div 
      className={cn(
        "h-full flex flex-col bg-background relative",
        isDragging && "ring-2 ring-primary ring-inset"
      )}
      {...dragProps}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Drop file to share</h3>
                <p className="text-sm text-muted-foreground">
                  Images, audio files, and documents up to 50MB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isUploadingDrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Uploading file...</h3>
                <p className="text-sm text-muted-foreground">Please wait</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Error Toast */}
      {dragError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg"
          onClick={clearError}
        >
          {dragError}
        </motion.div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={getOtherParticipantAvatar() || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getOtherParticipantName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {conversation.title || getOtherParticipantName()}
            </h3>
            <p className="text-xs text-muted-foreground">
              {typingUsers.length > 0
                ? `${typingUsers.join(", ")} typing...`
                : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voice Call</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Video className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Call</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Conversation Info</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground px-2">
                      {formatDateDivider(group.date)}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Messages for this date */}
                  {group.messages.map((msg, msgIndex) => {
                    const isOwn = msg.sender_id === user?.id;
                    const showAvatar =
                      !isOwn &&
                      (msgIndex === 0 ||
                        group.messages[msgIndex - 1].sender_id !== msg.sender_id);

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                          "flex gap-2 group",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar className="w-8 h-8 mt-auto">
                            <AvatarImage src={msg.sender?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {msg.sender?.full_name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}

                        <div
                          className={cn(
                            "flex flex-col max-w-[70%]",
                            isOwn ? "items-end" : "items-start"
                          )}
                        >
                          {editingId === msg.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-w-[200px]"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleEditSave}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleEditCancel}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : msg.file_url && msg.message_type !== "text" ? (
                            // File message
                            <div className="relative group">
                              <FileMessage
                                fileUrl={msg.file_url}
                                fileName={msg.file_name || "File"}
                                fileType={msg.message_type}
                                isOwn={isOwn}
                              />
                              {/* Message Actions for file messages */}
                              {isOwn && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => onDeleteMessage(msg.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          ) : (
                            // Text message
                            <div
                              className={cn(
                                "px-4 py-2 rounded-2xl relative",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              {msg.is_edited && (
                                <span className="text-[10px] opacity-60 ml-2">
                                  (edited)
                                </span>
                              )}

                              {/* Message Actions */}
                              {isOwn && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditStart(msg)}
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => onDeleteMessage(msg.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          )}
                          <span className="text-[10px] text-muted-foreground mt-1 px-1">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              </div>
              <span>{typingUsers.join(", ")} typing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <FileUploadButton
            conversationId={conversation.id}
            onFileUploaded={handleFileUploaded}
            disabled={sending}
          />
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Emoji</TooltipContent>
          </Tooltip>
          <Button
            size="icon"
            className="rounded-full shrink-0"
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
