import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

      // FIRST: Check profiles table (where your role actually is)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, client_type, badge")
        .eq("id", user.id)
        .maybeSingle();

      console.log("Profile role check:", profile?.role);
      
      // If role is in profiles table, use it
      if (profile?.role) {
        setRole(profile.role as AppRole);
        setLoading(false);
        return;
      }

      // SECOND: Fallback to user_roles table (legacy)
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setRole(userRole?.role as AppRole || null);
      setLoading(false);
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
    canAccessAdmin: role === "admin", // CHANGED: Only admin can access admin panel
    canManageContent: role === "admin",
    canManageUsers: role === "admin",
    canViewAnalytics: role === "admin",
  };

  const isArtist = role === "artist";
  const isProducer = role === "producer";
  const isAdmin = role === "admin";

  console.log("Current role:", role, "Is admin?", isAdmin);

  return {
    role,
    loading,
    permissions,
    isArtist,
    isProducer,
    isAdmin,
  };
}
