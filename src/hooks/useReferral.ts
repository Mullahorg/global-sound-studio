import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrCreateReferralCode();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrCreateReferralCode = async () => {
    if (!user) return;

    try {
      // Try to fetch existing code
      let { data: codeData } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!codeData) {
        // Create a new referral code
        const code = generateReferralCode(user.id);
        const { data: newCode } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select("code")
          .single();

        if (newCode) {
          codeData = newCode;
        }
      }

      if (codeData) {
        setReferralCode(codeData.code);
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = (userId: string) => {
    return `WGME-${userId.slice(0, 6).toUpperCase()}`;
  };

  const validateReferralCode = async (code: string) => {
    const { data } = await supabase
      .from("referral_codes")
      .select("id, user_id, is_active")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    return data;
  };

  const recordReferral = async (referralCodeId: string, referrerId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("referrals").insert({
        referrer_id: referrerId,
        referred_id: user.id,
        referral_code_id: referralCodeId,
        status: "pending",
        qualification_type: "signup",
      });

      if (error) throw error;

      // Manually increment uses_count on referral code
      const { data: currentCode } = await supabase
        .from("referral_codes")
        .select("uses_count")
        .eq("id", referralCodeId)
        .single();

      if (currentCode) {
        await supabase
          .from("referral_codes")
          .update({ uses_count: (currentCode.uses_count || 0) + 1 })
          .eq("id", referralCodeId);
      }

      return true;
    } catch (error) {
      console.error("Error recording referral:", error);
      return false;
    }
  };

  const getReferralLink = () => {
    if (!referralCode) return null;
    return `${window.location.origin}/auth?ref=${referralCode}`;
  };

  return {
    referralCode,
    loading,
    validateReferralCode,
    recordReferral,
    getReferralLink,
  };
};
