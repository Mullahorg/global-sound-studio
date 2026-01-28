import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Settings,
  Users,
  Check,
  Clock,
  Percent,
  Phone,
  Wallet,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";

interface ProducerSettings {
  id: string;
  is_franchise_active: boolean;
  commission_rate: number;
  minimum_payout: number;
  payout_method: string;
  mpesa_number: string | null;
  hourly_rate: number;
  booking_enabled: boolean;
  available_days: string[];
  available_hours: { start: string; end: string };
  bio_short: string | null;
  specializations: string[] | null;
}

interface BookingEarning {
  id: string;
  booking_id: string;
  gross_amount: number;
  platform_fee: number;
  commission_rate: number;
  net_amount: number;
  status: string;
  created_at: string;
}

const defaultSettings: Omit<ProducerSettings, "id"> = {
  is_franchise_active: false,
  commission_rate: 70,
  minimum_payout: 1000,
  payout_method: "mpesa",
  mpesa_number: null,
  hourly_rate: 2000,
  booking_enabled: true,
  available_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  available_hours: { start: "09:00", end: "18:00" },
  bio_short: null,
  specializations: null,
};

const days = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export const ProducerFranchise = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [settings, setSettings] = useState<ProducerSettings | null>(null);
  const [earnings, setEarnings] = useState<BookingEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [formData, setFormData] = useState(defaultSettings);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch producer settings
      const { data: settingsData } = await supabase
        .from("producer_settings")
        .select("*")
        .eq("producer_id", user.id)
        .maybeSingle();

      if (settingsData) {
        const mappedSettings: ProducerSettings = {
          ...settingsData,
          available_days: Array.isArray(settingsData.available_days) 
            ? settingsData.available_days as string[]
            : defaultSettings.available_days,
          available_hours: typeof settingsData.available_hours === "object" && settingsData.available_hours
            ? settingsData.available_hours as { start: string; end: string }
            : defaultSettings.available_hours,
          specializations: Array.isArray(settingsData.specializations)
            ? settingsData.specializations
            : null,
        };
        setSettings(mappedSettings);
        setFormData({
          is_franchise_active: mappedSettings.is_franchise_active,
          commission_rate: Number(mappedSettings.commission_rate),
          minimum_payout: Number(mappedSettings.minimum_payout),
          payout_method: mappedSettings.payout_method,
          mpesa_number: mappedSettings.mpesa_number,
          hourly_rate: Number(mappedSettings.hourly_rate),
          booking_enabled: mappedSettings.booking_enabled,
          available_days: mappedSettings.available_days,
          available_hours: mappedSettings.available_hours,
          bio_short: mappedSettings.bio_short,
          specializations: mappedSettings.specializations,
        });
      }

      // Fetch booking earnings
      const { data: earningsData } = await supabase
        .from("booking_earnings")
        .select("*")
        .eq("producer_id", user.id)
        .order("created_at", { ascending: false });

      if (earningsData) {
        setEarnings(earningsData);
      }
    } catch (error) {
      console.error("Error fetching producer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const payload = {
        producer_id: user.id,
        ...formData,
      };

      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from("producer_settings")
          .update(payload)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("producer_settings")
          .insert(payload);

        if (error) throw error;
      }

      toast.success("Settings saved successfully!");
      setShowSettings(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  // Calculate stats
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.net_amount), 0);
  const pendingEarnings = earnings
    .filter((e) => e.status === "pending" || e.status === "confirmed")
    .reduce((sum, e) => sum + Number(e.net_amount), 0);
  const paidEarnings = earnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + Number(e.net_amount), 0);
  const platformCommission = 100 - (formData.commission_rate || 70);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Producer Franchise
          </h2>
          <p className="text-muted-foreground">
            Earn from client bookings through the WE Global platform
          </p>
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Franchise Settings
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Franchise Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <Label className="font-semibold">Activate Franchise</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to receive bookings from the platform
                  </p>
                </div>
                <Switch
                  checked={formData.is_franchise_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_franchise_active: checked }))
                  }
                />
              </div>

              {/* Commission Display */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Your Commission Rate
                  </span>
                  <Badge className="text-lg font-bold">
                    {formData.commission_rate}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  You keep {formData.commission_rate}% of each booking. Platform fee:{" "}
                  {platformCommission}%
                </p>
                <Progress value={formData.commission_rate} className="h-2 mt-2" />
              </div>

              {/* Hourly Rate */}
              <div>
                <Label>Your Hourly Rate (KES)</Label>
                <Input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hourly_rate: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {/* Payout Method */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Payout Method</Label>
                  <Select
                    value={formData.payout_method}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, payout_method: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>M-Pesa Number</Label>
                  <Input
                    value={formData.mpesa_number || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mpesa_number: e.target.value }))
                    }
                    placeholder="254712345678"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Minimum Payout */}
              <div>
                <Label>Minimum Payout Amount (KES)</Label>
                <Input
                  type="number"
                  value={formData.minimum_payout}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minimum_payout: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              {/* Available Days */}
              <div>
                <Label className="mb-2 block">Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={
                        formData.available_days.includes(day.value)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Available Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.available_hours.start}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        available_hours: { ...prev.available_hours, start: e.target.value },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.available_hours.end}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        available_hours: { ...prev.available_hours, end: e.target.value },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label>Short Bio</Label>
                <Textarea
                  value={formData.bio_short || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio_short: e.target.value }))
                  }
                  placeholder="Tell clients about your expertise..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Banner */}
      {!settings?.is_franchise_active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                Franchise Not Active
              </p>
              <p className="text-sm text-muted-foreground">
                Activate your franchise to start receiving bookings and earning commissions
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            Activate Now
          </Button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earnings",
            value: formatPrice(totalEarnings),
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: "Pending Payout",
            value: formatPrice(pendingEarnings),
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Paid Out",
            value: formatPrice(paidEarnings),
            icon: Wallet,
            color: "text-blue-500",
          },
          {
            label: "Total Bookings",
            value: earnings.length.toString(),
            icon: Calendar,
            color: "text-primary",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display font-bold text-2xl">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            How Earnings Work
          </CardTitle>
          <CardDescription>
            Transparent commission structure for every booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Example: 2-Hour Recording Session</span>
                <span className="font-bold">KES {(formData.hourly_rate * 2).toLocaleString()}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Amount</span>
                  <span>KES {(formData.hourly_rate * 2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Platform Fee ({platformCommission}%)</span>
                  <span>
                    -KES {((formData.hourly_rate * 2 * platformCommission) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-bold text-green-500">
                  <span>Your Earnings ({formData.commission_rate}%)</span>
                  <span>
                    KES{" "}
                    {((formData.hourly_rate * 2 * formData.commission_rate) / 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Payouts are processed every week for balances above KES{" "}
              {formData.minimum_payout.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No earnings yet</h3>
              <p className="text-muted-foreground text-sm">
                Once clients book sessions with you, earnings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.slice(0, 10).map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">Booking Session</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500">
                      +{formatPrice(earning.net_amount)}
                    </p>
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
