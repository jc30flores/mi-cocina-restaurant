import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  getCustomizationGroups,
  createCustomizationGroup,
  updateCustomizationGroup,
  deleteCustomizationGroup,
  createCustomizationOption,
  updateCustomizationOption,
  deleteCustomizationOption,
} from "@/services/api";

interface Option {
  id: string;
  group_id: string;
  name: string;
  extra_price: number | null;
}
interface Group {
  id: string;
  name: string;
  is_required: boolean;
  max_select: number | null;
  options: Option[];
}

const Customizations = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: "", is_required: false, max_select: 1 });

  const load = async () => {
    try {
      setLoading(true);
      const data = await getCustomizationGroups();
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Open the add group dialog when ?new=1 is present
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddOpen(true);
    }
  }, [searchParams]);

  const handleCreate = async () => {
    try {
      const created = await createCustomizationGroup(form);
      setGroups([...groups, created]);
      setAddOpen(false);
      setForm({ name: "", is_required: false, max_select: 1 });
      toast({ title: "Created" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editGroup) return;
    try {
      const updated = await updateCustomizationGroup(editGroup.id, form);
      setGroups(groups.map(g => (g.id === updated.id ? { ...g, ...updated } : g)));
      setEditGroup(null);
      toast({ title: "Updated" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomizationGroup(id);
      setGroups(groups.filter(g => g.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const addOption = async (groupId: string, name: string, extra: number) => {
    try {
      const opt = await createCustomizationOption({ group_id: groupId, name, extra_price: extra });
      setGroups(groups.map(g => (g.id === groupId ? { ...g, options: [...g.options, opt] } : g)));
    } catch (e) {
      console.error(e);
    }
  };

  const updateOption = async (groupId: string, optionId: string, name: string, extra: number) => {
    try {
      const opt = await updateCustomizationOption(optionId, { name, extra_price: extra });
      setGroups(groups.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, options: g.options.map(o => (o.id === optionId ? opt : o)) };
      }));
    } catch (e) { console.error(e); }
  };

  const deleteOption = async (groupId: string, optionId: string) => {
    try {
      await deleteCustomizationOption(optionId);
      setGroups(groups.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, options: g.options.filter(o => o.id !== optionId) };
      }));
    } catch (e) { console.error(e); }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Customizations")}</h1>
        <Button onClick={() => setAddOpen(true)} className="mb-4">
          <Plus className="h-4 w-4 mr-1" /> {t("Add Group")}
        </Button>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-6">
            {groups.map(g => (
              <div key={g.id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium">{g.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {g.is_required ? t("Required") : t("Optional")} · {t("Max")}: {g.max_select ?? 1}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => { setEditGroup(g); setForm({ name: g.name, is_required: g.is_required, max_select: g.max_select ?? 1 }); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleDelete(g.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="space-y-1 mb-2">
                  {g.options.map(o => (
                    <li key={o.id} className="flex items-center justify-between gap-2">
                      <span>{o.name} {o.extra_price ? `(+$${o.extra_price})` : null}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={() => {
                          const name = prompt("Name", o.name) || o.name;
                          const ep = parseFloat(prompt("Extra price", String(o.extra_price || 0)) || "0");
                          updateOption(g.id, o.id, name, ep);
                        }}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="outline" size="icon" onClick={() => deleteOption(g.id, o.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2">
                  <Input placeholder="Option name" id={`opt-${g.id}`} className="flex-1" />
                  <Input placeholder="Extra" id={`price-${g.id}`} type="number" step="0.01" className="w-24" />
                  <Button size="sm" onClick={() => {
                    const nameInput = document.getElementById(`opt-${g.id}`) as HTMLInputElement;
                    const priceInput = document.getElementById(`price-${g.id}`) as HTMLInputElement;
                    const name = nameInput.value.trim();
                    const extra = parseFloat(priceInput.value || "0");
                    if (!name) return;
                    addOption(g.id, name, extra);
                    nameInput.value = ""; priceInput.value = "";
                  }}><Plus className="h-3 w-3 mr-1" />{t("Add Option")}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Group Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("Add Group")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="g-name" className="text-right">{t("Name")}</Label>
              <Input id="g-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="g-required" className="text-right">{t("Required")}</Label>
              <input id="g-required" type="checkbox" checked={form.is_required} onChange={e => setForm({ ...form, is_required: e.target.checked })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="g-max" className="text-right">{t("Max Select")}</Label>
              <Input id="g-max" type="number" value={form.max_select} onChange={e => setForm({ ...form, max_select: parseInt(e.target.value) })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t("Cancel")}</Button>
            <Button onClick={handleCreate}>{t("Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={!!editGroup} onOpenChange={(o) => { if(!o) setEditGroup(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("Edit Group")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eg-name" className="text-right">{t("Name")}</Label>
              <Input id="eg-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eg-req" className="text-right">{t("Required")}</Label>
              <input id="eg-req" type="checkbox" checked={form.is_required} onChange={e => setForm({ ...form, is_required: e.target.checked })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eg-max" className="text-right">{t("Max Select")}</Label>
              <Input id="eg-max" type="number" value={form.max_select} onChange={e => setForm({ ...form, max_select: parseInt(e.target.value) })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroup(null)}>{t("Cancel")}</Button>
            <Button onClick={handleUpdate}>{t("Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Customizations;
