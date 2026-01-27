import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  FileText, 
  DollarSign,
  Clock,
  Settings,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SessionPrice {
  id: string;
  name: string;
  description: string;
  priceKES: number;
  duration: number;
  icon: string;
}

export const ContentPanel = () => {
  const { toast } = useToast();
  const [sessionPrices, setSessionPrices] = useState<SessionPrice[]>([
    { id: "recording", name: "Recording Session", description: "Professional vocal and instrument recording", priceKES: 15000, duration: 2, icon: "🎤" },
    { id: "mixing", name: "Mixing Session", description: "Full mix with engineer consultation", priceKES: 20000, duration: 3, icon: "🎚️" },
    { id: "mastering", name: "Mastering", description: "Final polish for release-ready tracks", priceKES: 10000, duration: 1, icon: "💿" },
    { id: "production", name: "Production Session", description: "Collaborative beat-making and production", priceKES: 25000, duration: 4, icon: "🎹" },
    { id: "consultation", name: "Consultation", description: "One-on-one career and music advice", priceKES: 7500, duration: 1, icon: "💬" },
  ]);
  const [editingSession, setEditingSession] = useState<SessionPrice | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  
  // Site content
  const [siteContent, setSiteContent] = useState({
    heroTitle: "Professional Music Production",
    heroSubtitle: "Create, collaborate, and release world-class music",
    studioDescription: "State-of-the-art recording facility in the heart of Nairobi",
    contactEmail: "studio@weglobal.com",
    contactPhone: "+254 700 000 000",
  });

  const handleSaveSessionPrice = () => {
    if (!editingSession) return;
    
    setSessionPrices(prev => 
      prev.map(s => s.id === editingSession.id ? editingSession : s)
    );
    setShowSessionDialog(false);
    setEditingSession(null);
    toast({ title: "Session pricing updated" });
  };

  const handleSaveSiteContent = () => {
    // In production, this would save to Supabase platform_settings table
    toast({ title: "Site content saved successfully" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Content Management</h2>
          <p className="text-muted-foreground">Manage site content, pricing, and dynamic text</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
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
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{session.icon}</span>
                    <div>
                      <p className="font-medium">{session.name}</p>
                      <p className="text-sm text-muted-foreground">{session.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">KES {session.priceKES.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{session.duration} hour(s)</p>
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
                            <div>
                              <label className="text-sm font-medium mb-2 block">Name</label>
                              <Input
                                value={editingSession.name}
                                onChange={(e) => setEditingSession({ ...editingSession, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Description</label>
                              <Textarea
                                value={editingSession.description}
                                onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Price (KES)</label>
                                <Input
                                  type="number"
                                  value={editingSession.priceKES}
                                  onChange={(e) => setEditingSession({ ...editingSession, priceKES: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                                <Input
                                  type="number"
                                  value={editingSession.duration}
                                  onChange={(e) => setEditingSession({ ...editingSession, duration: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                            <Button onClick={handleSaveSessionPrice} className="w-full">
                              <Save className="w-4 h-4 mr-2" />
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
            <h3 className="font-display text-lg font-semibold mb-6">Site Content & Text</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Hero Title</label>
                <Input
                  value={siteContent.heroTitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
                  placeholder="Main headline text"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Hero Subtitle</label>
                <Textarea
                  value={siteContent.heroSubtitle}
                  onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                  placeholder="Supporting text below headline"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Studio Description</label>
                <Textarea
                  value={siteContent.studioDescription}
                  onChange={(e) => setSiteContent({ ...siteContent, studioDescription: e.target.value })}
                  placeholder="Description shown on studio page"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Email</label>
                  <Input
                    value={siteContent.contactEmail}
                    onChange={(e) => setSiteContent({ ...siteContent, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Phone</label>
                  <Input
                    value={siteContent.contactPhone}
                    onChange={(e) => setSiteContent({ ...siteContent, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSiteContent}>
                <Save className="w-4 h-4 mr-2" />
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
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active announcements</p>
              <p className="text-sm">Create an announcement to display a banner on the site</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
