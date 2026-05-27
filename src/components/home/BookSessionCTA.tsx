import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, Globe, ArrowUpRight } from "lucide-react";

const features = [
  { icon: Calendar, label: "Flexible Scheduling", swahili: "Ratiba" },
  { icon: Clock, label: "24/7 Availability", swahili: "Muda Wote" },
  { icon: Globe, label: "Remote Sessions", swahili: "Mbali" },
];

export const BookSessionCTA = () => {
  return (
    <section className="py-20 md:py-32 noise-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border">
          <div className="grid grid-cols-12">
            {/* Status strip */}
            <div className="col-span-12 flex items-center justify-between gap-4 px-5 md:px-8 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground">
                  Studio · Live · Nairobi
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hidden sm:inline">
                № 006 · Booking
              </span>
            </div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-8 p-6 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-border"
            >
              <p className="editorial-eyebrow mb-6">Andika Sasa</p>
              <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)" }}>
                Ready to create
                <span className="block display-italic font-light text-foreground/90">
                  your next record<span className="text-primary not-italic">.</span>
                </span>
              </h2>
              <p className="mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-xl">
                Book a session with our producers and engineers. In-studio in Nairobi or remote from anywhere — we'll bring your vision to life.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md">
                <Link
                  to="/booking"
                  className="group inline-flex flex-1 items-center justify-between gap-6 px-5 py-4 border border-foreground bg-foreground text-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
                >
                  Book a Session
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="group inline-flex flex-1 items-center justify-between gap-6 px-5 py-4 border border-border hover:border-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em] text-foreground"
                >
                  View Pricing
                  <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all" />
                </Link>
              </div>
            </motion.div>

            {/* Feature list */}
            <div className="col-span-12 lg:col-span-4 grid grid-cols-3 lg:grid-cols-1">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`p-4 md:p-6 lg:p-8 flex flex-col gap-3 ${
                    i < features.length - 1 ? "border-r lg:border-r-0 lg:border-b border-border" : ""
                  } ${i === features.length - 1 ? "lg:border-b-0" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="editorial-index">{String(i + 1).padStart(2, "0")}</span>
                    <f.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-display text-sm md:text-base text-foreground leading-tight">
                      {f.label}
                    </p>
                    <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
                      {f.swahili}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
