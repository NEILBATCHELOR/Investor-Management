import { supabase } from "../supabase";

// Types for Onfido API
export interface OnfidoApplicant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  dob?: string;
  address?: {
    building_number?: string;
    street?: string;
    town?: string;
    postcode?: string;
    country?: string;
  };
  created_at: string;
}

export interface OnfidoDocument {
  id: string;
  type: string;
  side: string;
  applicant_id: string;
  created_at: string;
}

export interface OnfidoCheck {
  id: string;
  applicant_id: string;
  status: "in_progress" | "awaiting_applicant" | "complete" | "withdrawn";
  result?: "clear" | "consider";
  created_at: string;
  completed_at?: string;
  report_ids: string[];
}

export interface OnfidoReport {
  id: string;
  name: string;
  result: "clear" | "consider";
  sub_result?: string;
  created_at: string;
  breakdown?: Record<string, any>;
}

export interface OnfidoSdkToken {
  token: string;
  applicant_id: string;
}

export interface OnfidoCompany {
  name: string;
  registration_number: string;
  country: string;
}

// Investor verification types
export type VerificationType = "individual" | "business";

export interface VerificationRequest {
  investorId: string;
  type: VerificationType;
  applicantData: {
    first_name: string;
    last_name: string;
    email?: string;
    dob?: string;
    address?: {
      building_number?: string;
      street?: string;
      town?: string;
      postcode?: string;
      country?: string;
    };
  };
  companyData?: OnfidoCompany;
}

export interface VerificationResult {
  success: boolean;
  status:
    | "in_progress"
    | "awaiting_applicant"
    | "complete"
    | "withdrawn"
    | "failed";
  result?: "clear" | "consider";
  details?: string;
  checkId?: string;
  applicantId?: string;
  error?: string;
}

// This function would be called from a secure backend environment (Supabase Edge Function)
// We're defining the interface here, but the actual implementation will be in a secure environment
export const createApplicant = async (
  applicantData: Partial<OnfidoApplicant>,
): Promise<{
  success: boolean;
  applicant?: OnfidoApplicant;
  error?: string;
}> => {
  try {
    // In a real implementation, this would be a call to a secure backend function
    // that has access to the Onfido API token
    const { data, error } = await supabase.functions.invoke(
      "onfido-create-applicant",
      {
        body: { applicantData },
      },
    );

    if (error) throw error;
    return { success: true, applicant: data.applicant };
  } catch (error) {
    console.error("Error creating Onfido applicant:", error);
    return {
      success: false,
      error: error.message || "Failed to create applicant",
    };
  }
};

// Generate SDK token for frontend integration
export const generateSdkToken = async (
  applicantId: string,
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "onfido-generate-sdk-token",
      {
        body: { applicantId },
      },
    );

    if (error) throw error;
    return { success: true, token: data.token };
  } catch (error) {
    console.error("Error generating SDK token:", error);
    return {
      success: false,
      error: error.message || "Failed to generate SDK token",
    };
  }
};

// Create a verification check
export const createCheck = async (
  applicantId: string,
  reportNames: string[],
  companyData?: OnfidoCompany,
  additionalApplicantIds?: string[],
): Promise<{ success: boolean; check?: OnfidoCheck; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "onfido-create-check",
      {
        body: {
          applicantId,
          reportNames,
          companyData,
          additionalApplicantIds,
        },
      },
    );

    if (error) throw error;
    return { success: true, check: data.check };
  } catch (error) {
    console.error("Error creating check:", error);
    return { success: false, error: error.message || "Failed to create check" };
  }
};

// Get check status
export const getCheckStatus = async (
  checkId: string,
): Promise<{ success: boolean; check?: OnfidoCheck; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "onfido-get-check",
      {
        body: { checkId },
      },
    );

    if (error) throw error;
    return { success: true, check: data.check };
  } catch (error) {
    console.error("Error getting check status:", error);
    return {
      success: false,
      error: error.message || "Failed to get check status",
    };
  }
};

