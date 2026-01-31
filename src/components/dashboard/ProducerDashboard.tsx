import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Music,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Play,
  Plus,
  Eye,
  Download,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { BeatUploadDialog } from "@/components/beats/BeatUploadDialog";
import { ProducerPayouts } from "@/components/dashboard/ProducerPayouts";

interface ProducerDashboardProps {
  userId: string;
  profile: { full_name: string | null } | null;
}

interface Beat {
  id: string;
  title: string;
  cover_url: string | null;
  play_count: number | null;
  price_basic: number;
  created_at: string;
}

interface Sale {
  id: string;
  purchased_at: string;
  price_paid: number;
  license_type: string;
  buyer: {
    full_name: string | null;
    email: string | null;
  } | null;
  beat: {
    title: string;
  } | null;
}

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  start_time: string;
  status: string;
  total_price: number | null;
}

export const ProducerDashboard = ({ userId, profile }: ProducerDashboardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [beatsRes, salesRes, bookingsRes] = await Promise.all([
        supabase
          .from("beats")
          .select("id, title, cover_url, play_count, price_basic, created_at")
          .eq("producer_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("beat_purchases")
          .select(`
            id,
            purchased_at,
            price_paid,
            license_type,
            beat:beats!inner(title, producer_id)
          `)
          .eq("beat.producer_id", userId)
          .order("purchased_at", { ascending: false })
          .limit(10),
        supabase
          .from("bookings")
          .select(`
            id,
            session_type,
            session_date,
            start_time,
            status,
            total_price
          `)
          .eq("producer_id", userId)
          .order("session_date", { ascending: true })
          .limit(5),
      ]);

      if (beatsRes.data) setBeats(beatsRes.data);
      if (salesRes.data) setSales(salesRes.data as unknown as Sale[]);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const totalEarnings = sales.reduce((sum, s) => sum + Number(s.price_paid), 0);
  const totalPlays = beats.reduce((sum, b) => sum + (b.play_count || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "confirmed": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-primary/10 text-primary";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Wallet className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: "Total Earnings", value: formatPrice(totalEarnings), icon: DollarSign, color: "primary" },
              { label: "Total Sales", value: sales.length, icon: TrendingUp, color: "accent" },
              { label: "Total Plays", value: totalPlays.toLocaleString(), icon: Play, color: "primary" },
              { label: "Active Beats", value: beats.length, icon: Music, color: "accent" },
            ].map((stat, i) => (
              <div key={i} className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color === "primary" ? "text-primary" : "text-accent"}`} />
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" onClick={() => setShowUploadDialog(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Beat
            </Button>
            <Button variant="outline" onClick={() => navigate("/beats")} className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              View Marketplace
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* My Beats */}
        <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold">My Beats</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowUploadDialog(true)} className="text-xs sm:text-sm">
              Add New
            </Button>
          </div>

          {beats.length > 0 ? (
            <div className="space-y-4">
              {beats.map((beat) => (
                <div
                  key={beat.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <img
                    src={beat.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop"}
                    alt={beat.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{beat.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {(beat.play_count || 0).toLocaleString()} plays
                      </span>
                      <span>{formatPrice(Number(beat.price_basic))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No beats uploaded yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowUploadDialog(true)}>
                Upload Your First Beat
              </Button>
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <h2 className="font-display text-xl font-semibold mb-6">Recent Sales</h2>

          {sales.length > 0 ? (
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sale.beat?.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {sale.license_type} License
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">
                      +{formatPrice(Number(sale.price_paid))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(sale.purchased_at), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No sales yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload beats to start selling!</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <h2 className="font-display text-xl font-semibold mb-6">Booked Sessions</h2>

        {bookings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  {booking.total_price && (
                    <span className="font-semibold text-primary">
                      {formatPrice(Number(booking.total_price))}
                    </span>
                  )}
                </div>
                <p className="font-medium capitalize">
                  {booking.session_type.replace("_", " ")} Session
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(booking.session_date), "MMM d, yyyy")} at {booking.start_time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No booked sessions</p>
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="payouts">
          <ProducerPayouts userId={userId} />
        </TabsContent>
      </Tabs>

      <BeatUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onSuccess={() => {
          // Refetch beats
          supabase
            .from("beats")
            .select("id, title, cover_url, play_count, price_basic, created_at")
            .eq("producer_id", userId)
            .order("created_at", { ascending: false })
            .limit(5)
            .then(({ data }) => {
              if (data) setBeats(data);
            });
        }}
      />
    </motion.div>
  );
};
