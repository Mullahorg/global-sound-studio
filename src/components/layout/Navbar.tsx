import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Heart, Command, MessageSquare, Settings, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { PageMetrics } from "@/components/ui/ScrollProgress";

const navLinks = [
  { idx: "01", label: "Index", href: "/" },
  { idx: "02", label: "Studio", href: "/studio" },
  { idx: "03", label: "Beats", href: "/beats" },
  { idx: "04", label: "Book", href: "/booking" },
  { idx: "05", label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = usePlatformSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Top utility strip — disappears on scroll */}
      <div
        className={`hidden md:block border-b border-border/40 overflow-hidden transition-all duration-500 ${
          isScrolled ? "h-0 opacity-0" : "h-7 opacity-100"
        }`}
      >
        <div className="container mx-auto px-6 h-7 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Vol. 01 / Issue {new Date().getFullYear()}</span>
          <div className="flex items-center gap-6">
            <span>Nairobi · Worldwide</span>
            <PageMetrics />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Wordmark */}
          <Link to="/" className="flex items-end gap-3 z-50 group">
            <div className="relative">
              <span className="block font-display font-semibold text-foreground text-base sm:text-lg tracking-[-0.04em] leading-none">
                {settings.site_name?.split(" ")[0] || "WE"}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground mt-1">
                {settings.site_name?.split(" ").slice(1).join(" ") || "Global Studio"}
              </span>
            </div>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary mb-1.5 group-hover:scale-150 transition-transform duration-500" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`group/link relative px-4 py-2 flex items-baseline gap-2 transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50 group-hover/link:opacity-100 transition-opacity">
                    {link.idx}
                  </span>
                  <span className="text-sm font-medium tracking-tight">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-px bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.dispatchEvent(new CustomEvent("openCommandPalette"))}
              className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-sm"
              aria-label="Search"
            >
              <Command className="w-4 h-4" />
            </Button>
            <ThemeToggle className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-sm" />
            <LanguageToggle className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-sm" />

            {user ? (
              <>
                <NotificationCenter />
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-sm" onClick={() => navigate("/chat")} aria-label="Messages">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-sm" onClick={() => navigate("/wishlist")} aria-label="Wishlist">
                  <Heart className="w-4 h-4" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-muted-foreground hover:text-foreground rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]"
                    onClick={() => navigate("/admin")}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 ml-2 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-9 ml-2 font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.2em] group/cta"
                  onClick={() => navigate("/booking")}
                >
                  Book Session
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground z-50 -mr-2"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background lg:hidden z-40 noise-overlay"
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6">
              <div className="flex items-center justify-between mb-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span>Index / Menu</span>
                <PageMetrics />
              </div>
              <nav className="flex-1 space-y-0">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-baseline gap-4 py-5 border-b border-border/40 transition-colors ${
                        location.pathname === link.href ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{link.idx}</span>
                      <span className="display-headline text-3xl">{link.label}</span>
                      <ArrowUpRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="pt-6 space-y-2">
                {user ? (
                  <>
                    <div className="flex gap-2 mb-3">
                      <Button variant="outline" size="sm" onClick={() => navigate("/chat")} className="flex-1 h-11 rounded-sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/wishlist")} className="flex-1 h-11 rounded-sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <ThemeToggle className="flex-1 h-11 rounded-sm border border-border" />
                      <LanguageToggle className="flex-1 h-11 rounded-sm border border-border" />
                    </div>
                    {isAdmin && (
                      <Button variant="outline" className="w-full h-11 justify-center rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate("/admin")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    )}
                    <Button variant="default" className="w-full h-12 justify-center rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full h-11 justify-center rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                    <Button variant="default" className="w-full h-12 justify-center rounded-sm font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => navigate("/booking")}>
                      Book Session
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
