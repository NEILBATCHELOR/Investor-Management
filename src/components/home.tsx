import React from "react";
import Header from "./dashboard/Header";
import InvestorGrid from "./dashboard/InvestorGrid";
import ImportDialog from "./dashboard/ImportDialog";
import ExportDialog from "./dashboard/ExportDialog";
import ConfirmDialog from "./dashboard/ConfirmDialog";
import EditDialog from "./dashboard/EditDialog";
import AddInvestorDialog from "./dashboard/AddInvestorDialog";
import ScreeningDialog from "./dashboard/ScreeningDialog";
import BatchScreeningDialog from "./dashboard/BatchScreeningDialog";
import InvestorGroups, { InvestorGroup } from "./dashboard/InvestorGroups";
import GroupDialog from "./dashboard/GroupDialog";
import InvestorDetail from "./dashboard/InvestorDetail";
import RemoveFromGroupDialog from "./dashboard/RemoveFromGroupDialog";
import ManageGroupsDialog from "./dashboard/ManageGroupsDialog";
import CapTableVisualization from "./dashboard/CapTableVisualization";
import { ErrorAlert } from "@/components/ui/error-alert";
import { ErrorDetails, createErrorDetails } from "@/lib/types/errorTypes";
import {
  fetchInvestors,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addInvestorsToGroup,
  removeInvestorsFromGroup,
  bulkUpdateInvestors,
  bulkDeleteInvestors,
  bulkCreateInvestors,
} from "@/lib/services/investorService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface HomeProps {
  onImportComplete?: (data: any) => void;
  onExportComplete?: (type: string, format: string) => void;
}

// Default investors are now loaded from Supabase

