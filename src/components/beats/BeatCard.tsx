import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  ShoppingCart,
  Headphones,
  Shield,
  Award,
  Globe,
  Heart,
  ListPlus,
  MapPin,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MpesaCheckoutDialog } from "@/components/payments/MpesaCheckoutDialog";
import { MiniWaveform } from "@/components/ui/MiniWaveform";
import { useCurrency } from "@/hooks/useCurrency";
import { useWishlist } from "@/hooks/useWishlist";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Beat = Database["public"]["Tables"]["beats"]["Row"] & {
  producer?: {
    full_name: string | null;
    badge: string | null;
    country: string | null;
  } | null;
};

interface BeatCardProps {
  beat: Beat;
  isPlaying: boolean;
  onPlay: () => void;
}

const getBadgeIcon = (badge: string | null) => {
  switch (badge) {
    case "global_staff":
      return <Globe className="w-3 h-3" />;
    case "partner":
      return <Shield className="w-3 h-3" />;
    case "verified_artist":
    case "top_producer":
      return <Award className="w-3 h-3" />;
    default:
      return null;
  }
};

const getBadgeLabel = (badge: string | null) => {
  switch (badge) {
    case "global_staff":
      return "WE Global Staff";
    case "partner":
      return "Partner";
    case "verified_artist":
      return "Verified Artist";
    case "top_producer":
      return "Top Producer";
    default:
      return null;
  }
};

export const BeatCard = ({ beat, isPlaying, onPlay }: BeatCardProps) => {
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<{ type: string; price: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { formatPrice } = useCurrency();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToQueue } = useAudioQueue();

  const isLiked = isInWishlist(beat.id);

  // For sample beats (no producer), show WE Global as producer with global_staff badge
  const isSampleBeat = !beat.producer_id;
  const producerName = isSampleBeat ? "WE Global Studio" : (beat.producer?.full_name || "Unknown Producer");
  const producerBadge = isSampleBeat ? "global_staff" : beat.producer?.badge;
  const producerCountry = isSampleBeat ? "Kenya" : beat.producer?.country;
  const isPartnerOrStaff = producerBadge === "global_staff" || producerBadge === "partner";

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWishlist(beat.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card border border-border overflow-hidden hover:border-primary/60 transition-colors duration-300 rounded-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial corner index */}
      <div className="absolute top-3 left-3 z-20 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 border border-border/60">
        {beat.bpm} BPM{beat.key ? ` · ${beat.key}` : ""}
      </div>

      {/* Partner/Staff indicator hairline */}
      {isPartnerOrStaff && (
        <div className="absolute top-0 left-0 right-0 h-px bg-primary z-10" />
      )}

      {/* Cover */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={beat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"}
          alt={beat.title}
          className="w-full h-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors duration-500" />

        {/* Play Button */}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center border border-primary-foreground/10">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            )}
          </div>
        </button>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            onClick={handleToggleWishlist}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "w-9 h-9 rounded-sm border border-border/70 flex items-center justify-center transition-colors",
              "bg-background/85 backdrop-blur-sm",
              isLiked ? "text-primary border-primary/60" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>
          <button
            onClick={handleAddToQueue}
            aria-label="Add to queue"
            className="w-9 h-9 rounded-sm border border-border/70 flex items-center justify-center bg-background/85 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Country (lucide pin, no emoji) */}
        {producerCountry && (
          <div className="absolute bottom-3 right-3 z-20">
            <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-sm border border-border/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
              <MapPin className="w-3 h-3 text-primary" />
              {producerCountry}
            </div>
          </div>
        )}
      </div>

      {/* Mini Waveform Preview */}
      <div className="px-5 pt-4 -mb-1">
        <MiniWaveform
          beatId={beat.id}
          isPlaying={isPlaying}
          isHovered={isHovered}
          progress={isPlaying ? 50 : 0}
          className="h-6"
          barCount={40}
        />
      </div>

      {/* Info */}
      <div className="p-5 pt-3 space-y-3">
        {/* Genre rule */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
            {beat.genre.replace("_", " ")}
          </span>
          <span className="flex-1 h-px bg-border" />
          {beat.mood && (
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {beat.mood}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
              {beat.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground truncate">by {producerName}</span>
              {producerBadge && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] border rounded-sm",
                    isPartnerOrStaff
                      ? "text-primary border-primary/50 bg-primary/5"
                      : "text-foreground border-border bg-secondary"
                  )}
                >
                  {getBadgeIcon(producerBadge)}
                  {getBadgeLabel(producerBadge)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Headphones className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs">{(beat.play_count || 0).toLocaleString()} plays</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              From
            </div>
            <div className="font-display font-bold text-lg sm:text-xl text-foreground tracking-tight">
              {formatPrice(Number(beat.price_basic))}
            </div>
          </div>
        </div>

        <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full mt-1 h-11 rounded-sm font-mono text-[10px] uppercase tracking-[0.22em]">
              <ShoppingCart className="w-4 h-4 mr-2" />
              License This Beat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl tracking-tight">Choose License</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {[
                { type: "Basic", price: Number(beat.price_basic), features: ["MP3 file", "2,500 streams", "Non-exclusive"] },
                { type: "Premium", price: Number(beat.price_premium), features: ["WAV + MP3", "Unlimited streams", "Non-exclusive"] },
                { type: "Exclusive", price: Number(beat.price_exclusive), features: ["All stems", "Unlimited use", "Full ownership"] },
              ].map((license) => (
                <button
                  key={license.type}
                  onClick={() => {
                    setSelectedLicense(license);
                    setShowLicenseDialog(false);
                    setShowMpesaDialog(true);
                  }}
                  className="w-full p-4 rounded-sm border border-border hover:border-primary/60 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-semibold text-lg tracking-tight">{license.type}</span>
                    <span className="font-display font-bold text-xl text-primary tracking-tight">{formatPrice(license.price)}</span>
                  </div>
                  <ul className="space-y-1">
                    {license.features.map((feature) => (
                      <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {selectedLicense && (
          <MpesaCheckoutDialog
            open={showMpesaDialog}
            onOpenChange={setShowMpesaDialog}
            amount={selectedLicense.price}
            description={`${beat.title} - ${selectedLicense.type} License`}
            paymentType="beat_purchase"
            referenceId={beat.id}
            metadata={{ license_type: selectedLicense.type.toLowerCase(), beat_title: beat.title }}
            onSuccess={() => {
              setShowMpesaDialog(false);
              setSelectedLicense(null);
            }}
          />
        )}
      </div>
    </motion.div>
  );
};
