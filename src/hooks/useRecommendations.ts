import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("useRecommendations");

interface Beat {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  bpm: number;
  key: string | null;
  genre: string;
  mood: string;
  price_basic: number;
  price_premium: number;
  price_exclusive: number;
  producer?: {
    full_name: string | null;
    badge: string | null;
    country: string | null;
  } | null;
}

export const useRecommendations = (limit: number = 8) => {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { getPreferences } = usePlayHistory();
  const [recommendations, setRecommendations] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);

    try {
      // Get preferences from play history
      const { topGenres, topMoods } = getPreferences();

      // Get genres/moods from wishlist
      const wishlistBeatIds = wishlist.map(w => w.beat_id);
      let wishlistGenres: string[] = [];
      let wishlistMoods: string[] = [];

      if (wishlistBeatIds.length > 0) {
        const { data: wishlistBeats, error: wishlistError } = await supabase
          .from("beats")
          .select("genre, mood")
          .in("id", wishlistBeatIds);

        if (wishlistError) {
          logDatabaseError(wishlistError, "beats", "select", { context: "wishlist genres" });
        }

        if (wishlistBeats) {
          wishlistGenres = [...new Set(wishlistBeats.map(b => b.genre))];
          wishlistMoods = [...new Set(wishlistBeats.map(b => b.mood))];
        }
      }

      // Combine preferences (weighted towards recent plays)
      const allGenres = [...new Set([...topGenres, ...wishlistGenres])];
      const allMoods = [...new Set([...topMoods, ...wishlistMoods])];

      let query = supabase
        .from("beats")
        .select("*")
        .order("play_count", { ascending: false })
        .limit(limit * 2);

      // If we have preferences, filter by them (cast to proper type)
      if (allGenres.length > 0) {
        query = query.in("genre", allGenres as any);
      }

      const { data: beatsData, error } = await query;

      if (error) {
        logDatabaseError(error, "beats", "select", { context: "recommendations" });
        throw error;
      }

      // Fetch producer profiles
      const producerIds = [...new Set((beatsData || []).map(b => b.producer_id).filter(Boolean))];
      let profilesMap: Record<string, { full_name: string | null; badge: string | null; country: string | null }> = {};

      if (producerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, badge, country")
          .in("id", producerIds);

        if (profilesError) {
          logDatabaseError(profilesError, "profiles", "select", { context: "producer profiles" });
        }

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, badge: p.badge, country: p.country };
            return acc;
          }, {} as typeof profilesMap);
        }
      }

      // Score and sort beats by relevance
      let scoredBeats = (beatsData || []).map(beat => {
        let score = 0;
        
        // Genre match
        if (topGenres.includes(beat.genre)) score += 3;
        if (wishlistGenres.includes(beat.genre)) score += 2;
        
        // Mood match
        if (topMoods.includes(beat.mood)) score += 2;
        if (wishlistMoods.includes(beat.mood)) score += 1;
        
        // Play count popularity
        score += Math.log10((beat.play_count || 1) + 1);

        return {
          ...beat,
          producer: beat.producer_id ? profilesMap[beat.producer_id] : null,
          _score: score,
        };
      });

      // Sort by score and remove already in wishlist
      scoredBeats = scoredBeats
        .filter(b => !wishlistBeatIds.includes(b.id))
        .sort((a, b) => b._score - a._score)
        .slice(0, limit);

      // Remove score before setting state
      const cleanedBeats: Beat[] = scoredBeats.map(({ _score, producer_id, ...beat }) => ({
        ...beat,
        price_basic: Number(beat.price_basic),
        price_premium: Number(beat.price_premium),
        price_exclusive: Number(beat.price_exclusive),
      }));

      setRecommendations(cleanedBeats);
    } catch (err) {
      logger.error(err, "fetchRecommendations");
      
      // Fallback: just get popular beats
      try {
        const { data, error: fallbackError } = await supabase
          .from("beats")
          .select("*")
          .order("play_count", { ascending: false })
          .limit(limit);

        if (fallbackError) {
          logDatabaseError(fallbackError, "beats", "select", { context: "fallback recommendations" });
          throw fallbackError;
        }

        const producerIds = [...new Set((data || []).map(b => b.producer_id).filter(Boolean))];
        let profilesMap: Record<string, any> = {};

        if (producerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, badge, country")
            .in("id", producerIds);

          if (profiles) {
            profilesMap = profiles.reduce((acc, p) => {
              acc[p.id] = { full_name: p.full_name, badge: p.badge, country: p.country };
              return acc;
            }, {} as any);
          }
        }

        setRecommendations(
          (data || []).map(beat => ({
            ...beat,
            producer: beat.producer_id ? profilesMap[beat.producer_id] : null,
            price_basic: Number(beat.price_basic),
            price_premium: Number(beat.price_premium),
            price_exclusive: Number(beat.price_exclusive),
          }))
        );
      } catch (e) {
        logger.error(e, "fallbackRecommendations");
      }
    } finally {
      setLoading(false);
    }
  }, [getPreferences, wishlist, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    refetch: fetchRecommendations,
  };
};
