import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  Music, 
  Calendar, 
  DollarSign, 
  Heart, 
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "beat" | "booking" | "payment" | "wishlist" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const notificationIcons = {
  beat: Music,
  booking: Calendar,
  payment: DollarSign,
  wishlist: Heart,
  system: Sparkles,
};

const notificationColors = {
  beat: "text-primary",
  booking: "text-accent",
  payment: "text-green-500",
  wishlist: "text-red-500",
  system: "text-blue-500",
};

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Generate dynamic notifications based on user activity
  const generateNotifications = useCallback(async () => {
    if (!user) return;

    const newNotifications: Notification[] = [];

    try {
      // Check for pending bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);

      bookings?.forEach((booking) => {
        newNotifications.push({
          id: `booking-${booking.id}`,
          type: "booking",
          title: "Pending Session",
          message: `Your ${booking.session_type.replace("_", " ")} session is pending confirmation`,
          read: false,
          createdAt: new Date(booking.created_at),
          actionUrl: "/dashboard",
        });
      });

      // Check for recent beat purchases
      const { data: purchases } = await supabase
        .from("beat_purchases")
        .select(`*, beats(title)`)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false })
        .limit(2);

      purchases?.forEach((purchase: any) => {
        newNotifications.push({
          id: `purchase-${purchase.id}`,
          type: "beat",
          title: "Beat Downloaded",
          message: `"${purchase.beats?.title || 'Beat'}" is ready for download`,
          read: true,
          createdAt: new Date(purchase.purchased_at),
          actionUrl: "/dashboard",
        });
      });

      // Add system notifications
      newNotifications.push({
        id: "welcome",
        type: "system",
        title: "Welcome to WE Global! 🎉",
        message: "Explore our beats and book your first session",
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });

      // Sort by date
      newNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(newNotifications);
      setHasNewNotifications(newNotifications.some((n) => !n.read));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    generateNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(generateNotifications, 30000);
    return () => clearInterval(interval);
  }, [generateNotifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasNewNotifications(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
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
      <PopoverContent
        className="w-80 p-0 mr-4"
        align="end"
        sideOffset={8}
      >
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
                const Icon = notificationIcons[notification.type];
                const colorClass = notificationColors[notification.type];

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
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
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
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border/50">
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
