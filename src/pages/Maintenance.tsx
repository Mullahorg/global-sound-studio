import { motion } from "framer-motion";
import { Wrench, Clock, Mail } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-lg"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30"
        >
          <Wrench className="w-12 h-12 text-primary-foreground" />
        </motion.div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Under Maintenance
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          We're making some improvements to give you a better experience.
          We'll be back shortly — thanks for your patience!
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <Clock className="w-4 h-4" />
          <span>We'll be back soon</span>
        </div>

        {/* Animated bars */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ height: [12, 32, 12] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              className="w-2 bg-gradient-to-t from-primary to-accent rounded-full"
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Mail className="w-3 h-3" />
          <span>Questions? Contact us at info@weglobal.com</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
