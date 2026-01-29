import { useState, useEffect } from "react";
import { X, AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

export const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, type")
      .eq("is_active", true)
      .or("ends_at.is.null,ends_at.gt.now()")
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setAnnouncements(data);
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "error":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "success":
        return "bg-green-500/10 border-green-500/20 text-green-600";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-600";
    }
  };

  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative px-4 py-3 border rounded-lg ${getColors(announcement.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5">{getIcon(announcement.type)}</span>
            <div className="flex-1">
              <p className="font-medium">{announcement.title}</p>
              <p className="text-sm opacity-90">{announcement.message}</p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="p-1 hover:bg-background/50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};