const Home = ({
  onImportComplete = () => {},
  onExportComplete = () => {},
}: HomeProps) => {
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showCapTableVisualization, setShowCapTableVisualization] =
    React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showAddInvestorDialog, setShowAddInvestorDialog] =
    React.useState(false);
  const [showScreeningDialog, setShowScreeningDialog] = React.useState(false);
  const [showBatchScreeningDialog, setShowBatchScreeningDialog] =
    React.useState(false);
  const [showInvestorDetailDialog, setShowInvestorDetailDialog] =
    React.useState(false);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showAddToGroupDialog, setShowAddToGroupDialog] = React.useState(false);
  const [selectedInvestorForScreening, setSelectedInvestorForScreening] =
    React.useState<string | null>(null);
  const [selectedInvestorForDetail, setSelectedInvestorForDetail] =
    React.useState<string | null>(null);
  const [selectedInvestors, setSelectedInvestors] = React.useState<string[]>(
    [],
  );
  const [investors, setInvestors] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<InvestorGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<ErrorDetails | null>(null);
  const [retryFunction, setRetryFunction] = React.useState<
    (() => Promise<void>) | null
  >(null);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(
    null,
  );
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  const handleFilterByType = (typeIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      type: typeIds,
    }));
  };

  const handleFilterByStatus = (statusIds: string[]) => {
    setFilters((prev) => ({
      ...prev,
      kycStatus: statusIds,
    }));
  };

  const handleFilterByDateRange = (
    field: string,
    dateRange: { from: Date | undefined; to: Date | undefined },
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: dateRange,
    }));
  };

  // Load data from Supabase
  const loadInvestors = async () => {
    try {
      setLoading(true);
      setError(null);
      const investorsData = await fetchInvestors();
      setInvestors(investorsData);
    } catch (error) {
      console.error("Error loading investors:", error);
      const errorDetails = createErrorDetails(error);
      errorDetails.message = "Failed to load investors";
      setError(errorDetails);
      setRetryFunction(() => loadInvestors);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const groupsData = await fetchGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error("Error loading groups:", error);
      const errorDetails = createErrorDetails(error);
      errorDetails.message = "Failed to load investor groups";
      setError(errorDetails);
      setRetryFunction(() => loadGroups);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    loadInvestors();
    loadGroups();
  }, []);

  // No need for event listener anymore, we'll pass the setter directly to GridToolbar

  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  const handleExportClick = (type: string) => {
    if (type === "cap-table") {
      if (selectedInvestors.length > 0) {
        // Export selected investors directly
        handleExport("selected-investors", "csv");
      } else {
        // Show a message that no investors are selected
        const errorDetails = createErrorDetails(
          new Error("No investors selected"),
        );
        errorDetails.message = "No investors selected";
        errorDetails.details = "Please select at least one investor to export.";
        errorDetails.type = "validation";
        setError(errorDetails);
      }
    } else {
      // Export all investors directly
      handleExport("all-investors", "csv");
    }
  };

  const handleExport = (type: string, format: string) => {
    const dataToExport =
      type === "selected-investors"
        ? investors.filter((inv) => selectedInvestors.includes(inv.id))
        : investors;

    if (format === "csv") {
      // Format headers to be more readable
      const headerMap = {
        id: "Investor ID",
        name: "Name",
        email: "Email",
        type: "Type",
        kycStatus: "KYC Status",
        walletAddress: "Wallet",
        lastUpdated: "Last Updated",
      };

      const fields =
        type === "cap-table"
          ? ["id", "name", "email", "type", "kycStatus", "walletAddress"]
          : [
              "name",
              "email",
              "type",
              "walletAddress",
              "kycStatus",
              "lastUpdated",
            ];

      // Use formatted headers and quote them
      const headers = fields
        .map((field) => `"${headerMap[field as keyof typeof headerMap]}"`)
        .join(",");

      // Format the data
      const rows = dataToExport.map((inv) => {
        // Add quotes around each field to handle commas in values
        return fields
          .map((field) => {
            const value = inv[field as keyof typeof inv];
            // Format KYC status to be more readable
            if (field === "kycStatus") {
              return `"${value
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}"`;
            }
            // Quote all values to handle special characters
            return `"${value}"`;
          })
          .join(",");
      });
      const csv = [headers, ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type}-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = async (data: any[]) => {
    try {
      await bulkCreateInvestors(data);
      await loadInvestors();
      setShowImportDialog(false);
      onImportComplete(data);
    } catch (error) {
      console.error("Error uploading investors:", error);
      const errorDetails = createErrorDetails(error);
      errorDetails.message = "Failed to upload investors";
      errorDetails.details =
        "There was an error saving the imported investors to the database.";
      errorDetails.resolutionSteps = [
        "Check that all investor data is valid",
        "Verify your connection to the database",
        "Try uploading a smaller batch of investors",
      ];
      setError(errorDetails);
      setRetryFunction(() => () => handleFileUpload(data));
    }
  };

  const selectedInvestorData = React.useMemo(() => {
    return investors.filter((investor) =>
      selectedInvestors.includes(investor.id),
    );
  }, [investors, selectedInvestors]);

  // Filter investors by selected group
  const filteredInvestors = React.useMemo(() => {
    if (!selectedGroupId) return investors;
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return investors;
    return investors.filter((investor) =>
      group.investorIds.includes(investor.id),
    );
  }, [investors, groups, selectedGroupId]);

  // Group management functions
  const handleCreateGroup = async (name: string, investorIds: string[]) => {
    try {
      const newGroup = await createGroup(name, investorIds);
      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.id);
    } catch (error) {
      console.error("Error creating group:", error);
      setError(createErrorDetails(error));
    }
  };

  const handleUpdateGroup = async (groupId: string, name: string) => {
    try {
      await updateGroup(groupId, name);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, name } : group,
        ),
      );
    } catch (error) {
      console.error("Error updating group:", error);
      setError(createErrorDetails(error));
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      setError(createErrorDetails(error));
    }
  };

  const handleAddToGroup = async (groupId: string, investorIds: string[]) => {
    if (investorIds.length === 0) return;

    try {
      await addInvestorsToGroup(groupId, investorIds);
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === groupId) {
            // Add only investors that aren't already in the group
            const newInvestorIds = [
              ...new Set([...group.investorIds, ...investorIds]),
            ];
            return { ...group, investorIds: newInvestorIds };
          }
          return group;
        }),
      );
    } catch (error) {
      console.error("Error adding to group:", error);
      setError(createErrorDetails(error));
    }
  };

  const handleRemoveFromGroup = async (
    groupId: string,
    investorIds: string[],
  ) => {
    if (investorIds.length === 0) return;

    try {
      await removeInvestorsFromGroup(groupId, investorIds);
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === groupId) {
            // Remove the specified investors from the group
            const newInvestorIds = group.investorIds.filter(
              (id) => !investorIds.includes(id),
            );
            return { ...group, investorIds: newInvestorIds };
          }
          return group;
        }),
      );
    } catch (error) {
      console.error("Error removing from group:", error);
      setError(createErrorDetails(error));
    }
  };

  const handleUpdateInvestors = async (data: Partial<any>) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const updatedData = { ...data, lastUpdated: currentDate };

      // Validate KYC status if it's being updated
      if (updatedData.kycStatus) {
        const validStatuses = [
          "approved",
          "pending",
          "failed",
          "not_started",
          "expired",
        ];
        if (!validStatuses.includes(updatedData.kycStatus)) {
          throw new Error(
            `Invalid KYC status: ${updatedData.kycStatus}. Must be one of: ${validStatuses.join(", ")}`,
          );
        }
      }

      await bulkUpdateInvestors(selectedInvestors, updatedData);

      setInvestors((prev) =>
        prev.map((investor) => {
          if (selectedInvestors.includes(investor.id)) {
            return {
              ...investor,
              ...data,
              lastUpdated: currentDate,
            };
          }
          return investor;
        }),
      );
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating investors:", error);
      const errorDetails = createErrorDetails(error);
      errorDetails.message = "Failed to update investors";
      errorDetails.details = `Could not update ${selectedInvestors.length} selected investor${selectedInvestors.length === 1 ? "" : "s"}.`;

      // Check for validation errors
      if (error.code === "23514" || error.message?.includes("validation")) {
        errorDetails.type = "validation";
        errorDetails.details = "The data you provided did not pass validation.";
        errorDetails.resolutionSteps = [
          "Check that all fields have valid values",
          "Ensure email addresses are in the correct format",
          "Verify wallet addresses are valid",
        ];
      } else {
        errorDetails.resolutionSteps = [
          "Check your database connection",
          "Verify you have permission to update records",
          "Try again with different data",
        ];
      }

      setError(errorDetails);

      // Set up retry function
      const investorsToUpdate = [...selectedInvestors];
      const dataToUpdate = { ...data };
      setRetryFunction(() => async () => {
        try {
          const currentDate = new Date().toISOString().split("T")[0];
          const updatedData = { ...dataToUpdate, lastUpdated: currentDate };

          await bulkUpdateInvestors(investorsToUpdate, updatedData);

          setInvestors((prev) =>
            prev.map((investor) => {
              if (investorsToUpdate.includes(investor.id)) {
                return {
                  ...investor,
                  ...dataToUpdate,
                  lastUpdated: currentDate,
                };
              }
              return investor;
            }),
          );
          setShowEditDialog(false);
          setError(null);
        } catch (retryError) {
          console.error("Error in retry updating investors:", retryError);
          const retryErrorDetails = createErrorDetails(retryError);
          retryErrorDetails.message = "Failed to update investors on retry";
          setError(retryErrorDetails);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {error && (
        <ErrorAlert
          error={error}
          onDismiss={() => setError(null)}
          onRetry={
            retryFunction
              ? () => {
                  if (retryFunction) retryFunction();
                }
              : undefined
          }
          showDetails={true}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Header
            onImportClick={handleImportClick}
            onExportInvestorList={() => handleExportClick("investor-list")}
            onExportCapTable={() => handleExportClick("cap-table")}
            onViewCapTable={() => setShowCapTableVisualization(true)}
            onCreateGroupClick={() => setShowCreateDialog(true)}
            onBatchScreeningClick={() => setShowBatchScreeningDialog(true)}
            onAddInvestorClick={() => setShowAddInvestorDialog(true)}
          />

          <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
            <div className="flex gap-6">
              <div className="w-48 flex-shrink-0">
                <InvestorGroups
                  groups={groups}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={setSelectedGroupId}
                  onCreateGroup={handleCreateGroup}
                  onUpdateGroup={handleUpdateGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onAddToGroup={handleAddToGroup}
                  onRemoveFromGroup={handleRemoveFromGroup}
                  selectedInvestorIds={selectedInvestors}
                  investors={investors}
                />
              </div>
              <div className="flex-1">
                <InvestorGrid
                  investors={filteredInvestors}
                  onSelectionChange={setSelectedInvestors}
                  onBulkEdit={() => setShowEditDialog(true)}
                  onBulkDelete={() => {
                    if (selectedInvestors.length > 0) {
                      setShowConfirmDialog(true);
                    }
                  }}
                  onScreenInvestor={(investorId) => {
                    setSelectedInvestorForScreening(investorId);
                    setShowScreeningDialog(true);
                  }}
                  onFilterByType={handleFilterByType}
                  onFilterByStatus={handleFilterByStatus}
                  onFilterByDateRange={handleFilterByDateRange}
                  onViewInvestor={(investorId) => {
                    setSelectedInvestorForDetail(investorId);
                    setShowInvestorDetailDialog(true);
                  }}
                  setShowAddToGroupDialog={setShowAddToGroupDialog}
                />
              </div>
            </div>
          </main>

          <ImportDialog
            isOpen={showImportDialog}
            onClose={() => setShowImportDialog(false)}
            onUpload={handleFileUpload}
          />

          <ExportDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            onExport={handleExport}
          />

          <AddInvestorDialog
            open={showAddInvestorDialog}
            onOpenChange={setShowAddInvestorDialog}
            onSave={async (investorData) => {
              try {
                console.log(
                  "Attempting to create investor with data:",
                  investorData,
                );

                // Format the data correctly for the database
                const insertData = {
                  name: investorData.name,
                  email: investorData.email,
                  type: investorData.type,
                  wallet_address: investorData.walletAddress,
                  kyc_status: investorData.kycStatus,
                  lastUpdated: investorData.lastUpdated,
                  verification_details: {},
                };

                console.log("Formatted data for insertion:", insertData);

                const { data, error } = await supabase
                  .from("investors")
                  .insert(insertData);

                if (error) {
                  console.error("Database error adding investor:", error);
                  throw error;
                }

                console.log("Successfully added investor:", data);
                await loadInvestors();
                setShowAddInvestorDialog(false);
              } catch (error) {
                console.error("Error adding investor:", error);
                const errorDetails = createErrorDetails(error);
                errorDetails.message = "Failed to add investor";
                errorDetails.details = `Database error: ${error.message || "Unknown error"}`;
                setError(errorDetails);
              }
            }}
          />

          <ConfirmDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            title="Delete Investors"
            description={`Are you sure you want to delete ${selectedInvestors.length} selected investor${selectedInvestors.length === 1 ? "" : "s"}?`}
            confirmText="Delete"
            onConfirm={async () => {
              try {
                await bulkDeleteInvestors(selectedInvestors);
                setInvestors((prev) =>
                  prev.filter(
                    (investor) => !selectedInvestors.includes(investor.id),
                  ),
                );
                setSelectedInvestors([]);
                setShowConfirmDialog(false);
              } catch (error) {
                console.error("Error deleting investors:", error);
                const errorDetails = createErrorDetails(error);
                errorDetails.message = "Failed to delete investors";
                errorDetails.details = `Could not delete ${selectedInvestors.length} selected investor${selectedInvestors.length === 1 ? "" : "s"}.`;

                if (error.code === "23503") {
                  // Foreign key constraint error
                  errorDetails.details =
                    "Cannot delete investors that are referenced by other records.";
                  errorDetails.resolutionSteps = [
                    "Remove investors from all groups first",
                    "Delete any related records before deleting investors",
                  ];
                } else {
                  errorDetails.resolutionSteps = [
                    "Check your database connection",
                    "Verify you have permission to delete records",
                    "Try again in a few moments",
                  ];
                }

                setError(errorDetails);

                // Set up retry function
                const investorsToDelete = [...selectedInvestors];
                setRetryFunction(() => async () => {
                  try {
                    await bulkDeleteInvestors(investorsToDelete);
                    setInvestors((prev) =>
                      prev.filter(
                        (investor) => !investorsToDelete.includes(investor.id),
                      ),
                    );
                    setSelectedInvestors([]);
                    setShowConfirmDialog(false);
                    setError(null);
                  } catch (retryError) {
                    console.error(
                      "Error in retry deleting investors:",
                      retryError,
                    );
                    const retryErrorDetails = createErrorDetails(retryError);
                    retryErrorDetails.message =
                      "Failed to delete investors on retry";
                    setError(retryErrorDetails);
                  }
                });
              }
            }}
          />

          <EditDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            selectedCount={selectedInvestors.length}
            selectedInvestors={selectedInvestorData}
            onSave={handleUpdateInvestors}
          />

          <ScreeningDialog
            open={showScreeningDialog}
            onOpenChange={setShowScreeningDialog}
            onScreen={async (status) => {
              if (selectedInvestorForScreening) {
                try {
                  const currentDate = new Date().toISOString().split("T")[0];
                  await bulkUpdateInvestors([selectedInvestorForScreening], {
                    kycStatus: status as any,
                    lastUpdated: currentDate,
                  });

                  setInvestors((prev) =>
                    prev.map((investor) => {
                      if (investor.id === selectedInvestorForScreening) {
                        return {
                          ...investor,
                          kycStatus: status as typeof investor.kycStatus,
                          lastUpdated: currentDate,
                        };
                      }
                      return investor;
                    }),
                  );
                  setShowScreeningDialog(false);
                  setSelectedInvestorForScreening(null);
                } catch (error) {
                  console.error("Error updating KYC status:", error);
                  const errorDetails = createErrorDetails(error);
                  errorDetails.type = "kyc_service";
                  errorDetails.message = "Failed to update KYC status";
                  errorDetails.details = `Could not update KYC status for investor ${investors.find((i) => i.id === selectedInvestorForScreening)?.name || ""}.`;
                  errorDetails.resolutionSteps = [
                    "Check that the KYC service is available",
                    "Verify the investor information is correct",
                    "Try again in a few moments",
                  ];
                  setError(errorDetails);

                  // Set up retry function
                  const investorId = selectedInvestorForScreening;
                  setRetryFunction(() => async () => {
                    if (investorId) {
                      try {
                        const currentDate = new Date()
                          .toISOString()
                          .split("T")[0];
                        await bulkUpdateInvestors([investorId], {
                          kycStatus: status as any,
                          lastUpdated: currentDate,
                        });

                        setInvestors((prev) =>
                          prev.map((investor) => {
                            if (investor.id === investorId) {
                              return {
                                ...investor,
                                kycStatus: status as typeof investor.kycStatus,
                                lastUpdated: currentDate,
                              };
                            }
                            return investor;
                          }),
                        );
                        setError(null);
                        setShowScreeningDialog(false);
                        setSelectedInvestorForScreening(null);
                      } catch (retryError) {
                        console.error(
                          "Error in retry updating KYC status:",
                          retryError,
                        );
                        const retryErrorDetails =
                          createErrorDetails(retryError);
                        retryErrorDetails.type = "kyc_service";
                        retryErrorDetails.message =
                          "Failed to update KYC status on retry";
                        setError(retryErrorDetails);
                      }
                    }
                  });
                }
              }
            }}
            investorName={
              selectedInvestorForScreening
                ? investors.find((i) => i.id === selectedInvestorForScreening)
                    ?.name || ""
                : ""
            }
            investor={
              selectedInvestorForScreening
                ? investors.find(
                    (i) => i.id === selectedInvestorForScreening,
                  ) || null
                : null
            }
          />

          <BatchScreeningDialog
            open={showBatchScreeningDialog}
            onOpenChange={setShowBatchScreeningDialog}
            investors={investors}
            onScreen={async (investorIds, status) => {
              try {
                const currentDate = new Date().toISOString().split("T")[0];
                await bulkUpdateInvestors(investorIds, {
                  kycStatus: status as any,
                  lastUpdated: currentDate,
                });

                setInvestors((prev) =>
                  prev.map((investor) => {
                    if (investorIds.includes(investor.id)) {
                      return {
                        ...investor,
                        kycStatus: status as typeof investor.kycStatus,
                        lastUpdated: currentDate,
                      };
                    }
                    return investor;
                  }),
                );
              } catch (error) {
                console.error("Error updating batch KYC status:", error);
                const errorDetails = createErrorDetails(error);
                errorDetails.type = "kyc_service";
                errorDetails.message = "Failed to update KYC status for batch";
                errorDetails.details = `Could not update KYC status for ${investorIds.length} investors.`;

                // Check if it's a partial failure
                const failedIds = error.failedIds || [];
                if (
                  failedIds.length > 0 &&
                  failedIds.length < investorIds.length
                ) {
                  errorDetails.details = `Successfully updated ${investorIds.length - failedIds.length} investors, but failed for ${failedIds.length} investors.`;
                }

                errorDetails.resolutionSteps = [
                  "Check that the KYC service is available",
                  "Try processing a smaller batch of investors",
                  "Verify all investor information is correct",
                ];
                setError(errorDetails);

                // Set up retry function for the batch
                const idsToRetry = [...investorIds];
                setRetryFunction(() => async () => {
                  try {
                    const currentDate = new Date().toISOString().split("T")[0];
                    await bulkUpdateInvestors(idsToRetry, {
                      kycStatus: status as any,
                      lastUpdated: currentDate,
                    });

                    setInvestors((prev) =>
                      prev.map((investor) => {
                        if (idsToRetry.includes(investor.id)) {
                          return {
                            ...investor,
                            kycStatus: status as typeof investor.kycStatus,
                            lastUpdated: currentDate,
                          };
                        }
                        return investor;
                      }),
                    );
                    setError(null);
                  } catch (retryError) {
                    console.error(
                      "Error in retry updating batch KYC status:",
                      retryError,
                    );
                    const retryErrorDetails = createErrorDetails(retryError);
                    retryErrorDetails.type = "kyc_service";
                    retryErrorDetails.message =
                      "Failed to update KYC status on retry";
                    setError(retryErrorDetails);
                  }
                });
              }
            }}
          />

          <GroupDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSave={(name) => handleCreateGroup(name, selectedInvestors)}
            title="Create Investor Group"
          />

          {/* Investor Detail Dialog */}
          {selectedInvestorForDetail && (
            <InvestorDetail
              open={showInvestorDetailDialog}
              onOpenChange={setShowInvestorDetailDialog}
              investor={
                investors.find((i) => i.id === selectedInvestorForDetail) ||
                null
              }
              onEdit={(investor) => {
                setSelectedInvestors([investor.id]);
                setShowInvestorDetailDialog(false);
                setShowEditDialog(true);
              }}
              onScreenInvestor={(investorId) => {
                setSelectedInvestorForScreening(investorId);
                setShowInvestorDetailDialog(false);
                setShowScreeningDialog(true);
              }}
            />
          )}

          {/* Manage Groups Dialog */}
          <ManageGroupsDialog
            open={showAddToGroupDialog}
            onOpenChange={setShowAddToGroupDialog}
            groups={groups}
            selectedInvestorIds={selectedInvestors}
            onAddToGroup={handleAddToGroup}
            onRemoveFromGroup={handleRemoveFromGroup}
            onCreateGroup={handleCreateGroup}
          />

          {/* Cap Table Visualization Dialog */}
          <Dialog
            open={showCapTableVisualization}
            onOpenChange={setShowCapTableVisualization}
          >
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <BarChart className="h-6 w-6" />
                    Cap Table Visualization
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <CapTableVisualization investors={investors} />
              </div>
              <DialogFooter className="px-6 py-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCapTableVisualization(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Home;
