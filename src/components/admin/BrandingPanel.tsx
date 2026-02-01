import { useState, useRef } from "react";
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
  FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogoCropper } from "./LogoCropper";
import { LogoFormatConverter } from "./LogoFormatConverter";

export const BrandingPanel = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <h2 className="font-display text-2xl font-semibold">Branding</h2>
          <p className="text-muted-foreground">Manage site logo with cropping, background removal & format export</p>
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
    </motion.div>
  );
};
