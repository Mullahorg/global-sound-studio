import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface Payout {
  id: string;
  producer_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number: string | null;
  mpesa_receipt_number: string | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  producer?: {
    full_name: string | null;
    email: string | null;
  };
}

export const PayoutsPanel = () => {
  const { formatPrice } = useCurrency();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [mpesaReceipt, setMpesaReceipt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    const { data } = await supabase
      .from("payouts")
      .select("*")
      .order("requested_at", { ascending: false });

    if (data) {
      // Fetch producer profiles separately
      const payoutsWithProducers = await Promise.all(
        data.map(async (payout) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", payout.producer_id)
            .maybeSingle();
          return { ...payout, producer: profile };
        })
      );
      setPayouts(payoutsWithProducers as Payout[]);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (status: "processing" | "completed" | "failed") => {
    if (!selectedPayout) return;
    setIsProcessing(true);

    const updateData: Record<string, unknown> = {
      status,
      admin_notes: adminNotes || null,
      processed_at: status === "completed" || status === "failed" ? new Date().toISOString() : null,
    };

    if (status === "completed" && mpesaReceipt) {
      updateData.mpesa_receipt_number = mpesaReceipt;
    }

    const { error } = await supabase
      .from("payouts")
      .update(updateData)
      .eq("id", selectedPayout.id);

    if (error) {
      toast.error("Failed to update payout status");
    } else {
      toast.success(`Payout marked as ${status}`);
      setSelectedPayout(null);
      setAdminNotes("");
      setMpesaReceipt("");
      fetchPayouts();
    }
    setIsProcessing(false);
  };

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.producer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.producer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.phone_number?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: payouts.filter((p) => p.status === "pending").length,
    processing: payouts.filter((p) => p.status === "processing").length,
    completed: payouts.filter((p) => p.status === "completed").length,
    totalPending: payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((acc, p) => acc + Number(p.amount), 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-500">
            <Clock className="w-3 h-3 mr-1" /> Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.processing}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalPending)}</p>
              <p className="text-sm text-muted-foreground">Total Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payouts List */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Producer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Requested</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{payout.producer?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{payout.producer?.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{formatPrice(payout.amount)}</td>
                  <td className="p-4 text-muted-foreground">{payout.phone_number || "-"}</td>
                  <td className="p-4">{getStatusBadge(payout.status)}</td>
                  <td className="p-4 text-muted-foreground">
                    {format(new Date(payout.requested_at), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setAdminNotes(payout.admin_notes || "");
                        setMpesaReceipt(payout.mpesa_receipt_number || "");
                      }}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayouts.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No payout requests found</p>
          </div>
        )}
      </div>

      {/* Manage Payout Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Payout Request</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Producer</span>
                  <span className="font-medium">{selectedPayout.producer?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary">{formatPrice(selectedPayout.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{selectedPayout.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedPayout.status)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">M-Pesa Receipt Number</label>
                <Input
                  placeholder="Enter receipt number"
                  value={mpesaReceipt}
                  onChange={(e) => setMpesaReceipt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this payout..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedPayout.status === "pending" && (
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleUpdateStatus("processing")}
                    disabled={isProcessing}
                  >
                    Mark Processing
                  </Button>
                )}
                {(selectedPayout.status === "pending" || selectedPayout.status === "processing") && (
                  <>
                    <Button
                      className="flex-1"
                      variant="hero"
                      onClick={() => handleUpdateStatus("completed")}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus("failed")}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
