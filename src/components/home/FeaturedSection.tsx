import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const featuredReleases = [
  {
    title: "Midnight Dreams",
    artist: "Luna Wave",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    title: "Golden Hour",
    artist: "Solar Collective",
    genre: "R&B / Soul",
    cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
  },
  {
    title: "Urban Legends",
    artist: "Metro Sounds",
    genre: "Hip-Hop",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
  },
  {
    title: "Echoes",
    artist: "Northern Lights",
    genre: "Ambient",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
  },
];

const ReleaseCard = ({ release, index }: { release: (typeof featuredReleases)[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group border-r border-b border-border"
    >
      <Link to="/beats" className="block p-4 md:p-5 hover:bg-secondary/40 transition-colors relative h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="editorial-index">{String(index + 1).padStart(2, "0")}</span>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="relative aspect-square overflow-hidden mb-4">
          <img
            src={release.cover}
            alt={release.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/50 flex items-center justify-center"
          >
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              className="w-12 h-12 bg-primary flex items-center justify-center"
            >
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" strokeWidth={1.5} />
            </motion.span>
          </motion.div>
          <span className="absolute top-2 left-2 px-2 py-1 bg-background/90 border border-border font-mono text-[9px] uppercase tracking-[0.18em] text-foreground">
            {release.genre}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base md:text-lg text-foreground group-hover:text-primary transition-colors leading-tight truncate">
            {release.title}
          </h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5 truncate">
          {release.artist}
        </p>
      </Link>
    </motion.div>
  );
};

export const FeaturedSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-10 md:mb-14 items-end">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-8"
          >
            <p className="editorial-eyebrow mb-6">№ 004 · Portfolio</p>
            <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              Featured
              <span className="display-italic font-light text-foreground/90"> releases<span className="text-primary not-italic">.</span></span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-4 md:text-right"
          >
            <Link
              to="/beats"
              className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground hover:text-primary transition-colors"
            >
              View all
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
          {featuredReleases.map((release, index) => (
            <ReleaseCard key={release.title} release={release} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
