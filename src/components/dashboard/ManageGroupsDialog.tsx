import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users } from "lucide-react";
import { InvestorGroup } from "./InvestorGroups";

interface ManageGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: InvestorGroup[];
  selectedInvestorIds: string[];
  onAddToGroup: (groupId: string, investorIds: string[]) => void;
  onRemoveFromGroup: (groupId: string, investorIds: string[]) => void;
  onCreateGroup: (name: string, investorIds: string[]) => void;
}

const ManageGroupsDialog = ({
  open,
  onOpenChange,
  groups,
  selectedInvestorIds,
  onAddToGroup,
  onRemoveFromGroup,
  onCreateGroup,
}: ManageGroupsDialogProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedGroups, setSelectedGroups] = React.useState<Set<string>>(
    new Set(),
  );
  const [groupsToRemove, setGroupsToRemove] = React.useState<Set<string>>(
    new Set(),
  );
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedGroups(new Set());
      setGroupsToRemove(new Set());
      setShowCreateGroup(false);
      setNewGroupName("");
    }
  }, [open]);

  // Filter groups based on search query
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const handleToggleGroup = (
    groupId: string,
    checked: boolean,
    forRemoval: boolean = false,
  ) => {
    if (forRemoval) {
      const newGroupsToRemove = new Set(groupsToRemove);
      if (checked) {
        newGroupsToRemove.add(groupId);
      } else {
        newGroupsToRemove.delete(groupId);
      }
      setGroupsToRemove(newGroupsToRemove);
    } else {
      const newSelectedGroups = new Set(selectedGroups);
      if (checked) {
        newSelectedGroups.add(groupId);
      } else {
        newSelectedGroups.delete(groupId);
      }
      setSelectedGroups(newSelectedGroups);
    }
  };

  const handleSave = () => {
    // Add investors to selected groups
    Array.from(selectedGroups).forEach((groupId) => {
      onAddToGroup(groupId, selectedInvestorIds);
    });

    // Remove investors from groups marked for removal
    Array.from(groupsToRemove).forEach((groupId) => {
      onRemoveFromGroup(groupId, selectedInvestorIds);
    });

    // Create new group if name is provided
    if (showCreateGroup && newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), selectedInvestorIds);
    }

    onOpenChange(false);
  };

  // Check if investor is already in a group
  const isInvestorInGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return false;

    // Check if ALL selected investors are in this group
    return selectedInvestorIds.every((investorId) =>
      group.investorIds.includes(investorId),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Groups for {selectedInvestorIds.length} Investor
            {selectedInvestorIds.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Add to Groups</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No groups found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGroups.map((group) => {
                      const alreadyInGroup = isInvestorInGroup(group.id);
                      return (
                        <div
                          key={group.id}
                          className="flex items-center space-x-2 py-1 px-1 hover:bg-gray-50 rounded-md"
                        >
                          <Checkbox
                            id={`add-${group.id}`}
                            checked={
                              selectedGroups.has(group.id) || alreadyInGroup
                            }
                            onCheckedChange={(checked) =>
                              handleToggleGroup(group.id, checked as boolean)
                            }
                            disabled={alreadyInGroup}
                          />
                          <Label
                            htmlFor={`add-${group.id}`}
                            className="flex items-center justify-between w-full cursor-pointer"
                          >
                            <span>{group.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {group.investorIds.length}
                              </span>
                              {alreadyInGroup && (
                                <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  Already Added
                                </span>
                              )}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Remove from Groups</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {filteredGroups.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No groups found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGroups.map((group) => {
                      // Only show groups that at least one investor is a member of
                      const hasInvestors = selectedInvestorIds.some((id) =>
                        group.investorIds.includes(id),
                      );

                      if (!hasInvestors) return null;

                      return (
                        <div
                          key={`remove-${group.id}`}
                          className="flex items-center space-x-2 py-1 px-1 hover:bg-gray-50 rounded-md"
                        >
                          <Checkbox
                            id={`remove-${group.id}`}
                            checked={groupsToRemove.has(group.id)}
                            onCheckedChange={(checked) =>
                              handleToggleGroup(
                                group.id,
                                checked as boolean,
                                true,
                              )
                            }
                          />
                          <Label
                            htmlFor={`remove-${group.id}`}
                            className="flex items-center justify-between w-full cursor-pointer"
                          >
                            <span>{group.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {group.investorIds.length}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Create New Group</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setShowCreateGroup(!showCreateGroup)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showCreateGroup ? "Cancel" : "Create New"}
                </Button>
              </div>

              {showCreateGroup && (
                <div className="border rounded-md p-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-group-name">Group Name</Label>
                    <Input
                      id="new-group-name"
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageGroupsDialog;
