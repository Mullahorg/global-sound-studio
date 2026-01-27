import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "What licensing options are available for beats?",
    answer: "We offer three tiers: Basic (MP3, 2,500 streams, non-exclusive), Premium (WAV + MP3, unlimited streams, non-exclusive), and Exclusive (all stems, unlimited use, full ownership). Each tier is designed to match your project's needs and budget.",
  },
  {
    question: "How do remote sessions work?",
    answer: "Our remote sessions use high-quality audio streaming technology to connect you with our producers in real-time. You'll receive a private session link, and we'll collaborate as if you were in the same room. All files are exchanged through our secure platform.",
  },
  {
    question: "What's the turnaround time for mixing and mastering?",
    answer: "Standard turnaround is 3-5 business days for mixing and 1-2 days for mastering. Rush delivery options are available for an additional fee. We ensure every project receives the attention it deserves.",
  },
  {
    question: "Do you offer refunds on beat purchases?",
    answer: "Due to the digital nature of our products, we don't offer refunds on completed beat purchases. However, you can preview every beat before buying, and our team is happy to help you find the perfect match for your project.",
  },
  {
    question: "How do I become a featured producer on WE Global?",
    answer: "We're always looking for talented producers! Apply through our Outreach Programs section. We review all applications and invite producers who match our quality standards to join our platform.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept M-Pesa for mobile payments, which provides instant, secure transactions. Additional payment methods including card payments will be added soon.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground/80 font-medium">Help Center</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to common questions about our services, licensing, and collaboration process.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/support">
              <Button variant="hero" className="group">
                Visit Support Center
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
