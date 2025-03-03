import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle, RefreshCw, Info } from "lucide-react";
import { ErrorDetails } from "@/lib/types/errorTypes";

interface ErrorAlertProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const ErrorAlert = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
}: ErrorAlertProps) => {
  const [expanded, setExpanded] = React.useState(false);

  const getIcon = () => {
    switch (error.type) {
      case "network":
        return <RefreshCw className="h-4 w-4" />;
      case "validation":
        return <Info className="h-4 w-4" />;
      case "authorization":
      case "database":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (error.type) {
      case "validation":
      case "network":
        return "default";
      case "authorization":
      case "database":
      case "kyc_service":
        return "destructive";
      default:
        return "destructive";
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle className="flex items-center justify-between">
        <span>{error.message}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onDismiss}
          >
            <XCircle className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          {error.details && <p className="text-sm mb-2">{error.details}</p>}

          {error.resolutionSteps && error.resolutionSteps.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Try the following:</p>
              <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                {error.resolutionSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs"
              >
                {expanded ? "Hide" : "Show"} Technical Details
              </Button>

              {expanded && (
                <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(error.technicalDetails, null, 2)}
                </pre>
              )}
            </div>
          )}

          {error.retryable && onRetry && (
            <div className="mt-3">
              <Button size="sm" onClick={onRetry} className="mr-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export { ErrorAlert };
