import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

interface ExportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onExport?: (type: string, format: string) => void;
}

const ExportDialog = ({
  open = true,
  onOpenChange = () => {},
  onExport = () => {},
}: ExportDialogProps) => {
  const [exportType, setExportType] = React.useState("investor-list");
  const [fileFormat, setFileFormat] = React.useState("csv");

  const handleExport = () => {
    onExport(exportType, fileFormat);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose the type of data and format you want to export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Export Type</Label>
            <RadioGroup
              defaultValue={exportType}
              onValueChange={setExportType}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                <RadioGroupItem value="investor-list" id="investor-list" />
                <Label
                  htmlFor="investor-list"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Investor List
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                <RadioGroupItem value="cap-table" id="cap-table" />
                <Label
                  htmlFor="cap-table"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Cap Table
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>File Format</Label>
            <RadioGroup
              defaultValue={fileFormat}
              onValueChange={setFileFormat}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                <RadioGroupItem value="csv" id="csv" />
                <Label
                  htmlFor="csv"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label
                  htmlFor="pdf"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
