import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase
          .from("platform_settings")
          .select("setting_value")
          .eq("setting_key", "maintenance_mode")
          .maybeSingle();

        setIsMaintenanceMode(data?.setting_value === "true");
      } catch {
        // If we can't check, assume not in maintenance
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { isMaintenanceMode, loading };
}
