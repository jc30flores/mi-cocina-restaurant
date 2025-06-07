
import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { PageHeader } from "@/components/ui/page-header";

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  source: "website" | "app" | "ubereats" | "doordash";
  time: string;
  address?: string;
  eta?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500",
  preparing: "bg-blue-500",
  ready: "bg-green-500",
  delivered: "bg-purple-500",
  cancelled: "bg-red-500"
};

const sourceLabels: Record<string, string> = {
  website: "Sitio Web",
  app: "App Móvil",
  ubereats: "Uber Eats",
  doordash: "DoorDash"
};

const orders: Order[] = [
  {
    id: "ORD-1234",
    customer: "Juan Pérez",
    items: ["Hamburguesa Clásica", "Papas Fritas", "Refresco"],
    total: 18.99,
    status: "pending",
    source: "website",
    time: "12:30 PM",
    address: "Calle Principal 123"
  },
  {
    id: "ORD-1235",
    customer: "María González",
    items: ["Pizza Margarita", "Ensalada César", "Agua"],
    total: 26.50,
    status: "preparing",
    source: "app",
    time: "12:45 PM",
    address: "Av. Central 456",
    eta: "1:15 PM"
  },
  {
    id: "ORD-1236",
    customer: "Carlos Rodríguez",
    items: ["Wrap de Pollo", "Papas Fritas", "Cerveza"],
    total: 21.75,
    status: "ready",
    source: "ubereats",
    time: "1:00 PM",
    eta: "1:30 PM"
  },
  {
    id: "ORD-1237",
    customer: "Ana Martínez",
    items: ["Pasta Alfredo", "Pan de Ajo", "Vino"],
    total: 32.99,
    status: "delivered",
    source: "doordash",
    time: "12:15 PM"
  },
  {
    id: "ORD-1238",
    customer: "Pedro López",
    items: ["Tacos (3)", "Nachos", "Refresco"],
    total: 19.50,
    status: "cancelled",
    source: "website",
    time: "11:30 AM"
  }
];

const OrderCard = ({ order }: { order: Order }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleStatusChange = () => {
    toast({
      title: t("Estado actualizado"),
      description: `${t("Orden")} ${order.id} ${t("actualizada a")} ${t(getNextStatus(order.status))}`,
    });
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case "pending": return "preparing";
      case "preparing": return "ready";
      case "ready": return "delivered";
      default: return status;
    }
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case "pending": return t("Preparar");
      case "preparing": return t("Marcar Listo");
      case "ready": return t("Entregar");
      default: return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "preparing":
      case "ready":
        return <Clock className="h-5 w-5 mr-1" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 mr-1" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.id}</CardTitle>
            <CardDescription>{order.customer}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusColors[order.status]} text-white`}
          >
            {t(order.status.charAt(0).toUpperCase() + order.status.slice(1))}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">
          <strong>{t("Fuente")}:</strong> {sourceLabels[order.source]}
        </div>
        <div className="text-sm mb-2">
          <strong>{t("Hora")}:</strong> {order.time}
          {order.eta && ` (${t("ETA")}: ${order.eta})`}
        </div>
        <div className="text-sm mb-2">
          <strong>{t("Artículos")}:</strong>
          <ul className="list-disc list-inside ml-2">
            {order.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        {order.address && (
          <div className="text-sm">
            <strong>{t("Dirección")}:</strong> {order.address}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="font-semibold">${order.total.toFixed(2)}</div>
        {(order.status !== "delivered" && order.status !== "cancelled") && (
          <Button size="sm" onClick={handleStatusChange}>
            {getStatusIcon(order.status)}
            {getStatusAction(order.status)}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const OnlineOrders = () => {
  const { t } = useLanguage();
  const pendingOrders = orders.filter(o => o.status === "pending");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready");
  const historyOrders = orders.filter(o => o.status === "delivered" || o.status === "cancelled");

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader 
          title={t("Pedidos en Línea")}
          className="mb-4"
        />
        
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              {t("Pendientes")} <Badge variant="secondary" className="ml-1">{pendingOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="preparing">
              {t("En Preparación")} <Badge variant="secondary" className="ml-1">{preparingOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ready">
              {t("Listos")} <Badge variant="secondary" className="ml-1">{readyOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history">
              {t("Historial")} <Badge variant="secondary" className="ml-1">{historyOrders.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {pendingOrders.length === 0 && (
                <div className="col-span-full text-center p-6 text-muted-foreground">
                  {t("No hay pedidos pendientes")}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preparing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {preparingOrders.length === 0 && (
                <div className="col-span-full text-center p-6 text-muted-foreground">
                  {t("No hay pedidos en preparación")}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ready">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {readyOrders.length === 0 && (
                <div className="col-span-full text-center p-6 text-muted-foreground">
                  {t("No hay pedidos listos para entrega")}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {historyOrders.length === 0 && (
                <div className="col-span-full text-center p-6 text-muted-foreground">
                  {t("No hay historial de pedidos")}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OnlineOrders;
