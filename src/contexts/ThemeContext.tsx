import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "wgs-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Load preference from profile on login
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const pref = (data as any)?.theme_preference as Theme | undefined;
      if ((pref === "dark" || pref === "light") && pref !== theme) {
        setThemeState(pref);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persist = (t: Theme) => {
    if (user) {
      supabase
        .from("profiles")
        .update({ theme_preference: t } as any)
        .eq("id", user.id)
        .then(() => {});
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    persist(t);
  };
  const toggleTheme = () =>
    setThemeState((p) => {
      const next = p === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};