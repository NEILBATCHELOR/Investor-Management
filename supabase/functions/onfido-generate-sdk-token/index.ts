// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/supabase-edge-functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ONFIDO_API_TOKEN = Deno.env.get("ONFIDO_API_TOKEN") || "";
const ONFIDO_API_URL = "https://api.onfido.com/v3";

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { applicantId } = await req.json();

    if (!applicantId) {
      throw new Error("Missing applicant ID");
    }

    // Generate SDK token
    const response = await fetch(`${ONFIDO_API_URL}/sdk_token`, {
      method: "POST",
      headers: {
        Authorization: `Token token=${ONFIDO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicant_id: applicantId,
        referrer: "*", // In production, specify your domain
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Onfido API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, token: data.token }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        status: 400,
      },
    );
  }
});
