import { useRef, useState } from "react";
import { Paperclip, Image, FileAudio, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createLogger } from "@/lib/errorLogger";

const logger = createLogger("FileUploadButton");

interface FileUploadButtonProps {
  conversationId: string;
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  disabled?: boolean;
}

export const ACCEPTED_TYPES = {
  image: "image/jpeg,image/png,image/gif,image/webp",
  audio: "audio/mpeg,audio/wav,audio/mp3,audio/ogg",
  document: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip",
};

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg",
  "application/pdf", "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "application/zip"
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
};

export const uploadFile = async (
  file: File,
  userId: string,
  conversationId: string
): Promise<{ url: string; fileName: string; fileType: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${conversationId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("chat-files")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // For private buckets, we need to create a signed URL
  const { data: signedData, error: signedError } = await supabase.storage
    .from("chat-files")
    .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

  if (signedError) throw signedError;

  const fileType = getFileType(file.type);
  
  return {
    url: signedData.signedUrl,
    fileName: file.name,
    fileType,
  };
};

export const FileUploadButton = ({
  conversationId,
  onFileUploaded,
  disabled,
}: FileUploadButtonProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentAccept, setCurrentAccept] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (type: keyof typeof ACCEPTED_TYPES | "all") => {
    if (type === "all") {
      setCurrentAccept(Object.values(ACCEPTED_TYPES).join(","));
    } else {
      setCurrentAccept(ACCEPTED_TYPES[type]);
    }
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFile(file, user.id, conversationId);
      onFileUploaded(result.url, result.fileName, result.fileType);

      toast({
        title: "File uploaded",
        description: `${file.name} shared successfully`,
      });
    } catch (error) {
      logger.error(error, "handleFileChange");
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={currentAccept}
        onChange={handleFileChange}
        className="hidden"
      />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full shrink-0"
                disabled={disabled || uploading}
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Attach File</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => handleFileSelect("image")}>
            <Image className="w-4 h-4 mr-2" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("audio")}>
            <FileAudio className="w-4 h-4 mr-2" />
            Audio File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("document")}>
            <FileText className="w-4 h-4 mr-2" />
            Document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleFileSelect("all")}>
            <Paperclip className="w-4 h-4 mr-2" />
            Any File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
