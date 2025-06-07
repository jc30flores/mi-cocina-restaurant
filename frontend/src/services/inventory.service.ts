
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/services/api";

export type InventoryItem = any; // from backend API
export type InsertInventoryItem = {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier?: string | null;
};

export const inventoryService = {
  async getAllItems() {
    try {
      return await getInventory();
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }
  },

  // For specific item, filter from fetched list
  async getItemById(id: string) {
    const items = await getInventory();
    return items.find((item: any) => item.id === id) || null;
  },

  // addItem, updateItem, deleteItem not implemented in API
  async addItem(item: any) {
    try {
      return await createInventoryItem(item);
    } catch (e) {
      console.error("Error adding inventory item:", e);
      throw e;
    }
  },

  async updateItem(id: string, updates: any) {
    try {
      return await updateInventoryItem(id, updates);
    } catch (e) {
      console.error("Error updating inventory item:", e);
      throw e;
    }
  },

  async deleteItem(id: string) {
    try {
      return await deleteInventoryItem(id);
    } catch (e) {
      console.error("Error deleting inventory item:", e);
      throw e;
    }
  }
};
