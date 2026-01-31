import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Music,
  Calendar,
  FolderKanban,
  CreditCard,
  TrendingUp,
  Clock,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";

interface ArtistDashboardProps {
  userId: string;
  profile: { full_name: string | null } | null;
}

interface Purchase {
  id: string;
  purchased_at: string;
  price_paid: number;
  license_type: string;
  beat: {
    title: string;
    audio_url: string;
    cover_url: string | null;
  };
}

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  start_time: string;
  status: string;
  total_price: number | null;
}

interface Payment {
  id: string;
  amount: number;
  status: string | null;
  payment_type: string;
  created_at: string | null;
}

export const ArtistDashboard = ({ userId, profile }: ArtistDashboardProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [purchasesRes, bookingsRes, paymentsRes] = await Promise.all([
        supabase
          .from("beat_purchases")
          .select(`
            id,
            purchased_at,
            price_paid,
            license_type,
            beat:beats(title, audio_url, cover_url)
          `)
          .eq("buyer_id", userId)
          .order("purchased_at", { ascending: false })
          .limit(5),
        supabase
          .from("bookings")
          .select("*")
          .eq("client_id", userId)
          .order("session_date", { ascending: true })
          .limit(5),
        supabase
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (purchasesRes.data) setPurchases(purchasesRes.data as unknown as Purchase[]);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const totalSpent = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500";
      case "confirmed": return "bg-green-500/10 text-green-500";
      case "completed": return "bg-primary/10 text-primary";
      case "cancelled": case "failed": return "bg-destructive/10 text-destructive";
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
      className="space-y-6 sm:space-y-8"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: "Beats Purchased", value: purchases.length, icon: Music, color: "primary" },
          { label: "Upcoming Sessions", value: bookings.filter(b => b.status !== "completed" && b.status !== "cancelled").length, icon: Calendar, color: "accent" },
          { label: "Total Spent", value: formatPrice(totalSpent), icon: CreditCard, color: "primary" },
          { label: "Total Bookings", value: bookings.length, icon: Clock, color: "accent" },
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

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Purchased Beats */}
        <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-lg sm:text-xl font-semibold">My Beats</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/beats")} className="text-xs sm:text-sm">
              Browse More
            </Button>
          </div>

          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <img
                    src={purchase.beat?.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop"}
                    alt={purchase.beat?.title}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{purchase.beat?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {purchase.license_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(purchase.purchased_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No beats purchased yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/beats")}>
                Browse Beats
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Upcoming Sessions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/booking")}>
              Book New
            </Button>
          </div>

          {bookings.filter(b => b.status !== "completed" && b.status !== "cancelled").length > 0 ? (
            <div className="space-y-4">
              {bookings
                .filter(b => b.status !== "completed" && b.status !== "cancelled")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">
                        {booking.session_type.replace("_", " ")} Session
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.session_date), "MMM d, yyyy")} at {booking.start_time}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming sessions</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate("/booking")}>
                Book a Session
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <h2 className="font-display text-xl font-semibold mb-6">Payment History</h2>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-border/50">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-4 text-sm">
                      {payment.created_at ? format(new Date(payment.created_at), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="py-4 text-sm capitalize">
                      {payment.payment_type.replace("_", " ")}
                    </td>
                    <td className="py-4 text-sm font-medium">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(payment.status || "pending")}>
                        {payment.status || "pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No payment history</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
