import { Suspense, lazy } from "react";
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
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PageLoader } from "@/components/ui/PageLoader";
import { Analytics } from "@vercel/analytics/react";
import { QuickAdminAccess } from "@/components/ui/QuickAdminAccess";

// Eager loaded pages (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded pages (code splitting)
const Beats = lazy(() => import("./pages/Beats"));
const Booking = lazy(() => import("./pages/Booking"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Studio = lazy(() => import("./pages/Studio"));
const Admin = lazy(() => import("./pages/Admin"));
const Contact = lazy(() => import("./pages/Contact"));
const Services = lazy(() => import("./pages/Services"));
const Library = lazy(() => import("./pages/Library"));
const Outreach = lazy(() => import("./pages/Outreach"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Licensing = lazy(() => import("./pages/Licensing"));
const Support = lazy(() => import("./pages/Support"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Referrals = lazy(() => import("./pages/Referrals"));

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
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <CommandPalette />
                <QuickActions />
                <PWAInstallPrompt />
                <ScrollToTop />
                <OnlineIndicator />
                <Analytics />
                {/* Quick Admin Access Button (Floating) */}
                <QuickAdminAccess />
                <Suspense fallback={<PageLoader />}>
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
                    <Route path="/referrals" element={<Referrals />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </TooltipProvider>
          </AudioQueueProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
