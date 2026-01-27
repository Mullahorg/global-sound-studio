import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const callback: MpesaCallback = await req.json();
    const stkCallback = callback.Body.stkCallback;

    console.log("M-Pesa Callback received:", JSON.stringify(stkCallback, null, 2));

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", CheckoutRequestID);
      return new Response(JSON.stringify({ success: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse callback metadata
    let mpesaReceiptNumber = "";
    let transactionAmount = 0;
    let phoneNumber = "";

    if (CallbackMetadata?.Item) {
      CallbackMetadata.Item.forEach((item) => {
        switch (item.Name) {
          case "MpesaReceiptNumber":
            mpesaReceiptNumber = String(item.Value || "");
            break;
          case "Amount":
            transactionAmount = Number(item.Value || 0);
            break;
          case "PhoneNumber":
            phoneNumber = String(item.Value || "");
            break;
        }
      });
    }

    // Update payment status
    const isSuccess = ResultCode === 0;
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: isSuccess ? "completed" : "failed",
        mpesa_receipt_number: mpesaReceiptNumber,
        result_code: String(ResultCode),
        result_desc: ResultDesc,
        metadata: {
          ...payment.metadata,
          callback_received_at: new Date().toISOString(),
          transaction_amount: transactionAmount,
        },
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
    }

    // If payment successful, handle based on payment type
    if (isSuccess) {
      console.log("Payment successful:", mpesaReceiptNumber);

      if (payment.payment_type === "beat_purchase") {
        // Create beat purchase record
        const { error: purchaseError } = await supabase
          .from("beat_purchases")
          .insert({
            beat_id: payment.reference_id,
            buyer_id: payment.user_id,
            license_type: payment.metadata?.license_type || "basic",
            price_paid: payment.amount,
          });

        if (purchaseError) {
          console.error("Failed to create beat purchase:", purchaseError);
        }
      } else if (payment.payment_type === "booking") {
        // Update booking status to confirmed
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", payment.reference_id);

        if (bookingError) {
          console.error("Failed to update booking:", bookingError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Callback processing error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
