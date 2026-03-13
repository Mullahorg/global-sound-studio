import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Radio, Video, Mic2, Sliders, ArrowRight } from "lucide-react";

const services = [
  { icon: Music, title: "Music Production", description: "Full-scale production from concept to master." },
  { icon: Sliders, title: "Mixing & Mastering", description: "Radio-ready and streaming-optimized sound." },
  { icon: Radio, title: "Beat Licensing", description: "Browse and license beats with flexible terms." },
  { icon: Headphones, title: "Remote Sessions", description: "Collaborate with producers from anywhere." },
  { icon: Mic2, title: "Songwriting", description: "Expert songwriters to craft your next hit." },
  { icon: Video, title: "Sound for Film", description: "Scores and audio post-production for media." },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">What We Offer</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Production <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            End-to-end music production services for artists, labels, and brands.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <Link key={service.title} to="/services">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group p-6 rounded-lg border border-border/30 hover:border-border transition-all"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
