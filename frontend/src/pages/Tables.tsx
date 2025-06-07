
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/context/POSContext";
import { getTables, updateTable } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";

type TableStatus = "available" | "pending" | "occupied" | "reserved";

interface TableData {
  id: string;
  number: string;
  status: TableStatus;
  capacity: number;
  // Color in hex format (e.g., #RRGGBB) for table display
  color?: string;
}

const statusColors: Record<TableStatus, string> = {
  available: "bg-green-100 border-green-300 hover:bg-green-200",
  pending: "bg-yellow-100 border-yellow-300",
  occupied: "bg-red-100 border-red-300",
  reserved: "bg-blue-100 border-blue-300"
};

const statusLabels: Record<TableStatus, string> = {
  available: "Available",
  pending: "Pending",
  occupied: "Occupied",
  reserved: "Reserved"
};

const Tables = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createOrder } = usePOS();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [clientCount, setClientCount] = useState<number>(1);
  const [showClientDialog, setShowClientDialog] = useState<boolean>(false);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        // Fetch tables from backend API
        const data = await getTables();

        // Transform the data to ensure status is a valid TableStatus
        const formattedData = data.map(table => ({
          ...table,
          status: (table.status as string || 'available') as TableStatus
        }));

        setTables(formattedData);
      } catch (error) {
        console.error("Error fetching tables:", error);
        toast({
          title: "Error",
          description: "Failed to load tables. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [toast]);

  const handleTableClick = (table: TableData) => {
    if (table.status === "available") {
      setSelectedTable(table.number);
      setShowClientDialog(true);
    }
  };

  const handleClientSelection = () => {
    createOrder(selectedTable, clientCount);
    
    // Update table status in database
    // Update table status to occupied via API
    const updateTableStatus = async () => {
      try {
        const table = tables.find(t => t.number === selectedTable);
        if (table) {
          await updateTable(table.id, { status: 'occupied' });
        }
      } catch (error) {
        console.error("Error updating table status:", error);
        // Continue anyway since the order is created
      }
    };
    updateTableStatus();
    navigate("/");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Table Selection" 
          className="mb-4"
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => {
              const baseColor = table.color || "#cccccc";
              const isAvailable = table.status === "available";
              const displayColor = isAvailable ? `${baseColor}33` : baseColor;
              return (
                <Card
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`border-2 transition-colors ${isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                  style={{ backgroundColor: displayColor, borderColor: baseColor }}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 h-24">
                    <span className="text-2xl font-bold">{table.number}</span>
                    <span className="text-sm mt-1">{statusLabels[table.status]}</span>
                    <span className="text-xs text-muted-foreground">Capacity: {table.capacity}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Number of Clients for Table {selectedTable}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(number => (
                  <Button 
                    key={number}
                    variant={clientCount === number ? "default" : "outline"}
                    className="h-14 text-lg"
                    onClick={() => setClientCount(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowClientDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleClientSelection}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Tables;
