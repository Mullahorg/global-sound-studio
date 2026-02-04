import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Loader2, CheckCircle, XCircle, AlertCircle, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaybillBackupDialog } from "./PaybillBackupDialog";

interface MpesaCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  paymentType: "beat_purchase" | "booking" | "project";
  referenceId?: string;
  metadata?: Record<string, any>;
  onSuccess?: () => void;
}

type PaymentStatus = "idle" | "initiating" | "waiting" | "success" | "failed";

export const MpesaCheckoutDialog = ({
  open,
  onOpenChange,
  amount,
  description,
  paymentType,
  referenceId,
  metadata,
  onSuccess,
}: MpesaCheckoutDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [showPaybillBackup, setShowPaybillBackup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMessage("");
      setCheckoutRequestId(null);
    }
  }, [open]);

  // Poll for payment status
  useEffect(() => {
    if (status !== "waiting" || !checkoutRequestId) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("status, result_desc")
          .eq("checkout_request_id", checkoutRequestId)
          .maybeSingle();

        if (error) throw error;

        if (data?.status === "completed") {
          setStatus("success");
          onSuccess?.();
        } else if (data?.status === "failed") {
          setStatus("failed");
          setErrorMessage(data.result_desc || "Payment was not completed");
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === "waiting") {
        setStatus("failed");
        setErrorMessage("Payment timeout. Please try again.");
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status, checkoutRequestId, onSuccess]);

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, "");
    
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    } else if (cleaned.startsWith("+254")) {
      cleaned = cleaned.substring(1);
    } else if (!cleaned.startsWith("254")) {
      cleaned = "254" + cleaned;
    }
    
    return cleaned;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({ title: "Please enter your M-Pesa phone number", variant: "destructive" });
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length !== 12) {
      toast({ title: "Invalid phone number format", variant: "destructive" });
      return;
    }

    setStatus("initiating");
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user is authenticated
      if (!user) {
        throw new Error("Please sign in to complete your purchase");
      }
      
      const response = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone_number: formattedPhone,
          amount: Math.round(amount),
          payment_type: paymentType,
          reference_id: referenceId,
          user_id: user.id,
          metadata: metadata || {},
        },
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (data.success && data.checkout_request_id) {
        setCheckoutRequestId(data.checkout_request_id);
        setStatus("waiting");
      } else {
        // Improve error messages for common issues
        let userMessage = data.error || "Failed to initiate payment";
        if (userMessage.includes("Unauthorized")) {
          userMessage = "Please sign in to complete your purchase";
        } else if (userMessage.includes("not configured")) {
          userMessage = "Payment system is being configured. Please try the Paybill option.";
        }
        throw new Error(userMessage);
      }
    } catch (error: any) {
      setStatus("failed");
      setErrorMessage(error.message || "Failed to initiate M-Pesa payment");
    }
  };

  const handleClose = () => {
    if (status === "waiting") {
      toast({
        title: "Payment in progress",
        description: "The payment is still processing. You'll be notified when it completes.",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Pay securely using M-Pesa mobile money
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-display font-bold text-2xl text-primary">
                    KSh {amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              <Button
                variant="hero"
                className="w-full h-12 bg-green-600 hover:bg-green-700"
                onClick={handleInitiatePayment}
              >
                Pay with M-Pesa
              </Button>
            </motion.div>
          )}

          {status === "initiating" && (
            <motion.div
              key="initiating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 text-center"
            >
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">Initiating Payment...</h3>
              <p className="text-muted-foreground">Connecting to M-Pesa</p>
            </motion.div>
          )}

          {status === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Phone className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Check Your Phone</h3>
              <p className="text-muted-foreground mb-4">
                Enter your M-Pesa PIN on your phone to complete the payment
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Waiting for confirmation...</span>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Your payment of KSh {amount.toLocaleString()} has been received
              </p>
              <Button variant="hero" onClick={() => onOpenChange(false)}>
                Continue
              </Button>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Payment Failed</h3>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              
              <div className="space-y-3">
                <Button variant="hero" onClick={() => setStatus("idle")} className="w-full">
                  Try M-Pesa Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onOpenChange(false);
                    setShowPaybillBackup(true);
                  }}
                  className="w-full"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Pay via Paybill Instead
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {/* Paybill Backup Dialog */}
      <PaybillBackupDialog
        open={showPaybillBackup}
        onOpenChange={setShowPaybillBackup}
        amount={amount}
        orderId={referenceId}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
};
