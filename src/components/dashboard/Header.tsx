import React from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Users,
  Plus,
  ShieldCheck,
  BarChart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onImportClick?: () => void;
  onExportInvestorList?: () => void;
  onExportCapTable?: () => void;
  onCreateGroupClick?: () => void;
  onBatchScreeningClick?: () => void;
  onViewCapTable?: () => void;
}

const Header = ({
  onImportClick = () => {},
  onExportInvestorList = () => {},
  onExportCapTable = () => {},
  onCreateGroupClick = () => {},
  onBatchScreeningClick = () => {},
  onViewCapTable = () => {},
}: HeaderProps) => {
  return (
    <div className="w-full h-[72px] bg-white border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Investor Management
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onBatchScreeningClick}
          className="flex items-center gap-2"
          variant="outline"
        >
          <ShieldCheck className="h-4 w-4" />
          Batch KYC Screening
        </Button>

        <Button
          onClick={onCreateGroupClick}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Users className="h-4 w-4" />
          <Plus className="h-3 w-3" />
          New Group
        </Button>

        <Button
          onClick={onImportClick}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportInvestorList}>
              Export Investor List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCapTable}>
              Export Cap Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onViewCapTable}>
              View Cap Table Visualization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
