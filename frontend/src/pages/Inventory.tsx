
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { inventoryService, type InventoryItem, type InsertInventoryItem } from "@/services/inventory.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsiveGrid } from "@/components/ui/responsive-layout";
import { useScreenSize } from "@/hooks/use-mobile";

const recipeItems = [
  {
    id: 1,
    name: "Classic Burger",
    ingredients: [
      { name: "Ground beef", quantity: 0.15, unit: "kg", cost: 1.28 },
      { name: "Burger bun", quantity: 1, unit: "unit", cost: 0.45 },
      { name: "Cheddar cheese", quantity: 0.03, unit: "kg", cost: 0.38 },
      { name: "Lettuce", quantity: 0.02, unit: "kg", cost: 0.08 },
      { name: "Tomato", quantity: 0.03, unit: "kg", cost: 0.11 }
    ],
    totalCost: 2.30,
    sellingPrice: 12.99,
    profit: 10.69,
    margin: 82
  },
  {
    id: 2,
    name: "French Fries",
    ingredients: [
      { name: "Potatoes", quantity: 0.15, unit: "kg", cost: 0.49 },
      { name: "Oil", quantity: 0.01, unit: "lt", cost: 0.05 }
    ],
    totalCost: 0.54,
    sellingPrice: 4.99,
    profit: 4.45,
    margin: 89
  }
];

