import { useState } from "react";
import { 
  FileAudio, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Image as ImageIcon,
  ExternalLink,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileMessageProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  isOwn: boolean;
}

export const FileMessage = ({ fileUrl, fileName, fileType, isOwn }: FileMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAudioToggle = () => {
    if (!audioElement) {
      const audio = new Audio(fileUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "audio":
        return <FileAudio className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getFileColor = () => {
    switch (fileType) {
      case "image":
        return "text-blue-500";
      case "audio":
        return "text-purple-500";
      case "document":
        return "text-orange-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Render image preview
  if (fileType === "image" && !imageError) {
    return (
      <div className="relative group max-w-[280px]">
        {!imageLoaded && (
          <div className="w-[280px] h-[180px] bg-muted animate-pulse rounded-lg" />
        )}
        <img
          src={fileUrl}
          alt={fileName}
          className={cn(
            "rounded-lg max-w-full cursor-pointer transition-opacity hover:opacity-90",
            !imageLoaded && "hidden"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          onClick={() => window.open(fileUrl, "_blank")}
        />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-lg"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Render audio player
  if (fileType === "audio") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg min-w-[240px]",
          isOwn ? "bg-primary/20" : "bg-muted"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/30"
          onClick={handleAudioToggle}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-primary" />
          ) : (
            <Play className="w-5 h-5 text-primary ml-0.5" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">Audio file</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Render document/file preview
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg min-w-[200px] max-w-[280px]",
        isOwn ? "bg-primary/20" : "bg-muted"
      )}
    >
      <div className={cn("p-2 rounded-lg bg-background/50", getFileColor())}>
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground capitalize">{fileType} file</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => window.open(fileUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
