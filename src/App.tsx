import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioQueueProvider } from "@/contexts/AudioQueueContext";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { QuickActions } from "@/components/ui/QuickActions";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { OnlineIndicator } from "@/components/ui/OnlineIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Beats from "./pages/Beats";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import Studio from "./pages/Studio";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Library from "./pages/Library";
import Outreach from "./pages/Outreach";
import Wishlist from "./pages/Wishlist";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Licensing from "./pages/Licensing";
import Support from "./pages/Support";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AudioQueueProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <CommandPalette />
              <QuickActions />
              <PWAInstallPrompt />
              <ScrollToTop />
              <OnlineIndicator />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/beats" element={<Beats />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/studio" element={<Studio />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/library" element={<Library />} />
                <Route path="/outreach" element={<Outreach />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/licensing" element={<Licensing />} />
                <Route path="/support" element={<Support />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AudioQueueProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
