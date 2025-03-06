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
    const { applicantId, reportNames, companyData, additionalApplicantIds } =
      await req.json();

    if (!applicantId || !reportNames || !Array.isArray(reportNames)) {
      throw new Error("Missing required parameters");
    }

    // Prepare check request body
    const checkData: any = {
      applicant_id: applicantId,
      report_names: reportNames,
    };

    // Add company data for business verification
    if (companyData) {
      checkData.company = companyData;
    }

    // Add additional applicants for business verification
    if (additionalApplicantIds && Array.isArray(additionalApplicantIds)) {
      checkData.applicant_ids = additionalApplicantIds;
    }

    // Create check in Onfido
    const response = await fetch(`${ONFIDO_API_URL}/checks`, {
      method: "POST",
      headers: {
        Authorization: `Token token=${ONFIDO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Onfido API error: ${JSON.stringify(errorData)}`);
    }

    const check = await response.json();

    return new Response(JSON.stringify({ success: true, check }), {
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
