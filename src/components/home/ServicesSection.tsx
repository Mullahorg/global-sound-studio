import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Radio, Video, Mic2, Sliders, ArrowUpRight, Calendar } from "lucide-react";
import { ServiceSamplePlayer } from "@/components/services/ServiceSamplePlayer";
import { cn } from "@/lib/utils";

type Lang = "en" | "sw" | "both";

const services = [
  { idx: "01", icon: Music, frequency: 220, bookingType: "production",
    en: { title: "Music Production", description: "Full-scale production from concept to master, built around your sound." },
    sw: { title: "Utengenezaji wa Muziki", description: "Utengenezaji kamili kutoka wazo hadi master, uliojengwa kuzunguka sauti yako." } },
  { idx: "02", icon: Sliders, frequency: 277, bookingType: "mixing",
    en: { title: "Mixing & Mastering", description: "Radio-ready, streaming-optimized masters tuned for African and global ears." },
    sw: { title: "Mchanganyo na Umaliziaji", description: "Masters tayari kwa redio na streaming, zilizoboreshwa kwa masikio ya Kiafrika na ulimwengu." } },
  { idx: "03", icon: Radio, frequency: 330, bookingType: null,
    en: { title: "Beat Licensing", description: "License exclusive and non-exclusive beats with transparent, flexible terms." },
    sw: { title: "Leseni za Beats", description: "Pata leseni za beats za pekee na za pamoja kwa masharti wazi na rahisi." } },
  { idx: "04", icon: Headphones, frequency: 392, bookingType: "recording",
    en: { title: "Remote Sessions", description: "Collaborate with Nairobi-based producers from anywhere in the world." },
    sw: { title: "Vipindi vya Mbali", description: "Shirikiana na watayarishaji wa Nairobi ukiwa popote duniani." } },
  { idx: "05", icon: Mic2, frequency: 440, bookingType: "consultation",
    en: { title: "Songwriting", description: "Top-line writers and composers crafting your next breakout record." },
    sw: { title: "Uandishi wa Nyimbo", description: "Waandishi na watunzi bora wanaotengeneza wimbo wako utakaovuma." } },
  { idx: "06", icon: Video, frequency: 523, bookingType: "production",
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

        {/* Services bento grid — Canva-style */}
        <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 auto-rows-[minmax(0,auto)]">
          {services.map((service, index) => {
            const primary = lang === "sw" ? service.sw : service.en;
            const secondary = lang === "both" ? service.sw : null;
            const bookLabel = lang === "en" ? "Book a Session" : lang === "sw" ? "Weka Nafasi" : "Book · Weka Nafasi";
            const browseLabel = lang === "en" ? "Browse Beats" : lang === "sw" ? "Vinjari Beats" : "Browse · Vinjari";
            // Bento sizing — featured tiles span more
            const isFeatured = index === 0 || index === 3;
            const isAccent = index === 1;
            const spanClass = isFeatured
              ? "sm:col-span-6 lg:col-span-8"
              : isAccent
              ? "sm:col-span-6 lg:col-span-4"
              : "sm:col-span-3 lg:col-span-4";
            // Alternating tile styles
            const tileStyle = isFeatured
              ? "bg-card border border-border/60"
              : isAccent
              ? "text-white border-0"
              : "bg-card border border-border/60";
            const accentBg = isAccent
              ? { background: "var(--gradient-blaze)" }
              : undefined;
            return (
            <motion.div
              key={service.idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                "bento-tile group relative p-6 md:p-8 flex flex-col",
                spanClass,
                tileStyle
              )}
              style={accentBg}
            >
              {/* Ambient gradient wash on featured tiles */}
              {isFeatured && (
                <div
                  aria-hidden
                  className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
                  style={{ background: index === 0 ? "var(--gradient-blaze)" : "linear-gradient(135deg, hsl(var(--tertiary)), hsl(var(--accent)))" }}
                />
              )}

              <div className="relative flex flex-col h-full">
                {/* index + arrow row */}
                <Link to="/services" className="flex items-start justify-between mb-6">
                  <span className={cn("font-mono text-[10px] uppercase tracking-[0.22em]", isAccent ? "text-white/70" : "text-muted-foreground/70")}>
                    {service.idx}
                  </span>
                  <ArrowUpRight className={cn("w-5 h-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5", isAccent ? "text-white/80" : "text-muted-foreground group-hover:text-primary")} />
                </Link>

                {/* icon — soft pill */}
                <div className={cn(
                  "w-12 h-12 mb-5 rounded-2xl flex items-center justify-center transition-colors",
                  isAccent
                    ? "bg-white/15 backdrop-blur-sm text-white"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                )}>
                  <service.icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* title */}
                <h3 className={cn(
                  "display-headline mb-1.5 transition-colors",
                  isFeatured ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-[26px]",
                  isAccent ? "text-white" : "text-foreground group-hover:text-primary"
                )}>
                  {primary.title}
                </h3>
                {secondary && (
                  <p className={cn(
                    "display-italic font-light text-base md:text-lg mb-3",
                    isAccent ? "text-white/75" : "text-foreground/60"
                  )}>
                    {secondary.title}
                  </p>
                )}

                <p className={cn(
                  "text-sm md:text-[15px] leading-relaxed max-w-md mt-2",
                  isAccent ? "text-white/85" : "text-foreground/70"
                )}>
                  {primary.description}
                </p>
                {secondary && (
                  <p className={cn(
                    "text-sm leading-relaxed max-w-md mt-2 italic",
                    isAccent ? "text-white/65" : "text-foreground/55"
                  )}>
                    {secondary.description}
                  </p>
                )}

                <div className="flex-1" />

                {/* Audio preview */}
                <div className="mt-6">
                  <ServiceSamplePlayer
                    id={`service-${service.idx}`}
                    frequency={service.frequency}
                    label={lang === "en" ? "Preview" : lang === "sw" ? "Sikiliza" : "Preview · Sikiliza"}
                  />
                </div>

                {/* Book CTA — pill button */}
                <div className="mt-5">
                  {service.bookingType ? (
                    <Link
                      to={`/booking?service=${service.bookingType}`}
                      className={cn(
                        "group/book inline-flex w-full items-center justify-between gap-4 px-5 py-3.5 rounded-full font-semibold text-sm transition-all shadow-soft hover:shadow-card",
                        isAccent
                          ? "bg-white text-foreground hover:bg-white/95"
                          : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {bookLabel}
                      </span>
                      <ArrowUpRight className="w-4 h-4 group-hover/book:translate-x-0.5 group-hover/book:-translate-y-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <Link
                      to="/beats"
                      className={cn(
                        "group/book inline-flex w-full items-center justify-between gap-4 px-5 py-3.5 rounded-full font-semibold text-sm transition-all border-2",
                        isAccent
                          ? "border-white/40 text-white hover:bg-white/15"
                          : "border-foreground/15 text-foreground hover:border-foreground hover:bg-secondary"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        {browseLabel}
                      </span>
                      <ArrowUpRight className="w-4 h-4 opacity-70 group-hover/book:opacity-100 transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
