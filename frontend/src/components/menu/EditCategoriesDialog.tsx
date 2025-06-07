import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateMenuCategory, deleteMenuCategory } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: Category[];
  onUpdated: (updated: Category[]) => void;
  onDeleted: (deletedId: string) => void;
}

const EditCategoriesDialog: React.FC<Props> = ({ open, onOpenChange, categories, onUpdated, onDeleted }) => {
  const [localCats, setLocalCats] = useState<Category[]>(categories);
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  React.useEffect(() => {
    setLocalCats(categories);
  }, [categories, open]);

  const handleSave = async (cat: Category) => {
    const trimmed = cat.name.trim();
    if (!trimmed) {
      toast({ title: "Name cannot be empty", variant: "destructive" });
      return;
    }
    try {
      const res = await updateMenuCategory(cat.id, { name: trimmed });
      const updatedList = localCats.map((c) => (c.id === cat.id ? res : c));
      setLocalCats(updatedList);
      onUpdated(updatedList);
      toast({ title: "Category updated" });
    } catch (e: any) {
      console.error(e);
      toast({ title: e.message || "Failed to update", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMenuCategory(deleteTarget.id);
      onDeleted(deleteTarget.id);
      toast({ title: "Category deleted" });
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {localCats.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Input
                value={cat.name}
                onChange={(e) =>
                  setLocalCats((prev) =>
                    prev.map((c) => (c.id === cat.id ? { ...c, name: e.target.value } : c))
                  )
                }
                onBlur={() => {
                  const current = localCats.find((c) => c.id === cat.id);
                  if (current) handleSave(current);
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setDeleteTarget(cat)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category and all menu items linked to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EditCategoriesDialog;
