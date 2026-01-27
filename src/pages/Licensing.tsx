import { motion } from "framer-motion";
import { FileText, Check, X, Music, Mic2, Video, Radio, Download, Shield, Globe, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageMeta } from "@/components/seo/PageMeta";

const Licensing = () => {
  const licenses = [
    {
      name: "Basic License",
      price: "From KES 2,999",
      description: "Perfect for demos, mixtapes, and non-commercial releases",
      features: [
        { text: "MP3 file (320kbps)", included: true },
        { text: "Up to 2,500 streams", included: true },
        { text: "Non-profit performances", included: true },
        { text: "Must credit producer", included: true },
        { text: "1 music video (non-monetized)", included: true },
        { text: "WAV file", included: false },
        { text: "Stems/Trackouts", included: false },
        { text: "Commercial use", included: false },
        { text: "Broadcast rights", included: false },
      ],
      popular: false,
      color: "border-border/50",
    },
    {
      name: "Premium License",
      price: "From KES 9,999",
      description: "Ideal for commercial releases and professional artists",
      features: [
        { text: "MP3 + WAV files", included: true },
        { text: "Unlimited streams", included: true },
        { text: "Commercial performances", included: true },
        { text: "Unlimited music videos", included: true },
        { text: "Radio broadcast rights", included: true },
        { text: "Credit producer (optional)", included: true },
        { text: "Sync licensing (TV/Film)", included: true },
        { text: "Stems/Trackouts", included: false },
        { text: "Exclusive ownership", included: false },
      ],
      popular: true,
      color: "border-primary/30",
    },
    {
      name: "Exclusive License",
      price: "From KES 49,999",
      description: "Full ownership - beat removed from marketplace",
      features: [
        { text: "All file formats", included: true },
        { text: "Full stems/trackouts", included: true },
        { text: "Unlimited everything", included: true },
        { text: "Full commercial use", included: true },
        { text: "All broadcast rights", included: true },
        { text: "No credit required", included: true },
        { text: "Full ownership transfer", included: true },
        { text: "Beat removed from store", included: true },
        { text: "Resale rights", included: true },
      ],
      popular: false,
      color: "border-accent/30",
    },
  ];

  const useCases = [
    { icon: Music, title: "Music Streaming", description: "Spotify, Apple Music, YouTube Music, Tidal, Deezer, SoundCloud" },
    { icon: Video, title: "Music Videos", description: "YouTube, Vevo, TikTok, Instagram Reels, social media" },
    { icon: Radio, title: "Radio & Broadcast", description: "FM/AM radio, podcasts, TV sync, Netflix, commercials" },
    { icon: Mic2, title: "Live Performance", description: "Concerts, tours, festivals, club performances, DJ sets" },
  ];

  const restrictions = [
    { license: "Basic", restrictions: ["No selling or reselling the beat", "No registering with PRO as sole owner", "No claiming beat as your own production", "No remixing for commercial release"] },
    { license: "Premium", restrictions: ["No selling or reselling the beat", "No registering with PRO as sole owner", "Cannot transfer rights to third parties"] },
    { license: "Exclusive", restrictions: ["None - full ownership rights transfer to you"] },
  ];

  const faqs = [
    { q: "Can I upgrade my license later?", a: "Yes! Contact us and we'll credit your previous purchase toward the upgrade. The price difference is all you'll pay." },
    { q: "What happens after I purchase exclusive rights?", a: "The beat is immediately removed from the marketplace. You receive the stems, all file formats, and a signed contract transferring full ownership." },
    { q: "Do I need to credit the producer?", a: "Credit is required for Basic licenses, optional but appreciated for Premium, and not required for Exclusive." },
    { q: "Can I register the song with a PRO?", a: "Yes, you can register your song (lyrics/vocals) with a PRO. For beat ownership registration, Exclusive license is required." },
    { q: "What if the beat is sold exclusively while I'm using it?", a: "Your existing license remains valid! You can continue using the beat according to your license terms. New sales are simply stopped." },
    { q: "Do licenses expire?", a: "No, all licenses are perpetual. Once purchased, you can use the beat forever within your license terms." },
    { q: "Can I use the beat in multiple songs?", a: "No, each license is for one song only. You'll need additional licenses for additional songs using the same beat." },
    { q: "What formats are included?", a: "Basic: MP3 (320kbps). Premium: MP3 + WAV (24-bit). Exclusive: MP3, WAV, and full stems/trackouts." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta 
        title="Beat Licensing | WE Global Studio"
        description="Choose the right beat license for your project. Basic, Premium, and Exclusive options with clear terms and instant delivery."
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Beat <span className="gradient-text">Licensing</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the right license for your project. All licenses include immediate download,
              a signed licensing agreement, and lifetime validity.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Legally Binding Contracts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Download className="w-4 h-4 text-primary" />
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm">
              <Globe className="w-4 h-4 text-accent" />
              <span>Worldwide Rights</span>
            </div>
          </motion.div>

          {/* License Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {licenses.map((license, index) => (
              <motion.div
                key={license.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative p-6 rounded-2xl border ${
                  license.popular
                    ? "bg-gradient-to-b from-primary/10 to-transparent border-primary/30"
                    : `bg-card ${license.color}`
                }`}
              >
                {license.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold mb-2">{license.name}</h2>
                  <p className="text-2xl font-bold text-primary mb-2">{license.price}</p>
                  <p className="text-sm text-muted-foreground">{license.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {license.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-3 text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 flex-shrink-0 text-muted" />
                      )}
                      <span className={!feature.included ? "line-through" : ""}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/beats">
                  <Button
                    variant={license.popular ? "hero" : "outline"}
                    className="w-full"
                  >
                    Browse Beats
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              What Can You Do With Licensed Beats?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border/50 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Restrictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              <AlertTriangle className="w-6 h-6 inline-block mr-2 text-amber-500" />
              License Restrictions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {restrictions.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-card border border-border/50">
                  <h3 className="font-semibold mb-3 text-center">{item.license} License</h3>
                  <ul className="space-y-2">
                    {item.restrictions.map((restriction, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border/50">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Still have questions about licensing?
            </p>
            <Link to="/support">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Licensing;
