import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ScreeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScreen: (status: string) => Promise<void>;
  investorName: string;
}

const ScreeningDialog = ({
  open,
  onOpenChange,
  onScreen,
  investorName,
}: ScreeningDialogProps) => {
  const [selectedStatus, setSelectedStatus] = React.useState<string>("pending");

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleScreen = async () => {
    try {
      setIsProcessing(true);
      await onScreen(selectedStatus);
      onOpenChange(false);
    } catch (error) {
      // Error will be handled by the parent component
      console.error("Error in handleScreen:", error);
      // Don't close the dialog on error
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Screen Investor: {investorName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>KYC Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleScreen} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScreeningDialog;
