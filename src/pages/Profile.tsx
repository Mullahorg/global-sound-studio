import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, MapPin, Camera, Save, ArrowLeft, 
  Instagram, Twitter, Youtube, Globe, Music, Edit2
} from "lucide-react";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageMeta } from "@/components/seo/PageMeta";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  phone: z.string().max(20, "Phone number is too long").optional(),
  country: z.string().optional(),
  region: z.string().optional(),
});

const socialLinksSchema = z.object({
  instagram: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  youtube: z.string().url().or(z.string().max(0)).optional(),
  website: z.string().url().or(z.string().max(0)).optional(),
});

interface ProfileData {
  full_name: string;
  email: string;
  bio: string;
  phone: string;
  country: string;
  region: string;
  avatar_url: string;
  badge: string | null;
  social_links: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
}

const regions = [
  "Africa", "Asia", "Europe", "North America", "South America", "Caribbean", "Oceania"
];

const countries = [
  "Kenya", "Nigeria", "Ghana", "South Africa", "UK", "USA", "Canada", "Jamaica", "Tanzania", "Uganda", "Other"
];

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    bio: "",
    phone: "",
    country: "Kenya",
    region: "Africa",
    avatar_url: "",
    badge: null,
    social_links: {},
  });
  const [userRole, setUserRole] = useState<string>("artist");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchProfile();
      fetchRole();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        bio: data.bio || "",
        phone: data.phone || "",
        country: data.country || "Kenya",
        region: data.region || "Africa",
        avatar_url: data.avatar_url || "",
        badge: data.badge,
        social_links: (data.social_links as ProfileData["social_links"]) || {},
      });
    } else {
      setProfile(prev => ({ ...prev, email: user.email || "" }));
    }
  };

  const fetchRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setUserRole(data.role);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSocialChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      social_links: { ...prev.social_links, [field]: value },
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    
    setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    setIsUploading(false);
    toast({ title: "Avatar uploaded!", description: "Don't forget to save your changes." });
  };

  const handleSave = async () => {
    if (!user) return;

    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio || null,
        phone: profile.phone || null,
        country: profile.country,
        region: profile.region,
        avatar_url: profile.avatar_url || null,
        social_links: profile.social_links,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setIsSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
      setIsEditing(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="My Profile" description="Manage your WE Global Music profile" path="/profile" />
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information</p>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="hero">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} variant="hero">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {getInitials(profile.full_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h2 className="font-display text-2xl font-bold">{profile.full_name || "Your Name"}</h2>
                      {profile.badge && (
                        <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
                          {profile.badge.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{profile.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.country}, {profile.region}</span>
                      <span className="mx-2">•</span>
                      <Music className="w-4 h-4" />
                      <span className="capitalize">{userRole}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="social">Social Links</TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="full_name"
                            value={profile.full_name}
                            onChange={(e) => handleChange("full_name", e.target.value)}
                            disabled={!isEditing}
                            className={`pl-10 ${errors.full_name ? "border-destructive" : ""}`}
                            placeholder="Your full name"
                          />
                        </div>
                        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={profile.email}
                            disabled
                            className="pl-10 bg-muted"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="+254 7XX XXX XXX"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={profile.country}
                          onValueChange={(v) => handleChange("country", v)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={profile.region}
                          onValueChange={(v) => handleChange("region", v)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself, your music, and your journey..."
                        className={`min-h-[120px] resize-none ${errors.bio ? "border-destructive" : ""}`}
                        maxLength={500}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        {errors.bio && <p className="text-destructive">{errors.bio}</p>}
                        <span className="ml-auto">{profile.bio.length}/500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Links Tab */}
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Connect your social media profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="instagram"
                            value={profile.social_links.instagram || ""}
                            onChange={(e) => handleSocialChange("instagram", e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="@username"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter / X</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="twitter"
                            value={profile.social_links.twitter || ""}
                            onChange={(e) => handleSocialChange("twitter", e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="@username"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube Channel</Label>
                        <div className="relative">
                          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="youtube"
                            value={profile.social_links.youtube || ""}
                            onChange={(e) => handleSocialChange("youtube", e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="https://youtube.com/@channel"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="website"
                            value={profile.social_links.website || ""}
                            onChange={(e) => handleSocialChange("website", e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
