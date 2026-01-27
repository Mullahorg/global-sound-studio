import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Search, Music2, Loader2, Trash2, Play, ListPlus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MiniWaveform } from "@/components/ui/MiniWaveform";
import { BeatPreviewPlayer } from "@/components/beats/BeatPreviewPlayer";
import { PageMeta } from "@/components/seo/PageMeta";
import { useWishlist } from "@/hooks/useWishlist";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { currentBeat, playBeat, isPlaying, addToQueue } = useAudioQueue();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Fetch full beat details for wishlist items
  const { data: beats, isLoading: beatsLoading } = useQuery({
    queryKey: ["wishlist-beats", wishlist.map(w => w.beat_id)],
    queryFn: async () => {
      if (wishlist.length === 0) return [];

      const beatIds = wishlist.map(w => w.beat_id);
      const { data: beatsData, error } = await supabase
        .from("beats")
        .select("*")
        .in("id", beatIds);

      if (error) throw error;

      // Fetch producer profiles
      const producerIds = [...new Set((beatsData || []).map(b => b.producer_id).filter(Boolean))];
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

      return (beatsData || []).map(beat => ({
        ...beat,
        producer: beat.producer_id ? profilesMap[beat.producer_id] : null,
        addedAt: wishlist.find(w => w.beat_id === beat.id)?.created_at,
      }));
    },
    enabled: wishlist.length > 0,
  });

  const loading = wishlistLoading || beatsLoading;

  const filteredBeats = (beats || []).filter(beat =>
    beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beat.producer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlay = (beat: typeof filteredBeats[0]) => {
    playBeat({
      id: beat.id,
      title: beat.title,
      audio_url: beat.audio_url,
      cover_url: beat.cover_url,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      mood: beat.mood,
      price_basic: Number(beat.price_basic),
      price_premium: Number(beat.price_premium),
      price_exclusive: Number(beat.price_exclusive),
      producer: beat.producer,
    });
  };

  const handleAddToQueue = (beat: typeof filteredBeats[0]) => {
    addToQueue({
      id: beat.id,
      title: beat.title,
      audio_url: beat.audio_url,
      cover_url: beat.cover_url,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      mood: beat.mood,
      price_basic: Number(beat.price_basic),
      price_premium: Number(beat.price_premium),
      price_exclusive: Number(beat.price_exclusive),
      producer: beat.producer,
    });
    toast.success(`Added "${beat.title}" to queue`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <PageMeta
          title="My Wishlist"
          description="Save your favorite beats and access them anytime. Sign in to view your wishlist."
          path="/wishlist"
        />
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Sign in to view your wishlist</h2>
            <p className="text-muted-foreground mb-6">Save your favorite beats and access them anytime</p>
            <Link to="/auth">
              <Button variant="hero">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="My Wishlist"
        description="Your saved beats collection. Browse your favorite beats and purchase them with flexible licensing."
        path="/wishlist"
      />
      <Navbar />

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                My <span className="gradient-text">Wishlist</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              {wishlist.length} saved beat{wishlist.length !== 1 ? "s" : ""}
            </p>
          </motion.div>

          {/* Search */}
          {wishlist.length > 0 && (
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your wishlist..."
                className="pl-12 h-12 bg-secondary border-border"
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && wishlist.length === 0 && (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring beats and save your favorites for later
              </p>
              <Link to="/beats">
                <Button variant="hero">
                  <Music2 className="w-4 h-4 mr-2" />
                  Browse Beats
                </Button>
              </Link>
            </div>
          )}

          {/* Beats List */}
          {!loading && filteredBeats.length > 0 && (
            <div className="space-y-3">
              {filteredBeats.map((beat, index) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl border transition-all",
                    currentBeat?.id === beat.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border/50 hover:border-primary/30"
                  )}
                  onMouseEnter={() => setHoveredId(beat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Cover & Play */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={beat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
                      alt={beat.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handlePlay(beat)}
                      className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-8 h-8 text-primary" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {beat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {beat.producer?.full_name || "Unknown Producer"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {beat.bpm} BPM
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {beat.genre.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Waveform (desktop) */}
                  <div className="hidden md:block w-48">
                    <MiniWaveform
                      beatId={beat.id}
                      isPlaying={currentBeat?.id === beat.id && isPlaying}
                      isHovered={hoveredId === beat.id}
                      barCount={32}
                      className="h-8"
                    />
                  </div>

                  {/* Price */}
                  <div className="text-right hidden sm:block">
                    <span className="font-display font-bold text-lg text-primary">
                      {formatPrice(Number(beat.price_basic))}
                    </span>
                    <p className="text-xs text-muted-foreground">Basic License</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToQueue(beat)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Add to queue"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(beat.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && wishlist.length > 0 && filteredBeats.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No beats match your search</p>
            </div>
          )}
        </div>

        {/* Global Player */}
        {currentBeat && <BeatPreviewPlayer />}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
