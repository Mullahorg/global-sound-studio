import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MiniWaveformProps {
  beatId: string;
  isPlaying?: boolean;
  isHovered?: boolean;
  progress?: number;
  className?: string;
  barCount?: number;
}

export const MiniWaveform = ({
  beatId,
  isPlaying = false,
  isHovered = false,
  progress = 0,
  className,
  barCount = 32,
}: MiniWaveformProps) => {
  // Generate consistent waveform based on beat ID
  const bars = useMemo(() => {
    const seed = beatId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: barCount }, (_, i) => {
      const rand = Math.sin(seed + i * 0.7) * 0.5 + 0.5;
      return rand * 0.6 + 0.4; // Range: 0.4 to 1.0
    });
  }, [beatId, barCount]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[1px] h-8 w-full",
        className
      )}
    >
      {bars.map((height, i) => {
        const isPlayed = (i / bars.length) * 100 <= progress;
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0.3, opacity: 0 }}
            animate={{
              scaleY: isPlaying
                ? [height * 0.5, height, height * 0.7, height * 0.9, height * 0.5]
                : isHovered
                ? height
                : 0.3,
              opacity: isHovered || isPlaying ? 1 : 0.5,
            }}
            transition={
              isPlaying
                ? {
                    duration: 0.4 + i * 0.02,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }
                : { duration: 0.3, delay: i * 0.01 }
            }
            className={cn(
              "w-1 min-w-[2px] rounded-full transition-colors duration-200",
              isPlayed
                ? "bg-gradient-to-t from-primary to-accent"
                : isHovered || isPlaying
                ? "bg-muted-foreground/60"
                : "bg-muted/40"
            )}
            style={{ height: `${height * 100}%` }}
          />
        );
      })}
    </div>
  );
};