const InventoryList = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isMobile } = useScreenSize();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<InsertInventoryItem>({
    name: "",
    quantity: 0,
    unit: "",
    cost: 0,
    supplier: "",
  });
  
  // Fetch inventory items
  const { data: inventoryItems = [], isLoading, error } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: inventoryService.getAllItems
  });

  // Add a new inventory item
  const addItemMutation = useMutation({
    mutationFn: inventoryService.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: t("Product added"),
        description: t("The product has been added to the inventory"),
      });
      setIsAddDialogOpen(false);
      // Reset form
      setNewItem({
        name: "",
        quantity: 0,
        unit: "",
        cost: 0,
        supplier: "",
      });
    },
    onError: (error) => {
      toast({
        title: t("Error"),
        description: (error as Error).message || t("Could not add the product"),
        variant: "destructive"
      });
    }
  });

  // Update an existing inventory item
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertInventoryItem> }) => 
      inventoryService.updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: t("Product updated"),
        description: t("The product has been updated successfully"),
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast({
        title: t("Error"),
        description: (error as Error).message || t("Could not update the product"),
        variant: "destructive"
      });
    }
  });
  
  // Delete an inventory item
  const deleteItemMutation = useMutation({
    mutationFn: inventoryService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      toast({
        title: t("Product deleted"),
        description: t("The product has been removed from inventory"),
      });
    },
    onError: (error) => {
      toast({
        title: t("Error"),
        description: (error as Error).message || t("Could not delete the product"),
        variant: "destructive"
      });
    }
  });

  const handleAddProduct = () => {
    addItemMutation.mutate(newItem);
  };

  const handleEditProduct = () => {
    if (editingItem) {
      const updates: Partial<InsertInventoryItem> = {
        name: editingItem.name,
        quantity: Number(editingItem.quantity),
        unit: editingItem.unit,
        cost: Number(editingItem.cost),
        supplier: editingItem.supplier,
      };
      
      updateItemMutation.mutate({ 
        id: editingItem.id, 
        updates 
      });
    }
  };

  const handleDeleteProduct = (item: InventoryItem) => {
    if (confirm(t("Are you sure you want to delete this product?"))) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">{t("Cargando inventario...")}</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("Error")}</AlertTitle>
        <AlertDescription>
          {(error as Error).message || t("Could not load inventory")}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl sm:text-2xl">{t("Inventory Status")}</CardTitle>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4" />
            {t("Add Product")}
          </Button>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 overflow-auto">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("Category")}</TableHead>
                  <TableHead>{t("Quantity")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Cost")}</TableHead>
                  <TableHead className="text-center">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => {
                  const stockPercentage = item.quantity ? (item.quantity / 5) * 100 : 0; // Using 5 as default min level
                  let statusColor = "bg-green-500";
                  if (stockPercentage <= 100) statusColor = "bg-amber-500";
                  if (stockPercentage <= 50) statusColor = "bg-red-500";
                  
                  let statusText = t("High");
                  if (stockPercentage <= 100) statusText = t("Medium");
                  if (stockPercentage <= 50) statusText = t("Low");
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.supplier || t("Not specified")}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(stockPercentage, 200)} className="h-2 w-24" />
                          <span className="text-xs">{statusText}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${Number(item.cost).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteProduct(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {inventoryItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t("No products in inventory")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("Add Product")}</DialogTitle>
            <DialogDescription>
              {t("Enter product information to add it to inventory.")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t("Name")}
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">
                {t("Supplier")}
              </Label>
              <Input
                id="supplier"
                value={newItem.supplier || ""}
                onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                {t("Quantity")}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setNewItem({
                    ...newItem,
                    quantity: isNaN(v) ? 0 : v
                  });
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                {t("Unit")}
              </Label>
              <Input
                id="unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costPerUnit" className="text-right">
                {t("Cost per Unit")}
              </Label>
              <Input
                id="costPerUnit"
                type="number"
                value={newItem.cost}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setNewItem({
                    ...newItem,
                    cost: isNaN(v) ? 0 : v
                  });
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleAddProduct} disabled={addItemMutation.isPending}>
              {addItemMutation.isPending ? t("Saving...") : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("Editar Producto")}</DialogTitle>
            <DialogDescription>
              {t("Modifica la información del producto.")}
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  {t("Name")}
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-supplier" className="text-right">
                  {t("Supplier")}
                </Label>
                <Input
                  id="edit-supplier"
                  value={editingItem.supplier || ""}
                  onChange={(e) => setEditingItem({...editingItem, supplier: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">
                  {t("Quantity")}
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setEditingItem({
                      ...editingItem,
                      quantity: isNaN(v) ? 0 : v
                    });
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">
                  {t("Unit")}
                </Label>
                <Input
                  id="edit-unit"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-costPerUnit" className="text-right">
                  {t("Cost per Unit")}
                </Label>
                <Input
                  id="edit-costPerUnit"
                  type="number"
                  value={Number(editingItem.cost)}
                  onChange={(e) => setEditingItem({...editingItem, cost: parseFloat(e.target.value)})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleEditProduct} disabled={updateItemMutation.isPending}>
              {updateItemMutation.isPending ? t("Saving...") : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RecipeCosts = () => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">{t("Recipe Costing")}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 overflow-auto">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Product")}</TableHead>
                <TableHead>{t("Ingredients Cost")}</TableHead>
                <TableHead>{t("Selling Price")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("Profit")}</TableHead>
                <TableHead className="text-right">{t("Margin %")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipeItems.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>${recipe.totalCost.toFixed(2)}</TableCell>
                  <TableCell>${recipe.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">${recipe.profit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{recipe.margin}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const LowStockAlert = () => {
  const { t } = useLanguage();
  // Assuming you want to filter based on a minLevel property that might not exist directly
  // You might need to fetch additional data or calculate this on the fly
  const lowStockItems = [];
  
  if (lowStockItems.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("Inventory Alert")}</AlertTitle>
      <AlertDescription>
        {lowStockItems.length} {t("products are below the minimum required level")}.
      </AlertDescription>
    </Alert>
  );
};

const Inventory = () => {
  const { t } = useLanguage();
  const { isMobile } = useScreenSize();
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <PageHeader 
          title={t("Inventory Dashboard")} 
          className="mb-6"
        />
        
        <LowStockAlert />
        
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-6 p-1 overflow-x-auto flex w-full sm:w-auto">
            <TabsTrigger value="inventory" className="flex-1 sm:flex-none px-4 py-2">{t("Inventory")}</TabsTrigger>
            <TabsTrigger value="recipes" className="flex-1 sm:flex-none px-4 py-2">{t("Recipes")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="mt-0">
            <InventoryList />
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-0">
            <RecipeCosts />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Inventory;
