import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, FileWarning, CheckCircle2, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { parseCSV, downloadTemplate } from "@/lib/csv";
import { ValidationError } from "@/lib/validators";

interface ImportDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onUpload?: (data: any[]) => void;
}

const ImportDialog = ({
  isOpen = true,
  onClose = () => {},
  onUpload = () => {},
}: ImportDialogProps) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<
    "idle" | "uploading" | "error" | "success"
  >("idle");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [validationErrors, setValidationErrors] = React.useState<
    ValidationError[]
  >([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv") {
      setFile(droppedFile);
      handleUpload(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "text/csv") {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file: File) => {
    setUploadStatus("uploading");
    setUploadProgress(30);

    try {
      const { data, errors } = await parseCSV(file);
      setUploadProgress(60);

      if (errors.length > 0) {
        setValidationErrors(errors);
        setUploadStatus("error");
        return;
      }

      setUploadProgress(100);
      setUploadStatus("success");
      onUpload(data);
    } catch (error) {
      setUploadStatus("error");
      setValidationErrors([
        {
          row: 0,
          column: "",
          value: "",
          message: "Failed to parse CSV file",
        },
      ]);
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Import Investors</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {uploadStatus === "idle" && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="mb-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    Drag and drop your CSV file here, or
                    <label className="mx-1 text-primary hover:underline cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileInput}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported format: CSV up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium">{file?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetState}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500">
                Uploading and validating file...
              </p>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <FileWarning className="h-5 w-5" />
                <span className="text-sm font-medium">Upload failed</span>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive mb-1">
                    Row {error.row}: {error.message} (value: {error.value})
                  </p>
                ))}
              </div>
              <Button onClick={resetState} variant="secondary">
                Try Again
              </Button>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Upload successful</span>
              </div>
              <p className="text-sm text-gray-500">
                Your file has been successfully uploaded and validated.
              </p>
              <Button onClick={onClose}>Continue</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
