import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl?: string;
  title: string;
  artist: string;
  coverUrl?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
  compact?: boolean;
}

export const AudioPlayer = ({
  audioUrl,
  title,
  artist,
  coverUrl,
  onNext,
  onPrevious,
  className,
  compact = false,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate static waveform for display
  useEffect(() => {
    const generateWaveform = () => {
      const bars = compact ? 30 : 60;
      const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
      setWaveformData(data);
    };
    generateWaveform();
  }, [compact, audioUrl]);

  // Initialize audio context and analyzer
  const initAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      sourceRef.current = source;
    } catch (e) {
      console.log("Audio context already initialized or not supported");
    }
  }, []);

  // Draw waveform visualization
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

      ctx.fillStyle = "rgba(10, 12, 16, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, "hsl(190, 100%, 50%)");
        gradient.addColorStop(0.5, "hsl(38, 100%, 55%)");
        gradient.addColorStop(1, "hsl(190, 100%, 60%)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }, []);

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

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      initAudioContext();
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
      onNext?.();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50", className)}>
        {/* Cover */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
            alt={title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-0.5 h-4 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{title}</h4>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
        </div>

        {/* Mini Waveform Progress */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
          <div className="flex-1 h-8 flex items-center gap-0.5">
            {waveformData.map((height, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all",
                  (i / waveformData.length) * 100 <= progress
                    ? "bg-primary"
                    : "bg-muted"
                )}
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>

        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
          )}
        </button>

        <audio
          ref={audioRef}
          src={audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-2xl bg-card border border-border/50 overflow-hidden",
        className
      )}
    >
      {/* Waveform Canvas */}
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-24 rounded-xl bg-background/50"
        />
        
        {/* Static Waveform Overlay (when not playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4">
            {waveformData.map((height, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: i * 0.01 }}
                className={cn(
                  "w-1.5 rounded-full",
                  (i / waveformData.length) * 100 <= progress
                    ? "bg-gradient-to-t from-primary/60 to-primary"
                    : "bg-muted/50"
                )}
                style={{ height: `${height * 80}px` }}
              />
            ))}
          </div>
        )}

        {/* Progress Overlay */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 glow-primary">
          <img
            src={coverUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"}
            alt={title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 h-6 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-xl text-foreground truncate">{title}</h3>
          <p className="text-muted-foreground truncate">{artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-muted-foreground w-12">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={0.1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground w-12">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isShuffle ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isRepeat ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
        <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={1}
          step={0.01}
          className="w-32"
        />
      </div>

      <audio
        ref={audioRef}
        src={audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </motion.div>
  );
};
