import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, addDays, isSameDay, isAfter, startOfToday } from "date-fns";
import { Calendar, Clock, User, ArrowRight, Check, ChevronLeft, ChevronRight, Smartphone, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageMeta } from "@/components/seo/PageMeta";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MpesaCheckoutDialog } from "@/components/payments/MpesaCheckoutDialog";

interface SessionType {
  id: string;
  session_type: string;
  name: string;
  description: string | null;
  price_kes: number;
  duration_hours: number;
  icon: string;
  is_active: boolean;
}

interface Producer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio_short: string | null;
  hourly_rate: number | null;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [calendarWeekStart, setCalendarWeekStart] = useState(startOfToday());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch session pricing from database
    const { data: pricingData } = await supabase
      .from("session_pricing")
      .select("*")
      .eq("is_active", true)
      .order("price_kes", { ascending: true });

    if (pricingData) {
      setSessionTypes(pricingData.map(p => ({
        id: p.session_type,
        session_type: p.session_type,
        name: p.name,
        description: p.description,
        price_kes: Number(p.price_kes),
        duration_hours: p.duration_hours,
        icon: p.icon || "🎵",
        is_active: p.is_active,
      })));
    }

    // Fetch active franchise producers
    const { data: producerSettings } = await supabase
      .from("producer_settings")
      .select("producer_id, bio_short, hourly_rate")
      .eq("is_franchise_active", true)
      .eq("booking_enabled", true);

    if (producerSettings && producerSettings.length > 0) {
      const producerIds = producerSettings.map(p => p.producer_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", producerIds);

      if (profiles) {
        const enrichedProducers = profiles.map(profile => {
          const settings = producerSettings.find(s => s.producer_id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio_short: settings?.bio_short || null,
            hourly_rate: settings?.hourly_rate || null,
          };
        });
        setProducers(enrichedProducers);
      }
    }

    setLoading(false);
  };

  const selectedSessionData = sessionTypes.find(s => s.id === selectedSession);
  const totalPrice = (selectedSessionData?.price_kes || 0) * (selectedSessionData?.duration_hours || 1);
  const selectedProducerData = producers.find(p => p.id === selectedProducer);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(calendarWeekStart, i));

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to book a session.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedSession || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      // 1. FIRST CREATE AN ORDER WITH ALL REQUIRED FIELDS
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: `WGME-${Date.now().toString().slice(-8)}`,
          amount: totalPrice, // ✅ Add the amount field
          license_type: "none", // ✅ Add license_type field with default value
          status: "pending", // ✅ Add status field if required
          created_at: new Date().toISOString(),
          // Add any other required fields based on your database schema
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. THEN CREATE BOOKING WITH ORDER ID
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          client_id: user.id,
          session_type: selectedSession as "recording" | "mixing" | "mastering" | "production" | "consultation",
          session_date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          duration_hours: selectedSessionData?.duration_hours || 2,
          total_price: totalPrice,
          notes: notes || null,
          status: "pending",
          order_id: order.id, // ✅ Link to the created order
          // Add producer_id if a producer was selected
          ...(selectedProducer && { producer_id: selectedProducer }),
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Store both IDs
      setCreatedBookingId(booking.id);
      setCreatedOrderId(order.id);
      setShowMpesaDialog(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!createdBookingId || !createdOrderId) return;

    try {
      // 1. Update booking status to confirmed
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", createdBookingId);

      // 2. Update order status to completed
      await supabase
        .from("orders")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", createdOrderId);

      // 3. Create manual payment record with valid order_id
      await supabase.from("manual_payments").insert({
        id: crypto.randomUUID(),
        order_id: createdOrderId,
        user_id: user?.id,
        amount: totalPrice,
        currency: "KES",
        reference_code: `MPESA-${Date.now()}`,
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Booking confirmed!",
        description: "Payment successful. You'll receive a confirmation shortly.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Payment success handler error:", error);
      toast({
        title: "Payment recorded, but update failed",
        description: "Your payment was successful but there was an issue updating your booking.",
        variant: "warning",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Book a Session"
        description="Schedule recording, mixing, mastering, or production sessions with world-class producers. M-Pesa payments accepted."
        path="/booking"
      />
      <Navbar />
      
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Book a <span className="gradient-text">Session</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Schedule time with our world-class producers and engineers
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 rounded ${step > s ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Session Type */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6">Choose Session Type</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {sessionTypes.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        selectedSession === session.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{session.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-display font-semibold text-lg mb-1">{session.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {session.duration_hours}h
                            </span>
                            <span className="font-display font-bold text-primary">KES {session.price_kes.toLocaleString()}/hr</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Producer */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6">Select Producer (Optional)</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {producers.length > 0 ? producers.map((producer) => (
                    <button
                      key={producer.id}
                      onClick={() => setSelectedProducer(producer.id)}
                      className={`p-6 rounded-xl border-2 text-center transition-all ${
                        selectedProducer === producer.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={producer.avatar_url || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face"}
                        alt={producer.full_name || "Producer"}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="font-display font-semibold mb-1">{producer.full_name || "Producer"}</h3>
                      <p className="text-sm text-muted-foreground">{producer.bio_short || "Music Producer"}</p>
                    </button>
                  )) : (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      <p>No producers available for selection</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProducer(null)}
                  className="text-muted-foreground"
                >
                  Skip - No preference
                </Button>
              </motion.div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6">Choose Date & Time</h2>
                
                {/* Calendar */}
                <div className="bg-card rounded-xl border border-border/50 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarWeekStart(addDays(calendarWeekStart, -7))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-display font-semibold">
                      {format(calendarWeekStart, "MMMM yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarWeekStart(addDays(calendarWeekStart, 7))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const isPast = !isAfter(day, startOfToday()) && !isSameDay(day, startOfToday());
                      const isSelected = selectedDate && isSameDay(day, selectedDate);

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => !isPast && setSelectedDate(day)}
                          disabled={isPast}
                          className={`p-4 rounded-xl text-center transition-all ${
                            isPast
                              ? "opacity-30 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {format(day, "EEE")}
                          </div>
                          <div className="font-display font-semibold">
                            {format(day, "d")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="bg-card rounded-xl border border-border/50 p-6">
                    <h3 className="font-display font-semibold mb-4">Available Times</h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6">Confirm Booking</h2>
                
                <div className="bg-card rounded-xl border border-border/50 p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Session Type</span>
                      <span className="font-semibold">{selectedSessionData?.name}</span>
                    </div>
                    {selectedProducerData && (
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-muted-foreground">Producer</span>
                        <span className="font-semibold">{selectedProducerData.full_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-semibold">
                        {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold">{selectedSessionData?.duration_hours} hours</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-display font-bold text-2xl text-primary">
                        KES {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or information..."
                    className="bg-secondary border-border"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  variant="hero"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedSession) ||
                    (step === 3 && (!selectedDate || !selectedTime))
                  }
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  {isSubmitting ? "Processing..." : "Pay with M-Pesa"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      )}

      <Footer />

      {/* M-Pesa Checkout Dialog */}
      <MpesaCheckoutDialog
        open={showMpesaDialog}
        onOpenChange={(open) => {
          setShowMpesaDialog(open);
          if (!open && createdBookingId) {
            // Optional: You could cancel the booking if payment dialog is closed
            toast({
              title: "Payment cancelled",
              description: "You can complete the payment later from your dashboard.",
              variant: "warning",
            });
          }
        }}
        amount={totalPrice}
        description={`${selectedSessionData?.name || "Session"} booking - ${selectedDate ? format(selectedDate, "MMM d, yyyy") : ""} at ${selectedTime || ""}`}
        paymentType="booking"
        referenceId={createdBookingId || undefined}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Booking;
