import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { checkout_request_id } = await req.json();

    if (!checkout_request_id) {
      throw new Error("Missing checkout_request_id");
    }

    // Check payment status in database first
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("checkout_request_id", checkout_request_id)
      .eq("user_id", user.id)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment not found");
    }

    // If already completed or failed, return status
    if (payment.status !== "pending") {
      return new Response(
        JSON.stringify({
          success: true,
          status: payment.status,
          receipt_number: payment.mpesa_receipt_number,
          result_desc: payment.result_desc,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Query M-Pesa for status
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "mpesa_environment",
        "mpesa_consumer_key",
        "mpesa_consumer_secret",
        "mpesa_passkey",
        "mpesa_shortcode",
      ]);

    const config: Record<string, string> = {};
    settings?.forEach((s) => {
      config[s.setting_key] = s.setting_value || "";
    });

    if (!config.mpesa_consumer_key || !config.mpesa_consumer_secret) {
      return new Response(
        JSON.stringify({
          success: true,
          status: "pending",
          message: "Awaiting payment confirmation",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isSandbox = config.mpesa_environment === "sandbox";
    const baseUrl = isSandbox
      ? "https://sandbox.safaricom.co.ke"
      : "https://api.safaricom.co.ke";

    // Get OAuth token
    const auth = btoa(`${config.mpesa_consumer_key}:${config.mpesa_consumer_secret}`);
    const tokenResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({ success: true, status: "pending" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Query STK Push status
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    const shortcode = config.mpesa_shortcode || "174379";
    const password = btoa(`${shortcode}${config.mpesa_passkey}${timestamp}`);

    const queryResponse = await fetch(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkout_request_id,
        }),
      }
    );

    const queryData = await queryResponse.json();
    console.log("STK Query response:", queryData);

    let status = "pending";
    if (queryData.ResultCode === "0") {
      status = "completed";
    } else if (queryData.ResultCode && queryData.ResultCode !== "0") {
      status = "failed";
    }

    // Update payment if status changed
    if (status !== "pending") {
      await supabase
        .from("payments")
        .update({
          status,
          result_code: queryData.ResultCode,
          result_desc: queryData.ResultDesc,
        })
        .eq("id", payment.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        result_desc: queryData.ResultDesc,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Query error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
