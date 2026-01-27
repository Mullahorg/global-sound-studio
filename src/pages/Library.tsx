import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Filter, Clock, Calendar, Users, Award, Music2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  client?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  producer?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CompletedWork {
  id: string;
  title: string;
  artist: string;
  genre: string;
  year: number;
  coverUrl: string;
  playUrl?: string;
  credits: string;
  streamCount?: string;
  awards?: string[];
}

// Sample completed works data
const sampleWorks: CompletedWork[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna Wave",
    genre: "Afrobeats",
    year: 2024,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    credits: "Production, Mixing, Mastering",
    streamCount: "2.5M+",
    awards: ["Best Afrobeats Production 2024"],
  },
  {
    id: "2",
    title: "City Lights",
    artist: "Marcus Flow",
    genre: "Hip-Hop",
    year: 2024,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    credits: "Production, Mixing",
    streamCount: "1.8M+",
  },
  {
    id: "3",
    title: "Heartbeat",
    artist: "Sarah Voice",
    genre: "R&B",
    year: 2023,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    credits: "Full Production",
    streamCount: "5.2M+",
    awards: ["Gold Certification"],
  },
  {
    id: "4",
    title: "Nairobi Nights",
    artist: "Afro Kings",
    genre: "Afrobeats",
    year: 2024,
    coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
    credits: "Production, Mixing, Mastering",
    streamCount: "3.1M+",
  },
  {
    id: "5",
    title: "Electric Soul",
    artist: "DJ Pulse",
    genre: "Electronic",
    year: 2023,
    coverUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
    credits: "Mastering",
    streamCount: "890K+",
  },
  {
    id: "6",
    title: "Safari Vibes",
    artist: "Kenya Collective",
    genre: "World",
    year: 2024,
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    credits: "Full Production",
    streamCount: "4.7M+",
    awards: ["African Music Award 2024"],
  },
];

const genres = ["All", "Afrobeats", "Hip-Hop", "R&B", "Electronic", "World"];

const Library = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          status,
          created_at
        `)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredWorks = selectedGenre === "All" 
    ? sampleWorks 
    : sampleWorks.filter(work => work.genre === selectedGenre);

  const stats = [
    { label: "Projects Completed", value: "500+", icon: Music2 },
    { label: "Artists Worked With", value: "200+", icon: Users },
    { label: "Years Experience", value: "10+", icon: Clock },
    { label: "Industry Awards", value: "25+", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Our Portfolio
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 mt-2">
              WE Global <span className="gradient-text">Library</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our collection of professionally produced tracks, albums, and projects
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-card border border-border/50 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-display font-bold text-3xl text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="works" className="mb-8">
            <TabsList className="bg-secondary mb-8">
              <TabsTrigger value="works">Released Works</TabsTrigger>
              <TabsTrigger value="projects">Studio Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="works">
              {/* Genre Filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>

              {/* Works Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorks.map((work) => (
                  <motion.div
                    key={work.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all"
                  >
                    {/* Cover */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={work.coverUrl}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                      {/* Play Button */}
                      <button
                        onClick={() => setPlayingId(playingId === work.id ? null : work.id)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                          {playingId === work.id ? (
                            <Pause className="w-6 h-6 text-primary-foreground" />
                          ) : (
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
                          )}
                        </div>
                      </button>

                      {/* Awards */}
                      {work.awards && work.awards.length > 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-accent text-accent-foreground">
                            <Award className="w-3 h-3 mr-1" />
                            Award Winner
                          </Badge>
                        </div>
                      )}

                      {/* Stream Count */}
                      {work.streamCount && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                            {work.streamCount} streams
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {work.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{work.artist}</p>
                        </div>
                        <Badge variant="outline">{work.year}</Badge>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <Badge className="bg-primary/10 text-primary border-0">
                          {work.genre}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{work.credits}</span>
                      </div>

                      {work.awards && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          {work.awards.map((award) => (
                            <div
                              key={award}
                              className="flex items-center gap-2 text-xs text-accent"
                            >
                              <Award className="w-3 h-3" />
                              {award}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 rounded-xl bg-card border border-border/50 flex items-center gap-6"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <Music2 className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-lg">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 capitalize">
                        {project.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No completed projects yet</h3>
                  <p className="text-muted-foreground">Check back soon for more!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Library;
