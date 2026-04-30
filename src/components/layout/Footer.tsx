import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, ArrowUpRight, Instagram, Twitter, Youtube } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const navColumns = [
  {
    label: "Studio",
    items: [
      { label: "Beats", href: "/beats" },
      { label: "Studio", href: "/studio" },
      { label: "Services", href: "/services" },
      { label: "Book Session", href: "/booking" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Library", href: "/library" },
      { label: "Outreach", href: "/outreach" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Referrals", href: "/referrals" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Support", href: "/support" },
      { label: "Licensing", href: "/licensing" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { settings } = usePlatformSettings();
  const year = new Date().getFullYear();

  return (
    <footer ref={ref} className="relative border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-10">
        <div className="grid grid-cols-12 gap-6 md:gap-8 mb-16 md:mb-24">
          <div className="col-span-12 lg:col-span-7">
            <p className="editorial-eyebrow mb-6">§ Coda</p>
            <h2 className="display-headline text-4xl sm:text-5xl md:text-6xl text-foreground max-w-2xl">
              Sound, <span className="display-italic text-primary">crafted</span> for those
              who refuse the average.
            </h2>
            <p className="mt-8 max-w-md text-sm text-muted-foreground leading-relaxed">
              A borderless production house. Studio sessions, mixing, mastering, and licensable beats - engineered with care.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                to="/booking"
                className="group inline-flex items-center justify-between gap-6 px-5 py-4 border border-foreground bg-foreground text-background hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em]"
              >
                Book a Session
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-between gap-6 px-5 py-4 border border-border hover:border-foreground transition-colors font-mono text-[11px] uppercase tracking-[0.22em] text-foreground"
              >
                Talk to Us
                <ArrowUpRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {navColumns.map((col) => (
              <div key={col.label}>
                <p className="editorial-label mb-4">{col.label}</p>
                <nav className="space-y-2.5">
                  {col.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mb-8 overflow-hidden">
          <div className="editorial-rule" />
          <h3
            aria-hidden
            className="display-mega text-foreground select-none mt-6"
            style={{ fontSize: "clamp(3rem, 16vw, 16rem)", lineHeight: 0.85 }}
          >
            {(settings.site_name || "WE Global").toUpperCase()}
          </h3>
          <div className="editorial-rule mt-2" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>© {year} {settings.site_name || "WE Global Studio"}</span>
            <span>All Rights Reserved</span>
            <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground transition-colors inline-flex items-center gap-2">
              <Mail className="w-3 h-3" /> {settings.contact_email || "hello@studio.com"}
            </a>
            <a href={`tel:${settings.contact_phone}`} className="hover:text-foreground transition-colors inline-flex items-center gap-2">
              <Phone className="w-3 h-3" /> {settings.contact_phone || "+254 700 000 000"}
            </a>
          </div>

          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center border border-border hover:border-foreground hover:text-primary transition-colors"
              >
                <s.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";