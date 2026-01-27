import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  beat_id: string;
  created_at: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (beatId: string) => wishlist.some((item) => item.beat_id === beatId),
    [wishlist]
  );

  const addToWishlist = useCallback(
    async (beatId: string) => {
      if (!user) {
        toast.error("Please sign in to save beats");
        return false;
      }

      try {
        const { error } = await supabase.from("wishlist").insert({
          user_id: user.id,
          beat_id: beatId,
        });

        if (error) throw error;

        setWishlist((prev) => [
          { id: crypto.randomUUID(), beat_id: beatId, created_at: new Date().toISOString() },
          ...prev,
        ]);
        toast.success("Added to wishlist");
        return true;
      } catch (err: any) {
        console.error("Error adding to wishlist:", err);
        toast.error("Failed to add to wishlist");
        return false;
      }
    },
    [user]
  );

  const removeFromWishlist = useCallback(
    async (beatId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("beat_id", beatId);

        if (error) throw error;

        setWishlist((prev) => prev.filter((item) => item.beat_id !== beatId));
        toast.success("Removed from wishlist");
        return true;
      } catch (err: any) {
        console.error("Error removing from wishlist:", err);
        toast.error("Failed to remove from wishlist");
        return false;
      }
    },
    [user]
  );

  const toggleWishlist = useCallback(
    async (beatId: string) => {
      if (isInWishlist(beatId)) {
        return removeFromWishlist(beatId);
      }
      return addToWishlist(beatId);
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  };
};
