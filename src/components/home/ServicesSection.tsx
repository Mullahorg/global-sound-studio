import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Radio, Video, Mic2, Sliders, ArrowUpRight } from "lucide-react";
import { ServiceSamplePlayer } from "@/components/services/ServiceSamplePlayer";
import { cn } from "@/lib/utils";

type Lang = "en" | "sw" | "both";

const services = [
  { idx: "01", icon: Music, frequency: 220,
    en: { title: "Music Production", description: "Full-scale production from concept to master, built around your sound." },
    sw: { title: "Utengenezaji wa Muziki", description: "Utengenezaji kamili kutoka wazo hadi master, uliojengwa kuzunguka sauti yako." } },
  { idx: "02", icon: Sliders, frequency: 277,
    en: { title: "Mixing & Mastering", description: "Radio-ready, streaming-optimized masters tuned for African and global ears." },
    sw: { title: "Mchanganyo na Umaliziaji", description: "Masters tayari kwa redio na streaming, zilizoboreshwa kwa masikio ya Kiafrika na ulimwengu." } },
  { idx: "03", icon: Radio, frequency: 330,
    en: { title: "Beat Licensing", description: "License exclusive and non-exclusive beats with transparent, flexible terms." },
    sw: { title: "Leseni za Beats", description: "Pata leseni za beats za pekee na za pamoja kwa masharti wazi na rahisi." } },
  { idx: "04", icon: Headphones, frequency: 392,
    en: { title: "Remote Sessions", description: "Collaborate with Nairobi-based producers from anywhere in the world." },
    sw: { title: "Vipindi vya Mbali", description: "Shirikiana na watayarishaji wa Nairobi ukiwa popote duniani." } },
  { idx: "05", icon: Mic2, frequency: 440,
    en: { title: "Songwriting", description: "Top-line writers and composers crafting your next breakout record." },
    sw: { title: "Uandishi wa Nyimbo", description: "Waandishi na watunzi bora wanaotengeneza wimbo wako utakaovuma." } },
  { idx: "06", icon: Video, frequency: 523,
    en: { title: "Sound for Film", description: "Original scores and post-production audio for film, TV and brand work." },
    sw: { title: "Sauti ya Filamu", description: "Muziki asilia na sauti ya baada ya utengenezaji kwa filamu, TV na chapa." } },
];

const COPY: Record<Lang, { eyebrow: string; heading: [string, string]; intro: string; toggleLabel: string; options: Record<Lang, string> }> = {
  en: {
    eyebrow: "№ 002 · Services",
    heading: ["Production", "services"],
    intro: "End-to-end music production for artists, labels and brands. Crafted in Nairobi, engineered for the world.",
    toggleLabel: "Language",
    options: { en: "EN", sw: "SW", both: "Both" },
  },
  sw: {
    eyebrow: "№ 002 · Huduma",
    heading: ["Huduma za", "utengenezaji"],
    intro: "Utengenezaji kamili wa muziki kwa wasanii, lebo na chapa. Umeundwa Nairobi, kwa ajili ya dunia.",
    toggleLabel: "Lugha",
    options: { en: "EN", sw: "SW", both: "Zote" },
  },
  both: {
    eyebrow: "№ 002 · Services · Huduma",
    heading: ["Production", "services"],
    intro: "End-to-end music production for artists, labels and brands. — Utengenezaji kamili wa muziki kwa wasanii, lebo na chapa.",
    toggleLabel: "Language · Lugha",
    options: { en: "EN", sw: "SW", both: "Both · Zote" },
  },
};

export const ServicesSection = () => {
  const [lang, setLang] = useState<Lang>("both");
  const copy = COPY[lang];

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
            <p className="editorial-eyebrow mb-6">{copy.eyebrow}</p>
            <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}>
              {copy.heading[0]}
              <span className="block display-italic font-light text-foreground/90">{copy.heading[1]}<span className="text-primary not-italic">.</span></span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-7 md:col-start-6 flex md:items-end"
          >
            <div className="w-full flex flex-col gap-6 md:gap-8">
              <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl">
                {copy.intro}
              </p>
              {/* Language toggle */}
              <div
                role="group"
                aria-label={copy.toggleLabel}
                className="inline-flex self-start border border-border bg-background/40"
              >
                <span className="hidden sm:flex items-center px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 border-r border-border">
                  {copy.toggleLabel}
                </span>
                {(["en", "sw", "both"] as Lang[]).map((opt) => {
                  const active = lang === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLang(opt)}
                      aria-pressed={active}
                      className={cn(
                        "px-3 sm:px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors border-r last:border-r-0 border-border",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      {copy.options[opt]}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Services grid - editorial brutalist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
          {services.map((service, index) => {
            const primary = lang === "sw" ? service.sw : service.en;
            const secondary = lang === "both" ? service.sw : null;
            return (
            <motion.div
              key={service.idx}
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
                  {primary.title}
                </h3>
                {secondary && (
                  <p className="display-italic font-light text-base md:text-lg text-foreground/60 mb-3">
                    {secondary.title}
                  </p>
                )}
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 mb-4">
                  {lang === "en" ? service.sw.title : lang === "sw" ? service.en.title : `${service.en.title} · ${service.sw.title}`}
                </p>

                <p className="text-sm text-foreground/70 leading-relaxed max-w-xs">
                  {primary.description}
                </p>
                {secondary && (
                  <p className="text-sm text-foreground/55 leading-relaxed max-w-xs mt-2 italic">
                    {secondary.description}
                  </p>
                )}

                {/* Audio preview */}
                <div className="mt-6">
                  <ServiceSamplePlayer
                    id={`service-${service.idx}`}
                    frequency={service.frequency}
                    label={lang === "en" ? "Preview" : lang === "sw" ? "Sikiliza" : "Preview · Sikiliza"}
                  />
                </div>

                {/* hover underline accent */}
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
