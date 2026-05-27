import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section ref={ref} className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* Left rail */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 lg:self-start"
          >
            <p className="editorial-eyebrow mb-6">№ 007 · Maswali</p>
            <h2 className="display-headline text-foreground mb-6" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
              Frequently
              <span className="block display-italic font-light text-foreground/90">
                asked<span className="text-primary not-italic">.</span>
              </span>
            </h2>
            <p className="text-base text-foreground/70 leading-relaxed max-w-sm mb-8">
              Notes on licensing, sessions, turnaround, and how we work with artists in Nairobi and beyond.
            </p>
            <div className="hidden lg:flex flex-col gap-2 pt-6 border-t border-border max-w-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Still need help?
              </p>
              <Link
                to="/support"
                className="group inline-flex items-center justify-between gap-6 px-4 py-3 border border-foreground bg-foreground text-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
              >
                Support Center
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-between gap-6 px-4 py-3 border border-border hover:border-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em] text-foreground"
              >
                Contact Us
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </motion.div>

          {/* Accordion list */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 lg:col-span-7"
          >
            <Accordion type="single" collapsible className="border-t border-border">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-border group/item"
                >
                  <AccordionTrigger className="text-left py-6 hover:no-underline [&>svg]:hidden">
                    <div className="flex items-start gap-4 md:gap-6 flex-1 pr-4">
                      <span className="editorial-index pt-1 shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-base md:text-lg text-foreground group-hover/item:text-primary transition-colors leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <Plus className="w-5 h-5 shrink-0 text-foreground transition-transform duration-300 group-data-[state=open]/item:rotate-45" strokeWidth={1.5} />
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pr-4">
                    <div className="pl-10 md:pl-14 text-sm md:text-base text-foreground/70 leading-relaxed max-w-2xl">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Mobile-only CTAs */}
            <div className="lg:hidden flex flex-col gap-2 mt-8 pt-6 border-t border-border">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Still need help?
              </p>
              <Link
                to="/support"
                className="group inline-flex items-center justify-between gap-6 px-4 py-3 border border-foreground bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.22em]"
              >
                Support Center
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-between gap-6 px-4 py-3 border border-border font-mono text-[11px] uppercase tracking-[0.22em] text-foreground"
              >
                Contact Us
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
