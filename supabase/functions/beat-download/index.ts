import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user via JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { beat_id } = await req.json();
    if (!beat_id || typeof beat_id !== "string") {
      return new Response(JSON.stringify({ error: "beat_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify ownership: either purchased the beat or is the producer
    const { data: purchase } = await admin
      .from("beat_purchases")
      .select("id, license_type")
      .eq("beat_id", beat_id)
      .eq("buyer_id", user.id)
      .maybeSingle();

    const { data: beat, error: beatError } = await admin
      .from("beats")
      .select("id, title, audio_url, producer_id")
      .eq("id", beat_id)
      .single();

    if (beatError || !beat) {
      return new Response(JSON.stringify({ error: "Beat not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isProducer = beat.producer_id === user.id;

    // Check admin role
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!roleRow;

    if (!purchase && !isProducer && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "You have not purchased this beat" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Extract storage path from audio_url
    // audio_url stored as full public/sign URL OR storage path
    let storagePath = beat.audio_url;
    const audioMarker = "/object/public/audio/";
    const signMarker = "/object/sign/audio/";
    if (storagePath.includes(audioMarker)) {
      storagePath = storagePath.split(audioMarker)[1].split("?")[0];
    } else if (storagePath.includes(signMarker)) {
      storagePath = storagePath.split(signMarker)[1].split("?")[0];
    } else if (storagePath.startsWith("audio/")) {
      storagePath = storagePath.replace(/^audio\//, "");
    }

    const { data: signed, error: signError } = await admin.storage
      .from("audio")
      .createSignedUrl(storagePath, 60 * 60, {
        download: `${beat.title}.mp3`,
      });

    if (signError || !signed) {
      console.error("Sign error", signError);
      return new Response(
        JSON.stringify({ error: "Could not generate download URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        download_url: signed.signedUrl,
        license_type: purchase?.license_type ?? (isProducer ? "owner" : "admin"),
        expires_in: 3600,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("beat-download error:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});