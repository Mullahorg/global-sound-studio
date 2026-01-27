import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Database, Clock, Globe, Users, Bell, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageMeta } from "@/components/seo/PageMeta";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information (name, email, phone number) when you create an account or make a purchase",
        "Payment information processed securely through M-Pesa and other payment providers",
        "Usage data including beats played, search queries, and browsing patterns",
        "Device information and IP addresses for security and analytics purposes",
        "Audio files and project data when using our studio services",
        "Communication records when you contact our support team",
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and improve our music production services and beat marketplace",
        "To process transactions and send related information including purchase confirmations",
        "To send promotional communications (with your consent) about new beats and studio offers",
        "To respond to your comments, questions, and provide customer service",
        "To personalize your experience with beat recommendations based on listening history",
        "To detect and prevent fraud and protect our users and platform",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We implement industry-standard encryption (AES-256) for all data transmissions",
        "Payment information is processed through secure, PCI-compliant payment processors",
        "Regular security audits and vulnerability assessments are conducted",
        "Access to personal data is restricted to authorized personnel only",
        "Two-factor authentication available for account protection",
        "Automatic session timeout after periods of inactivity",
      ],
    },
    {
      icon: Globe,
      title: "Data Sharing & Third Parties",
      content: [
        "Payment processors (M-Pesa, Safaricom) to process transactions",
        "Cloud storage providers for secure file hosting",
        "Analytics services to improve our platform (anonymized data only)",
        "We never sell your personal data to third parties for marketing",
        "Law enforcement when required by valid legal process",
      ],
    },
    {
      icon: Bell,
      title: "Cookies & Tracking",
      content: [
        "Essential cookies for site functionality and security",
        "Analytics cookies to understand how visitors use our site",
        "Preference cookies to remember your settings",
        "You can manage cookie preferences in your browser settings",
      ],
    },
    {
      icon: FileText,
      title: "Your Rights (GDPR & CCPA)",
      content: [
        "Access: Request a copy of your personal data",
        "Rectification: Correct inaccurate personal data",
        "Erasure: Request deletion of your personal data",
        "Portability: Receive your data in a structured format",
        "Opt-out: Unsubscribe from marketing communications",
        "Object: Challenge processing based on legitimate interests",
      ],
    },
    {
      icon: Users,
      title: "Children's Privacy",
      content: [
        "Our services are not directed to children under 13",
        "We do not knowingly collect data from children under 13",
        "Parents/guardians can contact us to delete any such data",
      ],
    },
    {
      icon: Trash2,
      title: "Data Retention",
      content: [
        "Account data: Retained while your account is active",
        "Transaction records: 7 years for tax/legal compliance",
        "Analytics data: Anonymized after 26 months",
        "Support tickets: 3 years after resolution",
        "Deleted account data: Purged within 30 days",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta 
        title="Privacy Policy | WE Global Studio"
        description="Learn how WE Global Music Production Studio collects, uses, and protects your personal information."
      />
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2026
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-card border border-border/50 mb-8"
          >
            <p className="text-muted-foreground leading-relaxed">
              At WE Global Music Production Studio, we are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit our 
              website and use our services, including our beat marketplace and studio booking system.
            </p>
          </motion.div>

          {/* Quick Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-xl bg-primary/5 border border-primary/20 mb-8"
          >
            <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Quick Summary
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Your data is encrypted at rest and in transit
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                We never sell your personal information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                You can delete your account anytime
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                GDPR and CCPA compliant
              </li>
            </ul>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
                className="p-6 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Questions About Privacy?</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact our Data Protection Officer at{" "}
              <a href="mailto:privacy@weglobal.com" className="text-primary hover:underline">
                privacy@weglobal.com
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              For EU residents: You may also lodge a complaint with your local data protection authority.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
