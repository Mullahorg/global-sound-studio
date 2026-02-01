// components/admin/ManualPaymentsPanel.tsx
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
  Download,
  User,
  Calendar,
  AlertCircle,
  CreditCard,
  Wallet,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
  orders?: {
    order_number: string | null;
    total_amount: number | null;
  } | null;
}

export const ManualPaymentsPanel = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("manual_payments")
        .select(`
          *,
          profiles:user_id (full_name, email),
          orders:order_id (order_number, total_amount)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out system-generated payments (like booking approvals)
      const manualEntries = (data || []).filter(payment => 
        payment.reference_code?.startsWith("MPESA-") || 
        payment.reference_code?.startsWith("PAYBILL-") ||
        payment.reference_code?.startsWith("BANK-") ||
        payment.proof_url !== null // Has uploaded proof
      );

      setPayments(manualEntries);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: "verified" | "rejected") => {
    if (!user) return;
    
    setVerifyingId(paymentId);
    setProcessing(true);
    
    try {
      const { error: paymentError } = await supabase
        .from("manual_payments")
        .update({
          status: status === "verified" ? "completed" : "rejected",
          admin_notes: adminNotes || `${status} by admin ${user.email} at ${new Date().toLocaleString()}`,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // If verified and has an order, update order status
      const payment = payments.find(p => p.id === paymentId);
      if (status === "verified" && payment?.order_id) {
        await supabase
          .from("orders")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", payment.order_id);
      }

      toast({
        title: `Payment ${status}`,
        description: `Payment has been ${status} successfully`,
      });

      setSelectedPayment(null);
      setAdminNotes("");
      fetchPayments();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setVerifyingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      verified: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      completed: <CheckCircle className="w-3 h-3 mr-1" />,
      verified: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    };

    const label = status === "completed" ? "verified" : status;

    return (
      <Badge className={styles[status] || "bg-secondary"}>
        {icons[status]}
        {label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.reference_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orders?.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold">Manual Payment Verification</h2>
          <p className="text-muted-foreground">
            Verify Paybill, Bank Transfer, and cash payments submitted by users
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/10 text-amber-500 text-base px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              {pendingCount} Pending Verification
            </Badge>
          )}
          <Button variant="outline" onClick={fetchPayments} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Awaiting Review</p>
              <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-green-500">
                {payments.filter(p => p.status === "completed" || p.status === "verified").length}
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
              <p className="text-2xl font-bold text-destructive">
                {payments.filter(p => p.status === "rejected").length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-blue-500">
                KES {payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference, client name, email, or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="completed">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Reference Code</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No manual payments found</p>
                    <p className="text-muted-foreground">
                      {statusFilter === "pending" 
                        ? "No pending payments require verification"
                        : "No payments match your search criteria"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow 
                  key={payment.id} 
                  className={`
                    ${payment.status === "pending" ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}
                    hover:bg-secondary/50
                  `}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {payment.reference_code?.startsWith("MPESA-") && <CreditCard className="w-4 h-4 text-green-500" />}
                      {payment.reference_code?.startsWith("BANK-") && <Banknote className="w-4 h-4 text-blue-500" />}
                      <span className="font-mono">{payment.reference_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.profiles?.full_name || "Customer"}</p>
                      <p className="text-sm text-muted-foreground">{payment.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.orders?.order_number ? (
                      <Badge variant="outline" className="font-mono">
                        {payment.orders.order_number}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {payment.currency} {payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {payment.proof_url ? (
                      <a 
                        href={payment.proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">View Proof</span>
                      </a>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        No Proof
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(payment.created_at), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerifyPayment(payment.id, "rejected")}
                          disabled={verifyingId === payment.id && processing}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setAdminNotes(payment.admin_notes || "");
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setAdminNotes(payment.admin_notes || "");
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Verification Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Manual Payment</DialogTitle>
            <DialogDescription>
              Review payment details and provide verification notes
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Reference Code</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedPayment.reference_code?.startsWith("MPESA-") && (
                        <CreditCard className="w-5 h-5 text-green-500" />
                      )}
                      {selectedPayment.reference_code?.startsWith("BANK-") && (
                        <Banknote className="w-5 h-5 text-blue-500" />
                      )}
                      <p className="font-mono font-bold text-lg">{selectedPayment.reference_code}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Amount</Label>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Client</Label>
                    <div className="mt-1">
                      <p className="font-medium">{selectedPayment.profiles?.full_name || "Customer"}</p>
                      <p className="text-muted-foreground">{selectedPayment.profiles?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPayment.orders && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Order Details</Label>
                      <div className="mt-1 space-y-1">
                        <p className="font-mono">{selectedPayment.orders.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Order Total: {selectedPayment.currency} {selectedPayment.orders.total_amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div className="mt-2">{getStatusBadge(selectedPayment.status)}</div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Submitted</Label>
                    <p className="mt-1">{format(new Date(selectedPayment.created_at), "PPP 'at' HH:mm")}</p>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedPayment.proof_url && (
                <div className="border rounded-lg p-4">
                  <Label className="text-sm text-muted-foreground mb-3 block">Payment Proof</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">
                          {selectedPayment.proof_file_name || "Payment Proof"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {format(new Date(selectedPayment.created_at), "PP")}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedPayment.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Proof
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {selectedPayment.status === "pending" ? (
                <>
                  <div>
                    <Label htmlFor="adminNotes" className="text-sm text-muted-foreground mb-2 block">
                      Verification Notes (Optional)
                    </Label>
                    <Textarea
                      id="adminNotes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this verification..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerifyPayment(selectedPayment.id, "rejected")}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Payment
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyPayment(selectedPayment.id, "verified")}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Payment
                    </Button>
                  </div>
                </>
              ) : (
                selectedPayment.admin_notes && (
                  <div className="border rounded-lg p-4 bg-secondary/30">
                    <Label className="text-sm text-muted-foreground mb-2 block">Verification Notes</Label>
                    <p className="whitespace-pre-wrap">{selectedPayment.admin_notes}</p>
                    {selectedPayment.reviewed_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Verified on: {format(new Date(selectedPayment.reviewed_at), "PPP 'at' HH:mm")}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
