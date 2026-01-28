import { useState, useEffect } from "react";
import { Gift, Users, Check, X, Loader2, Search, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  qualification_type: string;
  reward_amount: number;
  created_at: string;
  referrer_email?: string;
  referred_email?: string;
}

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  is_active: boolean;
  created_at: string;
  user_email?: string;
}

export const ReferralsPanel = () => {
  const { formatPrice } = useCurrency();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch referral codes
      const { data: codesData } = await supabase
        .from("referral_codes")
        .select("*")
        .order("uses_count", { ascending: false });

      if (referralsData) {
        // Fetch user emails for referrals
        const userIds = [
          ...new Set([
            ...referralsData.map((r) => r.referrer_id),
            ...referralsData.map((r) => r.referred_id),
          ]),
        ];

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

        setReferrals(
          referralsData.map((r) => ({
            ...r,
            referrer_email: emailMap.get(r.referrer_id) || "Unknown",
            referred_email: emailMap.get(r.referred_id) || "Unknown",
          }))
        );
      }

      if (codesData) {
        const userIds = [...new Set(codesData.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

        setCodes(
          codesData.map((c) => ({
            ...c,
            user_email: emailMap.get(c.user_id) || "Unknown",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("referrals")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Referral marked as ${status}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update referral");
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        r.referrer_email?.toLowerCase().includes(searchLower) ||
        r.referred_email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === "pending").length,
    qualified: referrals.filter((r) => r.status === "qualified").length,
    rewarded: referrals.filter((r) => r.status === "rewarded").length,
    totalRewards: referrals
      .filter((r) => r.status === "rewarded")
      .reduce((sum, r) => sum + Number(r.reward_amount), 0),
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
          { label: "Total Referrals", value: stats.total, icon: Users, color: "text-blue-500" },
          { label: "Pending", value: stats.pending, icon: Gift, color: "text-amber-500" },
          { label: "Qualified", value: stats.qualified, icon: Check, color: "text-green-500" },
          { label: "Rewarded", value: stats.rewarded, icon: DollarSign, color: "text-primary" },
          {
            label: "Total Paid",
            value: formatPrice(stats.totalRewards),
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

      {/* Top Referral Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Referral Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {codes.slice(0, 5).map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <Badge variant="outline" className="font-mono">
                    {code.code}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{code.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{code.uses_count} uses</p>
                  <Badge variant={code.is_active ? "default" : "secondary"}>
                    {code.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Referrals</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="rewarded">Rewarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referred</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.referrer_email}
                    </TableCell>
                    <TableCell>{referral.referred_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{referral.qualification_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          referral.status === "rewarded"
                            ? "default"
                            : referral.status === "qualified"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.reward_amount > 0 && formatPrice(referral.reward_amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {referral.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateReferralStatus(referral.id, "qualified")}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {referral.status === "qualified" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateReferralStatus(referral.id, "rewarded")}
                          >
                            <DollarSign className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReferrals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No referrals found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
