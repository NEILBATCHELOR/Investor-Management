import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  UserMinus,
} from "lucide-react";
import GroupDialog from "./GroupDialog";
import ConfirmDialog from "./ConfirmDialog";
import RemoveFromGroupDialog from "./RemoveFromGroupDialog";

export interface InvestorGroup {
  id: string;
  name: string;
  investorIds: string[];
}

interface InvestorGroupsProps {
  groups: InvestorGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (name: string, investorIds: string[]) => void;
  onUpdateGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddToGroup: (groupId: string, investorIds: string[]) => void;
  onRemoveFromGroup: (groupId: string, investorIds: string[]) => void;
  selectedInvestorIds: string[];
  investors: Array<{ id: string; name: string }>;
}

const InvestorGroups = ({
  groups = [],
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddToGroup,
  onRemoveFromGroup,
  selectedInvestorIds = [],
  investors = [],
}: InvestorGroupsProps) => {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
  const [groupToEdit, setGroupToEdit] = React.useState<InvestorGroup | null>(
    null,
  );

  const handleCreateGroup = (name: string) => {
    onCreateGroup(name, selectedInvestorIds);
  };

  const handleRenameGroup = (name: string) => {
    if (groupToEdit) {
      onUpdateGroup(groupToEdit.id, name);
    }
  };

  const handleDeleteGroup = () => {
    if (groupToEdit) {
      onDeleteGroup(groupToEdit.id);
      if (selectedGroupId === groupToEdit.id) {
        onSelectGroup(null);
      }
    }
  };

  const openRenameDialog = (group: InvestorGroup) => {
    setGroupToEdit(group);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (group: InvestorGroup) => {
    setGroupToEdit(group);
    setShowDeleteDialog(true);
  };

  const handleAddToGroup = (groupId: string) => {
    if (selectedInvestorIds.length > 0) {
      onAddToGroup(groupId, selectedInvestorIds);
    }
  };

  return (
    <div className="w-full bg-white border rounded-lg overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">Investor Groups</h3>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      <div className="p-2 max-h-[300px] overflow-y-auto">
        {groups.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No groups created yet</p>
            <p className="text-sm">Create a group to organize your investors</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedGroupId === group.id ? "bg-primary/10" : "hover:bg-gray-100"}`}
                onClick={() =>
                  onSelectGroup(group.id === selectedGroupId ? null : group.id)
                }
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{group.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {group.investorIds.length}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(group);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToGroup(group.id);
                      }}
                      disabled={selectedInvestorIds.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Selected Investors
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToEdit(group);
                        setShowRemoveDialog(true);
                      }}
                      disabled={group.investorIds.length === 0}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Investors
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(group);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <GroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleCreateGroup}
        title="Create Investor Group"
      />

      <GroupDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        onSave={handleRenameGroup}
        title="Rename Group"
        initialName={groupToEdit?.name}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        description={`Are you sure you want to delete the group "${groupToEdit?.name}"? This will not delete the investors in the group.`}
        confirmText="Delete"
      />

      <RemoveFromGroupDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        onRemove={(investorIds) => {
          if (groupToEdit) {
            onRemoveFromGroup(groupToEdit.id, investorIds);
          }
        }}
        groupName={groupToEdit?.name || ""}
        investors={
          groupToEdit
            ? investors.filter((investor) =>
                groupToEdit.investorIds.includes(investor.id),
              )
            : []
        }
      />
    </div>
  );
};

export default InvestorGroups;
