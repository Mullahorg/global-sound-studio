import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Image, 
  RefreshCw, 
  Save, 
  Eye,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const BrandingPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 2MB", variant: "destructive" });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewLogo(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !previewLogo) return;

    setUploading(true);

    try {
      // Upload to covers bucket (public)
      const fileName = `site-logo-${Date.now()}.${file.name.split(".").pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, { upsert: true });

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
        description: "The site logo has been updated. Refresh the page to see changes across the site."
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    setUploading(false);
  };

  const cancelPreview = () => {
    setPreviewLogo(null);
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
          <h2 className="font-display text-2xl font-semibold">Branding</h2>
          <p className="text-muted-foreground">Manage site logo and visual identity</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Site Logo</h3>
          </div>

          <div className="space-y-6">
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
                  This logo appears in the navbar, favicon, and app icon
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
                Recommended: Square PNG or SVG, at least 512x512px. Max 2MB.
              </p>
            </div>

            {/* Preview Actions */}
            {previewLogo && (
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
            )}
          </div>
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
              { location: "Favicon", description: "Browser tab icon" },
              { location: "App Icon", description: "PWA install icon on mobile devices" },
              { location: "Open Graph", description: "Social media link previews" },
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
              <strong>Note:</strong> After uploading a new logo, you may need to clear your browser cache or hard refresh (Ctrl+Shift+R) to see the changes immediately.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
