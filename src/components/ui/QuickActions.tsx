import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Music, 
  Calendar, 
  Upload, 
  Search, 
  Heart,
  Headphones,
  X,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color: string;
}

export const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions: QuickAction[] = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      action: () => {
        window.dispatchEvent(new CustomEvent("openCommandPalette"));
        setIsOpen(false);
      },
      color: "bg-primary",
    },
    {
      id: "beats",
      label: "Browse Beats",
      icon: Music,
      action: () => {
        navigate("/beats");
        setIsOpen(false);
      },
      color: "bg-accent",
    },
    {
      id: "book",
      label: "Book Session",
      icon: Calendar,
      action: () => {
        navigate("/booking");
        setIsOpen(false);
      },
      color: "bg-green-500",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      action: () => {
        navigate("/wishlist");
        setIsOpen(false);
      },
      color: "bg-red-500",
    },
  ];

  return (
    <>
      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3 items-end"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <span className="px-3 py-1.5 bg-card border border-border/50 rounded-lg text-sm font-medium shadow-lg">
                    {action.label}
                  </span>
                  <button
                    onClick={action.action}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                      action.color
                    )}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors",
            isOpen ? "bg-secondary" : "bg-primary"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Plus className="w-6 h-6 text-primary-foreground" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Desktop Command hint */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => window.dispatchEvent(new CustomEvent("openCommandPalette"))}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-secondary transition-colors group"
        >
          <Command className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground">
            Press
          </span>
          <kbd className="px-2 py-0.5 rounded bg-secondary text-xs font-mono">
            ⌘K
          </kbd>
          <span className="text-sm text-muted-foreground group-hover:text-foreground">
            for quick actions
          </span>
        </motion.button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
