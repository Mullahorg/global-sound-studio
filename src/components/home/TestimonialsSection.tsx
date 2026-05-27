import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "WE Global transformed our sound completely. The attention to detail and creative input took our album to the next level.",
    author: "Marcus Chen",
    role: "Grammy-Nominated Artist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "The remote session experience was seamless. It felt like we were in the same room, and the final mix exceeded expectations.",
    author: "Sarah Williams",
    role: "Lead Singer, Aurora Band",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "Their beat licensing platform is incredibly intuitive. Found the perfect production for our campaign in minutes.",
    author: "David Park",
    role: "Creative Director, Studio X",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-32 noise-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-5"
          >
            <p className="editorial-eyebrow mb-6">№ 005 · Sauti za Wateja</p>
            <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              What artists
              <span className="block display-italic font-light text-foreground/90">
                say<span className="text-primary not-italic">.</span>
              </span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-6 md:col-start-7 flex md:items-end"
          >
            <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl">
              Field notes from collaborators across the continent and the diaspora — recorded between sessions.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
          {testimonials.map((t, index) => (
            <motion.figure
              key={t.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative border-r border-b border-border p-6 md:p-8 flex flex-col group hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="editorial-index">{String(index + 1).padStart(2, "0")}</span>
                <Quote className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
              </div>

              <blockquote className="font-display text-lg md:text-xl leading-snug text-foreground mb-8 flex-1">
                “{t.quote}”
              </blockquote>

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                ))}
              </div>

              <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 object-cover grayscale group-hover:grayscale-0 transition-all" />
                <div className="min-w-0">
                  <p className="font-display text-sm text-foreground truncate">{t.author}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">{t.role}</p>
                </div>
              </figcaption>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};
