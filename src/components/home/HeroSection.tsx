import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 noise-overlay">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Top metadata strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="grid grid-cols-12 gap-4 md:gap-8 mb-10 md:mb-14"
        >
          <div className="col-span-6 md:col-span-3">
            <p className="editorial-label mb-2">№ 001 / Feature</p>
            <p className="font-mono text-[11px] text-foreground/70">
              {loading ? <Skeleton className="h-3 w-24" /> : settings.hero_badge}
            </p>
          </div>
          <div className="hidden md:block col-span-3">
            <p className="editorial-label mb-2">Filed</p>
            <p className="font-mono text-[11px] text-foreground/70">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="hidden md:block col-span-3">
            <p className="editorial-label mb-2">Discipline</p>
            <p className="font-mono text-[11px] text-foreground/70">Production · Mix · Master</p>
          </div>
          <div className="col-span-6 md:col-span-3 text-right">
            <p className="editorial-label mb-2">Edition</p>
            <p className="font-mono text-[11px] text-foreground/70">Vol. 01 - {new Date().getFullYear()}</p>
          </div>
        </motion.div>

        {/* Mega headline */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 items-end mb-10 md:mb-14">
          <div className="col-span-12 lg:col-span-9">
            {loading ? (
              <>
                <Skeleton className="h-24 w-3/4 mb-3" />
                <Skeleton className="h-24 w-2/3" />
              </>
            ) : (
              <h1 className="display-mega text-foreground" style={{ fontSize: "clamp(3.25rem, 11vw, 11rem)" }}>
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.05 }}
                    className="block"
                  >
                    {firstPart}
                    <span className="text-primary">.</span>
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.18 }}
                    className="block display-italic font-light text-foreground/90"
                  >
                    {secondPart}<span className="text-primary not-italic">.</span>
                  </motion.span>
                </span>
              </h1>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.45 }}
            className="col-span-12 lg:col-span-3 flex flex-col gap-3"
          >
            <p className="text-sm text-foreground/75 leading-relaxed max-w-xs">
              {loading ? <Skeleton className="h-4 w-full" /> : settings.hero_subtitle}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/beats"
                className="group inline-flex items-center justify-between gap-6 px-5 py-4 border border-foreground bg-foreground text-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
              >
                Explore Beats
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                to="/booking"
                className="group inline-flex items-center justify-between gap-6 px-5 py-4 border border-border hover:border-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em] text-foreground"
              >
                Book a Session
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="editorial-rule mb-10" />

        {/* Waveform + lead */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease, delay: 0.5 }}
          className="grid grid-cols-12 gap-4 md:gap-8 items-end mb-12"
        >
          <div className="col-span-12 md:col-span-8">
            <div className="relative h-32 md:h-40 overflow-hidden">
              <WaveformVisualizer />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-4">
            <p className="editorial-label mb-3">Live Session</p>
            <p className="font-mono text-[11px] text-foreground/70">
              Studio · Nairobi → Worldwide<br />
              Channels: 32 · Latency: 4ms
            </p>
          </div>
        </motion.div>

        <div className="editorial-rule mb-10" />

        {/* Stats - editorial table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-y border-border"
        >
          {[
            { idx: "01", value: settings.stat_projects, label: "Projects" },
            { idx: "02", value: settings.stat_artists, label: "Artists" },
            { idx: "03", value: settings.stat_nominations, label: "Nominations" },
            { idx: "04", value: settings.stat_access, label: "Studio Access" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 sm:px-6 py-6 sm:py-8">
              <p className="editorial-index mb-3">{stat.idx}</p>
              <p className="display-headline text-3xl sm:text-4xl md:text-5xl text-foreground mb-2">
                {loading ? <Skeleton className="h-9 w-16" /> : stat.value}
              </p>
              <p className="editorial-label">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
