import { motion } from "framer-motion";

const partners = [
  { 
    name: "Universal Music", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Universal_Music_Group_Logo.svg/200px-Universal_Music_Group_Logo.svg.png"
  },
  { 
    name: "Sony Music", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sony_Music_logo.svg/200px-Sony_Music_logo.svg.png"
  },
  { 
    name: "Warner Music", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Warner_Music_Group_logo.svg/200px-Warner_Music_Group_logo.svg.png"
  },
  { 
    name: "Atlantic Records", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Atlantic_Records.svg/200px-Atlantic_Records.svg.png"
  },
  { 
    name: "Def Jam", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Def_Jam_Recordings_logo.svg/200px-Def_Jam_Recordings_logo.svg.png"
  },
  { 
    name: "Interscope", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Interscope_Records_logo.svg/200px-Interscope_Records_logo.svg.png"
  },
];

export const TrustedBySection = () => {
  return (
    <section className="py-16 border-y border-border/30 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Trusted by Leading Labels & Brands
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling Container */}
          <div className="flex items-center justify-center gap-x-12 gap-y-8 flex-wrap">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className="transition-all duration-300 opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
              >
                {/* Fallback to text if logo doesn't load */}
                <div className="h-8 md:h-10 flex items-center justify-center">
                  <span className="font-display text-xl md:text-2xl font-semibold text-foreground whitespace-nowrap">
                    {partner.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-border/20"
        >
          {[
            { value: "50+", label: "Major Label Partnerships" },
            { value: "1000+", label: "Placements" },
            { value: "25+", label: "Countries Served" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
