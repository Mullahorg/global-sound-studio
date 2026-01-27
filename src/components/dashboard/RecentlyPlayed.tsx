import { motion } from "framer-motion";
import { Clock, Play, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const RecentlyPlayed = () => {
  const { history, loading } = usePlayHistory();
  const { playBeat, currentBeat, isPlaying } = useAudioQueue();

  // Get unique beats (most recent play first)
  const uniqueBeats = history.reduce((acc, item) => {
    if (!acc.find(h => h.beat_id === item.beat_id) && item.beat) {
      acc.push(item);
    }
    return acc;
  }, [] as typeof history).slice(0, 6);

  const handlePlay = (item: typeof uniqueBeats[0]) => {
    if (!item.beat) return;
    playBeat({
      id: item.beat.id,
      title: item.beat.title,
      audio_url: item.beat.audio_url,
      cover_url: item.beat.cover_url,
      bpm: item.beat.bpm,
      key: item.beat.key,
      genre: item.beat.genre,
      mood: item.beat.mood,
      price_basic: Number(item.beat.price_basic),
      price_premium: Number(item.beat.price_premium),
      price_exclusive: Number(item.beat.price_exclusive),
      producer: item.producer,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (uniqueBeats.length === 0) {
    return null; // Don't show section if no history
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Recently Played</h3>
        </div>
        <Link to="/beats">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {uniqueBeats.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handlePlay(item)}
            className={cn(
              "group text-left p-3 rounded-xl transition-all hover:bg-muted/50",
              currentBeat?.id === item.beat_id && "bg-primary/10"
            )}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
              <img
                src={item.beat?.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
                alt={item.beat?.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
              {currentBeat?.id === item.beat_id && isPlaying && (
                <div className="absolute bottom-2 right-2 flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 h-3 bg-primary rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>

            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {item.beat?.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {item.producer?.full_name || "Unknown"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {item.beat?.bpm} BPM
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.played_at), { addSuffix: true })}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
