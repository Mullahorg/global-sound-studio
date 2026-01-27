import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Mic2, 
  SlidersHorizontal, 
  Disc3, 
  Music2, 
  Video, 
  Headphones,
  Check,
  ArrowRight,
  Clock,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo/PageMeta";

const services = [
  {
    id: "production",
    icon: Music2,
    title: "Music Production",
    description: "Full-service music production from concept to finished track. Our producers work with you to craft your unique sound.",
    features: ["Custom beat creation", "Arrangement & composition", "Session musicians", "Sound design"],
    startingPrice: 500,
    turnaround: "3-7 days",
    popular: true,
  },
  {
    id: "mixing",
    icon: SlidersHorizontal,
    title: "Mixing",
    description: "Professional mixing that brings clarity, depth, and impact to your tracks. Industry-standard processing and attention to detail.",
    features: ["Stem mixing", "Vocal processing", "Spatial effects", "Unlimited revisions"],
    startingPrice: 200,
    turnaround: "2-4 days",
    popular: false,
  },
  {
    id: "mastering",
    icon: Disc3,
    title: "Mastering",
    description: "Final polish for your music. Optimized for streaming platforms with competitive loudness and pristine quality.",
    features: ["Stereo mastering", "Stem mastering", "Platform optimization", "DDP delivery"],
    startingPrice: 100,
    turnaround: "1-2 days",
    popular: false,
  },
  {
    id: "recording",
    icon: Mic2,
    title: "Recording Sessions",
    description: "State-of-the-art recording facilities with experienced engineers. Capture your best performances.",
    features: ["Vocal recording", "Live instruments", "Voice-over/ADR", "Remote sessions"],
    startingPrice: 150,
    turnaround: "Same day",
    popular: true,
  },
  {
    id: "beats",
    icon: Headphones,
    title: "Beat Licensing",
    description: "Access our extensive catalog of exclusive beats. Multiple license tiers for every budget and use case.",
    features: ["Instant download", "Multiple licenses", "Custom exclusives", "Full stems available"],
    startingPrice: 29.99,
    turnaround: "Instant",
    popular: false,
  },
  {
    id: "film",
    icon: Video,
    title: "Sound for Film & Ads",
    description: "Complete audio post-production for visual media. Music, sound design, and mixing for commercials, films, and content.",
    features: ["Original scoring", "Sound design", "Foley & effects", "Dialogue editing"],
    startingPrice: 1000,
    turnaround: "5-14 days",
    popular: false,
  },
];

const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for emerging artists",
    price: 299,
    features: [
      "1 mixed & mastered track",
      "2 revision rounds",
      "Stem delivery",
      "Email support",
    ],
  },
  {
    name: "Professional",
    description: "Most popular for serious artists",
    price: 799,
    features: [
      "3 mixed & mastered tracks",
      "Unlimited revisions",
      "Full stems + instrumentals",
      "Priority support",
      "Radio-ready master",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For labels & serious projects",
    price: 2499,
    features: [
      "10 mixed & mastered tracks",
      "Unlimited revisions",
      "Full production support",
      "Dedicated engineer",
      "24/7 priority support",
      "Commercial licensing",
    ],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Services & Pricing"
        description="Professional music production, mixing, mastering, and recording services. Flexible packages from $99 to enterprise solutions for labels."
        path="/services"
      />
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Premium Services
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Our <span className="gradient-text">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                From concept to release, we provide everything you need to create
                world-class music.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                {service.popular && (
                  <div className="absolute -top-3 right-6">
                    <Badge className="bg-accent text-accent-foreground">Popular</Badge>
                  </div>
                )}

                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-display text-2xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting from</p>
                    <p className="font-display text-2xl font-bold text-primary">${service.startingPrice}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {service.turnaround}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Package <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the package that fits your needs. All packages include our signature sound and attention to detail.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl border transition-all ${
                  tier.popular
                    ? "bg-gradient-to-b from-primary/10 via-card to-card border-primary/50 scale-105"
                    : "bg-card border-border/50 hover:border-primary/30"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}

                <h3 className="font-display text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/project</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/contact">
                  <Button 
                    variant={tier.popular ? "hero" : "outline"} 
                    className="w-full"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-border/50 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Need a Custom Quote?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Every project is unique. Let's discuss your specific needs and create a package that works for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="hero" size="lg">
                    Request Quote
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button variant="outline" size="lg">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
