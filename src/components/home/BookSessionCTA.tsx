import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Clock, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BookSessionCTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Studio Available</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to Create Your
              <br />
              <span className="text-primary">Next Masterpiece?</span>
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Book a session with our producers and engineers. In-studio or remote — we'll bring your vision to life.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                { icon: Calendar, label: "Flexible Scheduling" },
                { icon: Clock, label: "24/7 Availability" },
                { icon: Globe, label: "Remote Sessions" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-muted-foreground">
                  <f.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/booking">
                <Button variant="default" size="lg" className="group">
                  Book Your Session
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="outline" size="lg">View Pricing</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
