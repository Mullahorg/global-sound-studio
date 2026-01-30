import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Shield, Heart, Command, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Services", href: "/services" },
  { label: "Beats", href: "/beats" },
  { label: "Library", href: "/library" },
  { label: "Outreach", href: "/outreach" },
  { label: "Book Session", href: "/booking" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = usePlatformSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin" || data?.role === "producer");
    };
    checkAdmin();
  }, [user]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass shadow-lg shadow-black/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group z-50">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt={settings.site_name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
                {settings.site_name}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Music Studio</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.href;
              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className={`relative text-sm font-medium transition-colors duration-300 group ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Command Palette Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent("openCommandPalette"))}
              className="hidden xl:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Command className="w-4 h-4" />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded">⌘K</kbd>
            </Button>
            
            <KeyboardShortcutsHelp />
            
            {user ? (
              <>
                <NotificationCenter />
                <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} title="Messages">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/wishlist")} title="Wishlist">
                  <Heart className="w-4 h-4" />
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/booking")}>
                  Book Session
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground z-50 relative"
            whileTap={{ scale: 0.9 }}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/98 backdrop-blur-xl lg:hidden z-40"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto"
            >
              {/* Navigation Links */}
              <nav className="flex-1 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center justify-between py-4 text-lg font-medium border-b border-border/30 transition-colors ${
                        location.pathname === link.href 
                          ? "text-primary" 
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6 space-y-3"
              >
                {user ? (
                  <>
                    <div className="flex gap-3 mb-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate("/chat")}
                        className="flex-1 h-12"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate("/wishlist")}
                        className="flex-1 h-12"
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => navigate("/referrals")}
                        className="flex-1 h-12"
                      >
                        <User className="w-5 h-5" />
                      </Button>
                    </div>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-center text-base" 
                        onClick={() => navigate("/admin")}
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Admin Panel
                      </Button>
                    )}
                    <Button 
                      variant="hero" 
                      className="w-full h-12 justify-center text-base" 
                      onClick={() => navigate("/dashboard")}
                    >
                      <User className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 justify-center text-base" 
                      onClick={() => navigate("/auth")}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="hero" 
                      className="w-full h-12 justify-center text-base" 
                      onClick={() => navigate("/booking")}
                    >
                      Book Session
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Footer Info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 mt-6 border-t border-border/30 text-center"
              >
                <p className="text-sm text-muted-foreground">{settings.site_name}</p>
                <p className="text-xs text-muted-foreground mt-1">{settings.contact_email}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