// Get report details
export const getReportDetails = async (
  reportId: string,
): Promise<{ success: boolean; report?: OnfidoReport; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "onfido-get-report",
      {
        body: { reportId },
      },
    );

    if (error) throw error;
    return { success: true, report: data.report };
  } catch (error) {
    console.error("Error getting report details:", error);
    return {
      success: false,
      error: error.message || "Failed to get report details",
    };
  }
};

// Start verification process for an investor
export const startVerification = async (
  request: VerificationRequest,
): Promise<VerificationResult> => {
  try {
    // 1. Create applicant
    const applicantResult = await createApplicant(request.applicantData);
    if (!applicantResult.success || !applicantResult.applicant) {
      return {
        success: false,
        status: "failed",
        error: applicantResult.error || "Failed to create applicant",
      };
    }

    const applicantId = applicantResult.applicant.id;

    // 2. Determine which reports to request based on verification type
    const reportNames =
      request.type === "individual"
        ? ["document", "facial_similarity_photo"]
        : ["company_verification"];

    // 3. Create check
    const checkResult = await createCheck(
      applicantId,
      reportNames,
      request.type === "business" ? request.companyData : undefined,
    );

    if (!checkResult.success || !checkResult.check) {
      return {
        success: false,
        status: "failed",
        error: checkResult.error || "Failed to create check",
        applicantId,
      };
    }

    // 4. Return initial status
    return {
      success: true,
      status: checkResult.check.status,
      checkId: checkResult.check.id,
      applicantId,
    };
  } catch (error) {
    console.error("Error starting verification:", error);
    return {
      success: false,
      status: "failed",
      error: error.message || "Failed to start verification",
    };
  }
};

// Update investor verification status in database
export const updateInvestorVerificationStatus = async (
  investorId: string,
  status: string,
  checkId?: string,
  applicantId?: string,
  details?: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("investors")
      .update({
        kyc_status: status,
        lastUpdated: new Date().toISOString().split("T")[0], // Changed from last_updated to match the column name in the database
        verification_details: {
          checkId,
          applicantId,
          details,
          updatedAt: new Date().toISOString(),
        },
      })
      .eq("investor_id", investorId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating investor verification status:", error);
    return false;
  }
};

// Process webhook event from Onfido
export const processWebhookEvent = async (event: any): Promise<boolean> => {
  try {
    // Extract check information from the webhook event
    const checkId = event.payload?.object?.id;
    if (!checkId) return false;

    // Get the check details
    const checkResult = await getCheckStatus(checkId);
    if (!checkResult.success || !checkResult.check) return false;

    const check = checkResult.check;

    // Find the investor associated with this check
    const { data: investors, error } = await supabase
      .from("investors")
      .select("*")
      .filter("verification_details->checkId", "eq", checkId);

    if (error || !investors || investors.length === 0) return false;

    const investor = investors[0];

    // Map Onfido status to our status
    let kycStatus: string;
    let details = "";

    if (check.status === "complete") {
      kycStatus = check.result === "clear" ? "approved" : "failed";
      details =
        check.result === "clear"
          ? "Verification passed"
          : "Verification failed";

      // Get detailed report information if needed
      if (check.report_ids && check.report_ids.length > 0) {
        const reportPromises = check.report_ids.map((id) =>
          getReportDetails(id),
        );
        const reportResults = await Promise.all(reportPromises);

        const reportDetails = reportResults
          .filter((r) => r.success && r.report)
          .map(
            (r) =>
              `${r.report.name}: ${r.report.result}${r.report.sub_result ? ` (${r.report.sub_result})` : ""}`,
          );

        if (reportDetails.length > 0) {
          details += " - " + reportDetails.join(", ");
        }
      }
    } else if (check.status === "in_progress") {
      kycStatus = "pending";
      details = "Verification in progress";
    } else if (check.status === "awaiting_applicant") {
      kycStatus = "not_started";
      details = "Waiting for applicant to complete verification";
    } else {
      kycStatus = "failed";
      details = "Verification process withdrawn or failed";
    }

    // Update the investor status
    return await updateInvestorVerificationStatus(
      investor.investor_id,
      kycStatus,
      checkId,
      check.applicant_id,
      details,
    );
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return false;
  }
};
