import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logDatabaseError, createLogger } from "@/lib/errorLogger";

const logger = createLogger("usePlayHistory");

interface PlayHistoryItem {
  id: string;
  beat_id: string;
  played_at: string;
  duration_seconds: number;
  completed: boolean;
  beat?: {
    id: string;
    title: string;
    cover_url: string | null;
    audio_url: string;
    bpm: number;
    key: string | null;
    genre: string;
    mood: string;
    price_basic: number;
    price_premium: number;
    price_exclusive: number;
    producer_id: string | null;
  };
  producer?: {
    full_name: string | null;
    badge: string | null;
    country: string | null;
  } | null;
}

export const usePlayHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch play history with beat details
      const { data: historyData, error } = await supabase
        .from("play_history")
        .select("*")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(50);

      if (error) {
        logDatabaseError(error, "play_history", "select", { userId: user.id });
        throw error;
      }

      if (!historyData || historyData.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Fetch beat details for each history item
      const beatIds = [...new Set(historyData.map(h => h.beat_id))];
      const { data: beatsData, error: beatsError } = await supabase
        .from("beats")
        .select("*")
        .in("id", beatIds);

      if (beatsError) {
        logDatabaseError(beatsError, "beats", "select", { context: "play history beats" });
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
          logDatabaseError(profilesError, "profiles", "select", { context: "play history producers" });
        }

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, badge: p.badge, country: p.country };
            return acc;
          }, {} as typeof profilesMap);
        }
      }

      // Combine data
      const enrichedHistory: PlayHistoryItem[] = historyData.map(item => {
        const beat = beatsData?.find(b => b.id === item.beat_id);
        return {
          ...item,
          beat: beat || undefined,
          producer: beat?.producer_id ? profilesMap[beat.producer_id] : null,
        };
      });

      setHistory(enrichedHistory);
    } catch (err) {
      logger.error(err, "fetchHistory");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const recordPlay = useCallback(
    async (beatId: string, durationSeconds: number = 0, completed: boolean = false) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("play_history").insert({
          user_id: user.id,
          beat_id: beatId,
          duration_seconds: durationSeconds,
          completed,
        });

        if (error) {
          logDatabaseError(error, "play_history", "insert", { beatId });
          throw error;
        }

        // Refresh history
        fetchHistory();
      } catch (err) {
        logger.error(err, "recordPlay", { beatId });
      }
    },
    [user, fetchHistory]
  );

  const updatePlayDuration = useCallback(
    async (historyId: string, durationSeconds: number, completed: boolean) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("play_history")
          .update({ duration_seconds: durationSeconds, completed })
          .eq("id", historyId)
          .eq("user_id", user.id);

        if (error) {
          logDatabaseError(error, "play_history", "update", { historyId });
          throw error;
        }
      } catch (err) {
        logger.error(err, "updatePlayDuration", { historyId });
      }
    },
    [user]
  );

  // Get unique genres/moods from history for recommendations
  const getPreferences = useCallback(() => {
    const genres: Record<string, number> = {};
    const moods: Record<string, number> = {};

    history.forEach((item) => {
      if (item.beat) {
        genres[item.beat.genre] = (genres[item.beat.genre] || 0) + 1;
        moods[item.beat.mood] = (moods[item.beat.mood] || 0) + 1;
      }
    });

    const topGenres = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const topMoods = Object.entries(moods)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mood]) => mood);

    return { topGenres, topMoods };
  }, [history]);

  return {
    history,
    loading,
    recordPlay,
    updatePlayDuration,
    getPreferences,
    refetch: fetchHistory,
  };
};
