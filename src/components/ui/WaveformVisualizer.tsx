import { motion } from "framer-motion";

export const WaveformVisualizer = () => {
  const bars = 60;

  return (
    <div className="relative w-full h-24 md:h-32 flex items-center justify-center gap-[2px] md:gap-1 px-4">
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-2xl" />
      
      {Array.from({ length: bars }).map((_, i) => {
        const height = Math.sin((i / bars) * Math.PI * 2 + Math.random()) * 50 + 30;
        const delay = i * 0.02;
        
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: delay,
              ease: "easeOut"
            }}
            className="relative"
          >
            <motion.div
              animate={{
                height: [height * 0.3, height, height * 0.5, height * 0.8, height * 0.3],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
              style={{ 
                height: `${height}%`,
              }}
              className="w-1 md:w-1.5 rounded-full bg-gradient-to-t from-primary/60 via-primary to-accent"
            />
          </motion.div>
        );
      })}
    </div>
  );
};
