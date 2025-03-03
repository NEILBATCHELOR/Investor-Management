import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInvestorTypeName, getCategoryForType } from "@/lib/investorTypes";
import { getKYCStatus } from "@/lib/utils/kyc";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { Investor } from "./InvestorGrid";

interface InvestorDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: Investor | null;
  onEdit?: (investor: Investor) => void;
  onScreenInvestor?: (investorId: string) => void;
}

const statusConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-500",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
  not_started: {
    icon: AlertCircle,
    label: "Not Started",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    iconColor: "text-gray-500",
  },
  expired: {
    icon: AlertCircle,
    label: "Expired",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
} as const;

// Mock transaction history data
const mockTransactionHistory = [
  {
    id: "tx1",
    date: "2024-05-15",
    type: "Token Purchase",
    amount: "5,000 TOKENS",
    status: "Completed",
  },
  {
    id: "tx2",
    date: "2024-04-22",
    type: "KYC Update",
    amount: "",
    status: "Approved",
  },
  {
    id: "tx3",
    date: "2024-03-10",
    type: "Wallet Address Update",
    amount: "",
    status: "Completed",
  },
];

// Mock documents data
const mockDocuments = [
  {
    id: "doc1",
    name: "KYC Verification Document",
    date: "2024-04-22",
    type: "PDF",
  },
  {
    id: "doc2",
    name: "Investment Agreement",
    date: "2024-03-05",
    type: "PDF",
  },
  {
    id: "doc3",
    name: "Accreditation Certificate",
    date: "2024-02-18",
    type: "PDF",
  },
];

const InvestorDetail = ({
  open,
  onOpenChange,
  investor,
  onEdit = () => {},
  onScreenInvestor = () => {},
}: InvestorDetailProps) => {
  if (!investor) return null;

  const effectiveStatus = getKYCStatus(
    investor.kycStatus,
    investor.lastUpdated,
  );
  const statusInfo = statusConfig[effectiveStatus];
  const StatusIcon = statusInfo.icon;
  const investorType = getInvestorTypeName(investor.type);
  const investorCategory = getCategoryForType(investor.type) || "Unknown";

  const needsScreening =
    effectiveStatus === "failed" ||
    effectiveStatus === "not_started" ||
    effectiveStatus === "expired";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{investor.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onEdit(investor)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              {needsScreening && (
                <Button
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onScreenInvestor(investor.id)}
                >
                  <AlertCircle className="h-4 w-4" />
                  Screen
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline" className="text-sm">
              ID: {investor.id}
            </Badge>
            <Badge
              className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} flex items-center gap-1`}
            >
              <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.iconColor}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="w-full justify-start border-b rounded-none px-0 h-auto">
            <TabsTrigger
              value="overview"
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Transaction History
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Documents
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Email
                        </div>
                        <div className="text-sm">{investor.email}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Wallet Address
                        </div>
                        <div className="text-sm font-mono flex items-center gap-1">
                          {investor.walletAddress}
                          <a
                            href={`https://etherscan.io/address/${investor.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Investor Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Category
                        </div>
                        <div className="text-sm">{investorCategory}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Type
                        </div>
                        <div className="text-sm">{investorType}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">KYC/AML Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Status
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`h-4 w-4 ${statusInfo.iconColor}`}
                          />
                          <span className="text-sm">{statusInfo.label}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </div>
                        <div className="text-sm">
                          {investor.lastUpdated || "Never"}
                        </div>
                      </div>
                      {effectiveStatus === "expired" && (
                        <div className="text-sm text-red-600">
                          KYC verification has expired. Please initiate a new
                          screening.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Investment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Total Investment
                        </div>
                        <div className="text-sm">5,000 TOKENS</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">
                          Investment Date
                        </div>
                        <div className="text-sm">2024-05-15</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="p-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-2 px-4 text-left font-medium">
                            Date
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Type
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Amount
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTransactionHistory.map((tx) => (
                          <tr key={tx.id} className="border-b last:border-0">
                            <td className="py-2 px-4">{tx.date}</td>
                            <td className="py-2 px-4">{tx.type}</td>
                            <td className="py-2 px-4">{tx.amount}</td>
                            <td className="py-2 px-4">
                              <Badge variant="outline" className="font-normal">
                                {tx.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="p-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-2 px-4 text-left font-medium">
                            Document Name
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Date
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Type
                          </th>
                          <th className="py-2 px-4 text-left font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b last:border-0">
                            <td className="py-2 px-4">{doc.name}</td>
                            <td className="py-2 px-4">{doc.date}</td>
                            <td className="py-2 px-4">{doc.type}</td>
                            <td className="py-2 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorDetail;
