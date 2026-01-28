import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  Search,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface ProducerWithSettings {
  id: string;
  producer_id: string;
  is_franchise_active: boolean;
  commission_rate: number;
  hourly_rate: number;
  booking_enabled: boolean;
  verified_at: string | null;
  created_at: string;
  producer_email?: string;
  producer_name?: string;
  total_earnings?: number;
  total_bookings?: number;
}

interface BookingEarning {
  id: string;
  producer_id: string;
  gross_amount: number;
  net_amount: number;
  status: string;
  created_at: string;
}

export const FranchisePanel = () => {
  const { formatPrice } = useCurrency();
  const [producers, setProducers] = useState<ProducerWithSettings[]>([]);
  const [earnings, setEarnings] = useState<BookingEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch producer settings
      const { data: settingsData } = await supabase
        .from("producer_settings")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch booking earnings
      const { data: earningsData } = await supabase
        .from("booking_earnings")
        .select("*")
        .order("created_at", { ascending: false });

      if (settingsData) {
        const producerIds = settingsData.map((s) => s.producer_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", producerIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.id, { email: p.email, name: p.full_name }]) || []
        );

        // Calculate earnings per producer
        const earningsMap = new Map<string, { total: number; count: number }>();
        earningsData?.forEach((e) => {
          const current = earningsMap.get(e.producer_id) || { total: 0, count: 0 };
          earningsMap.set(e.producer_id, {
            total: current.total + Number(e.net_amount),
            count: current.count + 1,
          });
        });

        setProducers(
          settingsData.map((s) => ({
            ...s,
            producer_email: profileMap.get(s.producer_id)?.email || "Unknown",
            producer_name: profileMap.get(s.producer_id)?.name || "Unknown",
            total_earnings: earningsMap.get(s.producer_id)?.total || 0,
            total_bookings: earningsMap.get(s.producer_id)?.count || 0,
          }))
        );
      }

      if (earningsData) {
        setEarnings(earningsData);
      }
    } catch (error) {
      console.error("Error fetching franchise data:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyProducer = async (id: string) => {
    try {
      const { error } = await supabase
        .from("producer_settings")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast.success("Producer verified!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify producer");
    }
  };

  const toggleFranchise = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("producer_settings")
        .update({ is_franchise_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Franchise ${!currentStatus ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update franchise status");
    }
  };

  const filteredProducers = producers.filter((p) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        p.producer_email?.toLowerCase().includes(searchLower) ||
        p.producer_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    totalProducers: producers.length,
    activeProducers: producers.filter((p) => p.is_franchise_active).length,
    verifiedProducers: producers.filter((p) => p.verified_at).length,
    totalPlatformEarnings: earnings.reduce(
      (sum, e) => sum + (Number(e.gross_amount) - Number(e.net_amount)),
      0
    ),
    totalProducerPayouts: earnings.reduce((sum, e) => sum + Number(e.net_amount), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total Producers",
            value: stats.totalProducers,
            icon: Users,
            color: "text-blue-500",
          },
          {
            label: "Active Franchise",
            value: stats.activeProducers,
            icon: Building2,
            color: "text-green-500",
          },
          {
            label: "Verified",
            value: stats.verifiedProducers,
            icon: Check,
            color: "text-primary",
          },
          {
            label: "Platform Revenue",
            value: formatPrice(stats.totalPlatformEarnings),
            icon: TrendingUp,
            color: "text-amber-500",
          },
          {
            label: "Producer Payouts",
            value: formatPrice(stats.totalProducerPayouts),
            icon: DollarSign,
            color: "text-green-500",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Producers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Franchise Producers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search producers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducers.map((producer) => (
                  <TableRow key={producer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{producer.producer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {producer.producer_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={producer.is_franchise_active ? "default" : "secondary"}
                        >
                          {producer.is_franchise_active ? "Active" : "Inactive"}
                        </Badge>
                        {producer.verified_at && (
                          <Badge variant="outline" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{producer.commission_rate}%</span>
                    </TableCell>
                    <TableCell>{formatPrice(producer.hourly_rate)}/hr</TableCell>
                    <TableCell className="font-medium text-green-500">
                      {formatPrice(producer.total_earnings || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {producer.total_bookings || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!producer.verified_at && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => verifyProducer(producer.id)}
                            title="Verify Producer"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleFranchise(producer.id, producer.is_franchise_active)
                          }
                          title={producer.is_franchise_active ? "Deactivate" : "Activate"}
                        >
                          {producer.is_franchise_active ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No franchise producers found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No booking earnings recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {earnings.slice(0, 10).map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Gross</p>
                      <p className="font-medium">{formatPrice(earning.gross_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Producer</p>
                      <p className="font-medium text-green-500">
                        {formatPrice(earning.net_amount)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        earning.status === "paid"
                          ? "default"
                          : earning.status === "confirmed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
