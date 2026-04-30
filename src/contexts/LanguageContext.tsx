import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  supportedLanguages: readonly SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitial(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  return "en";
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitial);

  // Apply language to i18next + html lang
  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
    document.documentElement.setAttribute("lang", language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language, i18n]);

  // Load preference from profile when user signs in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("language_preference")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const pref = (data as any)?.language_preference as SupportedLanguage | undefined;
      if (pref && SUPPORTED_LANGUAGES.includes(pref) && pref !== language) {
        setLanguageState(pref);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (user) {
      await supabase
        .from("profiles")
        .update({ language_preference: lang } as any)
        .eq("id", user.id);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};