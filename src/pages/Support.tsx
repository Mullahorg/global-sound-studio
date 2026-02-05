import { useState } from "react";
import { motion } from "framer-motion";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  ChevronDown,
  Music,
  CreditCard,
  Calendar,
  User,
  Download,
  Shield,
  ExternalLink,
  FileText,
  Headphones,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageMeta } from "@/components/seo/PageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logDatabaseError } from "@/lib/errorLogger";

const Support = () => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    orderId: "",
    message: "",
  });

  const categories = [
    { icon: Music, label: "Beat Purchases", value: "beats" },
    { icon: CreditCard, label: "Payments & Billing", value: "payments" },
    { icon: Calendar, label: "Studio Bookings", value: "bookings" },
    { icon: User, label: "Account Issues", value: "account" },
    { icon: Download, label: "Downloads & Files", value: "downloads" },
    { icon: Shield, label: "Licensing Questions", value: "licensing" },
  ];

  const quickLinks = [
    { icon: FileText, title: "Licensing Guide", description: "Understand our license types", href: "/licensing" },
    { icon: BookOpen, title: "Privacy Policy", description: "How we handle your data", href: "/privacy" },
    { icon: Headphones, title: "Browse Beats", description: "Explore our catalog", href: "/beats" },
    { icon: Calendar, title: "Book a Session", description: "Schedule studio time", href: "/booking" },
  ];

  const faqs = [
    {
      category: "Beats & Downloads",
      questions: [
        {
          q: "How do I download my purchased beats?",
          a: "After purchase, beats are available in your Dashboard under 'Purchased Beats'. You'll also receive a download link via email. Downloads are available for 30 days after purchase. If your link expires, contact support for a new one.",
        },
        {
          q: "What file formats do I receive?",
          a: "Basic License: MP3 (320kbps). Premium License: MP3 + WAV (24-bit, 44.1kHz). Exclusive License: MP3, WAV, and full stems/trackouts in WAV format.",
        },
        {
          q: "Can I preview beats before purchasing?",
          a: "Yes! All beats have a preview player with a producer tag. You can listen to the full beat arrangement before deciding to purchase.",
        },
        {
          q: "The beat I want shows 'Sold Exclusive'. What does this mean?",
          a: "This means another artist has purchased exclusive rights to that beat. It's no longer available for licensing. Check out similar beats in the same genre!",
        },
      ],
    },
    {
      category: "Payments & M-Pesa",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept M-Pesa for all transactions. Simply enter your phone number at checkout and approve the payment prompt on your phone. We're working on adding card payments soon.",
        },
        {
          q: "My M-Pesa payment failed, what should I do?",
          a: "Check your M-Pesa balance and ensure you entered the correct PIN. If the issue persists, wait 5 minutes and try again. If you were charged but didn't receive your purchase, contact support with your M-Pesa receipt number.",
        },
        {
          q: "How long does payment confirmation take?",
          a: "M-Pesa payments are typically confirmed within 10-30 seconds. If your payment isn't confirmed after 2 minutes, use the 'Check Payment Status' button or contact support.",
        },
        {
          q: "Can I get a refund?",
          a: "Due to the digital nature of beats, purchases are final once you've downloaded the files. Studio bookings can be cancelled with a full refund if done 48+ hours in advance. Same-day cancellations are non-refundable.",
        },
        {
          q: "Do you offer payment plans for exclusive beats?",
          a: "Yes! For exclusive purchases over KES 30,000, we offer 50/50 payment plans. Contact us to arrange this before purchase.",
        },
      ],
    },
    {
      category: "Studio Bookings",
      questions: [
        {
          q: "How do I book a studio session?",
          a: "Go to the Booking page, select your preferred date and time, choose your session type, and complete the M-Pesa payment. You'll receive a confirmation email with session details.",
        },
        {
          q: "How do I reschedule my session?",
          a: "Contact us at least 24 hours before your session to reschedule for free. Same-day changes are subject to availability and may incur a KES 500 rescheduling fee.",
        },
        {
          q: "What should I bring to my studio session?",
          a: "Bring your lyrics (printed or on your phone), reference tracks, and any stems you want to work with. We provide all professional equipment including microphones, headphones, and software. Arrive 10 minutes early.",
        },
        {
          q: "Can I bring guests to my session?",
          a: "Yes, up to 2 guests are welcome. Additional guests require prior approval. All guests must follow studio rules and not interfere with the session.",
        },
      ],
    },
    {
      category: "Licensing & Legal",
      questions: [
        {
          q: "What's the difference between license types?",
          a: "Basic: Non-commercial, 2,500 streams, credit required. Premium: Commercial use, unlimited streams, optional credit. Exclusive: Full ownership, beat removed from store. See our Licensing page for full details.",
        },
        {
          q: "Can I upgrade my license later?",
          a: "Yes! Contact us with your original purchase receipt, and we'll credit the full amount toward your upgrade. You only pay the difference.",
        },
        {
          q: "Do I need to register my song somewhere?",
          a: "We recommend registering your song with a PRO (Performing Rights Organization) like ASCAP, BMI, or your local equivalent to collect royalties from performances and broadcasts.",
        },
        {
          q: "Can I use the beat on multiple songs?",
          a: "No, each license covers one song only. If you want to use the same beat for another song, you'll need to purchase an additional license.",
        },
      ],
    },
    {
      category: "Account & Technical",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within 5 minutes. Check your spam folder if you don't see it.",
        },
        {
          q: "How do I delete my account?",
          a: "Contact support@weglobal.com with your account email and request deletion. We'll process your request within 7 days. Note: This action is irreversible.",
        },
        {
          q: "The website isn't loading properly. What should I do?",
          a: "Try clearing your browser cache, disabling extensions, or using a different browser. If issues persist, email us a screenshot at support@weglobal.com.",
        },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.category || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        category: formData.category,
        order_id: formData.orderId && formData.orderId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/) ? formData.orderId : null,
        message: formData.message,
        status: "open",
        priority: "normal",
      });

      if (error) {
        logDatabaseError(error, "support_tickets", "insert", { category: formData.category });
        throw error;
      }
      
      setIsSubmitted(true);
      toast.success("Support ticket submitted! We'll respond within 24 hours.");
      setFormData({ name: "", email: "", category: "", orderId: "", message: "" });
    } catch (error) {
      toast.error("Failed to submit ticket. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold mb-4">Ticket Submitted!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for reaching out. We've received your support ticket and will respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" onClick={() => setIsSubmitted(false)}>
                Submit Another Ticket
              </Button>
              <Link to="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta 
        title="Support Center | WE Global Studio"
        description="Get help with beat purchases, studio bookings, payments, and more. Browse FAQs or contact our support team."
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Support <span className="gradient-text">Center</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Need help? Browse our comprehensive FAQs or contact our support team directly.
              We're here to help you create amazing music.
            </p>
          </motion.div>

          {/* Quick Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            <a
              href="mailto:support@weglobal.com"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Email Support</p>
                <p className="text-sm text-muted-foreground">support@weglobal.com</p>
              </div>
            </a>
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">+254 700 000 000</p>
              </div>
            </a>
            <div className="p-4 rounded-xl bg-card border border-border/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Response Time</p>
                <p className="text-sm text-muted-foreground">Within 24 hours</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:bg-primary/5 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {link.title}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </p>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                {faqs.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="font-semibold text-primary mb-3 sticky top-0 bg-background py-2">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = catIndex * 10 + faqIndex;
                        return (
                          <div
                            key={faqIndex}
                            className="rounded-lg border border-border/50 overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === globalIndex ? null : globalIndex)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
                            >
                              <span className="font-medium pr-4 text-sm">{faq.q}</span>
                              <ChevronDown
                                className={cn(
                                  "w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform",
                                  expandedFaq === globalIndex && "rotate-180"
                                )}
                              />
                            </button>
                            {expandedFaq === globalIndex && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="px-4 pb-4 text-muted-foreground text-sm"
                              >
                                {faq.a}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-display text-2xl font-bold mb-6">Submit a Ticket</h2>
              <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-card border border-border/50 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Order/Booking ID (optional)</label>
                    <Input
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g., ORD-12345"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue in detail. Include any error messages, transaction IDs, or screenshots if relevant..."
                    rows={6}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 24 hours. For urgent issues, use WhatsApp.
                </p>
              </form>

              {/* Additional Help */}
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold mb-2">Before You Submit</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check the FAQs - your question might already be answered</li>
                  <li>• Include relevant order/booking IDs for faster resolution</li>
                  <li>• For payment issues, have your M-Pesa receipt ready</li>
                  <li>• Screenshots help us understand your issue better</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
