import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { toast } from "sonner";

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { togglePlay, playNext, playPrevious, currentBeat, isPlaying } = useAudioQueue();

  const shortcuts: ShortcutAction[] = [
    // Playback controls
    {
      key: " ",
      description: "Play/Pause",
      action: () => {
        if (currentBeat) {
          togglePlay();
          toast.success(isPlaying ? "Paused" : "Playing", { duration: 1000 });
        }
      },
    },
    {
      key: "ArrowRight",
      shift: true,
      description: "Next track",
      action: () => {
        playNext();
        toast.success("Next track", { duration: 1000 });
      },
    },
    {
      key: "ArrowLeft",
      shift: true,
      description: "Previous track",
      action: () => {
        playPrevious();
        toast.success("Previous track", { duration: 1000 });
      },
    },
    // Navigation
    {
      key: "h",
      ctrl: true,
      description: "Go to Home",
      action: () => navigate("/"),
    },
    {
      key: "b",
      ctrl: true,
      description: "Go to Beats",
      action: () => navigate("/beats"),
    },
    {
      key: "d",
      ctrl: true,
      description: "Go to Dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      key: "k",
      ctrl: true,
      description: "Open Command Palette",
      action: () => {
        // Dispatch custom event for command palette
        window.dispatchEvent(new CustomEvent("openCommandPalette"));
      },
    },
    {
      key: "/",
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: "Escape",
      description: "Close modals",
      action: () => {
        // Handled by components
      },
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow space for play/pause even in non-search inputs
        if (event.key !== " " || target.tagName !== "INPUT") {
          return;
        }
        // But not in search inputs
        const inputType = (target as HTMLInputElement).type;
        if (inputType !== "button" && inputType !== "submit") {
          return;
        }
      }

      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!s.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!s.shift === event.shiftKey;
        const altMatch = !!s.alt === event.altKey;
        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
};

// Hook for showing keyboard shortcut hints
export const useShortcutHint = () => {
  const showHint = useCallback((key: string, description: string) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modKey = isMac ? "⌘" : "Ctrl";
    toast.info(`${modKey}+${key.toUpperCase()}: ${description}`, { duration: 2000 });
  }, []);

  return { showHint };
};
