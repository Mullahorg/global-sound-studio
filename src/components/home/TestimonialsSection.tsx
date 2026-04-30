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
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Client Stories</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            What Artists <span className="text-primary">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-full p-6 rounded-lg border border-border/30">
                <Quote className="w-6 h-6 text-primary/20 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
