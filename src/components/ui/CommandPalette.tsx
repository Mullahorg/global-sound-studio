import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Home,
  Music,
  Calendar,
  User,
  Settings,
  Search,
  Play,
  Heart,
  Headphones,
  Shield,
  HelpCircle,
  FileText,
  Mail,
  Sparkles,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { supabase } from "@/integrations/supabase/client";

interface CommandAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { togglePlay, currentBeat, isPlaying, playNext, playPrevious } = useAudioQueue();

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin" || data?.role === "producer");
    };
    checkAdmin();
  }, [user]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openCommandPalette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openCommandPalette", handleOpenEvent);
    };
  }, []);

  const runCommand = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  const navigationCommands: CommandAction[] = [
    {
      id: "home",
      label: "Go to Home",
      icon: <Home className="w-4 h-4" />,
      shortcut: "⌘H",
      action: () => navigate("/"),
      keywords: ["main", "landing"],
    },
    {
      id: "beats",
      label: "Browse Beats",
      icon: <Music className="w-4 h-4" />,
      shortcut: "⌘B",
      action: () => navigate("/beats"),
      keywords: ["music", "marketplace", "buy"],
    },
    {
      id: "studio",
      label: "View Studio",
      icon: <Headphones className="w-4 h-4" />,
      action: () => navigate("/studio"),
      keywords: ["about", "equipment"],
    },
    {
      id: "booking",
      label: "Book a Session",
      icon: <Calendar className="w-4 h-4" />,
      action: () => navigate("/booking"),
      keywords: ["schedule", "reserve", "session"],
    },
    {
      id: "services",
      label: "Our Services",
      icon: <Zap className="w-4 h-4" />,
      action: () => navigate("/services"),
      keywords: ["mixing", "mastering", "production"],
    },
    {
      id: "wishlist",
      label: "My Wishlist",
      icon: <Heart className="w-4 h-4" />,
      action: () => navigate("/wishlist"),
      keywords: ["saved", "favorites", "liked"],
    },
    {
      id: "outreach",
      label: "Outreach Programs",
      icon: <Sparkles className="w-4 h-4" />,
      action: () => navigate("/outreach"),
      keywords: ["talent", "discovery", "community"],
    },
    {
      id: "chat",
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: "⌘M",
      action: () => navigate("/chat"),
      keywords: ["chat", "messages", "collaborate", "conversation"],
    },
  ];

  const userCommands: CommandAction[] = user
    ? [
        {
          id: "dashboard",
          label: "My Dashboard",
          icon: <User className="w-4 h-4" />,
          shortcut: "⌘D",
          action: () => navigate("/dashboard"),
          keywords: ["profile", "account"],
        },
        ...(isAdmin
          ? [
              {
                id: "admin",
                label: "Admin Panel",
                icon: <Shield className="w-4 h-4" />,
                action: () => navigate("/admin"),
                keywords: ["manage", "settings", "control"],
              },
            ]
          : []),
      ]
    : [
        {
          id: "signin",
          label: "Sign In",
          icon: <User className="w-4 h-4" />,
          action: () => navigate("/auth"),
          keywords: ["login", "account"],
        },
      ];

  const playbackCommands: CommandAction[] = currentBeat
    ? [
        {
          id: "playpause",
          label: isPlaying ? "Pause" : "Play",
          icon: <Play className="w-4 h-4" />,
          shortcut: "Space",
          action: () => togglePlay(),
        },
        {
          id: "next",
          label: "Next Track",
          icon: <Music className="w-4 h-4" />,
          shortcut: "⇧→",
          action: () => playNext(),
        },
        {
          id: "previous",
          label: "Previous Track",
          icon: <Music className="w-4 h-4" />,
          shortcut: "⇧←",
          action: () => playPrevious(),
        },
      ]
    : [];

  const helpCommands: CommandAction[] = [
    {
      id: "support",
      label: "Get Support",
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => navigate("/support"),
      keywords: ["help", "faq", "contact"],
    },
    {
      id: "contact",
      label: "Contact Us",
      icon: <Mail className="w-4 h-4" />,
      action: () => navigate("/contact"),
      keywords: ["email", "message"],
    },
    {
      id: "licensing",
      label: "Licensing Info",
      icon: <FileText className="w-4 h-4" />,
      action: () => navigate("/licensing"),
      keywords: ["terms", "rights", "legal"],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {playbackCommands.length > 0 && (
              <CommandGroup heading="Now Playing">
                {playbackCommands.map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    onSelect={() => runCommand(cmd.action)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {cmd.icon}
                      <span>{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Navigation">
              {navigationCommands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => runCommand(cmd.action)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Account">
              {userCommands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => runCommand(cmd.action)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Help">
              {helpCommands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => runCommand(cmd.action)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
