import { useEffect } from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

/**
 * Applies admin-controlled branding at runtime:
 * - injects/updates favicon + apple-touch-icon to point at the uploaded site_logo
 * - sets the document title from site_name
 * - writes the admin primary_color into CSS custom properties (--primary)
 *
 * primary_color may be:
 *   - HSL triplet without commas, e.g. "18 90% 48%"
 *   - hex string, e.g. "#ff5722"
 */
export const BrandApplier = () => {
  const { settings, loading } = usePlatformSettings();

  useEffect(() => {
    if (loading) return;

    // Title
    if (settings.site_name) {
      document.title = `${settings.site_name} | World-Class Music Production`;
    }

    // Favicon + apple-touch-icon
    if (settings.site_logo) {
      const setIconHref = (rel: string) => {
        let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = settings.site_logo;
      };
      setIconHref("icon");
      setIconHref("apple-touch-icon");
      setIconHref("shortcut icon");
    }

    // Primary color → HSL CSS variables
    const hsl = toHslTriplet(settings.primary_color);
    if (hsl) {
      const root = document.documentElement;
      root.style.setProperty("--primary", hsl);
      // Keep ring + accent in sync so focus states stay coherent
      root.style.setProperty("--ring", hsl);
    }
  }, [loading, settings.site_logo, settings.site_name, settings.primary_color]);

  return null;
};

/** Accepts "h s% l%" or "#rrggbb" / "#rgb" and returns an HSL triplet string. */
function toHslTriplet(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Already an HSL triplet "h s% l%"
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(trimmed)) return trimmed;
  // Hex
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return hexToHsl(trimmed);
  return null;
}

function hexToHsl(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}