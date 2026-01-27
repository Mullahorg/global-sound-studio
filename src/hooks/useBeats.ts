import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BeatRow = Database["public"]["Tables"]["beats"]["Row"];
type Beat = BeatRow & {
  producer?: {
    full_name: string | null;
    badge: string | null;
    country: string | null;
  } | null;
};

type BeatGenre = Database["public"]["Enums"]["beat_genre"];
type BeatMood = Database["public"]["Enums"]["beat_mood"];

interface UseBeatsOptions {
  searchQuery?: string;
  genre?: BeatGenre | "all";
  mood?: BeatMood | "all";
  bpmRange?: [number, number];
}

export const useBeats = (options: UseBeatsOptions = {}) => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBeats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from("beats")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.genre && options.genre !== "all") {
        query = query.eq("genre", options.genre);
      }
      
      if (options.mood && options.mood !== "all") {
        query = query.eq("mood", options.mood);
      }
      
      if (options.bpmRange) {
        query = query.gte("bpm", options.bpmRange[0]).lte("bpm", options.bpmRange[1]);
      }

      const { data: beatsData, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch producer profiles separately
      const producerIds = [...new Set((beatsData || []).map(b => b.producer_id))];
      
      let profilesMap: Record<string, { full_name: string | null; badge: string | null; country: string | null }> = {};
      
      if (producerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, badge, country")
          .in("id", producerIds);
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, badge: p.badge, country: p.country };
            return acc;
          }, {} as typeof profilesMap);
        }
      }

      // Combine beats with producer info
      let enrichedBeats: Beat[] = (beatsData || []).map(beat => ({
        ...beat,
        producer: profilesMap[beat.producer_id] || null,
      }));

      // Client-side search filtering
      if (options.searchQuery) {
        const search = options.searchQuery.toLowerCase();
        enrichedBeats = enrichedBeats.filter(
          (beat) =>
            beat.title.toLowerCase().includes(search) ||
            beat.producer?.full_name?.toLowerCase().includes(search)
        );
      }

      setBeats(enrichedBeats);
    } catch (err: any) {
      console.error("Error fetching beats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.searchQuery, options.genre, options.mood, options.bpmRange]);

  // Initial fetch
  useEffect(() => {
    fetchBeats();
  }, [fetchBeats]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("beats-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "beats",
        },
        () => {
          fetchBeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBeats]);

  return { beats, loading, error, refetch: fetchBeats };
};
