import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Headphones, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Beats Marketplace", href: "/beats" },
  { label: "Studio", href: "/studio" },
  { label: "Services", href: "/services" },
  { label: "Book a Session", href: "/booking" },
  { label: "Outreach Programs", href: "/outreach" },
];

const resourceLinks = [
  { label: "Support Center", href: "/support" },
  { label: "Licensing Guide", href: "/licensing" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="bg-card/80 backdrop-blur-sm border-t border-border/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-foreground">WE Global</span>
                <p className="text-xs text-muted-foreground">Music Production Studio</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              A borderless ecosystem connecting artists, producers, and labels through world-class music production.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border/30"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
            <nav className="space-y-2">
              {resourceLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <a href="mailto:hello@weglobalstudio.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                hello@weglobalstudio.com
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +254 700 000 000
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Nairobi, Kenya<br />Serving Artists Worldwide</span>
              </div>
            </div>
            <Link to="/booking" className="block mt-4">
              <Button variant="hero" size="sm" className="w-full">
                Book a Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-secondary/30 rounded-2xl p-6 mb-8 border border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-semibold text-foreground">Stay in the Loop</h4>
              <p className="text-sm text-muted-foreground">Get updates on new beats, features, and exclusive offers.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button variant="hero" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            © {new Date().getFullYear()} WE Global Studio. All rights reserved.
          </p>

          {/* Legal Links */}
          <nav className="flex items-center gap-4 order-1 sm:order-2">
            {legalLinks.map((link, index) => (
              <span key={link.label} className="flex items-center gap-4">
                <Link
                  to={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
