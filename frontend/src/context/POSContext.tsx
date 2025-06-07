
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getMenu,
  getOrders,
  getOrderItems,
  createOrder as apiCreateOrder,
  createOrderItem as apiCreateOrderItem,
  updateOrder as apiUpdateOrder,
  getTables,
  updateTable,
  getEmployees,
  getInventory,
  getSubcategories,
  getTableLink,
  payLinkedTables,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Types for our POS system
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  image?: string;
  is_active?: boolean;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  multiSelect: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  modifiers: OrderModifier[];
  notes?: string;
  price: number;
  clientNumber?: number;
  // Original table if this item came from a merged order
  sourceTable?: string;
}

export interface OrderModifier {
  modifier: Modifier;
  selectedOptions: ModifierOption[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  tableNumber?: string;
  server: string;
  // Tables merged into this order
  mergedFrom?: string[];
  status: "new" | "hold" | "sent" | "completed" | "paid";
  createdAt: Date;
  updatedAt: Date;
  splitMethod?: "even" | "by-item" | "custom";
  splits?: OrderSplit[];
  discount?: {
    type: "percentage" | "amount";
    value: number;
  };
  tax?: number;
  tip?: number;
  subtotal: number;
  total: number;
  clientCount?: number;
  currentClient?: number;
  setCurrentClient?: (clientNumber: number) => void;
}

export interface OrderSplit {
  id: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  paid: boolean;
  paymentMethod?: "cash" | "card" | "other";
}

interface POSContextType {
  currentOrder: Order | null;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  activeCategory: string;
  menuItems: MenuItem[];
  categories: { id: string; name: string }[];
  subcategories: { id: string; name: string; category_id: string }[];
  createOrder: (tableNumber?: string, clientCount?: number) => void;
  addItemToOrder: (
    item: MenuItem,
    quantity?: number,
    modifiers?: OrderModifier[]
  ) => string | void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  addModifierToItem: (itemId: string, modifier: OrderModifier) => void;
  addNoteToItem: (itemId: string, note: string) => void;
  holdOrder: () => void;
  sendOrder: () => Promise<void>;
  payOrder: () => void;
  clearOrder: () => void;
  cancelOrder: () => void;
  setActiveCategory: (category: string) => void;
  activeSubcategory: string;
  setActiveSubcategory: (subcategory: string) => void;
  applyDiscount: (type: "percentage" | "amount", value: number) => void;
  splitOrder: (method: "even" | "by-item" | "custom") => void;
  resumeOrder: (order: Order) => void;
  loading: boolean;
  sending: boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  interface CategoryObj { id: string; name: string; }

  const [activeCategory, setActiveCategory] = useState<string>(""); // store id
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryObj[]>([]);
  const [subcategories, setSubcategories] = useState<{id:string;name:string;category_id:string}[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const { toast } = useToast();
  // Function to load and format orders from API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getOrders();
      const orderData = allOrders
        .filter(o => o.status !== "paid")
        .sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      const formattedOrders: Order[] = await Promise.all(
        orderData.map(async order => {
          const orderItems = await getOrderItems(order.id);
          const formattedItems = orderItems.map(item => {
            const menuItem = menuItems.find(mi => mi.id === item.menu_item_id) || {
              id: item.menu_item_id,
              name: "Unknown Item",
              price: item.price,
              category_id: ""
            } as MenuItem;
            return {
              id: item.id,
              menuItem,
              quantity: item.quantity,
              modifiers: [],
              price: item.price,
              clientNumber: item.client_number || 1,
              notes: item.notes
            };
          });
          return {
            id: order.id,
            items: formattedItems,
            tableNumber: order.table_number,
            server: order.server,
            status: order.status,
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at),
            subtotal: Number(order.subtotal) || 0,
            total: Number(order.total) || 0,
            tax: order.tax !== undefined ? Number(order.tax) : 0,
            tip: order.tip !== undefined ? Number(order.tip) : 0,
            discount:
              order.discount_type && order.discount_value
                ? {
                    type: order.discount_type as "percentage" | "amount",
                    value: order.discount_value
                  }
                : undefined,
            clientCount: order.client_count || 1
          };
        })
      );
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load POS orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu items and categories from database
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        // Fetch menu items via REST API
        const menuData = (await getMenu()).filter((it:any)=>it.is_active);
        setMenuItems(menuData);

        // build categories objects with at least one active item
        const catMap = new Map<string, CategoryObj>();
        menuData.forEach((it:any)=>{
          if(!catMap.has(it.category_id)){
            catMap.set(it.category_id,{ id: it.category_id, name: it.category_name});
          }
        });
        const catArr = Array.from(catMap.values());
        setCategories(catArr);

