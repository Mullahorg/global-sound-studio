import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Rocket, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const OutreachSection = () => {
  const programs = [
    {
      icon: Star,
      title: "Talent Discovery",
      description: "We actively search for exceptional emerging artists and producers worldwide.",
      color: "primary",
    },
    {
      icon: Rocket,
      title: "Skill Development",
      description: "Accelerate your growth with mentorship, workshops, and studio access.",
      color: "accent",
    },
    {
      icon: Users,
      title: "Global Network",
      description: "Connect with artists, producers, and industry professionals globally.",
      color: "primary",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-card relative overflow-hidden">
      {/* Background Elements */}
      <motion.div 
        className="absolute top-20 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[80px]"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Outreach Programs
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Supporting </span>
            <span className="gradient-text">Tomorrow's Stars</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Our outreach initiatives are designed to discover, nurture, and elevate 
            emerging talent from underrepresented communities worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all h-full">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  program.color === "primary" ? "bg-primary/10" : "bg-accent/10"
                } group-hover:scale-110 transition-transform`}>
                  <program.icon className={`w-7 h-7 ${
                    program.color === "primary" ? "text-primary" : "text-accent"
                  }`} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{program.title}</h3>
                <p className="text-muted-foreground">{program.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/outreach">
            <Button variant="hero" size="lg" className="group">
              Explore Programs
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
