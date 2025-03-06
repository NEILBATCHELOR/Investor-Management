import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Info, ChevronLeft, ChevronRight } from "lucide-react";
import {
  sortData,
  filterData,
  searchData,
  type SortConfig,
} from "@/lib/utils/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GridToolbar from "./GridToolbar";
import KYCStatusCell from "./KYCStatusCell";
import { getInvestorTypeName } from "@/lib/investorTypes";

export interface Investor {
  id: string;
  name: string;
  email: string;
  type: string;
  walletAddress: string;
  kycStatus: "approved" | "pending" | "failed" | "not_started" | "expired";
  lastUpdated: string;
}

interface InvestorGridProps {
  investors?: Investor[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onBulkEdit?: () => void;
  onBulkDelete?: () => void;
  onScreenInvestor?: (investorId: string) => void;
  onFilterByType?: (typeIds: string[]) => void;
  onFilterByStatus?: (statusIds: string[]) => void;
  onFilterByDateRange?: (
    field: string,
    dateRange: { from: Date | undefined; to: Date | undefined },
  ) => void;
  onViewInvestor?: (investorId: string) => void;
  setShowAddToGroupDialog?: (show: boolean) => void;
}

import { sampleInvestors } from "@/lib/sampleData";

const defaultInvestors: Investor[] = sampleInvestors;

const SEARCHABLE_COLUMNS = ["name", "email", "type", "walletAddress"];

const InvestorGrid = ({
  investors = defaultInvestors,
  onSelectionChange = () => {},
  onSearch = () => {},
  onFilter = () => {},
  onBulkEdit = () => {},
  onBulkDelete = () => {},
  onScreenInvestor = () => {},
  onFilterByType = () => {},
  onFilterByStatus = () => {},
  onFilterByDateRange = () => {},
  onViewInvestor = () => {},
  setShowAddToGroupDialog = () => {},
}: InvestorGridProps) => {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(100);

  const handleSort = (key: string) => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  // Apply sorting, filtering, and searching
  const processedData = React.useMemo(() => {
    let result = [...investors];
    result = searchData(result, searchQuery, SEARCHABLE_COLUMNS);
    result = filterData(result, filters);
    result = sortData(result, sortConfig);
    return result;
  }, [investors, searchQuery, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked
      ? new Set(paginatedData.map((i) => i.id))
      : new Set();
    setSelectedRows(newSelection);
    onSelectionChange(Array.from(newSelection));
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
    onSelectionChange(Array.from(newSelection));
  };

  // We don't need this useEffect as we're already calling onSelectionChange in the handlers

  const handleFilterByStatus = (statusIds: string[]) => {
    setFilters((prev) => ({ ...prev, kycStatus: statusIds }));
    onFilterByStatus(statusIds);
  };

  return (
    <div className="w-full h-full bg-white border rounded-lg overflow-hidden flex flex-col">
      <GridToolbar
        onSearch={handleSearch}
        onFilter={onFilter}
        onBulkEdit={onBulkEdit}
        onBulkDelete={onBulkDelete}
        onFilterByType={onFilterByType}
        onFilterByStatus={handleFilterByStatus}
        onFilterByDateRange={onFilterByDateRange}
        selectedCount={selectedRows.size}
        setShowAddToGroupDialog={setShowAddToGroupDialog}
      />
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Checkbox
                        checked={
                          paginatedData.length > 0 &&
                          selectedRows.size >= paginatedData.length &&
                          paginatedData.every((i) => selectedRows.has(i.id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Select all {paginatedData.length} investors on this page
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="h-8 flex items-center gap-1"
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("email")}
                  className="h-8 flex items-center gap-1"
                >
                  Email
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("type")}
                  className="h-8 flex items-center gap-1"
                >
                  Type
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("walletAddress")}
                  className="h-8 flex items-center gap-1"
                >
                  Wallet Address
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("kycStatus")}
                  className="h-8 flex items-center gap-1"
                >
                  KYC Status
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((investor) => (
              <TableRow
                key={investor.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewInvestor && onViewInvestor(investor.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedRows.has(investor.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(investor.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{investor.name}</TableCell>
                <TableCell>{investor.email}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 cursor-help">
                        <span className="truncate max-w-[150px]">
                          {getInvestorTypeName(investor.type)}
                        </span>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getInvestorTypeName(investor.type)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {investor.walletAddress}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <KYCStatusCell
                    status={investor.kycStatus}
                    lastUpdated={investor.lastUpdated}
                    onScreenInvestor={() => onScreenInvestor(investor.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {Math.min(processedData.length, (currentPage - 1) * pageSize + 1)}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(processedData.length, currentPage * pageSize)}
            </span>{" "}
            of <span className="font-medium">{processedData.length}</span>{" "}
            investors
          </span>

          <select
            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="mx-1">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvestorGrid;
