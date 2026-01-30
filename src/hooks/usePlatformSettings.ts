import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  contact_email: string;
  contact_phone: string;
  studio_description: string;
  commission_rate: string;
  minimum_payout: string;
  stat_projects: string;
  stat_artists: string;
  stat_nominations: string;
  stat_access: string;
}

const defaultSettings: PlatformSettings = {
  site_name: "WE Global",
  hero_title: "Global Sound. One Studio.",
  hero_subtitle: "A borderless ecosystem connecting artists, producers, labels, and brands through world-class music production. Your vision, our craft.",
  hero_badge: "World-Class Production Studio",
  contact_email: "info@weglobal.com",
  contact_phone: "+254 700 000 000",
  studio_description: "Professional music production studio",
  commission_rate: "30",
  minimum_payout: "1000",
  stat_projects: "500+",
  stat_artists: "120+",
  stat_nominations: "50+",
  stat_access: "24/7",
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_key, setting_value");

      if (data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach((s) => {
          settingsMap[s.setting_key] = s.setting_value || "";
        });
        setSettings({
          ...defaultSettings,
          ...settingsMap,
        } as PlatformSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
