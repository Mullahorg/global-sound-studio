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
    <section className="py-10 md:py-14 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-3"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              [ Trusted by · Imeaminika ]
            </p>
          </motion.div>
          <div className="col-span-12 md:col-span-9">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 md:gap-x-10">
              {partners.map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="font-display text-sm md:text-base text-muted-foreground/60 hover:text-foreground transition-colors text-center md:text-left truncate"
                >
                  {name}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
