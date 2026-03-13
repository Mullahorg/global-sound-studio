import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Heart, Command, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Beats", href: "/beats" },
  { label: "Book", href: "/booking" },
  { label: "Contact", href: "/contact" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 z-50">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-card border border-border/50 flex items-center justify-center">
              <img
                src={settings.site_logo || "/logo.png"}
                alt={settings.site_name}
                className="w-7 h-7 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              />
            </div>
            <span className="font-display font-semibold text-foreground text-sm tracking-tight">
              {settings.site_name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
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
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              <Command className="w-4 h-4" />
            </Button>

            {user ? (
              <>
                <NotificationCenter />
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/chat")}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/wishlist")}>
                  <Heart className="w-4 h-4" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/admin")}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 ml-1"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="default" size="sm" className="h-8 ml-1" onClick={() => navigate("/booking")}>
                  Book Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground z-50"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background lg:hidden z-40"
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6">
              <nav className="flex-1 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`block py-3 text-base border-b border-border/10 transition-colors ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="flex gap-2 mb-3">
                      <Button variant="outline" size="sm" onClick={() => navigate("/chat")} className="flex-1 h-10">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/wishlist")} className="flex-1 h-10">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    {isAdmin && (
                      <Button variant="outline" className="w-full h-10 justify-center" onClick={() => navigate("/admin")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    )}
                    <Button variant="default" className="w-full h-10 justify-center" onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full h-10 justify-center" onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                    <Button variant="default" className="w-full h-10 justify-center" onClick={() => navigate("/booking")}>
                      Book Now
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
