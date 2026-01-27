import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Users,
  Headphones,
  ArrowLeftRight,
  Heart
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
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"default" | "artist" | "producer">("default");

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

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileData) setProfile(profileData);

    // Fetch role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (roleData) setUserRole(roleData.role);

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_id", user.id)
      .order("session_date", { ascending: true })
      .limit(5);
    
    if (bookingsData) setBookings(bookingsData);

    // Fetch projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .or(`client_id.eq.${user.id},producer_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (projectsData) setProjects(projectsData);
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

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "beats", label: userRole === "producer" ? "My Beats" : "Purchased Beats", icon: Music },
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border/50 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground">WE Global</span>
              <Badge className="ml-2 text-xs capitalize">{userRole || "User"}</Badge>
            </div>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="font-semibold text-foreground">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "projects" && "Projects"}
                {activeTab === "bookings" && "Bookings"}
                {activeTab === "beats" && (userRole === "producer" ? "My Beats" : "Purchased Beats")}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
              </p>
            </div>
            <div className="flex gap-3">
              {userRole && (
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode(viewMode === "default" ? (userRole === "producer" ? "producer" : "artist") : "default")}
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  {viewMode === "default" ? "Role View" : "Overview"}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/beats")}>
                <Music className="w-4 h-4 mr-2" />
                Browse Beats
              </Button>
              <Button variant="hero" onClick={() => navigate("/booking")}>
                <Plus className="w-4 h-4 mr-2" />
                Book Session
              </Button>
            </div>
          </div>

          {/* Role-based Dashboard Views */}
          {viewMode === "artist" && user && (
            <ArtistDashboard userId={user.id} profile={profile} />
          )}
          {viewMode === "producer" && user && (
            <ProducerDashboard userId={user.id} profile={profile} />
          )}

          {/* Overview Tab */}
          {viewMode === "default" && activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Active Projects", value: projects.filter(p => p.status !== "completed").length, icon: FolderKanban, color: "primary" },
                  { label: "Upcoming Sessions", value: bookings.filter(b => b.status === "pending" || b.status === "confirmed").length, icon: Calendar, color: "accent" },
                  { label: "Total Spent", value: `$${bookings.reduce((acc, b) => acc + (b.total_price || 0), 0)}`, icon: DollarSign, color: "primary" },
                  { label: "Hours Booked", value: bookings.length * 2, icon: Clock, color: "accent" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`w-8 h-8 ${stat.color === "primary" ? "text-primary" : "text-accent"}`} />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recently Played & Recommendations */}
              <div className="space-y-8 mb-8">
                <RecentlyPlayed />
                <Recommendations limit={4} />
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Bookings */}
                <div className="p-6 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">Upcoming Sessions</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>
                      View All
                    </Button>
                  </div>
                  
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map((booking) => (
                        <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">
                              {booking.session_type.replace("_", " ")} Session
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.session_date), "MMM d, yyyy")} at {booking.start_time}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No upcoming sessions</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/booking")}>
                        Book a Session
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recent Projects */}
                <div className="p-6 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">Recent Projects</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("projects")}>
                      View All
                    </Button>
                  </div>
                  
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{project.title}</p>
                            {project.deadline && (
                              <p className="text-sm text-muted-foreground">
                                Due: {format(new Date(project.deadline), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No projects yet</p>
                      <Button variant="outline" size="sm" className="mt-4">
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
              <div className="p-6 rounded-xl bg-card border border-border/50">
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {booking.session_type.replace("_", " ")} Session
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.session_date), "EEEE, MMMM d, yyyy")} at {booking.start_time}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            {booking.total_price && (
                              <p className="text-sm font-medium mt-1">${booking.total_price}</p>
                            )}
                          </div>
                          {booking.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate("/booking")}
                              className="text-xs"
                            >
                              Retry Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">Schedule your first session with our producers</p>
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
              <div className="p-6 rounded-xl bg-card border border-border/50">
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{project.title}</p>
                          {project.deadline && (
                            <p className="text-sm text-muted-foreground">
                              Deadline: {format(new Date(project.deadline), "MMMM d, yyyy")}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Start your first music project</p>
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
          {activeTab === "beats" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">
                  {userRole === "producer" ? "No beats uploaded yet" : "No purchased beats"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {userRole === "producer" 
                    ? "Upload your first beat to start selling" 
                    : "Browse our marketplace to find your next hit"}
                </p>
                <Button variant="hero" onClick={() => navigate("/beats")}>
                  {userRole === "producer" ? "Upload Beat" : "Browse Beats"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <h2 className="font-display text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-border/50">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-border/50">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">••••••••</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">Role</p>
                      <p className="text-sm text-muted-foreground capitalize">{userRole || "Not set"}</p>
                    </div>
                    <Badge>{userRole || "User"}</Badge>
                  </div>
                </div>
              </div>
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
