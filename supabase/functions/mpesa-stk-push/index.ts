import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface STKPushRequest {
  phone_number: string;
  amount: number;
  payment_type: "beat_purchase" | "booking";
  reference_id: string;
  description?: string;
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

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: STKPushRequest = await req.json();
    const { phone_number, amount, payment_type, reference_id, description } = body;

    console.log("Processing M-Pesa STK Push request:", { phone_number, amount, payment_type, reference_id });

    // Fetch M-Pesa settings from database
    const { data: settings, error: settingsError } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "mpesa_environment",
        "mpesa_consumer_key",
        "mpesa_consumer_secret",
        "mpesa_passkey",
        "mpesa_shortcode",
        "mpesa_callback_url",
      ]);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error("Failed to fetch M-Pesa configuration");
    }

    const config: Record<string, string> = {};
    settings?.forEach((s) => {
      config[s.setting_key] = s.setting_value || "";
    });

    // Validate required settings
    if (!config.mpesa_consumer_key || !config.mpesa_consumer_secret || !config.mpesa_passkey) {
      throw new Error("M-Pesa not configured. Please configure M-Pesa settings in admin panel.");
    }

    const isSandbox = config.mpesa_environment === "sandbox";
    const baseUrl = isSandbox
      ? "https://sandbox.safaricom.co.ke"
      : "https://api.safaricom.co.ke";

    // Step 1: Get OAuth token
    const auth = btoa(`${config.mpesa_consumer_key}:${config.mpesa_consumer_secret}`);
    const tokenResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("OAuth token error:", errorText);
      throw new Error("Failed to authenticate with M-Pesa");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log("Got M-Pesa access token");

    // Step 2: Initiate STK Push
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    
    const shortcode = config.mpesa_shortcode || "174379";
    const password = btoa(`${shortcode}${config.mpesa_passkey}${timestamp}`);

    // Format phone number (remove + and country code handling)
    let formattedPhone = phone_number.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    const callbackUrl = config.mpesa_callback_url || `${supabaseUrl}/functions/v1/mpesa-callback`;

    const stkPushPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference_id.slice(0, 12),
      TransactionDesc: description || `${payment_type} payment`,
    };

    console.log("Sending STK Push:", { ...stkPushPayload, Password: "[REDACTED]" });

    const stkResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();
    console.log("STK Push response:", stkData);

    if (stkData.ResponseCode !== "0") {
      throw new Error(stkData.ResponseDescription || "STK Push failed");
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        payment_type,
        reference_id,
        amount,
        currency: "KES",
        payment_method: "mpesa",
        phone_number: formattedPhone,
        status: "pending",
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
        metadata: { description },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "STK Push sent. Please check your phone.",
        checkout_request_id: stkData.CheckoutRequestID,
        merchant_request_id: stkData.MerchantRequestID,
        payment_id: payment?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("M-Pesa STK Push error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Payment initiation failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
