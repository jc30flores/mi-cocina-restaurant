
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import EditCategoriesDialog from "@/components/menu/EditCategoriesDialog";
import AddSubcategoryDialog from "@/components/menu/AddSubcategoryDialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import AddCategoryDialog from "@/components/menu/AddCategoryDialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { createMenuItem, updateMenuItem, getMenu, getMenuCategories, getSubcategories, getCustomizationGroups, getItemCustomizations, updateItemCustomizations } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MenuItemType {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id: string; // FK to menu_categories
  category_name?: string; // convenience from backend
    subcategory_id?: string | null;
    is_active: boolean;
}

interface CustomOption {
  id: string;
  group_id: string;
  name: string;
  extra_price: number | null;
  allowed?: boolean;
}

interface CustomGroup {
  id: string;
  name: string;
  is_required: boolean;
  max_select: number | null;
  options: CustomOption[];
}

const MenuItem = ({ id, name, price, description = "", is_active = true, onEdit, onToggle }: {

  id: string;
  name: string;
  price: number;
  description?: string;
  is_active?: boolean;
  onEdit: (item: MenuItemType) => void;
  onToggle?: (state: boolean) => void;
}) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between">
          <span>{name}</span>
          <span>${price.toFixed(2)}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 flex justify-between items-center">
        {onToggle && (
          <Switch size="sm" checked={is_active} onCheckedChange={onToggle} />
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit({ id, name, price, description, category_id: "", subcategory_id: undefined, is_active })}>
          <Edit className="h-4 w-4 mr-1" /> {t("Edit")}
        </Button>
      </CardFooter>
    </Card>
  );
};

