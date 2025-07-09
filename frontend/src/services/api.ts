const API_URL = import.meta.env.VITE_API_URL;

// Wait for backend readiness by polling the /api/health endpoint
export async function waitForHealth(retries = 5): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) return true;
    } catch {
      // ignore errors until retries exhausted
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Backend not ready');
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

export async function getTables() {
  const res = await fetch(`${API_URL}/tables`);
  return handleResponse(res);
}

export async function getTable(id: string) {
  const res = await fetch(`${API_URL}/tables/${id}`);
  return handleResponse(res);
}

export async function updateTable(id: string, data: any) {
  const res = await fetch(`${API_URL}/tables/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getMenu() {
  const res = await fetch(`${API_URL}/menu`);
  const data = await handleResponse(res);
  // Ensure price is numeric
  return data.map((item: any) => ({
    ...item,
    price:
      typeof item.price === 'string'
        ? parseFloat(item.price)
        : item.price,
  }));
}

export async function createOrder(data: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  return handleResponse(res);
}

export async function updateOrder(id: string, data: any) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function mergeOrders(sourceId: string, targetId: string) {
  const res = await fetch(`${API_URL}/orders/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_order_id: sourceId, target_order_id: targetId }),
  });
  return handleResponse(res);
}

export async function changeOrderTable(orderId: string, tableNumber: string) {
  const res = await fetch(`${API_URL}/orders/change-table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, table_number: tableNumber }),
  });
  return handleResponse(res);
}

export async function getOrderItems(orderId: string) {
  const res = await fetch(`${API_URL}/order-items/${orderId}`);
  return handleResponse(res);
}

export async function createOrderItem(data: any) {
  const res = await fetch(`${API_URL}/order-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getEmployees() {
  const res = await fetch(`${API_URL}/employees`);
  // Parse numeric fields (e.g., hourly_rate comes as string from backend)
  const data = await handleResponse(res);
  return data.map((emp: any) => ({
    ...emp,
    hourly_rate:
      typeof emp.hourly_rate === 'string'
        ? parseFloat(emp.hourly_rate)
        : emp.hourly_rate,
  }));
}

export async function getInventory() {
  const res = await fetch(`${API_URL}/inventory`);
  return handleResponse(res);
}

// Menu item management
export async function createMenuItem(data: any) {
  const res = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ----------------- Subcategories -----------------
export async function getSubcategories(categoryId?: string) {
  const url = categoryId ? `${API_URL}/subcategories?category_id=${categoryId}` : `${API_URL}/subcategories`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createSubcategory(data: any) {
  const res = await fetch(`${API_URL}/subcategories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateSubcategory(id: string, data: any) {
  const res = await fetch(`${API_URL}/subcategories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteSubcategory(id: string) {
  const res = await fetch(`${API_URL}/subcategories/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function updateMenuItem(id: string, data: any) {
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Employee management
export async function createEmployee(data: any) {
  const res = await fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateEmployee(id: string, data: any) {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Break history management
export async function createBreakHistory(data: any) {
  const res = await fetch(`${API_URL}/break-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Fetch break history records for an employee
export async function getBreakHistory(employeeId: string) {
  const res = await fetch(`${API_URL}/break-history?employee_id=${employeeId}`);
  return handleResponse(res);
}

export async function updateBreakHistory(id: string, data: any) {
  const res = await fetch(`${API_URL}/break-history/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`);
  return handleResponse(res);
}

// Sections
export async function getSections() {
  const res = await fetch(`${API_URL}/sections`);
  return handleResponse(res);
}

// ----------------- Menu Categories -----------------
export async function getMenuCategories() {
  const res = await fetch(`${API_URL}/menu-categories`);
  return handleResponse(res);
}

export async function createMenuCategory(data: any) {
  const res = await fetch(`${API_URL}/menu-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateMenuCategory(id: string, data: any) {
  const res = await fetch(`${API_URL}/menu-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteMenuCategory(id: string) {
  const res = await fetch(`${API_URL}/menu-categories/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// --------------- Customizations -----------------
export async function getCustomizationGroups() {
  const res = await fetch(`${API_URL}/customization-groups`);
  return handleResponse(res);
}

export async function createCustomizationGroup(data: any) {
  const res = await fetch(`${API_URL}/customization-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCustomizationGroup(id: string, data: any) {
  const res = await fetch(`${API_URL}/customization-groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCustomizationGroup(id: string) {
  const res = await fetch(`${API_URL}/customization-groups/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getCustomizationOptions(groupId?: string) {
  const url = groupId ? `${API_URL}/customization-options?group_id=${groupId}` : `${API_URL}/customization-options`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function createCustomizationOption(data: any) {
  const res = await fetch(`${API_URL}/customization-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCustomizationOption(id: string, data: any) {
  const res = await fetch(`${API_URL}/customization-options/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCustomizationOption(id: string) {
  const res = await fetch(`${API_URL}/customization-options/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getItemCustomizations(itemId: string) {
  const res = await fetch(`${API_URL}/menu-items/${itemId}/customizations`);
  return handleResponse(res);
}

export async function updateItemCustomizations(itemId: string, data: any) {
  const res = await fetch(`${API_URL}/menu-items/${itemId}/customizations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
export async function createSection(data: any) {
  const res = await fetch(`${API_URL}/sections`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  return handleResponse(res);
}
export async function updateSection(id: string, data: any) {
  const res = await fetch(`${API_URL}/sections/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  return handleResponse(res);
}
export async function deleteSection(id: string) {
  const res = await fetch(`${API_URL}/sections/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Map Elements CRUD
export async function getMapElements() {
  const res = await fetch(`${API_URL}/elements`);
  return handleResponse(res);
}
export async function createMapElement(data: any) {
  const res = await fetch(`${API_URL}/elements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
export async function updateMapElement(id: string, data: any) {
  const res = await fetch(`${API_URL}/elements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
export async function deleteMapElement(id: string) {
  const res = await fetch(`${API_URL}/elements/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Inventory items
export async function createInventoryItem(data: any) {
  const res = await fetch(`${API_URL}/inventory_items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateInventoryItem(id: string, data: any) {
  const res = await fetch(`${API_URL}/inventory_items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteInventoryItem(id: string) {
  const res = await fetch(`${API_URL}/inventory_items/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

// Tables
export async function createTable(data: any) {
  const res = await fetch(`${API_URL}/tables`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  return handleResponse(res);
}
export async function deleteTable(id: string) {
  const res = await fetch(`${API_URL}/tables/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
// ---- Table Linking ----
export async function linkTables(leader: string, tables: string[]) {
  const res = await fetch(`${API_URL}/table-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leader, tables }),
  });
  return handleResponse(res);
}

export async function getTableLink(tableNumber: string) {
  const res = await fetch(`${API_URL}/table-links/table/${tableNumber}`);
  return handleResponse(res);
}

export async function payLinkedTables(tableNumber: string) {
  const res = await fetch(`${API_URL}/pay-linked/${tableNumber}`, { method: 'POST' });
  return handleResponse(res);
}

export async function unlinkTable(tableNumber: string, unlinkAll: boolean) {
  const res = await fetch(`${API_URL}/unlink-table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_number: tableNumber, unlink_all: unlinkAll })
  });
  return handleResponse(res);
}
