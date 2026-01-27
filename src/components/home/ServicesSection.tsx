import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Radio, Video, Mic2, Sliders, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Music,
    title: "Music Production",
    description: "Full-scale production from concept to master. We bring your vision to life with industry-leading sound.",
    gradient: "from-primary to-primary/50",
  },
  {
    icon: Sliders,
    title: "Mixing & Mastering",
    description: "Professional mixing and mastering that makes your tracks radio-ready and streaming-optimized.",
    gradient: "from-accent to-accent/50",
  },
  {
    icon: Radio,
    title: "Beat Licensing",
    description: "Browse our exclusive beat catalog. Instant licensing with flexible terms for any project size.",
    gradient: "from-waveform-secondary to-waveform-secondary/50",
  },
  {
    icon: Headphones,
    title: "Remote Sessions",
    description: "Collaborate with our producers from anywhere in the world. Real-time sessions, seamless workflow.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Mic2,
    title: "Songwriting",
    description: "Tap into our network of Grammy-winning songwriters to craft your next hit.",
    gradient: "from-accent to-waveform-secondary",
  },
  {
    icon: Video,
    title: "Sound for Film",
    description: "Cinematic scores, soundtracks, and audio post-production for film, TV, and advertising.",
    gradient: "from-waveform-secondary to-primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export const ServicesSection = () => {
  return (
    <section id="services" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
            Production <span className="gradient-text">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From initial concept to final master, we provide end-to-end music production 
            services tailored to artists, labels, and brands worldwide.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <Link key={service.title} to="/services">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 h-full cursor-pointer"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
