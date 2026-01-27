import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  fullScreen = false,
  message = "Loading...",
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const spinnerContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex flex-col items-center justify-center gap-4", className)}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={cn(
            "rounded-full border-2 border-primary/30 border-t-primary",
            sizeClasses[size]
          )}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Headphones className={cn(
            "text-primary/60",
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-7 h-7"
          )} />
        </motion.div>
      </div>
      {message && size !== "sm" && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};