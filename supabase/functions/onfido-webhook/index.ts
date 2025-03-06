// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/supabase-edge-functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONFIDO_WEBHOOK_TOKEN = Deno.env.get("ONFIDO_WEBHOOK_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    // Verify webhook signature
    const signature = req.headers.get("X-Signature");
    if (!signature || signature !== ONFIDO_WEBHOOK_TOKEN) {
      throw new Error("Invalid webhook signature");
    }

    const event = await req.json();

    // Process the webhook event
    if (
      event.payload &&
      event.payload.resource_type === "check" &&
      event.payload.action === "check.completed"
    ) {
      const checkId = event.payload.object.id;
      const checkResult = event.payload.object.result;
      const applicantId = event.payload.object.applicant_id;

      // Find the investor associated with this check
      const { data: investors, error } = await supabase
        .from("investors")
        .select("*")
        .filter("verification_details->checkId", "eq", checkId);

      if (error || !investors || investors.length === 0) {
        throw new Error("Investor not found for check ID: " + checkId);
      }

      const investor = investors[0];

      // Update investor verification status
      const kycStatus = checkResult === "clear" ? "approved" : "failed";
      const details =
        checkResult === "clear" ? "Verification passed" : "Verification failed";

      await supabase
        .from("investors")
        .update({
          kyc_status: kycStatus,
          last_updated: new Date().toISOString().split("T")[0],
          verification_details: {
            ...investor.verification_details,
            result: checkResult,
            details,
            updatedAt: new Date().toISOString(),
          },
        })
        .eq("id", investor.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
