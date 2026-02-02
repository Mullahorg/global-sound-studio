import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Shield, Heart, Command, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
const navLinks = [{
  label: "Home",
  href: "/"
}, {
  label: "Studio",
  href: "/studio"
}, {
  label: "Beats",
  href: "/beats"
}, {
  label: "Book",
  href: "/booking"
}, {
  label: "Contact",
  href: "/contact"
}];
export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user
  } = useAuth();
  const {
    isAdmin
  } = useUserRole(); // Use the hook instead of local state
  const navigate = useNavigate();
  const location = useLocation();
  const {
    settings
  } = usePlatformSettings();
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  return <motion.nav initial={{
    y: -100
  }} animate={{
    y: 0
  }} transition={{
    duration: 0.6,
    ease: "easeOut"
  }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-lg shadow-black/10" : "bg-transparent"}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-22 sm:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group z-50">
            <motion.div whileHover={{
            scale: 1.03
          }} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-destructive rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden rounded-2xl bg-background/90 backdrop-blur-sm border-2 border-primary/30 shadow-lg shadow-primary/20">
                <img 
                  src={settings.site_logo || "/logo.png"} 
                  alt={settings.site_name} 
                  className="w-14 h-14 sm:w-18 sm:h-18 object-contain" 
                  onError={e => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }} 
                />
              </div>
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl text-foreground leading-tight">
                {settings.site_name}
              </span>
              <span className="text-xs sm:text-sm text-primary font-semibold tracking-wider uppercase">
                Music Empire
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return <Link key={link.label} to={link.href} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  {link.label}
                </Link>;
          })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => window.dispatchEvent(new CustomEvent("openCommandPalette"))} className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Command className="w-4 h-4" />
            </Button>
            
            {user ? <>
                <NotificationCenter />
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/chat")}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate("/wishlist")}>
                  <Heart className="w-4 h-4" />
                </Button>
                {isAdmin && <Button variant="ghost" size="sm" className="h-8 px-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:text-purple-800 border border-purple-200" onClick={() => navigate("/admin")}>
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </Button>}
                <Button variant="hero" size="sm" className="h-8 px-3 ml-1" onClick={() => navigate("/dashboard")}>
                  <User className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
              </> : <>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" className="h-8 ml-1" onClick={() => navigate("/booking")}>
                  Book Now
                </Button>
              </>}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-foreground z-50 relative" whileTap={{
          scale: 0.9
        }} aria-label={isOpen ? "Close menu" : "Open menu"}>
            <AnimatePresence mode="wait">
              {isOpen ? <motion.div key="close" initial={{
              rotate: -90,
              opacity: 0
            }} animate={{
              rotate: 0,
              opacity: 1
            }} exit={{
              rotate: 90,
              opacity: 0
            }} transition={{
              duration: 0.2
            }}>
                  <X className="w-6 h-6" />
                </motion.div> : <motion.div key="menu" initial={{
              rotate: 90,
              opacity: 0
            }} animate={{
              rotate: 0,
              opacity: 1
            }} exit={{
              rotate: -90,
              opacity: 0
            }} transition={{
              duration: 0.2
            }}>
                  <Menu className="w-6 h-6" />
                </motion.div>}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.3
      }} className="fixed inset-0 bg-background/98 backdrop-blur-xl lg:hidden z-40">
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: 20
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }} className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto">
              {/* Navigation Links */}
              <nav className="flex-1 space-y-1">
                {navLinks.map(link => <Link key={link.label} to={link.href} className={`flex items-center py-3 text-base font-medium border-b border-border/20 transition-colors ${location.pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"}`}>
                    {link.label}
                  </Link>)}
              </nav>

              {/* Mobile Actions */}
              <div className="pt-4 space-y-2">
                {user ? <>
                    <div className="flex gap-2 mb-3">
                      <Button variant="outline" size="sm" onClick={() => navigate("/chat")} className="flex-1 h-10">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate("/wishlist")} className="flex-1 h-10">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    {isAdmin && <Button variant="outline" className="w-full h-10 justify-center bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:text-purple-800 border border-purple-200" onClick={() => navigate("/admin")}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>}
                    <Button variant="hero" className="w-full h-10 justify-center" onClick={() => navigate("/dashboard")}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </> : <>
                    <Button variant="outline" className="w-full h-10 justify-center" onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                    <Button variant="hero" className="w-full h-10 justify-center" onClick={() => navigate("/booking")}>
                      Book Now
                    </Button>
                  </>}
              </div>

              {/* Footer Info */}
              <div className="pt-4 mt-4 border-t border-border/20 text-center">
                <p className="text-xs text-muted-foreground">{settings.site_name}</p>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </motion.nav>;
};