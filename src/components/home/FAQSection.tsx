import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
    answer: "We offer three tiers: Basic (MP3, 2,500 streams), Premium (WAV + MP3, unlimited streams), and Exclusive (all stems, full ownership). Each tier matches different project needs.",
  },
  {
    question: "How do remote sessions work?",
    answer: "We use high-quality audio streaming to connect you with our producers in real-time. You'll receive a private session link and collaborate seamlessly.",
  },
  {
    question: "What's the turnaround time for mixing and mastering?",
    answer: "Standard turnaround is 3-5 business days for mixing and 1-2 days for mastering. Rush delivery is available for an additional fee.",
  },
  {
    question: "Do you offer refunds on beat purchases?",
    answer: "Due to the digital nature of our products, we don't offer refunds on completed purchases. You can preview every beat before buying.",
  },
  {
    question: "How do I become a featured producer?",
    answer: "Apply through our Outreach Programs. We review all applications and invite producers who match our quality standards.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept M-Pesa for mobile payments with instant, secure transactions. Additional methods coming soon.",
  },
];

export const FAQSection = forwardRef<HTMLElement, object>(function FAQSection(_, ref) {
  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-3">Help Center</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Common questions about our services, licensing, and collaboration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/30 rounded-lg px-5 data-[state=open]:border-border transition-colors"
              >
                <AccordionTrigger className="text-left font-display text-sm font-medium text-foreground py-4 hover:no-underline hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/support">
              <Button variant="default" size="sm" className="group">
                Support Center
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="sm">Contact Us</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
