import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Music, 
  Calendar, 
  Users,
  CreditCard,
  Activity,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  bookings?: number;
  beats?: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export const AnalyticsPanel = () => {
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [bookingsByType, setBookingsByType] = useState<ChartData[]>([]);
  const [beatsByGenre, setBeatsByGenre] = useState<ChartData[]>([]);
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    revenueChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    totalBeats: 0,
    beatsChange: 0,
    totalUsers: 0,
    usersChange: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const days = parseInt(timeRange);
    const startDate = subDays(new Date(), days);
    const previousStart = subDays(startDate, days);

    try {
      // Fetch payments
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .eq("status", "completed");

      const { data: previousPayments } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", startDate.toISOString())
        .eq("status", "completed");

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", startDate.toISOString());

      const { data: previousBookings } = await supabase
        .from("bookings")
        .select("id")
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", startDate.toISOString());

      // Fetch beats
      const { data: beats } = await supabase
        .from("beats")
        .select("*")
        .gte("created_at", startDate.toISOString());

      const { data: previousBeats } = await supabase
        .from("beats")
        .select("id")
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", startDate.toISOString());

      // Fetch users
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .gte("created_at", startDate.toISOString());

      const { data: previousUsers } = await supabase
        .from("profiles")
        .select("id")
        .gte("created_at", previousStart.toISOString())
        .lt("created_at", startDate.toISOString());

      // Calculate stats
      const currentRevenue = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const prevRevenue = previousPayments?.reduce((acc, p) => acc + p.amount, 0) || 0;
      const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      const currentBookings = bookings?.length || 0;
      const prevBookingsCount = previousBookings?.length || 0;
      const bookingsChange = prevBookingsCount > 0 ? ((currentBookings - prevBookingsCount) / prevBookingsCount) * 100 : 0;

      const currentBeats = beats?.length || 0;
      const prevBeatsCount = previousBeats?.length || 0;
      const beatsChange = prevBeatsCount > 0 ? ((currentBeats - prevBeatsCount) / prevBeatsCount) * 100 : 0;

      const currentUsers = users?.length || 0;
      const prevUsersCount = previousUsers?.length || 0;
      const usersChange = prevUsersCount > 0 ? ((currentUsers - prevUsersCount) / prevUsersCount) * 100 : 0;

      setStats({
        totalRevenue: currentRevenue,
        revenueChange,
        totalBookings: currentBookings,
        bookingsChange,
        totalBeats: currentBeats,
        beatsChange,
        totalUsers: currentUsers,
        usersChange,
      });

      // Generate daily revenue data
      const dateInterval = eachDayOfInterval({ start: startDate, end: new Date() });
      const dailyRevenue = dateInterval.map((date) => {
        const dayPayments = payments?.filter((p) => 
          isSameDay(new Date(p.created_at), date)
        ) || [];
        const dayBookings = bookings?.filter((b) => 
          isSameDay(new Date(b.created_at), date)
        ) || [];
        
        return {
          name: format(date, "MMM d"),
          value: dayPayments.reduce((acc, p) => acc + p.amount, 0),
          revenue: dayPayments.reduce((acc, p) => acc + p.amount, 0),
          bookings: dayBookings.length,
        };
      });
      setRevenueData(dailyRevenue);

      // Bookings by session type
      const typeCount: Record<string, number> = {};
      bookings?.forEach((b) => {
        const type = b.session_type.replace("_", " ");
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      setBookingsByType(
        Object.entries(typeCount).map(([name, value]) => ({ name, value }))
      );

      // Beats by genre
      const { data: allBeats } = await supabase.from("beats").select("genre");
      const genreCount: Record<string, number> = {};
      allBeats?.forEach((b) => {
        const genre = b.genre.replace("_", " ");
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
      setBeatsByGenre(
        Object.entries(genreCount).map(([name, value]) => ({ name, value }))
      );

      // User growth
      const userGrowthData = dateInterval.map((date) => {
        const dayUsers = users?.filter((u) => 
          isSameDay(new Date(u.created_at), date)
        ) || [];
        return {
          name: format(date, "MMM d"),
          value: dayUsers.length,
        };
      });
      setUserGrowth(userGrowthData);

    } catch (error) {
      console.error("Analytics error:", error);
    }

    setLoading(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon,
    prefix = ""
  }: { 
    title: string; 
    value: number; 
    change: number;
    icon: any;
    prefix?: string;
  }) => (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? "text-green-500" : "text-destructive"}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-display font-bold">
            {prefix}{value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          prefix="KES "
        />
        <StatCard
          title="Bookings"
          value={stats.totalBookings}
          change={stats.bookingsChange}
          icon={Calendar}
        />
        <StatCard
          title="Beats Added"
          value={stats.totalBeats}
          change={stats.beatsChange}
          icon={Music}
        />
        <StatCard
          title="New Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Daily revenue from M-Pesa payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Booking Trends */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Booking Trends
            </CardTitle>
            <CardDescription>Daily session bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings by Type */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Bookings by Session Type
            </CardTitle>
            <CardDescription>Distribution of session types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {bookingsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {bookingsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No booking data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Beats by Genre */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Beats by Genre
            </CardTitle>
            <CardDescription>Genre distribution in library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {beatsByGenre.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={beatsByGenre} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12 }} 
                      width={80}
                      className="capitalize"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No beat data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};