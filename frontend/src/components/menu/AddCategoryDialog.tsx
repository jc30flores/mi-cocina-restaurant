// Modal to add a new menu category
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createMenuCategory, createSubcategory } from "@/services/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCategories: string[]; // lowercase names
  onCreated: () => void;
}

const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const AddCategoryDialog: React.FC<Props> = ({ open, onOpenChange, existingCategories, onCreated }) => {
  const [name, setName] = useState("");
  const { toast } = useToast();

  const reset = () => setName("");

  const handleCreate = async () => {
    const formatted = toTitleCase(name.trim());

    if (!formatted) {
      toast({ title: "Category name is required", variant: "destructive" });
      return;
    }
    if (existingCategories.includes(formatted.toLowerCase())) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }

    try {
      // Create category
      const created = await createMenuCategory({ name: formatted });

      // Immediately create default "Principal" subcategory for this category
      try {
        await createSubcategory({ name: "Principal", category_id: created.id });
      } catch (err) {
        console.error("Failed to create default subcategory", err);
      }

      toast({ title: "Category created" });
      onCreated();
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create category", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>{ if(!o) reset(); onOpenChange(o);} }>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Enter a unique name for the new menu category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category-name" className="text-right">
              Name
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Snacks"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
