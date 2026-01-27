import { motion } from "framer-motion";
import { Sparkles, Play, Heart, ListPlus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MiniWaveform } from "@/components/ui/MiniWaveform";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RecommendationsProps {
  limit?: number;
  showViewAll?: boolean;
}

export const Recommendations = ({ limit = 4, showViewAll = true }: RecommendationsProps) => {
  const { recommendations, loading } = useRecommendations(limit);
  const { playBeat, currentBeat, isPlaying, addToQueue } = useAudioQueue();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const handlePlay = (beat: typeof recommendations[0]) => {
    playBeat(beat);
  };

  const handleAddToQueue = (e: React.MouseEvent, beat: typeof recommendations[0]) => {
    e.stopPropagation();
    addToQueue(beat);
    toast.success(`Added "${beat.title}" to queue`);
  };

  const handleToggleWishlist = async (e: React.MouseEvent, beatId: string) => {
    e.stopPropagation();
    await toggleWishlist(beatId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 rounded-xl border border-border/50">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-semibold">Recommended For You</h3>
        </div>
        {showViewAll && (
          <Link to="/beats">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Browse All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((beat, index) => {
          const isActive = currentBeat?.id === beat.id;
          const isLiked = isInWishlist(beat.id);

          return (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative p-4 rounded-xl border transition-all cursor-pointer",
                isActive
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border/50 hover:border-primary/30"
              )}
              onClick={() => handlePlay(beat)}
            >
              {/* Cover */}
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <img
                  src={beat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"}
                  alt={beat.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleToggleWishlist(e, beat.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      "bg-background/80 backdrop-blur-sm",
                      isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  </button>
                  <button
                    onClick={(e) => handleAddToQueue(e, beat)}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Playing indicator */}
                {isActive && isPlaying && (
                  <div className="absolute bottom-2 right-2 flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                        className="w-0.5 h-4 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Waveform */}
              <MiniWaveform
                beatId={beat.id}
                isPlaying={isActive && isPlaying}
                isHovered={false}
                barCount={28}
                className="h-5 mb-2"
              />

              {/* Info */}
              <h4 className="font-display font-semibold truncate group-hover:text-primary transition-colors">
                {beat.title}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {beat.producer?.full_name || "Unknown Producer"}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {beat.bpm} BPM
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {beat.genre.replace("_", " ")}
                  </Badge>
                </div>
                <span className="font-display font-bold text-primary">
                  {formatPrice(beat.price_basic)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
