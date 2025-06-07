
import React, { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Trash2, Send, CreditCard, Coffee, Settings, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const OrderTicket = () => {
  const { currentOrder, removeItemFromOrder, holdOrder, sendOrder, payOrder, clearOrder, addNoteToItem, sending } = usePOS();
  const { t } = useLanguage();
  const [customizeItem, setCustomizeItem] = useState(null);
  const [customNote, setCustomNote] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Sample ingredients for demo purposes
  const sampleIngredients = {
    "Burgers": [
      { id: "cheese", name: "Cheese", default: true },
      { id: "lettuce", name: "Lettuce", default: true },
      { id: "tomato", name: "Tomato", default: true },
      { id: "onion", name: "Onion", default: true },
      { id: "pickles", name: "Pickles", default: true },
      { id: "bacon", name: "Bacon", default: false },
      { id: "mustard", name: "Mustard", default: true },
      { id: "ketchup", name: "Ketchup", default: true },
      { id: "mayo", name: "Mayo", default: true }
    ],
    "Pizzas": [
      { id: "cheese", name: "Cheese", default: true },
      { id: "tomato-sauce", name: "Tomato Sauce", default: true },
      { id: "pepperoni", name: "Pepperoni", default: false },
      { id: "mushrooms", name: "Mushrooms", default: false },
      { id: "onions", name: "Onions", default: false },
      { id: "olives", name: "Olives", default: false }
    ],
    "Salads": [
      { id: "lettuce", name: "Lettuce", default: true },
      { id: "tomatoes", name: "Tomatoes", default: true },
      { id: "cucumber", name: "Cucumber", default: true },
      { id: "croutons", name: "Croutons", default: true },
      { id: "dressing", name: "Dressing", default: true }
    ]
  };

  // Default ingredients for other categories
  const defaultIngredients = [
    { id: "default-1", name: "Ingredient 1", default: true },
    { id: "default-2", name: "Ingredient 2", default: true },
    { id: "default-3", name: "Ingredient 3", default: true }
  ];

  const [selectedIngredients, setSelectedIngredients] = useState({});

  const handleCustomizeClick = (item) => {
    setCustomizeItem(item);
    setCustomNote(item.notes || "");
    
    // Get the category of the menu item
    const category = item.menuItem.category;
    
    // Initialize selected ingredients based on the category
    const ingredientsForCategory = sampleIngredients[category] || defaultIngredients;
    
    // Create a map of ingredient selections
    const initialSelections = {};
    ingredientsForCategory.forEach(ing => {
      initialSelections[ing.id] = ing.default;
    });
    
    setSelectedIngredients(initialSelections);
    setCustomizeOpen(true);
  };

  const handleSaveCustomization = () => {
    if (customizeItem) {
      // Create a note that includes the removed/added ingredients
      let noteContent = customNote ? customNote + "\n\n" : "";
      
      const removed = [];
      const added = [];
      
      const ingredientsForCategory = 
        sampleIngredients[customizeItem.menuItem.category] || defaultIngredients;
      
      ingredientsForCategory.forEach(ing => {
        const isSelected = selectedIngredients[ing.id];
        // If default is true but not selected, it's removed
        if (ing.default && !isSelected) {
          removed.push(ing.name);
        }
        // If default is false but selected, it's added
        if (!ing.default && isSelected) {
          added.push(ing.name);
        }
      });
      
      if (removed.length > 0) {
        noteContent += `No: ${removed.join(", ")}\n`;
      }
      
      if (added.length > 0) {
        noteContent += `Add: ${added.join(", ")}`;
      }
      
      addNoteToItem(customizeItem.id, noteContent.trim());
      
      setCustomizeOpen(false);
    }
  };

  const handleHold = () => {
    holdOrder();
  };

  const handleSend = () => {
    sendOrder();
  };

  const handlePay = () => {
    payOrder();
  };

  const handleClear = () => {
    clearOrder();
  };

  if (!currentOrder) {
    return (
      <Card className="h-full flex flex-col min-h-0">
        <CardHeader className="sticky top-0 bg-card z-10 flex-shrink-0">
          <CardTitle>{t("No Active Order")}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("Start a new order to begin")}</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by client
  const itemsByClient: Record<number, typeof currentOrder.items> = {};
  
  // Initialize with empty arrays for each client
  if (currentOrder.clientCount) {
    for (let i = 1; i <= currentOrder.clientCount; i++) {
      itemsByClient[i] = [];
    }
  }
  
  // Group items by client number
  currentOrder.items.forEach(item => {
    const clientNum = item.clientNumber || 1;
    if (!itemsByClient[clientNum]) {
      itemsByClient[clientNum] = [];
    }
    itemsByClient[clientNum].push(item);
  });

  // Calculate subtotals per client
  const subtotalsByClient: Record<number, number> = {};
  Object.entries(itemsByClient).forEach(([clientNum, items]) => {
    subtotalsByClient[Number(clientNum)] = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

  const subtotalsByTable: Record<string, number> = {};
  currentOrder.items.forEach(item => {
    const src = item.sourceTable || currentOrder.tableNumber || 'Unknown';
    subtotalsByTable[src] = (subtotalsByTable[src] || 0) + item.price * item.quantity;
  });

  const displayItems = currentOrder.currentClient 
    ? itemsByClient[currentOrder.currentClient] || [] 
    : currentOrder.items;

  return (
    <>
      <Card className="h-full flex flex-col min-h-0">
        <CardHeader className="pb-3 sticky top-0 z-10 bg-card flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div>
              {currentOrder.tableNumber
                ? `${t("Order")} - ${t("Table")} ${currentOrder.tableNumber}`
                : t("Takeout Order")}
            </div>
            {currentOrder.currentClient && (
              <div className="text-sm font-normal text-muted-foreground">
                {t("Client")} {currentOrder.currentClient}
              </div>
            )}
          </CardTitle>
          {currentOrder.mergedFrom && currentOrder.mergedFrom.length > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              Merged from table{currentOrder.mergedFrom.length > 1 ? 's' : ''} {currentOrder.mergedFrom.join(', ')}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 px-4">
          <div className="overflow-y-auto flex-grow min-h-0 max-h-[calc(100vh-250px)] pr-1">
            {displayItems.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">{t("Add items to the order")}</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {displayItems.map((item) => (
                  <li key={item.id} className="flex justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span>
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.modifiers.length > 0 &&
                        item.modifiers.map((mod, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground pl-4">
                            {mod.modifier.name}:{" "}
                            {mod.selectedOptions.map((opt) => opt.name).join(", ")}
                          </div>
                        ))}
                      {item.notes && (
                        <div className="text-sm italic text-muted-foreground pl-4">
                          {t("Note")}: {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-start">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1"
                        onClick={() => handleCustomizeClick(item)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItemFromOrder(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Client Subtotals (if multiple clients) */}
          {currentOrder.clientCount && currentOrder.clientCount > 1 && (!currentOrder.mergedFrom || currentOrder.mergedFrom.length === 0) && (
            <div className="border-t pt-3 flex-shrink-0">
              <h4 className="font-medium">{t("Subtotals per Client")}:</h4>
              <ul className="mt-1 space-y-1">
                {Object.entries(subtotalsByClient).map(([clientNum, subtotal]) => (
                  <li key={clientNum} className="flex justify-between text-sm">
                    <span>{t("Client")} {clientNum}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentOrder.mergedFrom && currentOrder.mergedFrom.length > 0 && (
            <div className="border-t pt-3 flex-shrink-0">
              <h4 className="font-medium">Subtotals per Table:</h4>
              <ul className="mt-1 space-y-1">
                {Object.entries(subtotalsByTable).map(([tbl, subtotal]) => (
                  <li key={tbl} className="flex justify-between text-sm">
                    <span>Table {tbl}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col pt-0 sticky bottom-0 bg-card z-10 flex-shrink-0">
          <div className="w-full border-t pt-3">
            <div className="flex justify-between">
              <span>{t("Subtotal")}:</span>
              <span>${currentOrder.subtotal.toFixed(2)}</span>
            </div>
            {currentOrder.discount && (
              <div className="flex justify-between text-green-600">
                <span>{t("Discount")}:</span>
                <span>
                  {currentOrder.discount.type === "percentage"
                    ? `-${currentOrder.discount.value}%`
                    : `-$${currentOrder.discount.value.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold mt-2">
              <span>{t("Total")}:</span>
              <span>${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <Button variant="outline" onClick={handleHold}>
              <Coffee className="mr-2 h-4 w-4" /> {t("Hold")}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="mr-2 h-4 w-4" /> {t("Clear")}
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? t("Sending...") : t("Send")}
            </Button>
            <Button onClick={handlePay}>
              <CreditCard className="mr-2 h-4 w-4" /> {t("Pay")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Customization Dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("Customize")} {customizeItem?.menuItem.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-sm text-muted-foreground mb-4">
              {t("Select the ingredients you'd like to include:")}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {customizeItem && (
                sampleIngredients[customizeItem.menuItem.category] || defaultIngredients
              ).map((ingredient) => (
                <div key={ingredient.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={ingredient.id} 
                    checked={selectedIngredients[ingredient.id]} 
                    onCheckedChange={(checked) => {
                      setSelectedIngredients(prev => ({
                        ...prev,
                        [ingredient.id]: !!checked
                      }));
                    }}
                  />
                  <Label htmlFor={ingredient.id}>{ingredient.name}</Label>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">{t("Special Instructions")}</Label>
              <Textarea 
                id="notes" 
                placeholder={t("Any special requests...")}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizeOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleSaveCustomization}>
              {t("Save Customization")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderTicket;
