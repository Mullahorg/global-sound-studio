import { motion } from "framer-motion";
import { FileText, Scale, Music, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: `By accessing and using WE Global Music Production Studio's services, including our website, 
        beat marketplace, and studio booking platform, you agree to be bound by these Terms of Service. 
        If you do not agree to these terms, please do not use our services.`,
    },
    {
      icon: Music,
      title: "Beat Licensing",
      content: `All beats purchased through our marketplace are subject to the license type selected at checkout:
        
        **Basic License**: Non-exclusive rights for up to 2,500 streams, MP3 file only, must credit producer.
        
        **Premium License**: Non-exclusive rights for unlimited streams, WAV + MP3 files, full commercial use.
        
        **Exclusive License**: Full ownership transfer, all stems included, unlimited commercial use, beat removed from marketplace.
        
        License terms are binding upon purchase and cannot be modified retroactively.`,
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      content: `All payments are processed securely through M-Pesa and other approved payment providers. 
        Prices are displayed in KES and may be converted to other currencies for display purposes.
        
        **Refund Policy**: Due to the digital nature of our products, all beat purchases are final. 
        Studio session cancellations made 48+ hours in advance are eligible for full refund. 
        Cancellations within 48 hours may be subject to a 50% cancellation fee.`,
    },
    {
      icon: Scale,
      title: "User Responsibilities",
      content: `Users agree to:
        - Provide accurate information when creating accounts and making purchases
        - Not share, resell, or redistribute licensed beats beyond the terms of their license
        - Not use our services for any illegal or unauthorized purpose
        - Respect intellectual property rights of all content on the platform
        - Not attempt to circumvent any security measures or access restrictions`,
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: `WE Global Music Production Studio shall not be liable for any indirect, incidental, 
        special, consequential, or punitive damages resulting from your use of our services. 
        Our total liability shall not exceed the amount paid by you for the specific service in question.
        
        We do not guarantee uninterrupted access to our services and reserve the right to modify 
        or discontinue any feature without prior notice.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2026
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">{section.title}</h2>
                </div>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>
              These terms constitute the entire agreement between you and WE Global Music Production Studio.
              For questions, contact{" "}
              <a href="mailto:legal@weglobal.com" className="text-primary hover:underline">
                legal@weglobal.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
