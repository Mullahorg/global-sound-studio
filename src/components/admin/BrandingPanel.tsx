import { useState, useRef } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Image, 
  RefreshCw, 
  Eye,
  Check,
  X,
  Wand2,
  Crop,
  FileImage,
  Type,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogoCropper } from "./LogoCropper";
import { LogoFormatConverter } from "./LogoFormatConverter";
import { Palette } from "lucide-react";

function hexToHsl(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const BrandingPanel = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [primaryColor, setPrimaryColor] = useState<string>("#ea580c");
  const [savingColor, setSavingColor] = useState(false);
  const [accentColor, setAccentColor] = useState<string>("#e84393");
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [identity, setIdentity] = useState({
    site_name: "",
    studio_description: "",
    hero_title: "",
    hero_subtitle: "",
    hero_badge: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "site_logo",
          "primary_color",
          "accent_color",
          "site_name",
          "studio_description",
          "hero_title",
          "hero_subtitle",
          "hero_badge",
          "contact_email",
          "contact_phone",
        ]);
      data?.forEach((row) => {
        if (row.setting_key === "site_logo" && row.setting_value) setLogoUrl(row.setting_value);
        if (row.setting_key === "primary_color" && row.setting_value) {
          // Stored as hex; if HSL triplet, convert back to a visual hex picker default
          if (row.setting_value.startsWith("#")) setPrimaryColor(row.setting_value);
        }
        if (row.setting_key === "accent_color" && row.setting_value?.startsWith?.("#")) {
          setAccentColor(row.setting_value);
        }
        const identityKeys = [
          "site_name",
          "studio_description",
          "hero_title",
          "hero_subtitle",
          "hero_badge",
          "contact_email",
          "contact_phone",
        ] as const;
        if (row.setting_value && (identityKeys as readonly string[]).includes(row.setting_key)) {
          setIdentity((prev) => ({ ...prev, [row.setting_key]: row.setting_value! }));
        }
      });
    })();
  }, []);

  const handleSaveIdentity = async () => {
    setSavingIdentity(true);
    try {
      const rows = Object.entries(identity).map(([k, v]) => ({
        setting_key: k,
        setting_value: v,
        setting_type: "string",
        description: `Brand identity: ${k}`,
      }));
      rows.push({
        setting_key: "accent_color",
        setting_value: accentColor,
        setting_type: "string",
        description: "Secondary brand color (hex)",
      });
      for (const row of rows) {
        await supabase
          .from("platform_settings")
          .upsert(row, { onConflict: "setting_key" });
      }
      toast({ title: "Brand identity saved", description: "Site-wide branding updated." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleSaveColor = async () => {
    setSavingColor(true);
    try {
      await supabase
        .from("platform_settings")
        .upsert(
          {
            setting_key: "primary_color",
            setting_value: primaryColor,
            setting_type: "string",
            description: "Primary brand color (hex)",
          },
          { onConflict: "setting_key" }
        );
      // Apply immediately
      document.documentElement.style.setProperty("--primary", hexToHsl(primaryColor));
      document.documentElement.style.setProperty("--ring", hexToHsl(primaryColor));
      toast({ title: "Color saved", description: "Primary brand color updated site-wide." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save color";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSavingColor(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB for better processing)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewLogo(e.target?.result as string);
      setShowCropper(false);
      toast({ title: "Cropped", description: "Logo cropped successfully" });
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleRemoveBackground = async () => {
    if (!previewLogo) return;

    setRemovingBg(true);
    try {
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageBase64: previewLogo },
      });

      if (error) throw error;

      if (data.processedImage) {
        setPreviewLogo(data.processedImage);
        toast({ title: "Background Removed", description: "Logo background has been removed" });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove background";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
    setRemovingBg(false);
  };

  const handleUploadLogo = async () => {
    if (!previewLogo) return;

    setUploading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(previewLogo);
      const blob = await response.blob();
      
      // Upload to covers bucket (public)
      const fileName = `site-logo-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, blob, { upsert: true, contentType: "image/png" });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      // Save to platform settings
      await supabase
        .from("platform_settings")
        .upsert({
          setting_key: "site_logo",
          setting_value: publicUrl,
          setting_type: "string",
          description: "Site logo URL"
        }, { onConflict: "setting_key" });

      setLogoUrl(publicUrl);
      setPreviewLogo(null);
      
      toast({ 
        title: "Logo uploaded successfully", 
        description: "The site logo has been updated. Refresh the page to see changes."
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }

    setUploading(false);
  };

  const cancelPreview = () => {
    setPreviewLogo(null);
    setShowCropper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Full Site Branding</h2>
          <p className="text-muted-foreground">Logo, colors, identity, hero copy and contact details — all in one place.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Logo Upload & Edit */}
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full grid grid-cols-3">
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                <Upload className="w-4 h-4 mr-1.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="crop" disabled={!previewLogo} className="text-xs sm:text-sm">
                <Crop className="w-4 h-4 mr-1.5" />
                Crop
              </TabsTrigger>
              <TabsTrigger value="export" disabled={!previewLogo && !logoUrl} className="text-xs sm:text-sm">
                <FileImage className="w-4 h-4 mr-1.5" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Current Logo Preview */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                    <img 
                      src={previewLogo || logoUrl} 
                      alt="Site Logo" 
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  </div>
                  {previewLogo && (
                    <Badge className="absolute -top-2 -right-2 bg-amber-500">
                      Preview
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Current Logo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This logo appears in the navbar, favicon, and app icons
                  </p>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="space-y-3">
                <Label>Upload New Logo</Label>
                <div className="flex gap-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square PNG or SVG, at least 512x512px. Max 5MB.
                </p>
              </div>

              {/* Preview Actions */}
              {previewLogo && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("crop")}
                      className="w-full"
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      Crop Logo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRemoveBackground}
                      disabled={removingBg}
                      className="w-full"
                    >
                      {removingBg ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Remove BG
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleUploadLogo} disabled={uploading} className="flex-1">
                      {uploading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Save Logo
                    </Button>
                    <Button variant="outline" onClick={cancelPreview}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crop">
              {previewLogo && (
                <LogoCropper 
                  imageUrl={previewLogo} 
                  onCropComplete={handleCropComplete}
                  onCancel={() => setActiveTab("upload")}
                />
              )}
            </TabsContent>

            <TabsContent value="export">
              <LogoFormatConverter imageUrl={previewLogo || logoUrl} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Locations */}
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Logo Locations</h3>
          </div>

          <div className="space-y-4">
            {[
              { location: "Navbar", description: "Header logo across all pages" },
              { location: "Dashboard Sidebar", description: "User and admin dashboard navigation" },
              { location: "Favicon", description: "Browser tab icon (32x32, 64x64)" },
              { location: "App Icon", description: "PWA install icon (192x192, 512x512)" },
              { location: "Open Graph", description: "Social media link previews (1200x630)" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <img 
                    src={previewLogo || logoUrl} 
                    alt="" 
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.location}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Tip:</strong> Use the Export tab to download your logo in all required formats for favicons, PWA icons, and social sharing.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Color */}
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Brand Colors</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Primary drives buttons, links and the active nav state. Accent is used for highlights and gradient washes.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Primary</Label>
            <div className="flex gap-3 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-11 rounded-md border border-border bg-background cursor-pointer p-1"
            />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#ff6b35"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-16 h-11 rounded-md border border-border bg-background cursor-pointer p-1"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#e84393"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveColor} disabled={savingColor} className="h-11">
            {savingColor ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Save Primary Color
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Preview:</span>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: primaryColor }} />
            <div className="w-10 h-10 rounded-md border border-border" style={{ backgroundColor: accentColor }} />
            <Button style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, color: "#fff" }}>
              Sample Button
            </Button>
          </div>
        </div>
      </div>

      {/* Site Identity */}
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Site Identity</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Name, tagline, hero copy and contact details shown across the site.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={identity.site_name}
              onChange={(e) => setIdentity((p) => ({ ...p, site_name: e.target.value }))}
              placeholder="WE Global"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />Hero Badge</Label>
            <Input
              value={identity.hero_badge}
              onChange={(e) => setIdentity((p) => ({ ...p, hero_badge: e.target.value }))}
              placeholder="Live from Nairobi"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Studio Tagline</Label>
            <Input
              value={identity.studio_description}
              onChange={(e) => setIdentity((p) => ({ ...p, studio_description: e.target.value }))}
              placeholder="Professional music production studio"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Hero Headline</Label>
            <Input
              value={identity.hero_title}
              onChange={(e) => setIdentity((p) => ({ ...p, hero_title: e.target.value }))}
              placeholder="Global Sound. One Studio."
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Hero Subtitle</Label>
            <Textarea
              value={identity.hero_subtitle}
              onChange={(e) => setIdentity((p) => ({ ...p, hero_subtitle: e.target.value }))}
              rows={3}
              placeholder="A borderless ecosystem connecting artists, producers, labels, and brands…"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />Contact Email</Label>
            <Input
              type="email"
              value={identity.contact_email}
              onChange={(e) => setIdentity((p) => ({ ...p, contact_email: e.target.value }))}
              placeholder="hello@weglobal.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />Contact Phone</Label>
            <Input
              value={identity.contact_phone}
              onChange={(e) => setIdentity((p) => ({ ...p, contact_phone: e.target.value }))}
              placeholder="+254 700 000 000"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveIdentity} disabled={savingIdentity} className="h-11">
            {savingIdentity ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save Identity
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
