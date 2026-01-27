import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  Rocket, 
  Users, 
  Music, 
  Mic, 
  Award,
  ArrowRight,
  CheckCircle,
  Calendar,
  MapPin,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  cover_image: string | null;
}

const defaultPrograms: Program[] = [
  {
    id: "default-1",
    title: "Rising Stars Program",
    description: "A 6-month mentorship program for emerging artists looking to break into the music industry. Get personalized guidance, studio access, and networking opportunities.",
    program_type: "talent_discovery",
    status: "active",
    start_date: null,
    end_date: null,
    max_participants: 20,
    current_participants: 12,
    benefits: ["Free studio sessions", "1-on-1 mentorship", "Industry networking", "Release support"],
    requirements: ["Must have original music", "18+ years old", "Commitment to 6 months"],
    cover_image: null,
  },
  {
    id: "default-2",
    title: "Producer Accelerator",
    description: "An intensive program for producers ready to level up their craft. Learn advanced techniques, get access to premium sounds, and connect with top artists.",
    program_type: "skill_development",
    status: "active",
    start_date: null,
    end_date: null,
    max_participants: 15,
    current_participants: 8,
    benefits: ["Premium plugin access", "Master classes", "Beat placement opportunities", "Marketing support"],
    requirements: ["2+ years production experience", "Portfolio of 10+ tracks", "DAW proficiency"],
    cover_image: null,
  },
  {
    id: "default-3",
    title: "Global Collaboration Hub",
    description: "Connect with artists and producers from around the world. Participate in cross-cultural music projects and expand your creative horizons.",
    program_type: "collaboration",
    status: "active",
    start_date: null,
    end_date: null,
    max_participants: 50,
    current_participants: 34,
    benefits: ["Global artist network", "Collaborative projects", "Cultural exchange", "Virtual sessions"],
    requirements: ["Active musician or producer", "Openness to collaboration", "Reliable internet"],
    cover_image: null,
  },
];

const programIcons: Record<string, typeof Star> = {
  talent_discovery: Star,
  skill_development: Rocket,
  collaboration: Users,
  mentorship: Award,
};

