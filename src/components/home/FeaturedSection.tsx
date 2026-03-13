import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
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
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg border border-border/30 hover:border-border transition-all">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={release.cover}
            alt={release.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/60 flex items-center justify-center"
          >
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: isHovered ? 1 : 0.8 }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
            >
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </motion.button>
          </motion.div>
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded text-[10px] font-medium bg-background/80 text-foreground border border-border/30">
              {release.genre}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm text-foreground">{release.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{release.artist}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturedSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-10"
        >
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Portfolio</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Featured <span className="text-primary">Releases</span>
            </h2>
          </div>
          <Link to="/beats" className="mt-3 md:mt-0 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            View all →
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredReleases.map((release, index) => (
            <ReleaseCard key={release.title} release={release} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
