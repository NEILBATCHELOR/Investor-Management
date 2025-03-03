import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isValidEmail, isValidEthAddress } from "@/lib/validators";
import {
  investorTypeCategories,
  getInvestorTypeName,
  getAllInvestorTypes,
} from "@/lib/investorTypes";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Investor } from "./InvestorGrid";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Investor>) => void;
  selectedCount: number;
  selectedInvestors?: Investor[];
}

interface FormData {
  name?: string;
  email?: string;
  type?: string;
  walletAddress?: string;
  kycStatus?: "approved" | "pending" | "failed" | "not_started";
}

const EditDialog = ({
  open = false,
  onOpenChange,
  onSave,
  selectedCount,
  selectedInvestors = [],
}: EditDialogProps) => {
  const [formData, setFormData] = React.useState<FormData>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationStatus, setValidationStatus] = React.useState<
    "idle" | "success" | "error"
  >("idle");

  React.useEffect(() => {
    if (selectedInvestors.length === 1) {
      const investor = selectedInvestors[0];
      setFormData({
        name: investor.name,
        email: investor.email,
        type: investor.type,
        walletAddress: investor.walletAddress,
        kycStatus: investor.kycStatus,
      });
    } else {
      setFormData({});
    }
    setTouched({});
    setValidationStatus("idle");
  }, [selectedInvestors, open]);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    if (!value) return "";

    switch (name) {
      case "name":
        return value.trim().length < 2
          ? "Name must be at least 2 characters"
          : "";
      case "email":
        return isValidEmail(value) ? "" : "Invalid email format";
      case "type":
        const validTypes = getAllInvestorTypes().map((t) => t.id);
        return validTypes.includes(value) ? "" : "Invalid investor type";
      case "walletAddress":
        return isValidEthAddress(value) ? "" : "Invalid ETH wallet address";
      case "kycStatus":
        const validStatuses = ["approved", "pending", "failed", "not_started"];
        return validStatuses.includes(value) ? "" : "Invalid KYC status";
      default:
        return "";
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Only validate fields that have values
    Object.entries(formData).forEach(([field, value]) => {
      if (value !== undefined && value !== "") {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const value = formData[field] || "";
    const error = validateField(field, value as string);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSave = () => {
    setIsSubmitting(true);

    // Mark all fields with values as touched for validation
    const newTouched: Record<string, boolean> = {};
    Object.entries(formData).forEach(([field, value]) => {
      if (value !== undefined && value !== "") {
        newTouched[field] = true;
      }
    });
    setTouched(newTouched);

    const isValid = validateAllFields();

    if (isValid) {
      setValidationStatus("success");
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(
          ([_, value]) => value !== undefined && value !== "",
        ),
      );
      onSave(cleanData);
      setIsSubmitting(false);
    } else {
      setValidationStatus("error");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {selectedCount} Investors</DialogTitle>
          <DialogDescription>
            Only filled fields will be updated across all selected investors.
          </DialogDescription>
        </DialogHeader>

        {validationStatus === "error" && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              Please correct the errors before saving changes.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === "success" && (
          <Alert
            variant="success"
            className="mt-2 bg-green-50 text-green-800 border-green-200"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              All fields validated successfully.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={touched.name && errors.name ? "border-red-500" : ""}
            />
            {touched.name && errors.name && (
              <span className="text-sm text-destructive">{errors.name}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={touched.email && errors.email ? "border-red-500" : ""}
            />
            {touched.email && errors.email && (
              <span className="text-sm text-destructive">{errors.email}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Investor Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
              onOpenChange={() => handleBlur("type")}
            >
              <SelectTrigger
                id="type"
                className={touched.type && errors.type ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {investorTypeCategories.map((category) => (
                  <SelectGroup key={category.id}>
                    <SelectLabel>{category.name}</SelectLabel>
                    {category.types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {touched.type && errors.type && (
              <span className="text-sm text-destructive">{errors.type}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              placeholder="Enter ETH wallet address"
              value={formData.walletAddress || ""}
              onChange={(e) => handleChange("walletAddress", e.target.value)}
              onBlur={() => handleBlur("walletAddress")}
              className={
                touched.walletAddress && errors.walletAddress
                  ? "border-red-500"
                  : ""
              }
            />
            {touched.walletAddress && errors.walletAddress && (
              <span className="text-sm text-destructive">
                {errors.walletAddress}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kycStatus">KYC Status</Label>
            <Select
              value={formData.kycStatus}
              onValueChange={(value) => handleChange("kycStatus", value)}
              onOpenChange={() => handleBlur("kycStatus")}
            >
              <SelectTrigger
                id="kycStatus"
                className={
                  touched.kycStatus && errors.kycStatus ? "border-red-500" : ""
                }
              >
                <SelectValue placeholder="Select KYC status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
            {touched.kycStatus && errors.kycStatus && (
              <span className="text-sm text-destructive">
                {errors.kycStatus}
              </span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSubmitting || Object.values(errors).some((error) => error)
            }
          >
            {isSubmitting ? "Validating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