const MenuSection = ({ title, items, setItems, categoryKey, subcategories, refreshData, onSubCreated }: {
  title: string;
  items: MenuItemType[];
  setItems: (categoryId: string, newItems: MenuItemType[]) => void;
  categoryKey: string;
  subcategories: { id: string; name: string; category_id: string }[];
  refreshData: () => void;
  onSubCreated: () => void;
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addSubOpen, setAddSubOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  // Determine the default "Principal" subcategory (if it exists)
  const defaultSub = subcategories.find((sc) => sc.name.toLowerCase() === "principal");

  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [newCustoms, setNewCustoms] = useState<{ group_id: string; option_ids: string[] }[]>([]);
  const [editCustoms, setEditCustoms] = useState<{ group_id: string; option_ids: string[] }[]>([]);
  const [newGroupSearch, setNewGroupSearch] = useState("");
  const [editGroupSearch, setEditGroupSearch] = useState("");

  useEffect(() => {
    getCustomizationGroups().then(setCustomGroups).catch(console.error);
  }, []);

  const [newItem, setNewItem] = useState<Partial<MenuItemType>>({
    name: "",
    price: 0,
    description: "",
    category_id: categoryKey,
    subcategory_id: defaultSub?.id,
  });

  // Whenever subcategories change (e.g., after creating category or subcategory),
  // make sure the default subcategory id is set in the new item draft.
  React.useEffect(() => {
    if (defaultSub && newItem.subcategory_id !== defaultSub.id) {
      setNewItem((prev) => ({ ...prev, subcategory_id: defaultSub.id }));
    }
  }, [defaultSub?.id]);
  
  const handleAddItem = async () => {
    try {
    const itemToAdd = {
        name: newItem.name || "",
        price: newItem.price || 0,
        description: newItem.description || "",
        category_id: categoryKey,
        subcategory_id: newItem.subcategory_id || null,
        is_active: true,
      };
      
      // Create menu item via API
      const created = await createMenuItem(itemToAdd);
      await updateItemCustomizations(created.id, { groups: newCustoms });
      
      toast({
        title: t("Product added"),
        description: t("The product has been added to the menu"),
      });
      
      setIsAddDialogOpen(false);
      refreshData();
      
      // Reset form
      setNewItem({
        name: "",
        price: 0,
        description: "",
        category_id: categoryKey,
        subcategory_id: defaultSub?.id,
      });
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast({
        title: t("Error"),
        description: t("Failed to add the product. Please try again."),
        variant: "destructive"
      });
    }
  };

  const handleEditItem = async () => {
    if (editingItem) {
      try {
        const itemToUpdate = {
          name: editingItem.name,
          price: editingItem.price,
          description: editingItem.description,
          subcategory_id: editingItem.subcategory_id || defaultSub?.id || null,
        };
        
        // Update menu item via API
        await updateMenuItem(editingItem.id, itemToUpdate);
        await updateItemCustomizations(editingItem.id, { groups: editCustoms });
        
        toast({
          title: t("Product updated"),
          description: t("The product has been updated successfully"),
        });
        
        setIsEditDialogOpen(false);
        refreshData();
        setEditingItem(null);
      } catch (error) {
        console.error("Error updating menu item:", error);
        toast({
          title: t("Error"),
          description: t("Failed to update the product. Please try again."),
          variant: "destructive"
        });
      }
    }
  };

  const toggleActive = async (itemId: string, state: boolean) => {
    try {
      await updateMenuItem(itemId, { is_active: state });
      setItems(categoryKey, items.map(i=> i.id===itemId? {...i, is_active: state}: i));
    } catch(e){ console.error(e); }
  };

  const openEditDialog = (item: MenuItemType) => {
    // Ensure default subcategory is pre-selected if none
    const subId = item.subcategory_id || defaultSub?.id;
    setEditingItem({ ...item, subcategory_id: subId });
    getItemCustomizations(item.id)
      .then(data => {
        const mapped = data.map((d: any) => ({
          group_id: d.id,
          option_ids: d.options.filter((o: any) => o.allowed).map((o: any) => o.id)
        }));
        setEditCustoms(mapped);
      })
      .catch(console.error);
    setIsEditDialogOpen(true);
  };

  const handleAddButtonClick = () => {
    setIsAddDialogOpen(true);
    setNewItem({
      name: "",
      price: 0,
      description: "",
      category_id: categoryKey,
      subcategory_id: defaultSub?.id,
    });
    setNewCustoms([]);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAddSubOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("Agregar Subcategoría")}
          </Button>
          <Button size="sm" onClick={handleAddButtonClick}>
            <Plus className="h-4 w-4 mr-1" /> {t("Add Product")}
          </Button>
        </div>
      </div>

      {/* Add Subcategory Dialog */}
      <AddSubcategoryDialog
        open={addSubOpen}
        onOpenChange={setAddSubOpen}
        categoryId={categoryKey}
        existingNames={subcategories.map(s=>s.name.toLowerCase())}
        onCreated={()=>{ onSubCreated(); }}
      />
      {/* Items grouped by subcategory */}
      {/* Show "Principal" group first */}
      {subcategories
        .slice()
        .sort((a,b)=>{
          const aIsPrincipal = a.name.toLowerCase()==='principal';
          const bIsPrincipal = b.name.toLowerCase()==='principal';
          if(aIsPrincipal && !bIsPrincipal) return -1;
          if(!aIsPrincipal && bIsPrincipal) return 1;
          return a.name.localeCompare(b.name);
        })
        .map((sc)=>{
        const group = items.filter(i=>{
          if (i.subcategory_id === sc.id) return true;
          if (!i.subcategory_id && sc.name.toLowerCase()==='principal') return true;
          return false;
        });
        if(group.length===0) return null;
        return (
          <div key={sc.id} className="mb-6">
            <h4 className="text-lg font-semibold mb-2">{sc.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.map(item => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  is_active={item.is_active}
                  onToggle={(v)=>toggleActive(item.id,v)}
                  onEdit={() => openEditDialog(item)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Otros platillos section removed – null subcategory items now included in "Principal" */}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{t("Add Product")}</DialogTitle>
            <DialogDescription>
              {t("Enter the product information to add it to the menu.")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">{t("Name")}</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="price">{t("Price")}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="subcat">{t("Subcategoría")}</Label>
                <Select
                  id="subcat"
                  value={newItem.subcategory_id || defaultSub?.id}
                  onValueChange={(val) =>
                    setNewItem({ ...newItem, subcategory_id: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...subcategories]
                      .sort((a, b) => {
                        const p = "principal";
                        const aP = a.name.toLowerCase() === p;
                        const bP = b.name.toLowerCase() === p;
                        if (aP && !bP) return -1;
                        if (!aP && bP) return 1;
                        return a.name.localeCompare(b.name);
                      })
                      .map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>
                          {sc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">{t("Descripción")}</Label>
              <Textarea
                id="description"
                value={newItem.description ?? ""}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="col-span-4 space-y-2">
              <h4 className="font-medium">{t("Personalizaciones")}</h4>
              <div className="space-y-1 px-2">
                <Input
                  placeholder={t("Busca grupos de personalización para añadir a este producto")}
                  value={newGroupSearch}
                  onChange={e => setNewGroupSearch(e.target.value)}
                />
                {newGroupSearch.trim() && (
                  customGroups.filter(g => g.name.toLowerCase().includes(newGroupSearch.toLowerCase())).length ? (
                    customGroups
                      .filter(g => g.name.toLowerCase().includes(newGroupSearch.toLowerCase()))
                      .map(g => (
                        <label key={g.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newCustoms.some(c => c.group_id === g.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewCustoms(prev => [...prev, { group_id: g.id, option_ids: g.options.map(o => o.id) }]);
                              } else {
                                setNewCustoms(prev => prev.filter(c => c.group_id !== g.id));
                              }
                            }}
                          />
                          {g.name}
                        </label>
                      ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {t("No customization group found.")}
                      <div>
                        <Button variant="link" size="sm" className="p-0" onClick={() => navigate('/customizations?new=1')}>+ {t("New")}</Button>
                      </div>
                    </div>
                  )
                )}
              </div>
              {newCustoms.map(c => {
                const g = customGroups.find(gr => gr.id === c.group_id);
                if (!g) return null;
                return (
                  <div key={g.id} className="ml-4 space-y-1">
                    <Label className="font-medium">{g.name}</Label>
                    <div className="ml-4 space-y-1">
                      {g.options.map(o => (
                        <label key={o.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={c.option_ids.includes(o.id)}
                            onChange={e => {
                              setNewCustoms(prev => prev.map(pc => {
                                if (pc.group_id !== g.id) return pc;
                                const opts = new Set(pc.option_ids);
                                if (e.target.checked) opts.add(o.id); else opts.delete(o.id);
                                return { ...pc, option_ids: Array.from(opts) };
                              }));
                            }}
                          />
                          {o.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="p-4 pt-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleAddItem}>
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{t("Editar Producto")}</DialogTitle>
            <DialogDescription>
              {t("Modifica la información del producto.")}
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="max-h-[80vh] overflow-y-auto p-4 flex flex-col gap-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-name">{t("Name")}</Label>
                  <Input
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-price">{t("Price")}</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-sub">{t("Subcategoría")}</Label>
                  <Select
                    id="edit-sub"
                    value={editingItem.subcategory_id || defaultSub?.id}
                    onValueChange={(val) =>
                      setEditingItem({ ...editingItem, subcategory_id: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Principal" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...subcategories]
                        .sort((a, b) => {
                          const p = "principal";
                          const aP = a.name.toLowerCase() === p;
                          const bP = b.name.toLowerCase() === p;
                          if (aP && !bP) return -1;
                          if (!aP && bP) return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            {sc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="edit-description">{t("Descripción")}</Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description ?? ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="col-span-4 space-y-2">
                <h4 className="font-medium">{t("Personalizaciones")}</h4>
                <div className="space-y-1 px-2">
                  <Input
                    placeholder={t("Busca grupos de personalización para añadir a este producto")}
                    value={editGroupSearch}
                    onChange={e => setEditGroupSearch(e.target.value)}
                  />
                  {editGroupSearch.trim() && (
                    customGroups.filter(g => g.name.toLowerCase().includes(editGroupSearch.toLowerCase())).length ? (
                      customGroups
                        .filter(g => g.name.toLowerCase().includes(editGroupSearch.toLowerCase()))
                        .map(g => (
                          <label key={g.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editCustoms.some(c => c.group_id === g.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setEditCustoms(prev => [...prev, { group_id: g.id, option_ids: g.options.map(o => o.id) }]);
                                } else {
                                  setEditCustoms(prev => prev.filter(c => c.group_id !== g.id));
                                }
                              }}
                            />
                            {g.name}
                          </label>
                        ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t("No customization group found.")}
                        <div>
                          <Button variant="link" size="sm" className="p-0" onClick={() => navigate('/customizations?new=1')}>+ {t("New")}</Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
                {editCustoms.map(c => {
                  const g = customGroups.find(gr => gr.id === c.group_id);
                  if (!g) return null;
                  return (
                    <div key={g.id} className="ml-4 space-y-1">
                      <Label className="font-medium">{g.name}</Label>
                      <div className="ml-4 space-y-1">
                        {g.options.map(o => (
                          <label key={o.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={c.option_ids.includes(o.id)}
                              onChange={e => {
                                setEditCustoms(prev => prev.map(pc => {
                                  if (pc.group_id !== g.id) return pc;
                                  const opts = new Set(pc.option_ids);
                                  if (e.target.checked) opts.add(o.id); else opts.delete(o.id);
                                  return { ...pc, option_ids: Array.from(opts) };
                                }));
                              }}
                            />
                            {o.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter className="p-4 pt-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleEditItem}>
              {t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Menu = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  interface Category { id: string; name: string; }
  interface SubCat { id: string; name: string; category_id: string; }

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuData, setMenuData] = useState<{ [key: string]: MenuItemType[] }>({});
  const [loading, setLoading] = useState(true);
  const [subcats, setSubcats] = useState<SubCat[]>([]);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [editCatOpen, setEditCatOpen] = useState(false);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch categories from backend
      const sections: any[] = await getMenuCategories();
      const merged: Category[] = sections.map((s) => ({ id: s.id, name: s.name }));
      setCategories(merged);

      // Fetch subcategories
      const allSubs: SubCat[] = await getSubcategories();
      setSubcats(allSubs);

      // Fetch all menu items
      const allItems: MenuItemType[] = await getMenu();
      // Build menuData dynamically
      const data: { [key: string]: MenuItemType[] } = {};
      merged.forEach((cat) => {
        data[cat.id] = allItems.filter((item) => item.category_id === cat.id);
      });
      setMenuData(data);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast({
        title: "Error",
        description: "Failed to load menu data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);
  
  const updateCategory = (category: string, newItems: MenuItemType[]) => {
    setMenuData((prev) => ({ ...prev, [category]: newItems }));
  };
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Menu Management")}</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
          {/* Active tab is first category by default */}
          {categories.length > 0 ? (
            <Tabs defaultValue={categories[0].id}>
              {/* Tabs list width adapts to its children instead of stretching full width */}
              <TabsList className="mb-6 inline-flex overflow-x-auto gap-2 w-fit">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="capitalize">
                    {cat.name}
                  </TabsTrigger>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="ml-2 shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setAddCatOpen(true)}>
                      {t("Agregar Categoría")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditCatOpen(true)}>
                      {t("Editar Categorías")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id}>
                  <MenuSection
                    title={`${cat.name} Menu`}
                    items={menuData[cat.id] || []}
                    setItems={updateCategory}
                    categoryKey={cat.id}
                    subcategories={subcats.filter(s=>s.category_id===cat.id)}
                    refreshData={fetchMenuData}
                    onSubCreated={() => fetchMenuData()}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : null}
          </>
        )}
      </div>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        open={addCatOpen}
        onOpenChange={setAddCatOpen}
        existingCategories={categories.map((c) => c.name.toLowerCase())}
        onCreated={() => {
          fetchMenuData();
        }}
      />

      <EditCategoriesDialog
        open={editCatOpen}
        onOpenChange={setEditCatOpen}
        categories={categories}
        onUpdated={(updated) => {
          // merge default and updated
          setCategories(updated);
        }}
        onDeleted={(deletedId) => {
          setCategories((prev) => prev.filter((c) => c.id !== deletedId));
          // remove menu items and tab data
          setMenuData((prev) => {
            const copy = { ...prev };
            delete copy[deletedId];
            return copy;
          });
          fetchMenuData();
        }}
      />
    </MainLayout>
  );
};

export default Menu;
