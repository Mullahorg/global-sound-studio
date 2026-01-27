import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  Star,
  Rocket,
  MessageSquare,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Program {
  id: string;
  title: string;
  description: string | null;
  program_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  current_participants: number | null;
  benefits: unknown[];
  requirements: unknown[];
  created_at: string;
}

interface Application {
  id: string;
  program_id: string;
  applicant_name: string;
  applicant_email: string;
  talent_type: string;
  experience_level: string;
  portfolio_url: string | null;
  demo_url: string | null;
  bio: string | null;
  why_apply: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export const OutreachPanel = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    program_type: "talent_discovery",
    status: "active",
    max_participants: 20,
    benefits: "",
    requirements: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [programsRes, applicationsRes] = await Promise.all([
      supabase.from("outreach_programs").select("*").order("created_at", { ascending: false }),
      supabase.from("outreach_applications").select("*").order("created_at", { ascending: false }),
    ]);

    if (programsRes.data) {
      const mappedPrograms: Program[] = programsRes.data.map(p => ({
        ...p,
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
        requirements: Array.isArray(p.requirements) ? p.requirements : [],
      }));
      setPrograms(mappedPrograms);
    }
    if (applicationsRes.data) setApplications(applicationsRes.data);
  };

  const handleSaveProgram = async () => {
    try {
      const programData = {
        title: programForm.title,
        description: programForm.description,
        program_type: programForm.program_type,
        status: programForm.status,
        max_participants: programForm.max_participants,
        benefits: programForm.benefits.split("\n").filter(b => b.trim()),
        requirements: programForm.requirements.split("\n").filter(r => r.trim()),
      };

      if (editingProgram) {
        const { error } = await supabase
          .from("outreach_programs")
          .update(programData)
          .eq("id", editingProgram.id);
        if (error) throw error;
        toast({ title: "Program updated" });
      } else {
        const { error } = await supabase
          .from("outreach_programs")
          .insert(programData);
        if (error) throw error;
        toast({ title: "Program created" });
      }

      setShowProgramDialog(false);
      setEditingProgram(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Delete this program? This will also delete all applications.")) return;
    
    const { error } = await supabase.from("outreach_programs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program deleted" });
      fetchData();
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("outreach_applications")
      .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${status}` });
      setSelectedApplication(null);
      setAdminNotes("");
      fetchData();
    }
  };

  const resetForm = () => {
    setProgramForm({
      title: "",
      description: "",
      program_type: "talent_discovery",
      status: "active",
      max_participants: 20,
      benefits: "",
      requirements: "",
    });
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramForm({
      title: program.title,
      description: program.description || "",
      program_type: program.program_type,
      status: program.status,
      max_participants: program.max_participants || 20,
      benefits: program.benefits.join("\n"),
      requirements: program.requirements.join("\n"),
    });
    setShowProgramDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "approved": return "bg-green-500/10 text-green-500";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "active": return "bg-green-500/10 text-green-500";
      case "paused": return "bg-amber-500/10 text-amber-500";
      case "completed": return "bg-primary/10 text-primary";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Tabs defaultValue="programs" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="programs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="w-4 h-4 mr-2" />
              Programs
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Applications
              {pendingCount > 0 && (
                <Badge className="ml-2 bg-amber-500/10 text-amber-500">{pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => { setEditingProgram(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingProgram ? "Edit Program" : "Create Program"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Program Title</Label>
                  <Input
                    value={programForm.title}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Rising Stars Mentorship"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the program..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Program Type</Label>
                    <Select
                      value={programForm.program_type}
                      onValueChange={(v) => setProgramForm(prev => ({ ...prev, program_type: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="talent_discovery">Talent Discovery</SelectItem>
                        <SelectItem value="skill_development">Skill Development</SelectItem>
                        <SelectItem value="mentorship">Mentorship</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={programForm.status}
                      onValueChange={(v) => setProgramForm(prev => ({ ...prev, status: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    value={programForm.max_participants}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 20 }))}
                  />
                </div>

                <div>
                  <Label>Benefits (one per line)</Label>
                  <Textarea
                    value={programForm.benefits}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, benefits: e.target.value }))}
                    placeholder="Free studio access&#10;1-on-1 mentorship&#10;Industry networking"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Requirements (one per line)</Label>
                  <Textarea
                    value={programForm.requirements}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, requirements: e.target.value }))}
                    placeholder="Must have original music&#10;18+ years old&#10;Commitment to program"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveProgram} variant="hero" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {editingProgram ? "Update Program" : "Create Program"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowProgramDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <div className="grid gap-4">
            {programs.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No programs yet. Create your first outreach program!</p>
                </CardContent>
              </Card>
            ) : (
              programs.map((program) => (
                <Card key={program.id} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display text-xl font-semibold">{program.title}</h3>
                          <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                          <Badge variant="outline">{program.program_type.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{program.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {program.current_participants}/{program.max_participants || "∞"} participants
                          </span>
                          <span>
                            Created {format(new Date(program.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProgram(program)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProgram(program.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications yet</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => {
                const program = programs.find(p => p.id === app.program_id);
                return (
                  <Card key={app.id} className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{app.applicant_name}</h3>
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{app.applicant_email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <Badge variant="outline">{app.talent_type}</Badge>
                            <Badge variant="outline">{app.experience_level}</Badge>
                            {program && <span>Applied to: {program.title}</span>}
                          </div>
                          {app.why_apply && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              "{app.why_apply}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => {
                                setSelectedApplication(app);
                                setAdminNotes(app.admin_notes || "");
                              }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Application Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="font-medium">{app.applicant_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{app.applicant_email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Talent Type</Label>
                                    <p className="font-medium capitalize">{app.talent_type}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Experience</Label>
                                    <p className="font-medium capitalize">{app.experience_level}</p>
                                  </div>
                                </div>

                                {app.portfolio_url && (
                                  <div>
                                    <Label className="text-muted-foreground">Portfolio</Label>
                                    <a href={app.portfolio_url} target="_blank" className="text-primary hover:underline block">
                                      {app.portfolio_url}
                                    </a>
                                  </div>
                                )}

                                {app.demo_url && (
                                  <div>
                                    <Label className="text-muted-foreground">Demo/Music</Label>
                                    <a href={app.demo_url} target="_blank" className="text-primary hover:underline block">
                                      {app.demo_url}
                                    </a>
                                  </div>
                                )}

                                {app.bio && (
                                  <div>
                                    <Label className="text-muted-foreground">Bio</Label>
                                    <p className="text-sm">{app.bio}</p>
                                  </div>
                                )}

                                {app.why_apply && (
                                  <div>
                                    <Label className="text-muted-foreground">Why They Want to Join</Label>
                                    <p className="text-sm">{app.why_apply}</p>
                                  </div>
                                )}

                                <div>
                                  <Label>Admin Notes</Label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this application..."
                                    rows={3}
                                  />
                                </div>

                                {app.status === "pending" && (
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                                      className="flex-1 bg-green-500 hover:bg-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                                      variant="destructive"
                                      className="flex-1"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
