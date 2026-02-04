import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("useReferral");

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
      let { data: codeData, error: fetchError } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        logDatabaseError(fetchError, "referral_codes", "select", { userId: user.id });
      }

      if (!codeData) {
        // Create a new referral code
        const code = generateReferralCode(user.id);
        const { data: newCode, error: insertError } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select("code")
          .single();

        if (insertError) {
          logDatabaseError(insertError, "referral_codes", "insert", { userId: user.id });
          throw insertError;
        }

        if (newCode) {
          codeData = newCode;
        }
      }

      if (codeData) {
        setReferralCode(codeData.code);
      }
    } catch (error) {
      logger.error(error, "fetchOrCreateReferralCode");
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = (userId: string) => {
    return `WGME-${userId.slice(0, 6).toUpperCase()}`;
  };

  const validateReferralCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("id, user_id, is_active")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        logDatabaseError(error, "referral_codes", "select", { code });
      }

      return data;
    } catch (error) {
      logger.error(error, "validateReferralCode", { code });
      return null;
    }
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

      if (error) {
        logDatabaseError(error, "referrals", "insert", { referralCodeId, referrerId });
        throw error;
      }

      // Manually increment uses_count on referral code
      const { data: currentCode, error: fetchError } = await supabase
        .from("referral_codes")
        .select("uses_count")
        .eq("id", referralCodeId)
        .single();

      if (fetchError) {
        logDatabaseError(fetchError, "referral_codes", "select", { referralCodeId });
      }

      if (currentCode) {
        const { error: updateError } = await supabase
          .from("referral_codes")
          .update({ uses_count: (currentCode.uses_count || 0) + 1 })
          .eq("id", referralCodeId);

        if (updateError) {
          logDatabaseError(updateError, "referral_codes", "update", { referralCodeId });
        }
      }

      return true;
    } catch (error) {
      logger.error(error, "recordReferral", { referralCodeId, referrerId });
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
