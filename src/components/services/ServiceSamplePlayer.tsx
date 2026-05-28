import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { MiniWaveform } from "@/components/ui/MiniWaveform";
import { cn } from "@/lib/utils";

interface ServiceSamplePlayerProps {
  id: string;
  /** Base frequency (Hz) used to synthesize a short distinct sample per service */
  frequency: number;
  /** Optional URL to a real audio sample. If omitted, a synthesized tone is played. */
  src?: string;
  label?: string;
  className?: string;
}

/**
 * Lightweight per-service audio preview. Plays a short (~4s) sample with an animated waveform.
 * Uses Web Audio synth when no `src` is provided so the feature works without asset files.
 */
export const ServiceSamplePlayer = ({ id, frequency, src, label = "Preview", className }: ServiceSamplePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current?.();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
    setProgress(0);
  };

  const playSynth = () => {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    const duration = 3.2;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    master.connect(ctx.destination);

    // Two detuned oscillators for warmth
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = "sine";
    oscB.type = "triangle";
    oscA.frequency.setValueAtTime(frequency, now);
    oscB.frequency.setValueAtTime(frequency * 1.5, now);
    // gentle melodic motion
    oscA.frequency.linearRampToValueAtTime(frequency * 1.12, now + duration * 0.6);
    oscA.frequency.linearRampToValueAtTime(frequency, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(2400, now + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(800, now + duration);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(master);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + duration);
    oscB.stop(now + duration);

    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    stopRef.current = () => {
      try {
        oscA.stop();
        oscB.stop();
      } catch {}
    };
    setIsPlaying(true);
  };

  const playFile = () => {
    if (!src) return;
    const audio = audioRef.current ?? new Audio(src);
    audioRef.current = audio;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    setIsPlaying(true);
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      stop();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    stopRef.current = () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  };

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaying) {
      stop();
      return;
    }
    if (src) playFile();
    else playSynth();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 border border-border bg-background/40 px-3 py-2",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        className={cn(
          "shrink-0 w-8 h-8 flex items-center justify-center border border-border transition-colors",
          "hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:outline-none",
          isPlaying && "border-primary text-primary bg-primary/5"
        )}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" strokeWidth={2} /> : <Play className="w-3.5 h-3.5 translate-x-[1px]" strokeWidth={2} />}
      </button>
      <MiniWaveform beatId={id} isPlaying={isPlaying} isHovered={isPlaying} progress={progress} className="flex-1 h-7" barCount={28} />
      <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80 shrink-0">
        {isPlaying ? "Playing" : label}
      </span>
    </div>
  );
};
