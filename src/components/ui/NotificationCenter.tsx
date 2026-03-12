import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Music, Calendar, DollarSign, Heart, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, typeof Music> = {
  beat: Music,
  booking: Calendar,
  payment: DollarSign,
  wishlist: Heart,
  system: Sparkles,
  referral: Sparkles,
  message: Bell,
};

const notificationColors: Record<string, string> = {
  beat: "text-primary",
  booking: "text-accent",
  payment: "text-green-500",
  wishlist: "text-red-500",
  system: "text-blue-500",
  referral: "text-amber-500",
  message: "text-purple-500",
};

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-display font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || "text-muted-foreground";

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-4 hover:bg-secondary/50 transition-colors cursor-pointer",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.action_url) {
                        window.location.href = notification.action_url;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={cn("w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("font-medium text-sm", !notification.read && "text-foreground")}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
