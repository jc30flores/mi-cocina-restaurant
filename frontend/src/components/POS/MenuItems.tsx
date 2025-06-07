
import React, { useEffect, useState } from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getMenu, getItemCustomizations } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

interface CustomOption {
  id: string;
  name: string;
  price: number;
}

interface CustomGroup {
  id: string;
  name: string;
  max_select: number | null;
  is_required: boolean;
  options: CustomOption[];
  selected: string[];
}

const MenuItems = () => {
  const { activeCategory, activeSubcategory, addItemToOrder, subcategories } = usePOS();
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        // Fetch and filter menu items by category via API
        const allItems: MenuItemData[] = await getMenu();
        let filtered = (allItems || []).filter(
          (it) => it.is_active && it.category_id === activeCategory
        );
        if (activeSubcategory) {
          const defaultSub = subcategories.find(
            (s) => s.category_id === activeCategory && s.name.toLowerCase() === "principal"
          );
          filtered = filtered.filter((it) => {
            const sid = it.subcategory_id ?? defaultSub?.id;
            return sid === activeSubcategory;
          });
        }
        setMenuItems(filtered);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        toast({
          title: "Error",
          description: "Failed to load menu items. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeCategory) {
      fetchMenuItems();
    }
  }, [activeCategory, activeSubcategory, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid auto-rows-[4rem] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 h-full overflow-y-auto p-3">
        {menuItems.length === 0 ? (
          <div className="col-span-full flex justify-center items-center h-48 text-muted-foreground">
            No items found in this category
          </div>
        ) : (
          menuItems.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className={`h-full whitespace-pre-wrap text-center transition-transform border rounded-md ${selectedItem?.id === item.id ? 'border-2 border-blue-500 shadow-lg scale-105' : ''}`}
              onClick={async () => {
                setSelectedItem(item);
                setQuantity(1);
                setLoadingCustom(true);
                try {
                  const groups = await getItemCustomizations(item.id);
                  const formatted: CustomGroup[] = groups.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    max_select: g.max_select,
                    is_required: g.is_required,
                    options: (g.options || [])
                      .filter((o: any) => o.allowed)
                      .map((o: any) => ({
                        id: o.id,
                        name: o.name,
                        price:
                          typeof o.extra_price === 'string'
                            ? parseFloat(o.extra_price)
                            : o.extra_price,
                      })),
                    selected: [],
                  }));
                  setCustomGroups(formatted);
                } catch (e) {
                  console.error('Error loading customizations', e);
                } finally {
                  setLoadingCustom(false);
                }
              }}
            >
              {item.name}
            </Button>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="p-3 border-t bg-card sticky bottom-0 z-10" id="custom-panel">
          <h4 className="font-semibold mb-2">Customize {selectedItem.name}</h4>
          {selectedItem.description && (
            <div className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
              {selectedItem.description}
            </div>
          )}
          {loadingCustom ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {customGroups.map((grp) => (
                <div key={grp.id} className="space-y-1">
                  <div className="font-medium text-sm">{grp.name}</div>
                  {grp.max_select === 1 ? (
                    <RadioGroup
                      value={grp.selected[0] || ""}
                      onValueChange={(val) =>
                        setCustomGroups((prev) =>
                          prev.map((g) =>
                            g.id === grp.id ? { ...g, selected: val ? [val] : [] } : g
                          )
                        )
                      }
                      className="grid grid-cols-2 gap-2"
                    >
                      {grp.options.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm">
                          <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} />
                          {opt.name} {opt.price ? `+$${opt.price}` : ""}
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {grp.options.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={grp.selected.includes(opt.id)}
                            onCheckedChange={(ck) =>
                              setCustomGroups((prev) =>
                                prev.map((g) =>
                                  g.id === grp.id
                                    ? {
                                        ...g,
                                        selected: ck
                                          ? [...g.selected, opt.id]
                                          : g.selected.filter((id) => id !== opt.id),
                                      }
                                    : g
                                )
                              )
                            }
                            id={`chk-${opt.id}`}
                          />
                          {opt.name} {opt.price ? `+$${opt.price}` : ""}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span>{quantity}</span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Cancel</Button>
                <Button
                  onClick={() => {
                    const mods = customGroups.map((g) => ({
                      modifier: {
                        id: g.id,
                        name: g.name,
                        options: [],
                        required: g.is_required,
                        multiSelect: (g.max_select ?? 1) > 1,
                      },
                      selectedOptions: g.options.filter((o) => g.selected.includes(o.id)),
                    }));
                    addItemToOrder(selectedItem, quantity, mods);
                    setSelectedItem(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MenuItems;
