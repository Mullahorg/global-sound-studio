import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  FileText, 
  Clock,
  RefreshCw,
  Bell,
  X,
  Check,
  AlertCircle,
  Info,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SessionPrice {
  id: string;
  session_type: string;
  name: string;
  description: string | null;
  price_kes: number;
  duration_hours: number;
  icon: string;
  is_active: boolean;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

interface SiteSettings {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  contact_email: string;
  contact_phone: string;
  studio_description: string;
  commission_rate: string;
  minimum_payout: string;
  stat_projects: string;
  stat_artists: string;
  stat_nominations: string;
  stat_access: string;
}

export const ContentPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionPrices, setSessionPrices] = useState<SessionPrice[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingSession, setEditingSession] = useState<SessionPrice | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [siteContent, setSiteContent] = useState<SiteSettings>({
    site_name: "",
    hero_title: "",
    hero_subtitle: "",
    hero_badge: "",
    contact_email: "",
    contact_phone: "",
    studio_description: "",
    commission_rate: "30",
    minimum_payout: "1000",
    stat_projects: "500+",
    stat_artists: "120+",
    stat_nominations: "50+",
    stat_access: "24/7",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch session pricing
    const { data: pricingData } = await supabase
      .from("session_pricing")
      .select("*")
      .order("price_kes", { ascending: true });
    
    if (pricingData) setSessionPrices(pricingData);

    // Fetch announcements
    const { data: announcementsData } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (announcementsData) setAnnouncements(announcementsData);

    // Fetch site settings
    const { data: settingsData } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value");
    
    if (settingsData) {
      const settings: Record<string, string> = {};
      settingsData.forEach((s) => {
        settings[s.setting_key] = s.setting_value || "";
      });
      setSiteContent({
        site_name: settings.site_name || "",
        hero_title: settings.hero_title || "",
        hero_subtitle: settings.hero_subtitle || "",
        hero_badge: settings.hero_badge || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        studio_description: settings.studio_description || "",
        commission_rate: settings.commission_rate || "30",
        minimum_payout: settings.minimum_payout || "1000",
        stat_projects: settings.stat_projects || "500+",
        stat_artists: settings.stat_artists || "120+",
        stat_nominations: settings.stat_nominations || "50+",
        stat_access: settings.stat_access || "24/7",
      });
    }

    setLoading(false);
  };

  const handleSaveSessionPrice = async () => {
    if (!editingSession) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("session_pricing")
      .update({
        name: editingSession.name,
        description: editingSession.description,
        price_kes: editingSession.price_kes,
        duration_hours: editingSession.duration_hours,
        icon: editingSession.icon,
        is_active: editingSession.is_active,
      })
      .eq("id", editingSession.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session pricing updated" });
      setShowSessionDialog(false);
      setEditingSession(null);
      fetchData();
    }
    setSaving(false);
  };

  const handleSaveSiteContent = async () => {
    setSaving(true);
    
    const updates = Object.entries(siteContent).map(([key, value]) =>
      supabase
        .from("platform_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
    );

    try {
      await Promise.all(updates);
      toast({ title: "Site content saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("announcements")
      .insert({
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        type: newAnnouncement.type,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Announcement created" });
      setShowAnnouncementDialog(false);
      setNewAnnouncement({ title: "", message: "", type: "info" });
      fetchData();
    }
    setSaving(false);
  };

  const handleToggleAnnouncement = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchData();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Announcement deleted" });
      fetchData();
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "success": return <Check className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Content Management</h2>
          <p className="text-muted-foreground">Manage site content, pricing, and announcements</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="pricing">Session Pricing</TabsTrigger>
          <TabsTrigger value="site">Site Content</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Session Pricing Tab */}
        <TabsContent value="pricing" className="mt-6">
          <div className="p-6 rounded-xl bg-card border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Studio Session Pricing</h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Prices in KES
              </Badge>
            </div>

            <div className="space-y-3">
              {sessionPrices.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    session.is_active ? "bg-secondary/50" : "bg-secondary/20 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{session.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.name}</p>
                        {!session.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">KES {Number(session.price_kes).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{session.duration_hours} hour(s)</p>
                    </div>
                    <Dialog open={showSessionDialog && editingSession?.id === session.id} onOpenChange={(open) => {
                      setShowSessionDialog(open);
                      if (!open) setEditingSession(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSession(session)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Session Pricing</DialogTitle>
                        </DialogHeader>
                        {editingSession && (
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <Label>Active</Label>
                              <Switch
                                checked={editingSession.is_active}
                                onCheckedChange={(checked) => setEditingSession({ ...editingSession, is_active: checked })}
                              />
                            </div>
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={editingSession.name}
                                onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={editingSession.description || ""}
                                onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Price (KES)</Label>
                                <Input
                                  type="number"
                                  value={editingSession.price_kes}
                                  onChange={(e) => setEditingSession({ ...editingSession, price_kes: Number(e.target.value) })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Duration (hours)</Label>
                                <Input
                                  type="number"
                                  value={editingSession.duration_hours}
                                  onChange={(e) => setEditingSession({ ...editingSession, duration_hours: Number(e.target.value) })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Icon (emoji)</Label>
                              <Input
                                value={editingSession.icon}
                                onChange={(e) => setEditingSession({ ...editingSession, icon: e.target.value })}
                                className="mt-1"
                                maxLength={4}
                              />
                            </div>
                            <Button onClick={handleSaveSessionPrice} className="w-full" disabled={saving}>
                              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Site Content Tab */}
        <TabsContent value="site" className="mt-6">
          <div className="p-6 rounded-xl bg-card border border-border/50">
            <h3 className="font-display text-lg font-semibold mb-6">Site Content & Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Site Name</Label>
                <Input
                  value={siteContent.site_name}
                  onChange={(e) => setSiteContent({ ...siteContent, site_name: e.target.value })}
                  placeholder="WE Global Music Empire"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hero Badge Text</Label>
                <Input
                  value={siteContent.hero_badge}
                  onChange={(e) => setSiteContent({ ...siteContent, hero_badge: e.target.value })}
                  placeholder="World-Class Production Studio"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hero Title</Label>
                <Input
                  value={siteContent.hero_title}
                  onChange={(e) => setSiteContent({ ...siteContent, hero_title: e.target.value })}
                  placeholder="Global Sound. One Studio."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hero Subtitle</Label>
                <Textarea
                  value={siteContent.hero_subtitle}
                  onChange={(e) => setSiteContent({ ...siteContent, hero_subtitle: e.target.value })}
                  placeholder="Supporting text below headline"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label>Projects Stat</Label>
                  <Input
                    value={siteContent.stat_projects}
                    onChange={(e) => setSiteContent({ ...siteContent, stat_projects: e.target.value })}
                    placeholder="500+"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Artists Stat</Label>
                  <Input
                    value={siteContent.stat_artists}
                    onChange={(e) => setSiteContent({ ...siteContent, stat_artists: e.target.value })}
                    placeholder="120+"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Nominations Stat</Label>
                  <Input
                    value={siteContent.stat_nominations}
                    onChange={(e) => setSiteContent({ ...siteContent, stat_nominations: e.target.value })}
                    placeholder="50+"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Access Stat</Label>
                  <Input
                    value={siteContent.stat_access}
                    onChange={(e) => setSiteContent({ ...siteContent, stat_access: e.target.value })}
                    placeholder="24/7"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Studio Description</Label>
                <Textarea
                  value={siteContent.studio_description}
                  onChange={(e) => setSiteContent({ ...siteContent, studio_description: e.target.value })}
                  placeholder="Description shown on studio page"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    value={siteContent.contact_email}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={siteContent.contact_phone}
                    onChange={(e) => setSiteContent({ ...siteContent, contact_phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Commission Rate (%)</Label>
                  <Input
                    type="number"
                    value={siteContent.commission_rate}
                    onChange={(e) => setSiteContent({ ...siteContent, commission_rate: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Platform fee on producer earnings</p>
                </div>
                <div>
                  <Label>Minimum Payout (KES)</Label>
                  <Input
                    type="number"
                    value={siteContent.minimum_payout}
                    onChange={(e) => setSiteContent({ ...siteContent, minimum_payout: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal amount</p>
                </div>
              </div>
              <Button onClick={handleSaveSiteContent} disabled={saving}>
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Content
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="mt-6">
          <div className="p-6 rounded-xl bg-card border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Site Announcements</h3>
              <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="Announcement title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                        placeholder="Announcement message"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={newAnnouncement.type}
                        onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateAnnouncement} className="w-full" disabled={saving}>
                      {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                      Create Announcement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      ann.is_active ? "bg-secondary/50" : "bg-secondary/20 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getAnnouncementIcon(ann.type)}
                      <div>
                        <p className="font-medium">{ann.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ann.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {format(new Date(ann.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ann.is_active}
                        onCheckedChange={(checked) => handleToggleAnnouncement(ann.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No announcements yet</p>
                <p className="text-sm">Create an announcement to display a banner on the site</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};