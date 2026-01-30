import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Sparkles, Disc3, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformVisualizer } from "@/components/ui/WaveformVisualizer";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { Skeleton } from "@/components/ui/skeleton";

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export const HeroSection = () => {
  const { settings, loading } = usePlatformSettings();

  // Parse hero title for styling (split on period for two-line display)
  const titleParts = settings.hero_title.split(". ");
  const firstPart = titleParts[0] || "Global Sound";
  const secondPart = titleParts[1]?.replace(".", "") || "One Studio";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      {/* Animated Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Glow Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/15 rounded-full blur-[100px] md:blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-accent/15 rounded-full blur-[80px] md:blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Floating Music Icons - Hidden on mobile */}
      <motion.div
        className="absolute top-32 right-20 text-primary/10 hidden lg:block"
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Disc3 className="w-24 h-24" />
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-accent/10 hidden lg:block"
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
      >
        <Music2 className="w-20 h-20" />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass border border-primary/20 mb-6 sm:mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
            {loading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-xs sm:text-sm text-foreground/80 font-medium">{settings.hero_badge}</span>
            )}
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-4 sm:mb-6"
          >
            {loading ? (
              <>
                <Skeleton className="h-12 sm:h-16 md:h-20 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-12 sm:h-16 md:h-20 w-1/2 mx-auto" />
              </>
            ) : (
              <>
                <span className="text-foreground">{firstPart}.</span>
                <br />
                <motion.span 
                  className="gradient-text inline-block"
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  {secondPart}.
                </motion.span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
          >
            {loading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              settings.hero_subtitle
            )}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
          >
            <Link to="/beats" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="group relative overflow-hidden w-full sm:w-auto">
                <span className="relative z-10 flex items-center justify-center">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Explore Our Beats
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link to="/booking" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                Book a Session
              </Button>
            </Link>
          </motion.div>

          {/* Waveform Visualizer - Hidden on small mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative hidden sm:block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-2xl" />
            <WaveformVisualizer />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-16 border-t border-border/30"
          >
            {[
              { value: settings.stat_projects, label: "Projects Delivered" },
              { value: settings.stat_artists, label: "Global Artists" },
              { value: settings.stat_nominations, label: "Grammy Nominations" },
              { value: settings.stat_access, label: "Studio Access" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-center group"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2"
                  whileHover={{ color: "hsl(var(--primary))" }}
                >
                  {loading ? <Skeleton className="h-8 w-16 mx-auto" /> : stat.value}
                </motion.div>
                <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};
