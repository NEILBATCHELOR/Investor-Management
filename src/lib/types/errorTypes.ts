export interface ErrorDetails {
  type: ErrorType;
  message: string;
  details?: string;
  resolutionSteps?: string[];
  technicalDetails?: any;
  retryable: boolean;
}

export type ErrorType =
  | "network"
  | "authorization"
  | "validation"
  | "database"
  | "kyc_service"
  | "unknown";

export const getErrorTypeFromError = (error: any): ErrorType => {
  if (!error) return "unknown";

  // Network errors
  if (
    error.message?.includes("network") ||
    error.message?.includes("connection") ||
    error.code === "ECONNREFUSED" ||
    error.name === "NetworkError"
  ) {
    return "network";
  }

  // Authorization errors
  if (
    error.status === 401 ||
    error.status === 403 ||
    error.code === "PGRST301" ||
    error.message?.toLowerCase().includes("permission") ||
    error.message?.toLowerCase().includes("unauthorized")
  ) {
    return "authorization";
  }

  // Validation errors
  if (
    error.status === 422 ||
    error.message?.toLowerCase().includes("validation") ||
    error.message?.toLowerCase().includes("invalid")
  ) {
    return "validation";
  }

  // Database errors
  if (
    error.code?.startsWith("23") || // PostgreSQL constraint errors
    error.code?.startsWith("42") || // PostgreSQL syntax errors
    error.message?.toLowerCase().includes("database") ||
    error.message?.toLowerCase().includes("db error")
  ) {
    return "database";
  }

  // KYC service errors
  if (
    error.message?.toLowerCase().includes("kyc") ||
    error.message?.toLowerCase().includes("screening")
  ) {
    return "kyc_service";
  }

  return "unknown";
};

export const createErrorDetails = (error: any): ErrorDetails => {
  const errorType = getErrorTypeFromError(error);
  let details: ErrorDetails = {
    type: errorType,
    message: error?.message || "An unknown error occurred",
    details: error?.details || error?.hint || undefined,
    technicalDetails: error,
    retryable: false,
  };

  // Add resolution steps based on error type
  switch (errorType) {
    case "network":
      details.message = "Network connection error";
      details.resolutionSteps = [
        "Check your internet connection",
        "Verify the server is running",
        "Try again in a few moments",
      ];
      details.retryable = true;
      break;

    case "authorization":
      details.message = "Authorization error";
      details.resolutionSteps = [
        "Verify you have the correct permissions",
        "Try logging out and back in",
        "Contact your administrator if the problem persists",
      ];
      details.retryable = false;
      break;

    case "validation":
      details.message = "Validation error";
      details.resolutionSteps = [
        "Check the input data for errors",
        "Ensure all required fields are filled correctly",
      ];
      details.retryable = true;
      break;

    case "database":
      details.message = "Database error";
      details.resolutionSteps = [
        "Try again with different data",
        "Contact support if the problem persists",
      ];
      details.retryable = false;
      break;

    case "kyc_service":
      details.message = "KYC service error";
      details.resolutionSteps = [
        "Verify the KYC service is available",
        "Check investor information for accuracy",
        "Try screening again in a few minutes",
      ];
      details.retryable = true;
      break;

    default:
      details.message = "An unexpected error occurred";
      details.resolutionSteps = [
        "Try again",
        "Contact support if the problem persists",
      ];
      details.retryable = true;
  }

  return details;
};
