import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
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

export const Footer = forwardRef<HTMLElement>((props, ref) => {
  const { settings } = usePlatformSettings();

  return (
    <footer ref={ref} className="border-t border-border/30">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display font-semibold text-foreground text-sm">{settings.site_name}</span>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Professional music production, mixing, mastering, and beat licensing.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.label} to={link.href} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Resources</h4>
            <nav className="space-y-2">
              {resourceLinks.map((link) => (
                <Link key={link.label} to={link.href} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-3">Contact</h4>
            <div className="space-y-2">
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{settings.contact_email || "hello@studio.com"}</span>
              </a>
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{settings.contact_phone || "+254 700 000 000"}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/20 mb-4" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings.site_name}
          </p>
          <nav className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.label} to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
