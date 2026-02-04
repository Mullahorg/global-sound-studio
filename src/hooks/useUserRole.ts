import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("useUserRole");

export type AppRole = "artist" | "producer" | "admin" | null;

export interface RolePermissions {
  canAccessDashboard: boolean;
  canAccessAdmin: boolean;
  canUploadBeats: boolean;
  canManageBookings: boolean;
  canViewFranchise: boolean;
  canRequestPayouts: boolean;
  canViewReferrals: boolean;
  canManageContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check profiles table (where your role actually is)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          logDatabaseError(profileError, "profiles", "select", { context: "fetch role", userId: user.id });
        }

        // If role is in profiles table, use it
        if (profile?.role) {
          setRole(profile.role as AppRole);
          setLoading(false);
          return;
        }

        // Fallback to user_roles table (legacy)
        const { data: userRole, error: userRoleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (userRoleError) {
          logDatabaseError(userRoleError, "user_roles", "select", { context: "fetch role fallback", userId: user.id });
        }

        setRole(userRole?.role as AppRole || null);
      } catch (error) {
        logger.error(error, "fetchRole");
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const permissions: RolePermissions = {
    // All logged-in users
    canAccessDashboard: !!user,
    canViewReferrals: !!user,
    
    // Producer & Admin only
    canUploadBeats: role === "producer" || role === "admin",
    canManageBookings: role === "producer" || role === "admin",
    canViewFranchise: role === "producer" || role === "admin",
    canRequestPayouts: role === "producer" || role === "admin",
    canAccessAdmin: role === "admin", // Only admin can access admin panel
    canManageContent: role === "admin",
    canManageUsers: role === "admin",
    canViewAnalytics: role === "admin",
  };

  const isArtist = role === "artist";
  const isProducer = role === "producer";
  const isAdmin = role === "admin";

  return {
    role,
    loading,
    permissions,
    isArtist,
    isProducer,
    isAdmin,
  };
}
