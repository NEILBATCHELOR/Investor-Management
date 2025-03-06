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
    const { reportId } = await req.json();

    if (!reportId) {
      throw new Error("Missing report ID");
    }

    // Get report from Onfido
    const response = await fetch(`${ONFIDO_API_URL}/reports/${reportId}`, {
      method: "GET",
      headers: {
        Authorization: `Token token=${ONFIDO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Onfido API error: ${JSON.stringify(errorData)}`);
    }

    const report = await response.json();

    return new Response(JSON.stringify({ success: true, report }), {
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
