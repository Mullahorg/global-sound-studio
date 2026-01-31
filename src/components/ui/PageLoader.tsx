import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

export const PageLoader = ({ message = "Loading..." }: PageLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6"
        >
          <Headphones className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        
        <div className="flex items-center justify-center gap-1 mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: ["8px", "24px", "8px"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <p className="text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
};

export const ContentLoader = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded-lg w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="p-6 rounded-xl bg-card border border-border/50 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>
    </div>
  );
};

export const TableLoader = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="p-4 bg-muted/30 border-b border-border/50">
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
            <div className="h-8 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
