import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Headphones, Instagram, Twitter, Youtube, Linkedin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const quickLinks = [
  { label: "Beats", href: "/beats" },
  { label: "Studio", href: "/studio" },
  { label: "Services", href: "/services" },
  { label: "Book Session", href: "/booking" },
];

const resourceLinks = [
  { label: "Support", href: "/support" },
  { label: "Licensing", href: "/licensing" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export const Footer = forwardRef<HTMLElement>((props, ref) => {
  const { settings } = usePlatformSettings();

  return (
    <footer ref={ref} className="bg-card/80 backdrop-blur-sm border-t border-border/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Mobile-first compact layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-6">
          {/* Brand Column - Full width on mobile */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Headphones className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">{settings.site_name}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 max-w-xs">
              Connecting artists & producers through world-class music production.
            </p>
            {/* Social Links - Horizontal on all devices */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-foreground mb-3 text-sm">Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium text-foreground mb-3 text-sm">Resources</h4>
            <nav className="space-y-2">
              {resourceLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact - Hidden on smallest screens, shown on md+ */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-medium text-foreground mb-3 text-sm">Contact</h4>
            <div className="space-y-2">
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{settings.contact_email || "hello@studio.com"}</span>
              </a>
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{settings.contact_phone || "+254 700 000 000"}</span>
              </a>
            </div>
            <Link to="/booking" className="block mt-3">
              <Button variant="hero" size="sm" className="h-8 text-xs">
                Book Session
              </Button>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 mb-4" />

        {/* Bottom Row - Compact */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} {settings.site_name}
          </p>

          {/* Legal Links */}
          <nav className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
