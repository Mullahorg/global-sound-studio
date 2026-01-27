import { motion } from "framer-motion";
import { 
  Headphones, 
  Mic2, 
  Monitor, 
  Music, 
  AudioWaveform, 
  Gauge, 
  Check, 
  ArrowRight,
  Cpu,
  HardDrive,
  Speaker,
  Cable,
  Play,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaveformVisualizer } from "@/components/ui/WaveformVisualizer";
import { PageMeta } from "@/components/seo/PageMeta";
import { useNavigate } from "react-router-dom";

const equipmentCategories = [
  {
    title: "Recording",
    icon: Mic2,
    items: [
      { name: "Neumann U87", desc: "Industry-standard vocal microphone" },
      { name: "Shure SM7B", desc: "Dynamic broadcast microphone" },
      { name: "Universal Audio Apollo x8", desc: "Premium audio interface" },
      { name: "Neve 1073 Preamp", desc: "Classic analog warmth" },
    ],
  },
  {
    title: "Monitoring",
    icon: Speaker,
    items: [
      { name: "Focal Trio11 Be", desc: "3-way reference monitors" },
      { name: "Yamaha NS-10", desc: "Classic mix reference" },
      { name: "Audeze LCD-X", desc: "Planar magnetic headphones" },
      { name: "Sonarworks Reference", desc: "Room correction software" },
    ],
  },
  {
    title: "Production",
    icon: Cpu,
    items: [
      { name: "Native Instruments Komplete", desc: "Complete sound library" },
      { name: "Arturia V Collection", desc: "Vintage synth emulations" },
      { name: "Slate Digital All Access", desc: "Premium mixing plugins" },
      { name: "FabFilter Pro Bundle", desc: "Precision EQ & dynamics" },
    ],
  },
  {
    title: "Outboard",
    icon: Cable,
    items: [
      { name: "SSL Fusion", desc: "Analog stereo processor" },
      { name: "Empirical Labs Distressor", desc: "Character compression" },
      { name: "Chandler Limited TG12345", desc: "Abbey Road curve bender" },
      { name: "Dangerous Music Compressor", desc: "Transparent bus compression" },
    ],
  },
];

const workflowSteps = [
  {
    step: 1,
    title: "Consultation",
    desc: "We discuss your vision, references, and goals",
    icon: Headphones,
  },
  {
    step: 2,
    title: "Pre-Production",
    desc: "Song structure, arrangement, and sound selection",
    icon: Music,
  },
  {
    step: 3,
    title: "Recording",
    desc: "Capture vocals, instruments, and performances",
    icon: Mic2,
  },
  {
    step: 4,
    title: "Production",
    desc: "Build the beat, add layers, and refine the sound",
    icon: AudioWaveform,
  },
  {
    step: 5,
    title: "Mixing",
    desc: "Balance, EQ, compression, and spatial effects",
    icon: Gauge,
  },
  {
    step: 6,
    title: "Mastering",
    desc: "Final polish for streaming and distribution",
    icon: Monitor,
  },
];

const qualityStandards = [
  { title: "48kHz / 24-bit", desc: "Professional recording standard" },
  { title: "Treated Room", desc: "Acoustically optimized space" },
  { title: "Analog + Digital", desc: "Hybrid workflow for best results" },
  { title: "Multiple Revisions", desc: "Until you're 100% satisfied" },
  { title: "Stem Delivery", desc: "Full stems for maximum flexibility" },
  { title: "Industry Format", desc: "Ready for all major platforms" },
];

const Studio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Our Studio"
        description="Experience our state-of-the-art production facility with professional recording equipment, Neumann mics, Neve preamps, and world-class acoustics."
        path="/studio"
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
                World-Class Facilities
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Our <span className="gradient-text">Studio</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A state-of-the-art production facility designed for sonic excellence.
                Every detail engineered for your sound.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => navigate("/booking")}>
                  Book a Session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Virtual Tour
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Studio Overview Image */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden aspect-[21/9]"
          >
            <img
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&h=700&fit=crop"
              alt="Studio Overview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Waveform Overlay */}
            <div className="absolute bottom-0 left-0 right-0">
              <WaveformVisualizer />
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-6">
              {[
                { value: "500+", label: "Projects Completed" },
                { value: "50+", label: "Artists Worked With" },
                { value: "15+", label: "Years Experience" },
                { value: "24/7", label: "Availability" },
              ].map((stat, i) => (
                <div key={i} className="glass px-6 py-4 rounded-xl">
                  <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Equipment Stack */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Professional <span className="gradient-text">Equipment</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've invested in the finest gear to ensure your music sounds its best.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipmentCategories.map((category, i) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Workflow Pipeline */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Workflow</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A proven process that delivers exceptional results every time.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary transform -translate-y-1/2" />

            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center mx-auto mb-4 glow-primary">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm z-20">
                    {step.step}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality Standards */}
        <section className="container mx-auto px-6 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Quality <span className="gradient-text">Standards</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                We maintain the highest standards in the industry to ensure your music
                competes at the highest level.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {qualityStandards.map((standard, i) => (
                  <motion.div
                    key={standard.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{standard.title}</p>
                      <p className="text-sm text-muted-foreground">{standard.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden aspect-square"
            >
              <img
                src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=800&fit=crop"
                alt="Mixing Console"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </motion.div>
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
                Ready to Create Something <span className="gradient-text">Amazing?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Book your session today and experience the difference a world-class studio makes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => navigate("/booking")}>
                  Book a Session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/beats")}>
                  Browse Beats
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Studio;
