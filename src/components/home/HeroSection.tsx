import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Headphones, Mic2, Sparkles, Radio, Play } from "lucide-react";
import { WaveformVisualizer } from "@/components/ui/WaveformVisualizer";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Skeleton } from "@/components/ui/skeleton";

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export const HeroSection = () => {
  const { settings, loading } = usePlatformSettings();

  const titleParts = settings.hero_title.split(". ");
  const firstPart = titleParts[0] || "Global Sound";
  const secondPart = titleParts[1]?.replace(".", "") || "One Studio";

  return (
    <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
      {/* Ambient gradient washes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
             style={{ background: "var(--gradient-blaze)" }} />
        <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl"
             style={{ background: "linear-gradient(135deg, hsl(var(--tertiary)), hsl(var(--accent)))" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow chip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-wrap items-center gap-3 mb-8 md:mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border shadow-soft text-[11px] sm:text-xs font-medium text-foreground/80">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
              <span className="relative w-2 h-2 rounded-full bg-primary" />
            </span>
            {loading ? "Live from Nairobi" : settings.hero_badge}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="w-3 h-3" /> Vol. 01 · {new Date().getFullYear()}
          </span>
        </motion.div>

        {/* Bento Grid: 6 cols on md, 12 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(0,auto)] gap-3 sm:gap-4 lg:gap-5">
          {/* HERO HEADLINE — big tile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="sm:col-span-6 lg:col-span-8 lg:row-span-2 relative rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden text-primary-foreground shadow-card"
            style={{ background: "var(--gradient-sunset)" }}
          >
            <div aria-hidden className="absolute inset-0 opacity-20 mix-blend-overlay"
                 style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 90%, white 0%, transparent 35%)" }} />
            <div className="relative">
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-white/80 mb-5">
                № 001 / Feature
              </p>
              {loading ? (
                <Skeleton className="h-32 w-3/4 mb-4" />
              ) : (
                <h1
                  className="display-mega text-white"
                  style={{ fontSize: "clamp(2.5rem, 8vw, 7.5rem)" }}
                >
                  <span className="block">{firstPart}.</span>
                  <span className="block italic font-normal text-white/95">{secondPart}.</span>
                </h1>
              )}
              <p className="mt-6 text-sm sm:text-base text-white/90 leading-relaxed max-w-xl">
                {loading ? <Skeleton className="h-4 w-full bg-white/20" /> : settings.hero_subtitle}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/booking"
                  className="group inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white text-foreground font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-soft"
                >
                  Book a Session
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  to="/beats"
                  className="group inline-flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm text-white font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Explore Beats
                </Link>
              </div>
            </div>
          </motion.div>

          {/* LIVE SESSION CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="sm:col-span-3 lg:col-span-4 rounded-[1.75rem] p-5 sm:p-6 bg-card border border-border shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex w-9 h-9 rounded-full items-center justify-center bg-primary/10 text-primary">
                  <Radio className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Live Session</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">On Air</span>
            </div>
            <div className="relative h-20 overflow-hidden rounded-xl bg-secondary/60">
              <WaveformVisualizer />
            </div>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Nairobi → Worldwide · 32 channels · 4ms latency
            </p>
          </motion.div>

          {/* ICON ACCENT CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.18 }}
            className="sm:col-span-3 lg:col-span-4 rounded-[1.75rem] p-5 sm:p-6 text-white shadow-soft relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--tertiary)), hsl(var(--accent)))" }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex w-11 h-11 rounded-2xl items-center justify-center bg-white/15 backdrop-blur-sm">
                <Headphones className="w-5 h-5" />
              </span>
              <ArrowUpRight className="w-5 h-5 opacity-70" />
            </div>
            <p className="mt-6 text-2xl sm:text-3xl font-serif leading-tight">
              Mix &amp; master with award-winning engineers.
            </p>
            <Link to="/services" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-white">
              See services →
            </Link>
          </motion.div>

          {/* STAT TILES — 4 small tiles on lg, 2x2 on mobile */}
          {[
            { idx: "01", value: settings.stat_projects, label: "Projects", tint: "bg-secondary text-foreground" },
            { idx: "02", value: settings.stat_artists, label: "Artists", tint: "bg-primary text-primary-foreground" },
            { idx: "03", value: settings.stat_nominations, label: "Nominations", tint: "bg-card border border-border text-foreground" },
            { idx: "04", value: settings.stat_access, label: "Studio Access", tint: "bg-foreground text-background" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.25 + i * 0.06 }}
              className={`sm:col-span-3 lg:col-span-3 rounded-2xl p-4 sm:p-5 shadow-soft ${stat.tint}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">{stat.idx}</p>
              <p className="font-serif text-3xl sm:text-4xl leading-none mb-1.5">
                {loading ? <Skeleton className="h-8 w-14" /> : stat.value}
              </p>
              <p className="text-[11px] sm:text-xs font-medium opacity-80">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
