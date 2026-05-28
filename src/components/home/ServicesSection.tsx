import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Radio, Video, Mic2, Sliders, ArrowUpRight } from "lucide-react";
import { ServiceSamplePlayer } from "@/components/services/ServiceSamplePlayer";

const services = [
  { idx: "01", icon: Music, title: "Music Production", swahili: "Utengenezaji", description: "Full-scale production from concept to master, built around your sound.", frequency: 220 },
  { idx: "02", icon: Sliders, title: "Mixing & Mastering", swahili: "Mchanganyo", description: "Radio-ready, streaming-optimized masters tuned for African and global ears.", frequency: 277 },
  { idx: "03", icon: Radio, title: "Beat Licensing", swahili: "Leseni za Beats", description: "License exclusive and non-exclusive beats with transparent, flexible terms.", frequency: 330 },
  { idx: "04", icon: Headphones, title: "Remote Sessions", swahili: "Vipindi vya Mbali", description: "Collaborate with Nairobi-based producers from anywhere in the world.", frequency: 392 },
  { idx: "05", icon: Mic2, title: "Songwriting", swahili: "Uandishi wa Nyimbo", description: "Top-line writers and composers crafting your next breakout record.", frequency: 440 },
  { idx: "06", icon: Video, title: "Sound for Film", swahili: "Sauti ya Filamu", description: "Original scores and post-production audio for film, TV and brand work.", frequency: 523 },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-20 md:py-32 noise-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-4"
          >
            <p className="editorial-eyebrow mb-6">№ 002 · Huduma</p>
            <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}>
              Production
              <span className="block display-italic font-light text-foreground/90">services<span className="text-primary not-italic">.</span></span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-7 md:col-start-6 flex md:items-end"
          >
            <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl">
              End-to-end music production for artists, labels and brands. Crafted in Nairobi, engineered for the world.
            </p>
          </motion.div>
        </div>

        {/* Services grid - editorial brutalist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="border-r border-b border-border"
            >
              <Link
                to="/services"
                className="group relative block p-6 md:p-8 h-full transition-colors hover:bg-secondary/40 focus-visible:bg-secondary/40 outline-none"
              >
                {/* index + arrow row */}
                <div className="flex items-start justify-between mb-8 md:mb-10">
                  <span className="editorial-index">{service.idx}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                {/* icon */}
                <div className="w-10 h-10 mb-6 flex items-center justify-center border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                  <service.icon className="w-4 h-4" strokeWidth={1.5} />
                </div>

                {/* title */}
                <h3 className="display-headline text-2xl md:text-[28px] text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 mb-4">
                  {service.swahili}
                </p>

                <p className="text-sm text-foreground/70 leading-relaxed max-w-xs">
                  {service.description}
                </p>

                {/* Audio preview */}
                <div className="mt-6">
                  <ServiceSamplePlayer
                    id={`service-${service.idx}`}
                    frequency={service.frequency}
                    label={service.swahili}
                  />
                </div>

                {/* hover underline accent */}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
