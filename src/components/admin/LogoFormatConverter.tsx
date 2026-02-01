import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, FileImage, Image, Smartphone, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface LogoFormat {
  name: string;
  description: string;
  size: number;
  icon: React.ElementType;
  fileName: string;
}

const LOGO_FORMATS: LogoFormat[] = [
  { name: "Favicon", description: "Browser tab icon", size: 32, icon: Globe, fileName: "favicon-32x32.png" },
  { name: "Favicon Large", description: "High-res favicon", size: 64, icon: Globe, fileName: "favicon-64x64.png" },
  { name: "Apple Touch", description: "iOS home screen", size: 180, icon: Smartphone, fileName: "apple-touch-icon.png" },
  { name: "Android Icon", description: "PWA manifest", size: 192, icon: Smartphone, fileName: "android-chrome-192x192.png" },
  { name: "Android Large", description: "PWA splash", size: 512, icon: Smartphone, fileName: "android-chrome-512x512.png" },
  { name: "OG Image", description: "Social sharing", size: 1200, icon: Image, fileName: "og-image.png" },
];

interface LogoFormatConverterProps {
  imageUrl: string;
}

export const LogoFormatConverter = ({ imageUrl }: LogoFormatConverterProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateFormat = useCallback(async (format: LogoFormat) => {
    setGenerating(format.name);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const img = document.createElement("img") as HTMLImageElement;
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      // For OG Image, we need a different aspect ratio (1200x630)
      if (format.name === "OG Image") {
        canvas.width = 1200;
        canvas.height = 630;
        ctx.fillStyle = "#0d0d0d"; // Dark background matching theme
        ctx.fillRect(0, 0, 1200, 630);
        
        // Draw logo centered
        const logoSize = 300;
        const x = (1200 - logoSize) / 2;
        const y = (630 - logoSize) / 2;
        ctx.drawImage(img, x, y, logoSize, logoSize);
      } else {
        canvas.width = format.size;
        canvas.height = format.size;
        ctx.clearRect(0, 0, format.size, format.size);
        ctx.drawImage(img, 0, 0, format.size, format.size);
      }

      // Create download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = format.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setGenerated((prev) => new Set([...prev, format.name]));
          toast({
            title: "Downloaded",
            description: `${format.fileName} has been downloaded`,
          });
        }
      }, "image/png", 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate format",
        variant: "destructive",
      });
    }

    setGenerating(null);
  }, [imageUrl, toast]);

  const downloadAll = async () => {
    for (const format of LOGO_FORMATS) {
      await generateFormat(format);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <FileImage className="w-4 h-4 text-primary" />
          Export Formats
        </h4>
        <Button variant="outline" size="sm" onClick={downloadAll}>
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LOGO_FORMATS.map((format) => {
          const Icon = format.icon;
          const isGenerating = generating === format.name;
          const isGenerated = generated.has(format.name);

          return (
            <motion.button
              key={format.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateFormat(format)}
              disabled={isGenerating}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                isGenerated
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/50 bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              {isGenerated && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${isGenerated ? "bg-primary/20" : "bg-secondary"}`}>
                  <Icon className={`w-4 h-4 ${isGenerated ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {format.size}px
                </Badge>
              </div>
              
              <p className="font-medium text-sm text-foreground">{format.name}</p>
              <p className="text-xs text-muted-foreground">{format.description}</p>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click each format to download, or use "Download All" to get everything at once.
      </p>
    </div>
  );
};
