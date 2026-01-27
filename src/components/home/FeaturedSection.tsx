import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Pause } from "lucide-react";
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

const ReleaseCard = ({ release, index }: { release: typeof featuredReleases[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={release.cover}
            alt={release.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex items-center justify-center"
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-110 transition-transform"
            >
              <Play className="w-6 h-6 text-primary-foreground ml-1" />
            </motion.button>
          </motion.div>

          {/* Genre Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground border border-border/50">
              {release.genre}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {release.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{release.artist}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturedSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Our Portfolio
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Featured <span className="gradient-text">Releases</span>
            </h2>
          </div>
          <Link to="/beats">
            <motion.span
              whileHover={{ x: 5 }}
              className="mt-4 md:mt-0 text-sm font-medium text-primary flex items-center gap-2"
            >
              View All Releases
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.span>
          </Link>
        </motion.div>

        {/* Releases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredReleases.map((release, index) => (
            <ReleaseCard key={release.title} release={release} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
