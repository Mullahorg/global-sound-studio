import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Heart, ShoppingCart,
  ListMusic, Shuffle, Repeat, Trash2, GripVertical
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface BeatPreviewPlayerProps {
  onPurchase?: () => void;
  className?: string;
}

export const BeatPreviewPlayer = ({
  onPurchase,
  className,
}: BeatPreviewPlayerProps) => {
  const {
    queue,
    currentBeat,
    currentIndex,
    isPlaying,
    isQueueOpen,
    playNext,
    playPrevious,
    togglePlay,
    setIsPlaying,
    setCurrentBeat,
    setIsQueueOpen,
    removeFromQueue,
    clearQueue,
  } = useAudioQueue();

  const { isInWishlist, toggleWishlist } = useWishlist();

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");

  const isLiked = currentBeat ? isInWishlist(currentBeat.id) : false;

  // Generate pseudo-random waveform based on beat ID for consistency
  useEffect(() => {
    if (!currentBeat) return;
    const generateWaveform = () => {
      const bars = 80;
      const seed = currentBeat.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const data = Array.from({ length: bars }, (_, i) => {
        const rand = Math.sin(seed + i * 0.5) * 0.5 + 0.5;
        return rand * 0.7 + 0.3;
      });
      setWaveformBars(data);
    };
    generateWaveform();
  }, [currentBeat?.id]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      sourceRef.current = source;
    } catch (e) {
      console.log("Audio context initialization:", e);
    }
  }, []);

  // Draw real-time waveform
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * centerY * 0.9;
        const x = i * barWidth;

        // Create gradient
        const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
        gradient.addColorStop(0, "hsl(190, 100%, 55%)");
        gradient.addColorStop(0.5, "hsl(38, 100%, 60%)");
        gradient.addColorStop(1, "hsl(190, 100%, 55%)");

        ctx.fillStyle = gradient;
        // Draw mirrored bars
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(x, centerY, barWidth - 1, barHeight * 0.6);
      }
    };

    draw();
  }, []);

  // Handle play state
  useEffect(() => {
    if (isPlaying && analyzerRef.current) {
      drawWaveform();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, drawWaveform]);

  // Sync audio with isPlaying state
  useEffect(() => {
    if (!audioRef.current || !currentBeat) return;

    if (isPlaying) {
      if (!audioContextRef.current) {
        initAudioContext();
      }
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioRef.current.play().catch(console.log);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentBeat, initAudioContext]);

  // Reset when beat changes
  useEffect(() => {
    if (!currentBeat || !audioRef.current) return;
    
    audioRef.current.load();
    setCurrentTime(0);
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(console.log);
      }
    }
  }, [currentBeat?.id]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      initAudioContext();
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    togglePlay();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleEnded = () => {
    if (repeat === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeat === "all" || currentIndex < queue.length - 1) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentBeat(null);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const cycleRepeat = () => {
    setRepeat((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentBeat) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border",
          className
        )}
      >
        <div className="container mx-auto px-4 py-4">
          {/* Waveform Section */}
          <div className="relative mb-4 rounded-xl overflow-hidden bg-card/50 border border-border/30">
            {/* Real-time Waveform Canvas */}
            <canvas
              ref={canvasRef}
              width={1200}
              height={120}
              className="w-full h-24 md:h-32"
            />

            {/* Static Waveform Overlay when not playing */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center gap-[2px] px-4"
                >
                  {waveformBars.map((height, i) => {
                    const isPlayed = (i / waveformBars.length) * 100 <= progress;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.005 }}
                        className="relative flex flex-col items-center justify-center gap-0.5"
                      >
                        <div
                          className={cn(
                            "w-1 md:w-1.5 rounded-full transition-colors duration-200",
                            isPlayed
                              ? "bg-gradient-to-t from-primary/80 to-accent"
                              : "bg-muted/60"
                          )}
                          style={{ height: `${height * 40}px` }}
                        />
                        <div
                          className={cn(
                            "w-1 md:w-1.5 rounded-full opacity-40 transition-colors duration-200",
                            isPlayed
                              ? "bg-gradient-to-b from-primary/60 to-transparent"
                              : "bg-muted/30"
                          )}
                          style={{ height: `${height * 20}px` }}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress overlay line */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-4">
            {/* Cover & Info */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={currentBeat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
                  alt={currentBeat.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 h-4 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden sm:block min-w-0 max-w-[150px] md:max-w-[200px]">
                <h4 className="font-display font-semibold text-foreground truncate">{currentBeat.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {currentBeat.producer?.full_name || "Unknown Producer"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-accent font-medium">{currentBeat.bpm} BPM</span>
                  {currentBeat.key && <span className="text-xs text-muted-foreground">• {currentBeat.key}</span>}
                </div>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {/* Playback Controls */}
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={playPrevious}
                  disabled={queue.length === 0}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  ) : (
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  disabled={queue.length === 0}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <button
                  onClick={cycleRepeat}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors relative",
                    repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Repeat className="w-4 h-4" />
                  {repeat === "one" && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">1</span>
                  )}
                </button>
              </div>

              {/* Time & Progress */}
              <div className="flex items-center gap-2 w-full max-w-md">
                <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration || 100}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Volume */}
              <div className="hidden md:flex items-center gap-2">
                <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-20"
                />
              </div>

              {/* Queue Button */}
              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors relative",
                  isQueueOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListMusic className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Like */}
              <button
                onClick={() => toggleWishlist(currentBeat.id)}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </button>

              {/* Purchase */}
              <Button size="sm" variant="hero" onClick={onPurchase} className="hidden sm:flex gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden md:inline">License</span>
              </Button>

              {/* Close */}
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {currentBeat && (
          <audio
            ref={audioRef}
            src={currentBeat.audio_url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            crossOrigin="anonymous"
          />
        )}
      </motion.div>

      {/* Queue Sidebar */}
      <AnimatePresence>
        {isQueueOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-24 w-80 md:w-96 z-40 bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-display font-semibold text-lg">Queue</h3>
                <p className="text-sm text-muted-foreground">{queue.length} tracks</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearQueue} disabled={queue.length === 0}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <button
                  onClick={() => setIsQueueOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-80px)]">
              <div className="p-4 space-y-2">
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListMusic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your queue is empty</p>
                    <p className="text-sm">Add beats from the marketplace</p>
                  </div>
                ) : (
                  queue.map((beat, index) => (
                    <motion.div
                      key={beat.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group",
                        index === currentIndex
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
                      <img
                        src={beat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100"}
                        alt={beat.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          index === currentIndex && "text-primary"
                        )}>
                          {beat.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {beat.producer?.full_name || "Unknown"}
                        </p>
                      </div>
                      {index === currentIndex && isPlaying && (
                        <div className="flex gap-0.5">
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(beat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
