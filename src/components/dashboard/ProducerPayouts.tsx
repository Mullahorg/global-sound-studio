import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  ArrowUpRight,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number: string | null;
  mpesa_receipt_number: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface ProducerPayoutsProps {
  userId: string;
}

export const ProducerPayouts = ({ userId }: ProducerPayoutsProps) => {
  const { formatPrice, currency } = useCurrency();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPayoutData();
  }, [userId]);

  const fetchPayoutData = async () => {
    // Fetch payouts
    const { data: payoutsData } = await supabase
      .from("payouts")
      .select("*")
      .eq("producer_id", userId)
      .order("requested_at", { ascending: false });

    if (payoutsData) {
      setPayouts(payoutsData);
      const withdrawn = payoutsData
        .filter((p) => p.status === "completed")
        .reduce((acc, p) => acc + Number(p.amount), 0);
      const pending = payoutsData
        .filter((p) => p.status === "pending" || p.status === "processing")
        .reduce((acc, p) => acc + Number(p.amount), 0);
      setWithdrawnAmount(withdrawn);
      setPendingAmount(pending);
    }

    // Fetch total earnings from beat sales
    const { data: salesData } = await supabase
      .from("beat_purchases")
      .select(`
        price_paid,
        beat:beats!inner(producer_id)
      `)
      .eq("beat.producer_id", userId);

    if (salesData) {
      const total = salesData.reduce((acc, sale) => acc + Number(sale.price_paid), 0);
      setTotalEarnings(total);
    }

    setLoading(false);
  };

  const availableBalance = totalEarnings - withdrawnAmount - pendingAmount;

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!phoneNumber.match(/^(?:254|\+254|0)?([17]\d{8})$/)) {
      toast.error("Please enter a valid M-Pesa phone number");
      return;
    }

    setIsSubmitting(true);
    const formattedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : phoneNumber.startsWith("+254")
      ? phoneNumber.slice(1)
      : phoneNumber.startsWith("0")
      ? "254" + phoneNumber.slice(1)
      : "254" + phoneNumber;

    const { error } = await supabase.from("payouts").insert({
      producer_id: userId,
      amount,
      currency: "KES",
      phone_number: formattedPhone,
      payment_method: "mpesa",
    });

    if (error) {
      toast.error("Failed to submit withdrawal request");
    } else {
      toast.success("Withdrawal request submitted successfully");
      setShowWithdrawDialog(false);
      setWithdrawAmount("");
      setPhoneNumber("");
      fetchPayoutData();
    }
    setIsSubmitting(false);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Balance Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatPrice(totalEarnings)}
          </p>
          <p className="text-sm text-muted-foreground">Total Earnings</p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatPrice(availableBalance)}
          </p>
          <p className="text-sm text-muted-foreground">Available Balance</p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatPrice(pendingAmount)}
          </p>
          <p className="text-sm text-muted-foreground">Pending Withdrawal</p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatPrice(withdrawnAmount)}
          </p>
          <p className="text-sm text-muted-foreground">Total Withdrawn</p>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end">
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button variant="hero" disabled={availableBalance <= 0}>
              <Wallet className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Enter the amount you want to withdraw to your M-Pesa account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-display font-bold text-primary">
                  {formatPrice(availableBalance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={availableBalance}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">
                  Withdrawals are processed within 24-48 hours. A small transaction fee may apply.
                </p>
              </div>

              <Button
                className="w-full"
                variant="hero"
                onClick={handleWithdrawRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payout History */}
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <h3 className="font-display text-lg font-semibold mb-6">Withdrawal History</h3>
        
        {payouts.length > 0 ? (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{formatPrice(payout.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payout.requested_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(payout.status)}
                  {payout.mpesa_receipt_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Receipt: {payout.mpesa_receipt_number}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No withdrawals yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
