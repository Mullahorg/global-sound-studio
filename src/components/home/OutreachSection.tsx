import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Rocket, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  { icon: Star, title: "Talent Discovery", description: "Finding exceptional emerging artists worldwide." },
  { icon: Rocket, title: "Skill Development", description: "Mentorship, workshops, and studio access." },
  { icon: Users, title: "Global Network", description: "Connect with artists and industry professionals." },
];

export const OutreachSection = () => {
  return (
    <section className="py-20 md:py-28 border-t border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Outreach Programs</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Supporting <span className="text-primary">Tomorrow's Stars</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover, nurture, and elevate emerging talent from communities worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {programs.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-lg border border-border/30"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/outreach">
            <Button variant="default" size="lg" className="group">
              Explore Programs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
