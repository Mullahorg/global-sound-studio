import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Banknote, 
  Copy, 
  CheckCircle, 
  Upload, 
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaybillBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  orderId?: string;
  orderNumber?: string;
  onSuccess?: () => void;
}

type Step = "instructions" | "submit" | "success";

// These would come from environment/settings in production
const PAYBILL_NUMBER = "522522";
const BANK_NAME = "KCB Bank";

export const PaybillBackupDialog = ({
  open,
  onOpenChange,
  amount,
  orderId,
  orderNumber,
  onSuccess,
}: PaybillBackupDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("instructions");
  const [referenceCode, setReferenceCode] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const accountReference = orderNumber || `WGME-${orderId?.substring(0, 8).toUpperCase() || "ORDER"}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!referenceCode.trim()) {
      toast({ title: "Reference code required", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      let proofUrl = null;
      let proofFileName = null;

      // Upload proof if provided
      if (proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(filePath, proofFile);

        if (uploadError) {
          throw new Error("Failed to upload proof: " + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(filePath);
        
        proofUrl = publicUrl;
        proofFileName = proofFile.name;
      }

      // Create manual payment record
      const { error } = await supabase.from("manual_payments").insert({
        order_id: orderId,
        user_id: user.id,
        amount,
        currency: "KES",
        reference_code: referenceCode.trim().toUpperCase(),
        proof_url: proofUrl,
        proof_file_name: proofFileName,
        status: "pending",
      });

      if (error) throw error;

      setStep("success");
    } catch (error: any) {
      toast({ 
        title: "Submission failed", 
        description: error.message,
        variant: "destructive" 
      });
    }

    setSubmitting(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep("instructions");
      setReferenceCode("");
      setProofFile(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            Paybill Payment
          </DialogTitle>
          <DialogDescription>
            Pay via M-Pesa Paybill to {BANK_NAME}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "instructions" && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Amount to Pay</span>
                  <span className="font-display font-bold text-2xl text-primary">
                    KSh {amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Payment Instructions:</h3>
                
                <ol className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">1</span>
                    <span>Go to M-Pesa → Lipa na M-Pesa → Pay Bill</span>
                  </li>
                  
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">2</span>
                    <div className="flex-1">
                      <span>Enter Business Number:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-3 py-1.5 rounded bg-card border border-border font-mono font-bold">
                          {PAYBILL_NUMBER}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(PAYBILL_NUMBER, "paybill")}
                        >
                          {copied === "paybill" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">3</span>
                    <div className="flex-1">
                      <span>Enter Account Number:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-3 py-1.5 rounded bg-card border border-border font-mono font-bold text-primary">
                          {accountReference}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(accountReference, "account")}
                        >
                          {copied === "account" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">4</span>
                    <span>Enter Amount: <strong>KSh {amount.toLocaleString()}</strong></span>
                  </li>
                  
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">5</span>
                    <span>Enter your M-Pesa PIN and confirm</span>
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-500">
                  After payment, click below to submit your transaction reference for verification.
                </p>
              </div>

              <Button
                variant="hero"
                className="w-full h-12"
                onClick={() => setStep("submit")}
              >
                I've Made the Payment
              </Button>
            </motion.div>
          )}

          {step === "submit" && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-4"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reference">M-Pesa Transaction Code *</Label>
                  <Input
                    id="reference"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    placeholder="e.g., QKJ7ABC123"
                    className="font-mono uppercase mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You received this code in the M-Pesa confirmation SMS
                  </p>
                </div>

                <div>
                  <Label htmlFor="proof">Payment Screenshot (Optional)</Label>
                  <div className="mt-1">
                    {proofFile ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="flex-1 truncate text-sm">{proofFile.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setProofFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                        <input
                          id="proof"
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("instructions")} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={submitting || !referenceCode.trim()}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
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
              <h3 className="font-display font-semibold text-xl mb-2">Submitted Successfully!</h3>
              <p className="text-muted-foreground mb-2">
                Your payment is being verified by our team.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You'll receive a notification once verified (usually within 24 hours).
              </p>
              <Button variant="hero" onClick={() => { handleClose(); onSuccess?.(); }}>
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
