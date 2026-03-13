import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformVisualizer } from "@/components/ui/WaveformVisualizer";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroSection = () => {
  const { settings, loading } = usePlatformSettings();

  const titleParts = settings.hero_title.split(". ");
  const firstPart = titleParts[0] || "Global Sound";
  const secondPart = titleParts[1]?.replace(".", "") || "One Studio";

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-16">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 mb-8"
          >
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <span className="text-xs text-muted-foreground">{settings.hero_badge}</span>
            )}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
          >
            {loading ? (
              <>
                <Skeleton className="h-14 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-14 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-foreground">{firstPart}.</span>
                <br />
                <span className="text-primary">{secondPart}.</span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            {loading ? <Skeleton className="h-5 w-full" /> : settings.hero_subtitle}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
          >
            <Link to="/beats" className="w-full sm:w-auto">
              <Button variant="default" size="lg" className="w-full sm:w-auto group">
                <Play className="w-4 h-4 mr-2" />
                Explore Beats
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to="/booking" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Book a Session
              </Button>
            </Link>
          </motion.div>

          {/* Waveform */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden sm:block"
          >
            <WaveformVisualizer />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-border/20"
          >
            {[
              { value: settings.stat_projects, label: "Projects" },
              { value: settings.stat_artists, label: "Artists" },
              { value: settings.stat_nominations, label: "Nominations" },
              { value: settings.stat_access, label: "Studio Access" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {loading ? <Skeleton className="h-8 w-14 mx-auto" /> : stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
