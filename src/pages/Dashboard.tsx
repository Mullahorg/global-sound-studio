import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Music, 
  Calendar, 
  FolderKanban, 
  Settings, 
  LogOut,
  Plus,
  Clock,
  TrendingUp,
  DollarSign,
  Headphones,
  ArrowLeftRight,
  Heart,
  Menu,
  X,
  ChevronRight,
  Home,
  Wallet,
  Users,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArtistDashboard } from "@/components/dashboard/ArtistDashboard";
import { ProducerDashboard } from "@/components/dashboard/ProducerDashboard";
import { RecentlyPlayed } from "@/components/dashboard/RecentlyPlayed";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { BeatPreviewPlayer } from "@/components/beats/BeatPreviewPlayer";
import { useAudioQueue } from "@/contexts/AudioQueueContext";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  start_time: string;
  status: string;
  total_price: number | null;
}

interface Project {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const { currentBeat } = useAudioQueue();
  const { settings } = usePlatformSettings();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const [profileRes, roleRes, bookingsRes, projectsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
      supabase.from("bookings").select("*").eq("client_id", user.id).order("session_date", { ascending: true }).limit(5),
      supabase.from("projects").select("*").or(`client_id.eq.${user.id},producer_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(5)
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (roleRes.data) setUserRole(roleRes.data.role);
    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = userRole === "producer" ? [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "beats", label: "My Beats", icon: Music },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "franchise", label: "Franchise", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ] : [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "beats", label: "My Beats", icon: Music },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "confirmed": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-primary/10 text-primary";
      case "cancelled": return "bg-destructive/10 text-destructive";
      case "in_progress": return "bg-blue-500/10 text-blue-500";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-foreground text-sm sm:text-base truncate block">{settings.site_name}</span>
            <Badge className="text-[10px] sm:text-xs capitalize mt-0.5">{userRole || "User"}</Badge>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </button>
        ))}
      </nav>

      {/* Quick Links */}
      <div className="p-3 sm:p-4 border-t border-border/50 space-y-1">
        <Link 
          to="/" 
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm sm:text-base"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
        <Link 
          to="/beats" 
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm sm:text-base"
        >
          <Music className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Browse Beats</span>
        </Link>
        <Link 
          to="/wishlist" 
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm sm:text-base"
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Wishlist</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-3 sm:p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-semibold text-foreground text-sm sm:text-base">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate text-sm sm:text-base">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 lg:hidden z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-foreground"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <span className="font-display font-bold text-foreground">{settings.site_name}</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] sm:w-72 bg-card border-r border-border/50 flex flex-col z-50 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-card border-r border-border/50 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 sm:pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "projects" && "Projects"}
                {activeTab === "bookings" && "Bookings"}
                {activeTab === "beats" && (userRole === "producer" ? "My Beats" : "Purchased Beats")}
                {activeTab === "payouts" && "Payouts"}
                {activeTab === "franchise" && "Franchise"}
                {activeTab === "referrals" && "Referrals"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate("/beats")} className="text-xs sm:text-sm">
                <Music className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Browse </span>Beats
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/booking")} className="text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Book </span>Session
              </Button>
            </div>
          </div>

          {/* Role-based Dashboard Views */}
          {activeTab === "overview" && userRole === "producer" && user && (
            <ProducerDashboard userId={user.id} profile={profile} />
          )}
          {activeTab === "overview" && userRole === "artist" && user && (
            <ArtistDashboard userId={user.id} profile={profile} />
          )}

          {/* Default Overview Tab for non-role users */}
          {activeTab === "overview" && (!userRole || (userRole !== "producer" && userRole !== "artist")) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {[
                  { label: "Active Projects", value: projects.filter(p => p.status !== "completed").length, icon: FolderKanban, color: "primary" },
                  { label: "Upcoming Sessions", value: bookings.filter(b => b.status === "pending" || b.status === "confirmed").length, icon: Calendar, color: "accent" },
                  { label: "Total Spent", value: `KES ${bookings.reduce((acc, b) => acc + (b.total_price || 0), 0).toLocaleString()}`, icon: DollarSign, color: "primary" },
                  { label: "Hours Booked", value: bookings.length * 2, icon: Clock, color: "accent" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color === "primary" ? "text-primary" : "text-accent"}`} />
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                    <p className="text-xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recently Played & Recommendations */}
              <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
                <RecentlyPlayed />
                <Recommendations limit={4} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Upcoming Bookings */}
                <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-lg sm:text-xl font-semibold">Upcoming Sessions</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")} className="text-xs sm:text-sm">
                      View All
                    </Button>
                  </div>
                  
                  {bookings.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize text-sm sm:text-base truncate">
                              {booking.session_type.replace("_", " ")} Session
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {format(new Date(booking.session_date), "MMM d, yyyy")} at {booking.start_time}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-xs shrink-0`}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm sm:text-base">No upcoming sessions</p>
                      <Button variant="outline" size="sm" className="mt-4 text-xs sm:text-sm" onClick={() => navigate("/booking")}>
                        Book a Session
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recent Projects */}
                <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="font-display text-lg sm:text-xl font-semibold">Recent Projects</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("projects")} className="text-xs sm:text-sm">
                      View All
                    </Button>
                  </div>
                  
                  {projects.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">{project.title}</p>
                            {project.deadline && (
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Due: {format(new Date(project.deadline), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge className={`${getStatusColor(project.status)} text-xs shrink-0`}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <FolderKanban className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm sm:text-base">No projects yet</p>
                      <Button variant="outline" size="sm" className="mt-4 text-xs sm:text-sm">
                        Start a Project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                {bookings.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium capitalize text-sm sm:text-base">
                              {booking.session_type.replace("_", " ")} Session
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {format(new Date(booking.session_date), "EEEE, MMMM d, yyyy")} at {booking.start_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                          {booking.total_price && (
                            <span className="text-sm font-medium">KES {Number(booking.total_price).toLocaleString()}</span>
                          )}
                          {booking.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate("/booking")}
                              className="text-xs"
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">Schedule your first session with our producers</p>
                    <Button variant="hero" onClick={() => navigate("/booking")}>
                      Book a Session
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                {projects.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{project.title}</p>
                          {project.deadline && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Deadline: {format(new Date(project.deadline), "MMMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(project.status)} shrink-0`}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FolderKanban className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">Start your first music project</p>
                    <Button variant="hero">
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Beats Tab */}
          {activeTab === "beats" && user && (
            userRole === "producer" ? (
              <ProducerDashboard userId={user.id} profile={profile} />
            ) : (
              <ArtistDashboard userId={user.id} profile={profile} />
            )
          )}

          {/* Referrals Tab - for artists */}
          {activeTab === "referrals" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Referral Program</h3>
              <p className="text-muted-foreground mb-4">Earn rewards by inviting friends</p>
              <Button variant="hero" onClick={() => navigate("/referrals")}>
                View Referrals
              </Button>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Account Settings</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-4 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Email</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-fit">Change</Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-4 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Password</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">••••••••</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-fit">Update</Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-4 border-b border-border/50">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Profile</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Manage your public profile</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate("/profile")}>
                      Edit Profile
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:py-4">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Role</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">{userRole || "Not set"}</p>
                    </div>
                    <Badge>{userRole || "User"}</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payouts Tab - Producer only */}
          {activeTab === "payouts" && userRole === "producer" && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProducerDashboard userId={user.id} profile={profile} />
            </motion.div>
          )}

          {/* Franchise Tab - Producer only */}
          {activeTab === "franchise" && userRole === "producer" && user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProducerDashboard userId={user.id} profile={profile} />
            </motion.div>
          )}
        </div>
      </main>

      {/* Global Audio Player */}
      {currentBeat && <BeatPreviewPlayer />}
    </div>
  );
};

export default Dashboard;
