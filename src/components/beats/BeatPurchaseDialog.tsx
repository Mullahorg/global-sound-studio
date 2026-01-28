import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Star, Shield, Music, FileAudio } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MpesaCheckoutDialog } from "@/components/payments/MpesaCheckoutDialog";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface BeatPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beat: {
    id: string;
    title: string;
    price_basic: number;
    price_premium: number;
    price_exclusive: number;
    producer?: {
      full_name: string | null;
    } | null;
  };
  onSuccess?: () => void;
}

const licenses = [
  {
    type: "basic",
    name: "Basic",
    icon: Music,
    color: "from-blue-500 to-cyan-500",
    features: [
      "High-quality MP3 file",
      "Up to 2,500 streams",
      "Non-exclusive license",
      "Credit required",
      "1 music video allowed",
    ],
    notIncluded: ["WAV file", "Stems", "Unlimited streams"],
  },
  {
    type: "premium",
    name: "Premium",
    icon: Crown,
    color: "from-primary to-accent",
    popular: true,
    features: [
      "WAV + MP3 files",
      "Unlimited streams",
      "Non-exclusive license",
      "Radio broadcasting rights",
      "Unlimited music videos",
      "Keep 100% royalties",
    ],
    notIncluded: ["Stems", "Exclusive ownership"],
  },
  {
    type: "exclusive",
    name: "Exclusive",
    icon: Star,
    color: "from-amber-500 to-orange-500",
    features: [
      "All stems + WAV + MP3",
      "Full ownership rights",
      "Beat removed from store",
      "Unlimited everything",
      "No credit required",
      "Resell rights included",
      "Commercial use worldwide",
    ],
    notIncluded: [],
  },
];

export const BeatPurchaseDialog = ({
  open,
  onOpenChange,
  beat,
  onSuccess,
}: BeatPurchaseDialogProps) => {
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const { formatPrice } = useCurrency();

  const getPrice = (type: string) => {
    switch (type) {
      case "basic":
        return beat.price_basic;
      case "premium":
        return beat.price_premium;
      case "exclusive":
        return beat.price_exclusive;
      default:
        return 0;
    }
  };

  const handleSelectLicense = (type: string) => {
    setSelectedLicense(type);
  };

  const handleProceedToCheckout = () => {
    if (selectedLicense) {
      onOpenChange(false);
      setShowMpesaDialog(true);
    }
  };

  const handlePaymentSuccess = () => {
    setShowMpesaDialog(false);
    setSelectedLicense(null);
    onSuccess?.();
  };

  const selectedLicenseData = licenses.find((l) => l.type === selectedLicense);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              License "{beat.title}"
            </DialogTitle>
            {beat.producer?.full_name && (
              <p className="text-sm text-muted-foreground">
                by {beat.producer.full_name}
              </p>
            )}
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {licenses.map((license) => {
              const Icon = license.icon;
              const price = getPrice(license.type);
              const isSelected = selectedLicense === license.type;

              return (
                <motion.button
                  key={license.type}
                  onClick={() => handleSelectLicense(license.type)}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {license.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}

                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
                      license.color
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-display font-bold text-xl mb-1">
                    {license.name}
                  </h3>
                  <p className="font-display font-bold text-2xl text-primary mb-4">
                    {formatPrice(price)}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {license.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {license.notIncluded.length > 0 && (
                    <ul className="space-y-1">
                      {license.notIncluded.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-muted-foreground line-through"
                        >
                          <span className="w-4 h-4" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Purchase Summary */}
          {selectedLicense && selectedLicenseData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">
                    {selectedLicenseData.name} License
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {beat.title}
                  </p>
                </div>
                <p className="font-display font-bold text-2xl text-primary">
                  {formatPrice(getPrice(selectedLicense))}
                </p>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleProceedToCheckout}
              >
                <Zap className="w-4 h-4 mr-2" />
                Proceed to Payment
              </Button>

              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure Payment
                </span>
                <span className="flex items-center gap-1">
                  <FileAudio className="w-3 h-3" />
                  Instant Download
                </span>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* M-Pesa Checkout Dialog */}
      {selectedLicense && (
        <MpesaCheckoutDialog
          open={showMpesaDialog}
          onOpenChange={setShowMpesaDialog}
          amount={getPrice(selectedLicense)}
          description={`${beat.title} - ${selectedLicenseData?.name} License`}
          paymentType="beat_purchase"
          referenceId={beat.id}
          metadata={{
            license_type: selectedLicense,
            beat_title: beat.title,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
