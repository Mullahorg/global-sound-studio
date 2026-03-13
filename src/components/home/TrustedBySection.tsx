import { motion } from "framer-motion";

const partners = [
  "Universal Music",
  "Sony Music",
  "Warner Music",
  "Atlantic Records",
  "Def Jam",
  "Interscope",
];

export const TrustedBySection = () => {
  return (
    <section className="py-12 border-y border-border/20">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-muted-foreground uppercase tracking-wider text-center mb-8"
        >
          Trusted by Leading Labels
        </motion.p>

        <div className="flex items-center justify-center gap-x-10 gap-y-4 flex-wrap">
          {partners.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="font-display text-lg font-medium text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};
