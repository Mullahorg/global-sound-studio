import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import sw from "./locales/sw.json";

export const SUPPORTED_LANGUAGES = ["en", "sw"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "wgs-language";

/**
 * Humanize a translation key as a last-resort fallback.
 * Turns "hero.exploreBeats" -> "Explore Beats" so the UI never
 * shows raw dotted keys when a translation is missing.
 */
function humanizeKey(key: string): string {
  const last = key.split(".").pop() ?? key;
  const spaced = last
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return "";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    // If a key is missing in the active language, try English; if still
    // missing, return an empty string from the parser so our
    // missingKeyHandler/parseMissingKeyHandler decides what to render.
    returnEmptyString: false,
    returnNull: false,
    saveMissing: false,
    parseMissingKeyHandler: (key) => humanizeKey(key),
    missingKeyHandler: (_lngs, _ns, key) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;