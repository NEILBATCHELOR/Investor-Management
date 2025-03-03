import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemoveFromGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (investorIds: string[]) => void;
  groupName: string;
  investors: Array<{ id: string; name: string }>;
}

const RemoveFromGroupDialog = ({
  open,
  onOpenChange,
  onRemove,
  groupName,
  investors,
}: RemoveFromGroupDialogProps) => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  const handleToggleInvestor = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(investors.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleRemove = () => {
    onRemove(Array.from(selectedIds));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Investors from {groupName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              onCheckedChange={handleSelectAll}
              checked={
                selectedIds.size === investors.length && investors.length > 0
              }
            />
            <Label htmlFor="select-all">Select All</Label>
          </div>

          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {investors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No investors in this group
                </p>
              ) : (
                investors.map((investor) => (
                  <div
                    key={investor.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={investor.id}
                      checked={selectedIds.has(investor.id)}
                      onCheckedChange={(checked) =>
                        handleToggleInvestor(investor.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={investor.id}>{investor.name}</Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={selectedIds.size === 0}
            variant="destructive"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromGroupDialog;
