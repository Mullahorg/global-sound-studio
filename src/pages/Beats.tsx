import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Search, Music2, Upload, Plus, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BeatCard } from "@/components/beats/BeatCard";
import { BeatPreviewPlayer } from "@/components/beats/BeatPreviewPlayer";
import { BeatUploadDialog } from "@/components/beats/BeatUploadDialog";
import { PageMeta } from "@/components/seo/PageMeta";
import { useBeats } from "@/hooks/useBeats";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BeatGenre = Database["public"]["Enums"]["beat_genre"];
type BeatMood = Database["public"]["Enums"]["beat_mood"];

const genres: { value: BeatGenre | "all"; label: string }[] = [
  { value: "all", label: "All Genres" },
  { value: "afrobeats", label: "Afrobeats" },
  { value: "hip_hop", label: "Hip-Hop" },
  { value: "rnb", label: "R&B" },
  { value: "trap", label: "Trap" },
  { value: "electronic", label: "Electronic" },
  { value: "ambient", label: "Ambient" },
  { value: "pop", label: "Pop" },
];

const moods: { value: BeatMood | "all"; label: string }[] = [
  { value: "all", label: "All Moods" },
  { value: "energetic", label: "Energetic" },
  { value: "chill", label: "Chill" },
  { value: "dark", label: "Dark" },
  { value: "uplifting", label: "Uplifting" },
  { value: "romantic", label: "Romantic" },
];

const Beats = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<BeatGenre | "all">("all");
  const [selectedMood, setSelectedMood] = useState<BeatMood | "all">("all");
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 180]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isProducer, setIsProducer] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { currentBeat, playBeat, isPlaying } = useAudioQueue();

  const { beats, loading, refetch } = useBeats({
    searchQuery,
    genre: selectedGenre,
    mood: selectedMood,
    bpmRange,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        
        const hasProducerRole = roles?.some(r => r.role === "producer" || r.role === "admin");
        setIsProducer(!!hasProducerRole);
      }
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlayBeat = (beat: typeof beats[0]) => {
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

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Beat Marketplace"
        description="Browse exclusive beats from top African producers. Find Afrobeats, Hip-Hop, R&B, and Trap beats with flexible licensing options."
        path="/beats"
      />
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Kenya & Africa First
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 mt-2">
              Beat <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse exclusive beats from top African producers. Find the perfect sound for your next hit.
            </p>
          </motion.div>

          {/* Producer Upload CTA */}
          {isProducer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-between"
            >
              <div>
                <h3 className="font-display font-semibold text-lg">Got new heat? 🔥</h3>
                <p className="text-sm text-muted-foreground">Upload your beats and start selling to artists worldwide.</p>
              </div>
              <Button variant="hero" onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Beat
              </Button>
            </motion.div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beats or producers..."
                className="pl-12 h-12 bg-secondary border-border"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedGenre} onValueChange={(v) => setSelectedGenre(v as BeatGenre | "all")}>
                <SelectTrigger className="w-[160px] h-12 bg-secondary border-border">
                  <Music2 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMood} onValueChange={(v) => setSelectedMood(v as BeatMood | "all")}>
                <SelectTrigger className="w-[140px] h-12 bg-secondary border-border">
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                BPM
              </Button>
            </div>
          </div>

          {/* BPM Filter */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-8 p-6 rounded-xl bg-card border border-border/50"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">BPM Range:</span>
                <span className="text-sm text-muted-foreground">{bpmRange[0]}</span>
                <Slider
                  value={bpmRange}
                  onValueChange={(v) => setBpmRange(v as [number, number])}
                  min={60}
                  max={180}
                  step={5}
                  className="flex-1 max-w-md"
                />
                <span className="text-sm text-muted-foreground">{bpmRange[1]}</span>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <p className="text-muted-foreground mb-6">
            {loading ? "Loading..." : `Showing ${beats.length} beats`}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Beats Grid */}
          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {beats.map((beat) => (
                <BeatCard
                  key={beat.id}
                  beat={beat}
                  isPlaying={currentBeat?.id === beat.id && isPlaying}
                  onPlay={() => handlePlayBeat(beat)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && beats.length === 0 && (
            <div className="text-center py-16">
              <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No beats found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedGenre !== "all" || selectedMood !== "all"
                  ? "Try adjusting your filters or search query."
                  : "Be the first to upload a beat!"}
              </p>
              {isProducer && (
                <Button variant="hero" onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Beat
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Global Beat Preview Player */}
        {currentBeat && <BeatPreviewPlayer />}
      </main>

      <Footer />

      {/* Upload Dialog */}
      <BeatUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Beats;
