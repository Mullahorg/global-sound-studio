import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Music, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Headphones,
  Edit,
  Trash2,
  Eye,
  Upload,
  Image,
  Save,
  X,
  CreditCard,
  Rocket,
  Wallet,
  Gift,
  Building2,
  Menu,
  Home,
  Palette,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { PaymentsPanel } from "@/components/admin/PaymentsPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { OutreachPanel } from "@/components/admin/OutreachPanel";
import { PayoutsPanel } from "@/components/admin/PayoutsPanel";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { ContentPanel } from "@/components/admin/ContentPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { ManualPaymentsPanel } from "@/components/admin/ManualPaymentsPanel";
import { ReferralsPanel } from "@/components/admin/ReferralsPanel";
import { FranchisePanel } from "@/components/admin/FranchisePanel";
import { BrandingPanel } from "@/components/admin/BrandingPanel";
import { ChatMonitorPanel } from "@/components/admin/ChatMonitorPanel";
import { DisputesPanel } from "@/components/admin/DisputesPanel";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useUserRole } from "@/hooks/useUserRole";

interface Beat {
  id: string;
  title: string;
  genre: string;
  mood: string;
  bpm: number;
  key: string | null;
  price_basic: number;
  price_premium: number;
  price_exclusive: number;
  play_count: number | null;
  created_at: string;
}

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  start_time: string;
  status: string;
  total_price: number | null;
  client_id: string;
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = usePlatformSettings();
  const { role, isAdmin: isAdminRole, isProducer, loading: roleLoading } = useUserRole();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showBeatDialog, setShowBeatDialog] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Beat form state
  const [beatForm, setBeatForm] = useState({
    title: "",
    genre: "hip_hop",
    mood: "chill",
    bpm: 120,
    key: "C",
    price_basic: 29.99,
    price_premium: 99.99,
    price_exclusive: 499.99,
    audio_url: "",
    cover_url: "",
    description: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Redirect non-admins
  useEffect(() => {
    if (!roleLoading && user && !isAdminRole) {
      console.log("User is not admin, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [roleLoading, user, isAdminRole, navigate]);

  const fetchData = async () => {
    try {
      // Fetch beats
      const { data: beatsData, error: beatsError } = await supabase
        .from("beats")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (beatsError) throw beatsError;
      if (beatsData) setBeats(beatsData);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("session_date", { ascending: false });
      
      if (bookingsError) throw bookingsError;
      if (bookingsData) setBookings(bookingsData);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (usersError) throw usersError;
      if (usersData) setUsers(usersData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch data", 
        variant: "destructive" 
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveBeat = async () => {
    if (!user) return;

    try {
      if (editingBeat) {
        // Update existing beat
        const { error } = await supabase
          .from("beats")
          .update({
            title: beatForm.title,
            genre: beatForm.genre as any,
            mood: beatForm.mood as any,
            bpm: beatForm.bpm,
            key: beatForm.key,
            price_basic: beatForm.price_basic,
            price_premium: beatForm.price_premium,
            price_exclusive: beatForm.price_exclusive,
            audio_url: beatForm.audio_url || "https://example.com/audio.mp3",
            cover_url: beatForm.cover_url,
            description: beatForm.description,
          })
          .eq("id", editingBeat.id);

        if (error) throw error;
        toast({ title: "Beat updated successfully" });
      } else {
        // Create new beat
        const { error } = await supabase.from("beats").insert({
          title: beatForm.title,
          genre: beatForm.genre as any,
          mood: beatForm.mood as any,
          bpm: beatForm.bpm,
          key: beatForm.key,
          price_basic: beatForm.price_basic,
          price_premium: beatForm.price_premium,
          price_exclusive: beatForm.price_exclusive,
          audio_url: beatForm.audio_url || "https://example.com/audio.mp3",
          cover_url: beatForm.cover_url,
          description: beatForm.description,
          producer_id: user.id,
        });

        if (error) throw error;
        toast({ title: "Beat created successfully" });
      }

      setShowBeatDialog(false);
      setEditingBeat(null);
      resetBeatForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteBeat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this beat?")) return;

    const { error } = await supabase.from("beats").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Beat deleted successfully" });
      fetchData();
    }
  };

  const handleEditBeat = (beat: Beat) => {
    setEditingBeat(beat);
    setBeatForm({
      title: beat.title,
      genre: beat.genre,
      mood: beat.mood,
      bpm: beat.bpm,
      key: beat.key || "C",
      price_basic: beat.price_basic,
      price_premium: beat.price_premium,
      price_exclusive: beat.price_exclusive,
      audio_url: "",
      cover_url: "",
      description: "",
    });
    setShowBeatDialog(true);
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: status as any })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking status updated" });
      fetchData();
    }
  };

  const resetBeatForm = () => {
    setBeatForm({
      title: "",
      genre: "hip_hop",
      mood: "chill",
      bpm: 120,
      key: "C",
      price_basic: 29.99,
      price_premium: 99.99,
      price_exclusive: 499.99,
      audio_url: "",
      cover_url: "",
      description: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "confirmed": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-primary/10 text-primary";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  // Show loading while checking auth and role
  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not admin (after loading), show nothing (will redirect)
  if (!isAdminRole) {
    return null;
  }

  // Sidebar items - Admin sees all
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "chat-monitor", label: "Chat Monitor", icon: MessageSquare },
    { id: "disputes", label: "Disputes", icon: AlertTriangle },
    { id: "beats", label: "Beats CMS", icon: Music },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "orders", label: "Orders", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "manual-payments", label: "Manual Verify", icon: Wallet },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "users", label: "Users", icon: Users },
    { id: "outreach", label: "Outreach", icon: Rocket },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "franchise", label: "Franchise", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "content", label: "Content", icon: FileText },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Total Revenue", value: `KES ${bookings.reduce((acc, b) => acc + (b.total_price || 0), 0).toLocaleString()}`, icon: DollarSign, trend: "+12%" },
    { label: "Total Beats", value: beats.length.toString(), icon: Music, trend: "+3" },
    { label: "Active Bookings", value: bookings.filter(b => b.status === "pending" || b.status === "confirmed").length.toString(), icon: Calendar, trend: "+5" },
    { label: "Total Users", value: users.length.toString(), icon: Users, trend: "+8" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt={settings.site_name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-foreground text-sm sm:text-base">{settings.site_name}</span>
            <Badge className="ml-2 text-xs bg-green-500/10 text-green-600">Admin</Badge>
          </div>
        </Link>
      </div>

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
          </button>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-border/50 space-y-1">
        <Link 
          to="/" 
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all text-sm sm:text-base"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
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
        <span className="font-display font-bold text-foreground">Admin Panel</span>
        <div className="w-10" />
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
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Welcome, {user?.email} • Manage your platform content and settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                Role: {role || "Admin"}
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchData}>
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className="w-8 h-8 text-primary" />
                      <span className="text-sm text-green-500 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="p-6 rounded-xl bg-card border border-border/50">
                  <h2 className="font-display text-xl font-semibold mb-4">Recent Bookings</h2>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium capitalize">{booking.session_type.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.session_date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Beats */}
                <div className="p-6 rounded-xl bg-card border border-border/50">
                  <h2 className="font-display text-xl font-semibold mb-4">Recent Beats</h2>
                  <div className="space-y-3">
                    {beats.slice(0, 5).map((beat) => (
                      <div key={beat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">{beat.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {beat.genre.replace("_", " ")} • {beat.bpm} BPM
                          </p>
                        </div>
                        <span className="font-medium text-primary">${beat.price_basic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Beats CMS Tab */}
          {activeTab === "beats" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold">Beats Management</h2>
                <Dialog open={showBeatDialog} onOpenChange={setShowBeatDialog}>
                  <DialogTrigger asChild>
                    <Button variant="hero" onClick={() => { setEditingBeat(null); resetBeatForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Beat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">
                        {editingBeat ? "Edit Beat" : "Add New Beat"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Title</label>
                        <Input
                          value={beatForm.title}
                          onChange={(e) => setBeatForm({ ...beatForm, title: e.target.value })}
                          placeholder="Enter beat title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Genre</label>
                          <Select value={beatForm.genre} onValueChange={(v) => setBeatForm({ ...beatForm, genre: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["hip_hop", "rnb", "trap", "pop", "electronic", "afrobeats", "ambient", "jazz", "rock", "latin"].map((g) => (
                                <SelectItem key={g} value={g}>{g.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Mood</label>
                          <Select value={beatForm.mood} onValueChange={(v) => setBeatForm({ ...beatForm, mood: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["energetic", "chill", "dark", "uplifting", "romantic", "aggressive", "melancholic", "happy"].map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">BPM</label>
                          <Input
                            type="number"
                            value={beatForm.bpm}
                            onChange={(e) => setBeatForm({ ...beatForm, bpm: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Key</label>
                          <Input
                            value={beatForm.key}
                            onChange={(e) => setBeatForm({ ...beatForm, key: e.target.value })}
                            placeholder="e.g., Am, C, F#m"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Basic Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={beatForm.price_basic}
                            onChange={(e) => setBeatForm({ ...beatForm, price_basic: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Premium Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={beatForm.price_premium}
                            onChange={(e) => setBeatForm({ ...beatForm, price_premium: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Exclusive Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={beatForm.price_exclusive}
                            onChange={(e) => setBeatForm({ ...beatForm, price_exclusive: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                          value={beatForm.description}
                          onChange={(e) => setBeatForm({ ...beatForm, description: e.target.value })}
                          placeholder="Describe the beat..."
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowBeatDialog(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button variant="hero" onClick={handleSaveBeat}>
                          <Save className="w-4 h-4 mr-2" />
                          {editingBeat ? "Update Beat" : "Create Beat"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Genre</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">BPM</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Plays</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beats.map((beat) => (
                      <tr key={beat.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-4 font-medium">{beat.title}</td>
                        <td className="p-4 capitalize">{beat.genre.replace("_", " ")}</td>
                        <td className="p-4">{beat.bpm}</td>
                        <td className="p-4">${beat.price_basic}</td>
                        <td className="p-4">{(beat.play_count || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/beats`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEditBeat(beat)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteBeat(beat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {beats.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No beats yet. Add your first beat to get started.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Booking Management</h2>
              
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Session Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-4 font-medium capitalize">{booking.session_type.replace("_", " ")}</td>
                        <td className="p-4">{format(new Date(booking.session_date), "MMM d, yyyy")}</td>
                        <td className="p-4">{booking.start_time}</td>
                        <td className="p-4">{booking.total_price ? `$${booking.total_price}` : "-"}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </td>
                        <td className="p-4">
                          <Select
                            value={booking.status}
                            onValueChange={(v) => handleUpdateBookingStatus(booking.id, v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No bookings yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && <OrdersPanel />}

          {/* Payments Tab */}
          {activeTab === "payments" && <PaymentsPanel />}

          {/* Manual Payments Tab */}
          {activeTab === "manual-payments" && <ManualPaymentsPanel />}

          {/* Payouts Tab */}
          {activeTab === "payouts" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Producer Payouts</h2>
              <PayoutsPanel />
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && <UsersPanel />}

          {/* Analytics Tab */}
          {activeTab === "analytics" && <AnalyticsPanel />}

          {/* Content Tab */}
          {activeTab === "content" && <ContentPanel />}

          {/* Outreach Tab */}
          {activeTab === "outreach" && <OutreachPanel />}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Referral Program</h2>
              <ReferralsPanel />
            </motion.div>
          )}

          {/* Franchise Tab */}
          {activeTab === "franchise" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Producer Franchise</h2>
              <FranchisePanel />
            </motion.div>
          )}

          {/* Chat Monitor Tab */}
          {activeTab === "chat-monitor" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Chat Monitoring</h2>
              <ChatMonitorPanel />
            </motion.div>
          )}

          {/* Disputes Tab */}
          {activeTab === "disputes" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-2xl font-semibold mb-6">Dispute Management</h2>
              <DisputesPanel />
            </motion.div>
          )}

          {/* Branding Tab */}
          {activeTab === "branding" && <BrandingPanel />}

          {/* Settings Tab */}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
