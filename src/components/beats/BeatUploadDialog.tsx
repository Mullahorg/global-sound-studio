import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Music, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BeatGenre = Database["public"]["Enums"]["beat_genre"];
type BeatMood = Database["public"]["Enums"]["beat_mood"];

const genres: { value: BeatGenre; label: string }[] = [
  { value: "hip_hop", label: "Hip-Hop" },
  { value: "rnb", label: "R&B" },
  { value: "trap", label: "Trap" },
  { value: "electronic", label: "Electronic" },
  { value: "afrobeats", label: "Afrobeats" },
  { value: "ambient", label: "Ambient" },
  { value: "pop", label: "Pop" },
];

const moods: { value: BeatMood; label: string }[] = [
  { value: "energetic", label: "Energetic" },
  { value: "chill", label: "Chill" },
  { value: "dark", label: "Dark" },
  { value: "uplifting", label: "Uplifting" },
  { value: "romantic", label: "Romantic" },
];

interface BeatUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BeatUploadDialog = ({ open, onOpenChange, onSuccess }: BeatUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "" as BeatGenre | "",
    mood: "" as BeatMood | "",
    bpm: 120,
    key: "",
    price_basic: 29.99,
    price_premium: 99.99,
    price_exclusive: 499.99,
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast.error("Please select an audio file");
        return;
      }
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }
    
    if (!formData.title || !formData.genre || !formData.mood) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload audio file
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;
      const { error: audioError } = await supabase.storage
        .from("audio")
        .upload(audioPath, audioFile);
      
      if (audioError) throw audioError;
      
      const { data: audioUrlData } = supabase.storage
        .from("audio")
        .getPublicUrl(audioPath);

      // Upload cover if provided
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${user.id}/${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile);
        
        if (coverError) throw coverError;
        
        const { data: coverUrlData } = supabase.storage
          .from("covers")
          .getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      // Insert beat record
      const { error: insertError } = await supabase.from("beats").insert({
        title: formData.title,
        description: formData.description,
        genre: formData.genre as BeatGenre,
        mood: formData.mood as BeatMood,
        bpm: formData.bpm,
        key: formData.key,
        audio_url: audioUrlData.publicUrl,
        cover_url: coverUrl,
        price_basic: formData.price_basic,
        price_premium: formData.price_premium,
        price_exclusive: formData.price_exclusive,
        producer_id: user.id,
      });

      if (insertError) throw insertError;

      toast.success("Beat uploaded successfully!");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        genre: "",
        mood: "",
        bpm: 120,
        key: "",
        price_basic: 29.99,
        price_premium: 99.99,
        price_exclusive: 499.99,
      });
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload beat");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary" />
            Upload New Beat
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* File Uploads */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Audio Upload */}
            <div 
              onClick={() => audioInputRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
              <Music className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              {audioFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-primary truncate max-w-[150px]">{audioFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium">Drop audio file here</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV up to 50MB</p>
                </>
              )}
            </div>

            {/* Cover Upload */}
            <div 
              onClick={() => coverInputRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverPreview ? (
                <div className="relative">
                  <img src={coverPreview} alt="Cover" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Image className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Cover artwork</p>
                  <p className="text-xs text-muted-foreground mt-1">Optional, recommended</p>
                </>
              )}
            </div>
          </div>

          {/* Beat Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Beat title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your beat..."
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Genre *</Label>
                <Select 
                  value={formData.genre} 
                  onValueChange={(value: BeatGenre) => setFormData(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood *</Label>
                <Select 
                  value={formData.mood} 
                  onValueChange={(value: BeatMood) => setFormData(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  min={60}
                  max={200}
                  value={formData.bpm}
                  onChange={(e) => setFormData(prev => ({ ...prev, bpm: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., Am, Gm, C"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Pricing (KES)</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_basic">Basic</Label>
                  <Input
                    id="price_basic"
                    type="number"
                    step="0.01"
                    value={formData.price_basic}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_basic: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price_premium">Premium</Label>
                  <Input
                    id="price_premium"
                    type="number"
                    step="0.01"
                    value={formData.price_premium}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_premium: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price_exclusive">Exclusive</Label>
                  <Input
                    id="price_exclusive"
                    type="number"
                    step="0.01"
                    value={formData.price_exclusive}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_exclusive: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Beat
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
