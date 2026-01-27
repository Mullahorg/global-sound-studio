import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Banknote, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  FileText,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ManualPayment {
  id: string;
  order_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  reference_code: string;
  proof_url: string | null;
  proof_file_name: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export const ManualPaymentsPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel("manual-payments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manual_payments" },
        () => fetchPayments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("manual_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedPayment || !user) return;
    
    setProcessing(true);
    
    const { error } = await supabase
      .from("manual_payments")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedPayment.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Payment ${status}`, description: `Manual payment has been ${status}` });
      
      // If approved, update the associated order
      if (status === "approved" && selectedPayment.order_id) {
        await supabase
          .from("orders")
          .update({ status: "completed" })
          .eq("id", selectedPayment.order_id);
      }
      
      fetchPayments();
      setSelectedPayment(null);
      setAdminNotes("");
    }
    
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    
    const icons: Record<string, React.ReactNode> = {
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={styles[status] || "bg-secondary"}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.reference_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;

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
          <h2 className="font-display text-2xl font-semibold">Manual Payment Review</h2>
          <p className="text-muted-foreground">Verify Paybill/Bank transfer payments</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-500 text-base px-4 py-2">
            {pendingCount} Pending Review
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-amber-500">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-xl font-bold text-green-500">
                {payments.filter(p => p.status === "approved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl font-bold text-destructive">
                {payments.filter(p => p.status === "rejected").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Reference Code</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No manual payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className={payment.status === "pending" ? "bg-amber-500/5" : ""}>
                  <TableCell className="font-mono font-medium">{payment.reference_code}</TableCell>
                  <TableCell className="font-medium">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {payment.proof_url ? (
                      <a 
                        href={payment.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setSelectedPayment(payment);
                        setAdminNotes(payment.admin_notes || "");
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Manual Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference Code</p>
                  <p className="font-mono font-bold">{selectedPayment.reference_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg">
                    {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p>{format(new Date(selectedPayment.created_at), "PPpp")}</p>
                </div>
              </div>

              {selectedPayment.proof_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
                  <a 
                    href={selectedPayment.proof_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {selectedPayment.proof_file_name || "View Proof"}
                  </a>
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <>
                  <div>
                    <Label htmlFor="notes">Admin Notes</Label>
                    <Textarea
                      id="notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleReview("approved")}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Payment
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReview("rejected")}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedPayment.status !== "pending" && selectedPayment.admin_notes && (
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                  <p>{selectedPayment.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
