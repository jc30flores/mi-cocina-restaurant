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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createSubcategory } from "@/services/api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categoryId: string;
  existingNames: string[]; // lowercase
  onCreated: () => void;
}

const toTitle = (s: string) => s.trim().toLowerCase().split(" ").filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");

const AddSubcategoryDialog: React.FC<Props> = ({ open, onOpenChange, categoryId, existingNames, onCreated }) => {
  const [name, setName] = useState("");
  const { toast } = useToast();

  const resetClose = () => { setName(""); onOpenChange(false); };

  const handleCreate = async () => {
    const formatted = toTitle(name);
    if (!formatted) { toast({title:"Name required",variant:"destructive"}); return; }
    if (existingNames.includes(formatted.toLowerCase())) { toast({title:"Exists",variant:"destructive"}); return; }
    try {
      await createSubcategory({ name: formatted, category_id: categoryId });
      toast({title:"Subcategory created"});
      onCreated();
      resetClose();
    } catch(e){ console.error(e); toast({title:"Failed",variant:"destructive"}); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Subcategory</DialogTitle>
          <DialogDescription>Enter subcategory name.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sub-name" className="text-right">Name</Label>
            <Input id="sub-name" value={name} onChange={(e)=>setName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubcategoryDialog;
