import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Rocket, Users, ArrowUpRight } from "lucide-react";

const programs = [
  { icon: Star, title: "Talent Discovery", swahili: "Vipaji", description: "Finding exceptional emerging artists across Kenya and the wider continent." },
  { icon: Rocket, title: "Skill Development", swahili: "Ujuzi", description: "Mentorship, workshops, and dedicated studio access for selected artists." },
  { icon: Users, title: "Global Network", swahili: "Mtandao", description: "Connect with artists, labels and industry professionals worldwide." },
];

export const OutreachSection = () => {
  return (
    <section className="py-20 md:py-32 border-t border-border noise-overlay">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-5"
          >
            <p className="editorial-eyebrow mb-6">№ 003 · Mradi wa Vipaji</p>
            <h2 className="display-headline text-foreground" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              Tomorrow's
              <span className="block display-italic font-light text-foreground/90">
                stars<span className="text-primary not-italic">.</span>
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
              We discover, nurture and elevate emerging talent — from Kibera to Kisumu, Lagos to London.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border mb-10">
          {programs.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative border-r border-b border-border p-6 md:p-8 group hover:bg-secondary/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="editorial-index">{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="w-10 h-10 mb-6 flex items-center justify-center border border-border group-hover:border-primary group-hover:text-primary transition-colors">
                <p.icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="display-headline text-2xl md:text-[28px] text-foreground mb-1.5 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 mb-4">
                {p.swahili}
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed max-w-xs">{p.description}</p>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-start md:justify-end"
        >
          <Link
            to="/outreach"
            className="group inline-flex items-center justify-between gap-6 px-5 py-4 border border-foreground bg-foreground text-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em] min-w-[240px]"
          >
            Explore Programs
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
