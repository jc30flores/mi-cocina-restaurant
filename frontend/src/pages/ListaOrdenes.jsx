import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import MainLayout from "@/components/layouts/MainLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOrders, updateOrderStatus } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  ShoppingBag,
  Bike,
  DollarSign,
} from "lucide-react";

const STATUS_STYLES = {
  preparando: "border-[#00cfff] shadow-[0_0_10px_#00cfff]",
  servida: "border-[#ffbe3b] shadow-[0_0_10px_#ffbe3b]",
  pagada: "border-[#00ff90] shadow-[0_0_10px_#00ff90]",
  cancelada: "border-[#ff4f4f] shadow-[0_0_10px_#ff4f4f]",
};

const STATUS_LABELS = {
  preparando: "🔵 Preparando",
  servida: "🟡 Servida",
  pagada: "🟢 Pagada",
  cancelada: "🔴 Cancelada",
};

export default function ListaOrdenes() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [highlight, setHighlight] = useState({});
  const socketRef = useRef(null);

  const load = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, "ws").replace(/\/api$/, "");
    socketRef.current = io(wsUrl);
    socketRef.current.on("orden_actualizada", (orden) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === orden.id);
        let updated;
        if (exists) {
          updated = prev.map((o) => (o.id === orden.id ? orden : o));
        } else {
          updated = [orden, ...prev];
          setHighlight((h) => ({ ...h, [orden.id]: true }));
          setTimeout(() =>
            setHighlight((h) => {
              const { [orden.id]: _, ...rest } = h;
              return rest;
            }),
            2000
          );
        }
        return updated;
      });
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const counts = {
    preparando: orders.filter((o) => o.status === "preparando").length,
    servida: orders.filter((o) => o.status === "servida").length,
    pagada: orders.filter((o) => o.status === "pagada").length,
    cancelada: orders.filter((o) => o.status === "cancelada").length,
  };

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "takeout") return !o.table_number;
    return o.status === filter;
  });

  const changeStatus = async (id, status) => {
    await updateOrderStatus(id, status);
  };

  const renderActions = (order) => {
    if (order.status === "preparando") {
      return (
        <>
          <Button
            size="sm"
            onClick={() => changeStatus(order.id, "servida")}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Servida
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => changeStatus(order.id, "cancelada")}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-1" /> Cancelar
          </Button>
        </>
      );
    }
    if (order.status === "servida") {
      return (
        <Button
          size="sm"
          className="flex-1"
          onClick={() => changeStatus(order.id, "pagada")}
        >
          <DollarSign className="w-4 h-4 mr-1" /> Pagar
        </Button>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge>Preparando: {counts.preparando}</Badge>
          <Badge>Servidas: {counts.servida}</Badge>
          <Badge>Pagadas: {counts.pagada}</Badge>
          <Badge>Canceladas: {counts.cancelada}</Badge>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas las Órdenes</TabsTrigger>
            <TabsTrigger value="preparando">Preparando</TabsTrigger>
            <TabsTrigger value="servida">Servidas</TabsTrigger>
            <TabsTrigger value="pagada">Pagadas</TabsTrigger>
            <TabsTrigger value="takeout">Para Llevar</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <div className="grid gap-4">
            {filtered.map((order) => (
              <Card
                key={order.id}
                className={`border-2 ${STATUS_STYLES[order.status] || ""} ${highlight[order.id] ? 'animate-pulse' : ''}`}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">
                      {order.table_number
                        ? `Mesa ${order.table_number}`
                        : "Para Llevar"}
                    </h3>
                    <Badge>{STATUS_LABELS[order.status] || order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ⏱️ Hace {formatDistanceToNow(new Date(order.created_at), { locale: es })}
                  </div>
                  {!order.table_number && (
                    <div className="flex items-center gap-1 text-sm">
                      {order.order_type === "delivery" ? (
                        <Bike className="w-4 h-4" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span>{order.order_type ? order.order_type : "Takeout"}</span>
                    </div>
                  )}
                </CardContent>
                {renderActions(order) && (
                  <CardFooter className="flex gap-2">
                    {renderActions(order)}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </MainLayout>
  );
}