export default function Outreach() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>(defaultPrograms);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    applicant_name: "",
    applicant_email: "",
    talent_type: "artist",
    experience_level: "beginner",
    portfolio_url: "",
    demo_url: "",
    bio: "",
    why_apply: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const { data } = await supabase
      .from("outreach_programs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
      const mappedPrograms: Program[] = data.map(p => ({
        ...p,
        benefits: Array.isArray(p.benefits) ? p.benefits : [],
        requirements: Array.isArray(p.requirements) ? p.requirements : [],
      }));
      setPrograms(mappedPrograms);
    }
  };

  const handleApply = async () => {
    if (!user || !selectedProgram) {
      toast({ title: "Please sign in to apply", variant: "destructive" });
      return;
    }

    if (!applicationForm.applicant_name || !applicationForm.applicant_email || !applicationForm.why_apply) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase.from("outreach_applications").insert({
        program_id: selectedProgram.id,
        applicant_id: user.id,
        ...applicationForm,
      });

      if (error) throw error;

      toast({ title: "Application submitted!", description: "We'll review your application and get back to you soon." });
      setSelectedProgram(null);
      setApplicationForm({
        applicant_name: "",
        applicant_email: "",
        talent_type: "artist",
        experience_level: "beginner",
        portfolio_url: "",
        demo_url: "",
        bio: "",
        why_apply: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setApplying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          
          <motion.div 
            className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Talent Discovery & Support
              </Badge>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                <span className="text-foreground">Discover Your</span>
                <br />
                <span className="gradient-text">Global Sound</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Join our outreach programs designed to discover, nurture, and elevate 
                emerging talent from around the world. Your journey to global recognition starts here.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { icon: Music, label: "500+ Artists Supported" },
                  { icon: Mic, label: "50+ Countries Reached" },
                  { icon: Award, label: "100+ Success Stories" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50"
                  >
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Active Programs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our current initiatives and find the perfect program for your career stage
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => {
                const Icon = programIcons[program.program_type] || Star;
                const spotsLeft = program.max_participants && program.current_participants !== null
                  ? program.max_participants - program.current_participants 
                  : null;

                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-border/50 hover:border-primary/50 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          {spotsLeft !== null && (
                            <Badge variant="outline" className="text-xs">
                              {spotsLeft} spots left
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{program.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {program.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {program.benefits.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Benefits:</p>
                            <div className="flex flex-wrap gap-1">
                              {program.benefits.slice(0, 3).map((benefit, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {String(benefit)}
                                </Badge>
                              ))}
                              {program.benefits.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{program.benefits.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                              variant="outline"
                              onClick={() => setSelectedProgram(program)}
                            >
                              Learn More & Apply
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-display text-2xl flex items-center gap-3">
                                <Icon className="w-6 h-6 text-primary" />
                                {program.title}
                              </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                              <p className="text-muted-foreground">{program.description}</p>

                              {program.benefits.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Program Benefits
                                  </h4>
                                  <ul className="space-y-2">
                                    {program.benefits.map((benefit, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {String(benefit)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {program.requirements.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">Requirements</h4>
                                  <ul className="space-y-2">
                                    {program.requirements.map((req, i) => (
                                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                        {String(req)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="border-t border-border/50 pt-6">
                                <h4 className="font-semibold mb-4">Apply Now</h4>
                                <div className="grid gap-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Full Name *</Label>
                                      <Input
                                        value={applicationForm.applicant_name}
                                        onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_name: e.target.value }))}
                                        placeholder="Your full name"
                                      />
                                    </div>
                                    <div>
                                      <Label>Email *</Label>
                                      <Input
                                        type="email"
                                        value={applicationForm.applicant_email}
                                        onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_email: e.target.value }))}
                                        placeholder="your@email.com"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>I am a...</Label>
                                      <Select
                                        value={applicationForm.talent_type}
                                        onValueChange={(v) => setApplicationForm(prev => ({ ...prev, talent_type: v }))}
                                      >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="artist">Artist/Singer</SelectItem>
                                          <SelectItem value="producer">Producer</SelectItem>
                                          <SelectItem value="songwriter">Songwriter</SelectItem>
                                          <SelectItem value="dj">DJ</SelectItem>
                                          <SelectItem value="multi">Multi-talented</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Experience Level</Label>
                                      <Select
                                        value={applicationForm.experience_level}
                                        onValueChange={(v) => setApplicationForm(prev => ({ ...prev, experience_level: v }))}
                                      >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                                          <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                                          <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                                          <SelectItem value="professional">Professional</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Portfolio/Website URL</Label>
                                    <Input
                                      value={applicationForm.portfolio_url}
                                      onChange={(e) => setApplicationForm(prev => ({ ...prev, portfolio_url: e.target.value }))}
                                      placeholder="https://yourportfolio.com"
                                    />
                                  </div>

                                  <div>
                                    <Label>Demo/Music Link</Label>
                                    <Input
                                      value={applicationForm.demo_url}
                                      onChange={(e) => setApplicationForm(prev => ({ ...prev, demo_url: e.target.value }))}
                                      placeholder="SoundCloud, Spotify, YouTube, etc."
                                    />
                                  </div>

                                  <div>
                                    <Label>Tell us about yourself</Label>
                                    <Textarea
                                      value={applicationForm.bio}
                                      onChange={(e) => setApplicationForm(prev => ({ ...prev, bio: e.target.value }))}
                                      placeholder="Brief bio about your music journey..."
                                      rows={3}
                                    />
                                  </div>

                                  <div>
                                    <Label>Why do you want to join this program? *</Label>
                                    <Textarea
                                      value={applicationForm.why_apply}
                                      onChange={(e) => setApplicationForm(prev => ({ ...prev, why_apply: e.target.value }))}
                                      placeholder="Share your goals and what you hope to achieve..."
                                      rows={4}
                                    />
                                  </div>

                                  <Button 
                                    onClick={handleApply} 
                                    disabled={applying}
                                    variant="hero"
                                    className="w-full"
                                  >
                                    {applying ? "Submitting..." : "Submit Application"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Don't See the Right Fit?
              </h2>
              <p className="text-muted-foreground mb-8">
                We're always looking for exceptional talent. Reach out to us directly 
                and let's discuss how we can support your journey.
              </p>
              <Button variant="hero" size="lg" asChild>
                <a href="/contact">
                  Contact Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
