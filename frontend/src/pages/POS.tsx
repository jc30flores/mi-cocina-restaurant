import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import CategorySelector from "@/components/POS/CategorySelector";
import SubcategorySelector from "@/components/POS/SubcategorySelector";
import MenuItems from "@/components/POS/MenuItems";
import OrderTicket from "@/components/POS/OrderTicket";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { TableMap } from "@/components/TableMap/TableMap";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getTables, getMapElements, getSections, updateTable, getOrderItems, getOrders, mergeOrders as mergeOrdersApi, changeOrderTable, linkTables, unlinkTable, updateOrderStatus } from "@/services/api";
import type { TableData } from "@/components/TableMap/TableMap";
import { 
  PlusCircle,
  Eye,
  DollarSign,
  Clock,
  Users,
  List,
  LayoutGrid,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUUID = (id: string | undefined | null): boolean => !!id && uuidRegex.test(id);

// Compute orientation-aware merged rectangle for a group of tables
const computeMergedDimensions = (group: TableData[]) => {
  const minX = Math.min(...group.map(t => t.position_x));
  const minY = Math.min(...group.map(t => t.position_y));
  const maxX = Math.max(...group.map(t => t.position_x + t.width));
  const maxY = Math.max(...group.map(t => t.position_y + t.height));
  const boundingWidth = maxX - minX;
  const boundingHeight = maxY - minY;
  const isVertical = boundingHeight >= boundingWidth;

  const width = isVertical
    ? Math.max(...group.map(t => t.width))
    : group.reduce((sum, t) => sum + t.width, 0);
  const height = isVertical
    ? group.reduce((sum, t) => sum + t.height, 0)
    : Math.max(...group.map(t => t.height));

  return { left: minX, top: minY, width, height };
};

// Helper function to format order status
const getStatusBadge = (status) => {
  const statusStyles = {
    preparando: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    servida: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    pagada: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelada: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const statusLabels = {
    preparando: "Preparando",
    servida: "Servida",
    pagada: "Pagada",
    cancelada: "Cancelada",
  };

  return (
    <Badge className={statusStyles[status] || "bg-gray-100"} variant="outline">
      {statusLabels[status] || status}
    </Badge>
  );
};

const POS = () => {
  const { currentOrder, orders, resumeOrder, createOrder, cancelOrder, setOrders, menuItems } = usePOS();
  const { waiterColor } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [viewOrderDetails, setViewOrderDetails] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("tableMap");
  // Tables for map view
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const [selectedSection, setSelectedSection] = useState<{ id: string; name: string } | null>(null);
  const [tables, setTables] = useState<TableData[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  // State for selecting client count when starting an order
  const [showClientCountDialog, setShowClientCountDialog] = useState(false);
  const [pendingTableNumber, setPendingTableNumber] = useState<string>("");
  const [pendingCapacity, setPendingCapacity] = useState<number>(1);
  const [selectedClientCount, setSelectedClientCount] = useState<number>(1);
  // Merge tables mode (temporary super-table)
  const [mergeMode, setMergeMode] = useState<boolean>(false);
  const [mergeSelection, setMergeSelection] = useState<string[]>([]);
  // Merge orders mode
  const [mergeOrdersMode, setMergeOrdersMode] = useState<boolean>(false);
  const [mergeSourceTable, setMergeSourceTable] = useState<string | null>(null);
  const [pendingMergeTarget, setPendingMergeTarget] = useState<string | null>(null);
  const [showMergeConfirm, setShowMergeConfirm] = useState<boolean>(false);
  const [merging, setMerging] = useState<boolean>(false);
  // Move order to different table
  const [moveOrderMode, setMoveOrderMode] = useState<boolean>(false);
  const [moveSourceTable, setMoveSourceTable] = useState<string | null>(null);
  const [pendingMoveTarget, setPendingMoveTarget] = useState<string | null>(null);
  const [showMoveConfirm, setShowMoveConfirm] = useState<boolean>(false);
  const [moving, setMoving] = useState<boolean>(false);
  // Link tables mode
  const [linkMode, setLinkMode] = useState<boolean>(false);
  const [linkLeader, setLinkLeader] = useState<string | null>(null);
  const [linkSelection, setLinkSelection] = useState<string[]>([]);
  const [unlinkTableNumber, setUnlinkTableNumber] = useState<string | null>(null);
  const [unlinkGroupId, setUnlinkGroupId] = useState<string | null>(null);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState<boolean>(false);
  const [unlinking, setUnlinking] = useState<boolean>(false);

  const refreshOrders = async () => {
    try {
      const all = await getOrders();
      const orderData = all
        .filter(o => o.status !== 'pagada')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const formatted = await Promise.all(
        orderData.map(async order => {
          const orderItems = await getOrderItems(order.id);
          const items = orderItems.map(it => {
            const mi = menuItems.find(m => m.id === it.menu_item_id) || {
              id: it.menu_item_id,
              name: 'Unknown Item',
              price: it.price,
              category_id: ''
            } as any;
            return {
              id: it.id,
              menuItem: mi,
              quantity: it.quantity,
              modifiers: [],
              price: it.price,
              clientNumber: it.client_number || 1,
              notes: it.notes
            };
          });
          return {
            id: order.id,
            items,
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
                ? { type: order.discount_type as any, value: order.discount_value }
                : undefined,
            clientCount: order.client_count || 1
          } as any;
        })
      );
      setOrders(formatted);
      return formatted;
    } catch (e) {
      console.error('Error loading orders', e);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesData, elementsData, sectionsData] = await Promise.all([
          getTables(),
          getMapElements(),
          getSections()
        ]);
        setTables(tablesData);
        setElements(elementsData);
        setSections(sectionsData);
        if (sectionsData.length > 0) {
          setSelectedSection(sectionsData[0]);
        }
      } catch (error) {
        console.error("Error fetching map data:", error);
        toast({ title: "Error", description: "Failed to load map data", variant: "destructive" });
      }
    };
    fetchData();
  }, [toast]);
  // Handle selecting a table to start a new order: prompt for client count
  const handleTableSelect = (id: string, number: string) => {
    // If in merge mode, add/remove table selection
    if (mergeMode) {
      setMergeSelection(prev =>
        prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
      );
      return;
    }
    if (linkMode) {
      if (number === linkLeader) return;
      setLinkSelection(prev =>
        prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
      );
      return;
    }
    // If in move order mode, choose destination table
    if (moveOrderMode) {
      if (number === moveSourceTable) return;
      const hasOrder = activeOrders.find(o => o.tableNumber === number);
      if (hasOrder) {
        toast({ title: 'Error', description: 'Table already has an order', variant: 'destructive' });
        return;
      }
      setPendingMoveTarget(number);
      setShowMoveConfirm(true);
      return;
    }
    // If in merge orders mode, choose target table
    if (mergeOrdersMode) {
      if (number === mergeSourceTable) return;
      const hasOrder = activeOrders.find(o => o.tableNumber === number);
      if (!hasOrder) return;
      setPendingMergeTarget(number);
      setShowMergeConfirm(true);
      return;
    }
    const table = tables.find(t => t.id === id);
    const capacity = (table as any)?.capacity ?? 1;
    // If table already has an active order, resume that order instead of starting new
    const existing = activeOrders.find(
      (o) => o.tableNumber === number
    );
    if (existing) {
      handleResumeOrder(existing);
      setActiveTab("tableMap");
      return;
    }
    // Start a new order: select number of guests based on table capacity
    setPendingTableNumber(number);
    setPendingCapacity(capacity);
    setSelectedClientCount(1);
    setShowClientCountDialog(true);
  };
  // Cancel merge mode and clear selection
  const cancelMerge = () => {
    setMergeMode(false);
    setMergeSelection([]);
  };
  const startMergeFrom = (tableNumber: string) => {
    setMergeMode(true);
    setMergeSelection([tableNumber]);
  };

  const startLinkFrom = (tableNumber: string) => {
    setLinkMode(true);
    setLinkLeader(tableNumber);
    setLinkSelection([tableNumber]);
  };

  const startUnlinkFrom = (tableNumber: string, groupId: string) => {
    setUnlinkTableNumber(tableNumber);
    setUnlinkGroupId(groupId);
    setShowUnlinkDialog(true);
  };

  const cancelLink = () => {
    setLinkMode(false);
    setLinkLeader(null);
    setLinkSelection([]);
  };
  // Merge selected tables into a super-table to start combined order
  const handleMerge = () => {
    if (mergeSelection.length < 2) return;
    // Composite table number, e.g. "3-4"
    const sorted = [...mergeSelection].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    const composite = sorted.join('-');
    // Sum capacities of selected tables
    const capSum = sorted.reduce((sum, num) => {
      const tbl = tables.find(t => t.number === num);
      return sum + (tbl?.capacity || 0);
    }, 0);
    setPendingTableNumber(composite);
    setPendingCapacity(capSum);
    setSelectedClientCount(1);
    setShowClientCountDialog(true);
    // keep merge mode active until order is confirmed to show combined positions during dialog
  };

  const handleLink = async () => {
    if (linkSelection.length < 2 || !linkLeader) return;
    try {
      await linkTables(linkLeader, linkSelection.filter(n => n !== linkLeader));
      const tbls = await getTables();
      setTables(tbls);
      cancelLink();
      toast({ title: 'Tables linked' });
    } catch (e: any) {
      console.error(e);
      let msg = 'Failed to link tables';
      if (e?.message?.includes('table_already_linked')) {
        msg = 'Selected table is already linked to another group.';
      } else if (e?.message?.includes('no_active_order')) {
        msg = 'Cannot link to a table without an active order.';
      }
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const executeUnlink = async (all: boolean) => {
    if (!unlinkTableNumber) return;
    setUnlinking(true);
    try {
      await unlinkTable(unlinkTableNumber, all);
      const tbls = await getTables();
      setTables(tbls);
      await refreshOrders();
      toast({ title: 'Tables unlinked' });
    } catch (e: any) {
      console.error('Unlink table failed:', e);
      const err = e?.message || '';
      let msg =
        'Unable to unlink this table. Please check if it is already unlinked or try again later.';
      if (err.includes('payment')) {
        msg = 'Unlinking is not allowed while payment is in progress.';
      } else if (err.includes('not linked')) {
        msg = 'Table is not linked or already unlinked.';
      }
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
    setUnlinking(false);
    setShowUnlinkDialog(false);
    setUnlinkTableNumber(null);
    setUnlinkGroupId(null);
  };

  // Get active orders for the current user (simple version, will need user context in real app)
  const activeOrders = orders.filter(
    (order) => order.status !== "pagada" && order.server === "Demo User"
  );

  // Apply filter if needed
  const filteredOrders = statusFilter === "all" 
    ? activeOrders 
    : activeOrders.filter(order => order.status === statusFilter);

  const handleNewOrder = () => {
    // Switch to table map to start a new order via map UI
    setActiveTab("tableMap");
  };

  const handleResumeOrder = async (order) => {
    try {
      const items = await getOrderItems(order.id);
      const formatted = items.map((it:any) => {
        const mi = menuItems.find(m => m.id === it.menu_item_id) || {
          id: it.menu_item_id,
          name: 'Unknown Item',
          price: it.price,
          category_id: ''
        };
        return {
          id: it.id,
          menuItem: mi,
          quantity: it.quantity,
          modifiers: [],
          price: it.price,
          clientNumber: it.client_number || 1,
          notes: it.notes
        };
      });
      resumeOrder({ ...order, items: formatted });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load order items', variant: 'destructive' });
    }
  };

  const handlePayOrder = (order) => {
    // This would trigger the payment process in a real app
  };

  const marcarComoServida = async (id: string) => {
    try {
      await updateOrderStatus(id, "servida");
      await refreshOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      const items = await getOrderItems(order.id);
      const formatted = items.map((it:any) => {
        const mi = menuItems.find(m => m.id === it.menu_item_id) || {
          id: it.menu_item_id,
          name: 'Unknown Item',
          price: it.price,
          category_id: ''
        };
        return {
          id: it.id,
          menuItem: mi,
          quantity: it.quantity,
          modifiers: [],
          price: it.price,
          clientNumber: it.client_number || 1,
          notes: it.notes
        };
      });
      setViewOrderDetails({ ...order, items: formatted });
      setShowOrderDetails(true);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load order items', variant: 'destructive' });
    }
  };

  const handleCancelOrder = () => {
    cancelOrder();
    setActiveTab("tableMap");
  };

  const startMergeOrders = (tableNumber: string) => {
    setMergeOrdersMode(true);
    setMergeSourceTable(tableNumber);
    setMerging(false);
    setActiveTab("tableMap");
  };

  const startMoveOrder = (tableNumber: string) => {
    setMoveOrderMode(true);
    setMoveSourceTable(tableNumber);
    setMoving(false);
    setActiveTab('tableMap');
  };

  const executeMergeOrders = async (targetNumber: string) => {
    if (!mergeSourceTable) return;
    const sourceOrder = orders.find(o => o.tableNumber === mergeSourceTable);
    const targetOrder = orders.find(o => o.tableNumber === targetNumber);
    if (!sourceOrder || !targetOrder) {
      toast({ title: 'Error', description: 'Order not found for one of the tables', variant: 'destructive' });
      return;
    }

    if (!isUUID(sourceOrder.id) || !isUUID(targetOrder.id)) {
      console.error('Invalid order IDs', sourceOrder.id, targetOrder.id);
      toast({ title: 'Error', description: 'Invalid order data', variant: 'destructive' });
      return;
    }

    console.log('Merging orders', sourceOrder.id, '->', targetOrder.id);

    setMerging(true);

    try {
      await mergeOrdersApi(sourceOrder.id, targetOrder.id);
      const updatedOrders = await refreshOrders();
      const tblData = await getTables();
      setTables(tblData);

      if (currentOrder) {
        const merged = updatedOrders?.find(o => o.id === targetOrder.id);
        if (merged) {
          merged.mergedFrom = [...(merged.mergedFrom || []), mergeSourceTable!];
        }
        if (currentOrder.id === sourceOrder.id && merged) {
          resumeOrder(merged);
        } else if (currentOrder.id === targetOrder.id && merged) {
          resumeOrder(merged);
        } else if (currentOrder.id === sourceOrder.id) {
          cancelOrder();
        }
      }
    } catch (err) {
      console.error('Error merging orders:', err);
      toast({ title: 'Error', description: 'Failed to merge orders', variant: 'destructive' });
    }

    setMerging(false);
    setMergeOrdersMode(false);
    setMergeSourceTable(null);
    setPendingMergeTarget(null);
    setShowMergeConfirm(false);
  };

  const executeMoveOrder = async (targetNumber: string) => {
    if (!moveSourceTable) return;
    const order = orders.find(o => o.tableNumber === moveSourceTable);
    if (!order) {
      toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
      return;
    }
    if (!isUUID(order.id)) {
      console.error('Invalid order ID', order.id);
      toast({ title: 'Error', description: 'Invalid order data', variant: 'destructive' });
      return;
    }

    console.log('Moving order', order.id, '-> table', targetNumber);
    setMoving(true);
    try {
      await changeOrderTable(order.id, targetNumber);
      const updatedOrders = await refreshOrders();
      const tblData = await getTables();
      setTables(tblData);

      if (currentOrder && currentOrder.id === order.id) {
        const moved = updatedOrders?.find(o => o.id === order.id);
        if (moved) {
          resumeOrder(moved);
        }
      }
    } catch (err) {
      console.error('Error moving order:', err);
      toast({ title: 'Error', description: 'Failed to change table', variant: 'destructive' });
    }
    setMoving(false);
    setMoveOrderMode(false);
    setMoveSourceTable(null);
    setPendingMoveTarget(null);
    setShowMoveConfirm(false);
  };

  // Filter by section
  // Filter by section (show all tables in section)
  const filteredTables = selectedSection
    ? tables.filter(t => t.section_id === selectedSection.id)
    : tables;
  // For POS, display all unoccupied tables translucent, occupied tables vivid
  // Build set of occupied table numbers, splitting merged composites
  const activeTableNumbers = new Set<string>();
  activeOrders.forEach(o => {
    const tbl = o.tableNumber;
    if (tbl) {
      if (tbl.includes('-')) {
        tbl.split('-').forEach(num => activeTableNumbers.add(num));
        activeTableNumbers.add(tbl);
      } else {
        activeTableNumbers.add(tbl);
      }
    }
  });
  const visualTables = filteredTables.map(table => {
    const baseColor = table.color;
    const isOccupied = activeTableNumbers.has(table.number);
    // Unoccupied tables translucent, occupied tables vivid
    const displayColor = baseColor
      ? isOccupied
        ? baseColor
        : `${baseColor}33`
      : undefined;
    // Text color: white for unoccupied, black for occupied
    const textColor = isOccupied ? '#000000' : '#FFFFFF';
    // Status for brightness logic
    const status = isOccupied ? 'occupied' : 'available';
    return { ...table, color: displayColor, status, textColor };
  });

  // Build merged composite tables for any active orders that span multiple tables
  const mergedVisualTables = React.useMemo(() => {
    const baseTables: typeof visualTables = [...visualTables];

    // Identify composite table orders e.g., "3-4-5"
    const compositeOrders = activeOrders.filter(o => o.tableNumber && o.tableNumber.includes('-'));
    if (compositeOrders.length === 0) return baseTables;

    // Helper to remove tables already merged
    const toRemoveIds = new Set<string>();
    const mergedList: typeof visualTables = [];

    compositeOrders.forEach(order => {
      const numberStr = order.tableNumber as string;
      const nums = numberStr.split('-');
      // get tables for these numbers that exist in current section
      const group = baseTables.filter(t => nums.includes(t.number));
      if (group.length < 2) return; // skip if not enough tables

      group.forEach(t => toRemoveIds.add(t.id));

      // Compute merged rectangle, oriented based on table layout
      const { left, top, width: mergedWidth, height: maxHeight } = computeMergedDimensions(group);

      const representative = group[0];

      mergedList.push({
        ...representative,
        // When merging round tables, render merged table as rectangle
        shape: 'square',
        id: `merged-${numberStr}`,
        number: numberStr,
        position_x: left,
        position_y: top,
        width: mergedWidth,
        height: maxHeight,
        status: 'occupied',
        color: representative.color?.replace('33', '') || representative.color, // vivid
      });
    });

    // Remove merged tables from base and add merged rectangles
    const remaining = baseTables.filter(t => !toRemoveIds.has(t.id));
    return [...remaining, ...mergedList];
  }, [visualTables, activeOrders]);

  // When in merge mode, combine currently selected tables into a temporary
  // preview rectangle so the waiter can visualize the merged layout before
  // starting the order
  const previewVisualTables = React.useMemo(() => {
    if (!mergeMode || mergeSelection.length < 2) return mergedVisualTables;

    const baseTables: typeof mergedVisualTables = [...mergedVisualTables];
    const numbers = [...mergeSelection];

    const group = baseTables.filter(t => numbers.includes(t.number));
    if (group.length < 2) return mergedVisualTables;

    const remaining = baseTables.filter(t => !numbers.includes(t.number));

    // Preview merged rectangle respecting table orientation
    const { left, top, width: mergedWidth, height: maxHeight } = computeMergedDimensions(group);

    const rep = group[0];
    const mergedNumber = numbers
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .join('-');

    const previewTable = {
      ...rep,
      // Render preview merged tables as rectangles
      shape: 'square',
      id: `preview-${mergedNumber}`,
      number: mergedNumber,
      position_x: left,
      position_y: top,
      width: mergedWidth,
      height: maxHeight,
      status: 'pending',
      color: rep.color?.replace('33', '') || rep.color,
    } as typeof rep;

    return [...remaining, previewTable];
  }, [mergeMode, mergeSelection, mergedVisualTables]);
  const filteredElements = selectedSection
    ? elements.filter(e => e.section_id === selectedSection.id)
    : elements;
  // Compute display table positions, applying merge clustering if in merge mode
  const displayTables = React.useMemo(() => {
    if (mergeOrdersMode) {
      return previewVisualTables.map(t => {
        const isSource = mergeSourceTable && t.number === mergeSourceTable;
        const isOccupied = activeTableNumbers.has(t.number);
        if (!isSource && !isOccupied) return t;
        return {
          ...t,
          highlight: isOccupied,
          sourceHighlight: isSource,
        } as any;
      });
    }
    if (moveOrderMode) {
      return previewVisualTables.map(t => {
        const isSource = moveSourceTable && t.number === moveSourceTable;
        const isOccupied = activeTableNumbers.has(t.number);
        if (isSource) return { ...t, sourceHighlight: true } as any;
        if (!isOccupied) return { ...t, highlight: true } as any;
        return t;
      });
    }
    if (linkMode) {
      return previewVisualTables.map(t => {
        const selected = linkSelection.includes(t.number);
        if (selected) return { ...t, highlight: true } as any;
        return t;
      });
    }
    return previewVisualTables;
  }, [previewVisualTables, mergeOrdersMode, mergeSourceTable, moveOrderMode, moveSourceTable, activeTableNumbers, linkMode, linkSelection]);
  return (
    <MainLayout noPadding hideNav={!!currentOrder}>
        {waiterColor && (
          <div className="mt-1 mb-2 flex items-center gap-2">
            {currentOrder && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleCancelOrder}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {currentOrder && (
              <div className="ml-6 flex items-center gap-2">
                {Array.from({ length: currentOrder.clientCount || 1 }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentOrder.currentClient === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => currentOrder.setCurrentClient?.(index + 1)}
                  >
                    Client {index + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {!currentOrder ? (
          <div className="flex-1 flex flex-col">            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
              <div className="flex flex-wrap items-center gap-2 p-2 pb-0">
                <TabsList className="mb-0 mr-2">
                  <TabsTrigger value="tableMap" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    <span>{t("Mapa de Mesas")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="orderList" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>{t("Lista de Órdenes")}</span>
                  </TabsTrigger>
                </TabsList>
                {sections.map(sec => (
                  <Button
                    key={sec.id}
                    size="sm"
                    variant={selectedSection?.id === sec.id ? 'default' : 'outline'}
                    className={selectedSection?.id === sec.id ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    onClick={() => setSelectedSection(sec)}
                  >
                    {sec.name}
                  </Button>
                ))}
              </div>
              
              <TabsContent value="tableMap" className="flex-1 flex flex-col h-full">
                <div className="flex-1 mb-8 flex flex-col">
                  {/* Merge tables controls */}
                  {mergeMode && (
                    <div className="p-2 flex items-center gap-2">
                      <span className="text-sm">{t("Mesas seleccionadas")}: {mergeSelection.join(', ')}</span>
                      <Button variant="outline" size="sm" onClick={cancelMerge}>
                        {t("Cancelar Fusión")}
                      </Button>
                      <Button size="sm" onClick={handleMerge} disabled={mergeSelection.length < 2}>
                        {t("Iniciar Orden Fusionada")}
                      </Button>
                    </div>
                  )}
                  {linkMode && (
                    <div className="p-2 flex items-center gap-2">
                      <span className="text-sm">{t("Enlazando")}: {linkSelection.join(', ')}</span>
                      <Button variant="outline" size="sm" onClick={cancelLink}>
                        {t("Cancelar Enlace")}
                      </Button>
                      <Button size="sm" onClick={handleLink} disabled={linkSelection.length < 2}>
                        {t("Confirmar Enlace")}
                      </Button>
                    </div>
                  )}
                  {mergeOrdersMode && (
                    <div className="p-2">
                      <Button variant="outline" size="sm" onClick={() => { setMergeOrdersMode(false); setMergeSourceTable(null); }}>
                        {t("Cancelar")}
                      </Button>
                    </div>
                  )}
                  {moveOrderMode && (
                    <div className="p-2">
                      <Button variant="outline" size="sm" onClick={() => { setMoveOrderMode(false); setMoveSourceTable(null); }}>
                        {t("Cancelar")}
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <TableMap
                      tables={displayTables}
                      elements={filteredElements}
                      onTableSelect={handleTableSelect}
                      onTableMove={() => {}}
                      onMergeTables={startMergeFrom}
                      onMergeOrders={startMergeOrders}
                      onMoveOrderTable={startMoveOrder}
                      onLinkTables={startLinkFrom}
                      onUnlinkTable={startUnlinkFrom}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="orderList">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{t("Gestión de Órdenes")}</h1>
                    <p className="text-muted-foreground">
                      {t("Administra tus órdenes activas")}
                    </p>
                  </div>
                  <Button 
                    onClick={handleNewOrder} 
                    size="lg" 
                    className="mt-4 md:mt-0 flex items-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    {t("Nueva Orden")}
                  </Button>
                </div>
                
                {/* Order Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{activeOrders.filter(o => o.status === "preparando").length}</div>
                      <div className="text-muted-foreground text-sm">{t("Preparando")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{activeOrders.filter(o => o.status === "servida").length}</div>
                      <div className="text-muted-foreground text-sm">{t("Servidas")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{activeOrders.filter(o => o.status === "pagada").length}</div>
                      <div className="text-muted-foreground text-sm">{t("Pagadas")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">${activeOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</div>
                      <div className="text-muted-foreground text-sm">{t("Ingresos Activos")}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    {t("Todas las Órdenes")}
                  </Button>
                  <Button
                    variant={statusFilter === "preparando" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("preparando")}
                  >
                    {t("Preparando")}
                  </Button>
                  <Button
                    variant={statusFilter === "servida" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("servida")}
                  >
                    {t("Servidas")}
                  </Button>
                </div>

                {/* Active Orders Section */}
                <ScrollArea className="flex-1 h-[calc(100vh-22rem)]">
                  <h2 className="text-xl font-semibold mb-4">{t("Mis Órdenes Activas")}</h2>
                  
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <p className="mb-4">{t("No se encontraron órdenes activas")}</p>
                      <Button onClick={handleNewOrder} className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        {t("Crear Nueva Orden")}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {t("Mesa")} {order.tableNumber || t("Para llevar")}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{order.clientCount || 1} {t("cliente(s)")}</span>
                                </div>
                              </div>
                              <div>{getStatusBadge(order.status)}</div>
                            </div>
                            <div className="flex flex-col gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {t("Iniciada a las")} {format(new Date(order.createdAt), "h:mm a")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 font-semibold">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                              <div className="mt-2 text-muted-foreground">
                                {order.items.length} items
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/50 p-4 flex gap-2 justify-between">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" /> {t("Ver")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleResumeOrder(order)}
                            >
                            {t("Agregar")}
                            </Button>
                            {order.status === "preparando" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                onClick={() => marcarComoServida(order.id)}
                              >
                                {t("Servida")}
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handlePayOrder(order)}
                            >
                              {t("Pagar")}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
            
            {/* Menu Section - larger area */}
            <div className="lg:col-span-3 h-full flex flex-col">
              <CategorySelector />
              <SubcategorySelector />
              <div className="flex-1 bg-card rounded-lg border overflow-hidden">
                <MenuItems />
              </div>
            </div>
            
            {/* Order Ticket Section - narrower */}
            <div className="h-full lg:max-w-sm flex flex-col min-h-0">
              <OrderTicket />
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("Detalles de Orden")} - {t("Mesa")} {viewOrderDetails?.tableNumber || t("Para llevar")}
            </DialogTitle>
          </DialogHeader>
          
          {viewOrderDetails && (
            <div className="py-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("ID de Orden")}</div>
                  <div>{viewOrderDetails.id}</div>
                </div>
                <div>{getStatusBadge(viewOrderDetails.status)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("Creada")}</div>
                  <div>{format(new Date(viewOrderDetails.createdAt), "MMM d, yyyy h:mm a")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("Mesero")}</div>
                  <div>{viewOrderDetails.server}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{t("Clientes")}</div>
                  <div>{viewOrderDetails.clientCount || 1}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-semibold">${viewOrderDetails.total.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("Artículos de la Orden")}</h4>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {viewOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-2">
                      <div>
                        <div>
                          {item.quantity}x {item.menuItem.name}
                        </div>
                        {item.clientNumber && (
                          <div className="text-xs text-muted-foreground">
                            {t("Cliente")} {item.clientNumber}
                          </div>
                        )}
                        {item.modifiers.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {item.modifiers.map((mod, i) => (
                              <div key={i}>
                                {mod.modifier.name}: {mod.selectedOptions.map(opt => opt.name).join(", ")}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
              {t("Cerrar")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleResumeOrder(viewOrderDetails);
                  setShowOrderDetails(false);
                }}
              >
                {t("Agregar")}
              </Button>
              <Button
                onClick={() => {
                  handlePayOrder(viewOrderDetails);
                  setShowOrderDetails(false);
                }}
              >
                {t("Procesar Pago")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm merge orders when target table in another section */}
      <Dialog open={showMergeConfirm} onOpenChange={setShowMergeConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Confirmar Fusión")}</DialogTitle>
          </DialogHeader>
          <p className="py-4">{t("¿Deseas fusionar la orden de la Mesa")} {mergeSourceTable} {t("a la Mesa")} {pendingMergeTarget}?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowMergeConfirm(false)} disabled={merging}>
                {t("Cancelar")}
              </Button>
            </DialogClose>
            <Button
              onClick={async () => {
                if (pendingMergeTarget) {
                  await executeMergeOrders(pendingMergeTarget);
                }
              }}
              disabled={merging}
            >
              {merging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("Fusionando...")}
                </>
              ) : (
                t("Confirmar")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm move order to a different table */}
      <Dialog open={showMoveConfirm} onOpenChange={setShowMoveConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Confirmar Cambio de Mesa")}</DialogTitle>
          </DialogHeader>
          <p className="py-4">{t("Mover orden de la Mesa")} {moveSourceTable} {t("a la Mesa")} {pendingMoveTarget}?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowMoveConfirm(false)} disabled={moving}>
                {t("Cancelar")}
              </Button>
            </DialogClose>
            <Button onClick={async () => { if (pendingMoveTarget) { await executeMoveOrder(pendingMoveTarget); } }} disabled={moving}>
              {moving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("Moviendo...")}</>) : t("Confirmar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Unlink table options */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Desvincular Mesa")}</DialogTitle>
          </DialogHeader>
          <p className="py-4">{t("Elige cómo desvincular la mesa")} {unlinkTableNumber}.</p>
          <DialogFooter className="flex gap-2 justify-between">
            <Button
              variant="outline"
              onClick={() => executeUnlink(false)}
              disabled={unlinking}
            >
              {unlinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("Desvinculando...")}
                </>
              ) : (
                t("Desvincular Esta Mesa")
              )}
            </Button>
            <Button
              onClick={() => executeUnlink(true)}
              disabled={unlinking}
            >
              {unlinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("Desvinculando...")}
                </>
              ) : (
                t("Desvincular Todo el Grupo")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog to select number of guests when starting an order */}
      <Dialog open={showClientCountDialog} onOpenChange={(open) => { if (!open) setShowClientCountDialog(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Selecciona Número de Clientes")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {`${t("Selecciona número de clientes (máx")} ${pendingCapacity})`}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: pendingCapacity }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    variant={selectedClientCount === n ? "default" : "outline"}
                    onClick={() => setSelectedClientCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowClientCountDialog(false)}>{t("Cancelar")}</Button>
            <Button onClick={() => {
              if (pendingTableNumber) {
                createOrder(pendingTableNumber, selectedClientCount);
              }
              setShowClientCountDialog(false);
              // cleanup merge state after starting order
              setMergeMode(false);
              setMergeSelection([]);
            }}>
              {t("Iniciar Orden")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default POS;
