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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, UserPlus } from "lucide-react";
import { InvestorGroup } from "./InvestorGroups";

interface AddToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: InvestorGroup[];
  onAddToGroup: (groupId: string) => void;
  selectedInvestorCount: number;
}

const AddToGroupDialog = ({
  open,
  onOpenChange,
  groups,
  onAddToGroup,
  selectedInvestorCount,
}: AddToGroupDialogProps) => {
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");

  React.useEffect(() => {
    if (open && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    } else {
      setSelectedGroupId("");
    }
  }, [open, groups]);

  const handleAddToGroup = () => {
    if (selectedGroupId) {
      onAddToGroup(selectedGroupId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add to Group
          </DialogTitle>
        </DialogHeader>

        {groups.length === 0 ? (
          <div className="py-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-muted-foreground">No groups available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a group first to add investors
            </p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select a group to add {selectedInvestorCount} selected investor
                {selectedInvestorCount !== 1 ? "s" : ""}
              </p>

              <ScrollArea className="h-[200px] pr-4">
                <RadioGroup
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                >
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center space-x-2 py-2 px-1 hover:bg-gray-50 rounded-md"
                    >
                      <RadioGroupItem value={group.id} id={group.id} />
                      <Label
                        htmlFor={group.id}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <span>{group.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {group.investorIds.length}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddToGroup} disabled={!selectedGroupId}>
                Add to Group
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToGroupDialog;
