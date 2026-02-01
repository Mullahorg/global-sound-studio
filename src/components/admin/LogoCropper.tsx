import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface LogoCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export const LogoCropper = ({ imageUrl, onCropComplete, onCancel }: LogoCropperProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Set canvas size to output size (512x512 for best icon compatibility)
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Clear canvas
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Apply transformations
    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-outputSize / 2 + position.x, -outputSize / 2 + position.y);

    // Draw image centered
    const scale = Math.max(outputSize / img.width, outputSize / img.height);
    const x = (outputSize - img.width * scale) / 2;
    const y = (outputSize - img.height * scale) / 2;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, "image/png", 1);
  }, [imageUrl, zoom, rotation, position, onCropComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">Crop & Adjust Logo</h4>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleCrop}>
            <Check className="w-4 h-4 mr-1" />
            Apply Crop
          </Button>
        </div>
      </div>

      {/* Crop Preview Area */}
      <div
        ref={containerRef}
        className="relative w-full h-64 bg-secondary/50 rounded-xl overflow-hidden cursor-move border-2 border-dashed border-border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Crop Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-primary/60 rounded-xl" />
        </div>

        {/* Image */}
        <motion.img
          src={imageUrl}
          alt="Logo preview"
          className="absolute top-1/2 left-1/2 max-w-none select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            maxHeight: "250%",
            maxWidth: "250%",
          }}
          draggable={false}
        />
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Zoom
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Rotation
            </span>
            <span className="text-xs text-muted-foreground">{rotation}°</span>
          </div>
          <Slider
            value={[rotation]}
            onValueChange={([value]) => setRotation(value)}
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Drag the image to position it within the crop area. The logo will be exported at 512×512 pixels.
      </p>
    </div>
  );
};