        // fetch subcategories once
        const allSubs = await getSubcategories();
        setSubcategories(allSubs);

        if (!activeCategory && catArr.length > 0) {
          setActiveCategory(catArr[0].id);
        }

        // Load orders from backend
        await loadOrders();
      } catch (error) {
        console.error("Error loading POS data:", error);
        toast({
          title: "Error",
          description: "Failed to load POS data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMenuData();
    // Load orders after fetching menu data
    loadOrders();
  }, []);

  // Create a new order
  const createOrder = (tableNumber?: string, clientCount: number = 1) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items: [],
      tableNumber,
      server: "Demo User",
      mergedFrom: [],
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
      subtotal: 0,
      total: 0,
      clientCount,
      currentClient: 1,
      setCurrentClient: (clientNumber: number) => {
        setCurrentOrder((prev) => {
          if (!prev) return null;
          return { ...prev, currentClient: clientNumber };
        });
      }
    };
    setCurrentOrder(newOrder);
    // Add new order to active orders list so map occupancy updates immediately
    setOrders(prev => [newOrder, ...prev]);
  };

  // Add an item to the current order
  const addItemToOrder = (
    item: MenuItem,
    quantity: number = 1,
    modifiers: OrderModifier[] = []
  ) => {
    if (!currentOrder) return "";

    const modifierPrice = modifiers.reduce(
      (sum, mod) =>
        sum + mod.selectedOptions.reduce((s, opt) => s + opt.price, 0),
      0
    );

    const orderItem: OrderItem = {
      id: `item-${Date.now()}`,
      menuItem: item,
      quantity,
      modifiers,
      price: item.price + modifierPrice,
      clientNumber: currentOrder.currentClient || 1
    };

    const updatedOrder = {
      ...currentOrder,
      items: [...currentOrder.items, orderItem],
      updatedAt: new Date(),
    };

    // Recalculate totals
    const subtotal = updatedOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    updatedOrder.subtotal = subtotal;
    updatedOrder.total = subtotal;
    
    if (updatedOrder.discount) {
      if (updatedOrder.discount.type === "percentage") {
        updatedOrder.total = subtotal * (1 - updatedOrder.discount.value / 100);
      } else {
        updatedOrder.total = subtotal - updatedOrder.discount.value;
      }
    }
    
    if (updatedOrder.tax) {
      updatedOrder.total += updatedOrder.subtotal * (updatedOrder.tax / 100);
    }

    setCurrentOrder(updatedOrder);
    if (!updatedOrder.id.startsWith('order-')) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, items: updatedOrder.items, subtotal: updatedOrder.subtotal, total: updatedOrder.total } : o));
    }
    return orderItem.id;
  };

  // Remove an item from the current order
  const removeItemFromOrder = (itemId: string) => {
    if (!currentOrder) return;

    const updatedOrder = {
      ...currentOrder,
      items: currentOrder.items.filter(item => item.id !== itemId),
      updatedAt: new Date(),
    };

    // Recalculate totals
    const subtotal = updatedOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    updatedOrder.subtotal = subtotal;
    updatedOrder.total = subtotal;
    
    if (updatedOrder.discount) {
      if (updatedOrder.discount.type === "percentage") {
        updatedOrder.total = subtotal * (1 - updatedOrder.discount.value / 100);
      } else {
        updatedOrder.total = subtotal - updatedOrder.discount.value;
      }
    }
    
    if (updatedOrder.tax) {
      updatedOrder.total += updatedOrder.subtotal * (updatedOrder.tax / 100);
    }

    setCurrentOrder(updatedOrder);
    if (!updatedOrder.id.startsWith('order-')) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, items: updatedOrder.items, subtotal: updatedOrder.subtotal, total: updatedOrder.total } : o));
    }
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });

    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
    };

    // Recalculate totals
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    updatedOrder.subtotal = subtotal;
    updatedOrder.total = subtotal;
    
    if (updatedOrder.discount) {
      if (updatedOrder.discount.type === "percentage") {
        updatedOrder.total = subtotal * (1 - updatedOrder.discount.value / 100);
      } else {
        updatedOrder.total = subtotal - updatedOrder.discount.value;
      }
    }
    
    if (updatedOrder.tax) {
      updatedOrder.total += updatedOrder.subtotal * (updatedOrder.tax / 100);
    }

    setCurrentOrder(updatedOrder);
    if (!updatedOrder.id.startsWith('order-')) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, items: updatedOrder.items, subtotal: updatedOrder.subtotal, total: updatedOrder.total } : o));
    }
  };

  // Add modifiers to an item
  const addModifierToItem = (itemId: string, modifier: OrderModifier) => {
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        const newModifiers = [...item.modifiers, modifier];
        const totalModPrice = newModifiers.reduce(
          (sum, mod) =>
            sum + mod.selectedOptions.reduce((s, opt) => s + opt.price, 0),
          0
        );

        return {
          ...item,
          modifiers: newModifiers,
          price: item.menuItem.price + totalModPrice,
        };
      }
      return item;
    });

    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
    };

    // Recalculate totals
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    updatedOrder.subtotal = subtotal;
    updatedOrder.total = subtotal;
    
    if (updatedOrder.discount) {
      if (updatedOrder.discount.type === "percentage") {
        updatedOrder.total = subtotal * (1 - updatedOrder.discount.value / 100);
      } else {
        updatedOrder.total = subtotal - updatedOrder.discount.value;
      }
    }
    
    if (updatedOrder.tax) {
      updatedOrder.total += updatedOrder.subtotal * (updatedOrder.tax / 100);
    }

    setCurrentOrder(updatedOrder);
    if (!updatedOrder.id.startsWith('order-')) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, items: updatedOrder.items, subtotal: updatedOrder.subtotal, total: updatedOrder.total } : o));
    }
  };

  // Add note to an item
  const addNoteToItem = (itemId: string, note: string) => {
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === itemId) {
        return { ...item, notes: note };
      }
      return item;
    });

    setCurrentOrder({
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
    });
    if (!currentOrder.id.startsWith('order-')) {
      setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, items: updatedItems } : o));
    }
  };

  // Change order status to hold
  const holdOrder = async () => {
    if (!currentOrder) return;

    try {
      if (currentOrder.id.startsWith('order-')) {
        const orderData = {
          table_number: currentOrder.tableNumber,
          server: currentOrder.server,
          status: 'hold',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        };
        const savedOrder = await apiCreateOrder(orderData);
        const orderId = savedOrder.id;
        for (const item of currentOrder.items) {
          await apiCreateOrderItem({
            order_id: orderId,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null,
            client_number: item.clientNumber,
          });
        }
      } else {
        await apiUpdateOrder(currentOrder.id, {
          status: 'hold',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        });
        for (const item of currentOrder.items) {
          if (item.id.startsWith('item-')) {
            await apiCreateOrderItem({
              order_id: currentOrder.id,
              menu_item_id: item.menuItem.id,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || null,
              client_number: item.clientNumber,
            });
          }
        }
      }
      await loadOrders();
      setCurrentOrder(null);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Change order status to sent
  const sendOrder = async () => {
    if (!currentOrder || sending) return;

    setSending(true);
    try {
      if (currentOrder.id.startsWith('order-')) {
        const orderData = {
          table_number: currentOrder.tableNumber,
          server: currentOrder.server,
          status: 'sent',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        };
        const savedOrder = await apiCreateOrder(orderData);
        const orderId = savedOrder.id;
        for (const item of currentOrder.items) {
          await apiCreateOrderItem({
            order_id: orderId,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null,
            client_number: item.clientNumber,
          });
        }
      } else {
        await apiUpdateOrder(currentOrder.id, {
          status: 'sent',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        });
        for (const item of currentOrder.items) {
          if (item.id.startsWith('item-')) {
            await apiCreateOrderItem({
              order_id: currentOrder.id,
              menu_item_id: item.menuItem.id,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || null,
              client_number: item.clientNumber,
            });
          }
        }
      }
      await loadOrders();
      setCurrentOrder(null);
      toast({ title: 'Success', description: 'Order sent' });
    } catch (error) {
      console.error('Error sending order:', error);
      toast({
        title: 'Error',
        description: 'Failed to send the order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  // Complete payment process
  const payOrder = async () => {
    if (!currentOrder) return;

    try {
      if (currentOrder.tableNumber) {
        const link = await getTableLink(currentOrder.tableNumber);
        if (link && link.group_id) {
          await payLinkedTables(currentOrder.tableNumber);
          await loadOrders();
          setCurrentOrder(null);
          return;
        }
      }
      if (currentOrder.id.startsWith('order-')) {
        const orderData = {
          table_number: currentOrder.tableNumber,
          server: currentOrder.server,
          status: 'paid',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        };
        const savedOrder = await apiCreateOrder(orderData);
        const orderId = savedOrder.id;
        for (const item of currentOrder.items) {
          await apiCreateOrderItem({
            order_id: orderId,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null,
            client_number: item.clientNumber,
          });
        }
      } else {
        await apiUpdateOrder(currentOrder.id, {
          status: 'paid',
          subtotal: currentOrder.subtotal,
          total: currentOrder.total,
          client_count: currentOrder.clientCount,
          discount_type: currentOrder.discount?.type,
          discount_value: currentOrder.discount?.value,
          tax: currentOrder.tax,
          tip: currentOrder.tip,
        });
        for (const item of currentOrder.items) {
          if (item.id.startsWith('item-')) {
            await apiCreateOrderItem({
              order_id: currentOrder.id,
              menu_item_id: item.menuItem.id,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || null,
              client_number: item.clientNumber,
            });
          }
        }
      }
      await loadOrders();
      setCurrentOrder(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Clear the current order
  const clearOrder = () => {
    setCurrentOrder(null);
  };

  // Cancel the current order and remove it from the list
  const cancelOrder = () => {
    if (!currentOrder) return;
    setOrders(prev => prev.filter(o => o.id !== currentOrder.id));
    setCurrentOrder(null);
  };

  // Apply discount to order
  const applyDiscount = (type: "percentage" | "amount", value: number) => {
    if (!currentOrder) return;

    const updatedOrder = {
      ...currentOrder,
      discount: { type, value },
      updatedAt: new Date(),
    };

    // Recalculate total with discount
    if (type === "percentage") {
      updatedOrder.total = updatedOrder.subtotal * (1 - value / 100);
    } else {
      updatedOrder.total = updatedOrder.subtotal - value;
    }
    
    // Apply tax if present
    if (updatedOrder.tax) {
      updatedOrder.total += updatedOrder.subtotal * (updatedOrder.tax / 100);
    }

    setCurrentOrder(updatedOrder);
  };

  // Split the order
  const splitOrder = (method: "even" | "by-item" | "custom") => {
    if (!currentOrder) return;

    const updatedOrder = {
      ...currentOrder,
      splitMethod: method,
      updatedAt: new Date(),
    };

    // Initialize splits based on method
    if (method === "even") {
      // Example: Split evenly between 2 people
      const perPersonAmount = updatedOrder.total / 2;
      updatedOrder.splits = [
        {
          id: `split-1-${Date.now()}`,
          name: "Split 1",
          items: [...updatedOrder.items],
          subtotal: updatedOrder.subtotal / 2,
          tax: (updatedOrder.tax || 0) / 2,
          total: perPersonAmount,
          paid: false,
        },
        {
          id: `split-2-${Date.now()}`,
          name: "Split 2",
          items: [...updatedOrder.items],
          subtotal: updatedOrder.subtotal / 2,
          tax: (updatedOrder.tax || 0) / 2,
          total: perPersonAmount,
          paid: false,
        }
      ];
    }

    setCurrentOrder(updatedOrder);
  };

  // Resume an existing order
  const resumeOrder = async (order: Order) => {
    try {
      let fullItems = order.items;
      if (!order.id.startsWith('order-')) {
        await apiUpdateOrder(order.id, { status: 'new' });
        const latest = await getOrderItems(order.id);
        fullItems = latest.map(item => {
          const mi = menuItems.find(m => m.id === item.menu_item_id) || {
            id: item.menu_item_id,
            name: 'Unknown Item',
            price: item.price,
            category_id: ''
          } as MenuItem;
          return {
            id: item.id,
            menuItem: mi,
            quantity: item.quantity,
            modifiers: [],
            price: item.price,
            clientNumber: item.client_number || 1,
            notes: item.notes
          };
        });
        setOrders(orders.filter(o => o.id !== order.id));
      } else {
        setOrders(orders.filter(o => o.id !== order.id));
      }

      const resumedOrder = {
        ...order,
        items: fullItems,
        updatedAt: new Date(),
        setCurrentClient: (clientNumber: number) => {
          setCurrentOrder((prev) => {
            if (!prev) return null;
            return { ...prev, currentClient: clientNumber };
          });
        }
      };

      setCurrentOrder(resumedOrder);
    } catch (error) {
      console.error("Error resuming order:", error);
      toast({
        title: "Error",
        description: "Failed to resume the order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <POSContext.Provider
      value={{
        currentOrder,
        orders,
        setOrders,
        activeCategory,
        menuItems,
        categories,
        subcategories,
        createOrder,
        addItemToOrder,
        removeItemFromOrder,
        updateItemQuantity,
        addModifierToItem,
        addNoteToItem,
        holdOrder,
        sendOrder,
        payOrder,
        clearOrder,
        cancelOrder,
        setActiveCategory,
        activeSubcategory,
        setActiveSubcategory,
        applyDiscount,
        splitOrder,
        resumeOrder,
        loading,
        sending
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
