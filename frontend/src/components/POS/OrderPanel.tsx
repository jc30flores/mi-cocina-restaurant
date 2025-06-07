
import React from "react";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/context/POSContext";
import { Loader2 } from "lucide-react";

const OrderPanel = () => {
  const { currentOrder, loading, sendOrder, holdOrder, sending } = usePOS();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading order data...</p>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No active order</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <h2 className="text-xl font-semibold mb-4">
        {currentOrder.tableNumber
          ? `Table ${currentOrder.tableNumber}`
          : "Takeout Order"}
      </h2>

      {currentOrder.items.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Add products to the order</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {currentOrder.items.map((item) => (
            <li key={item.id} className="border-b pb-2">
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
                  Note: {item.notes}
                </div>
              )}
              {item.clientNumber && currentOrder.clientCount > 1 && (
                <div className="text-xs text-muted-foreground pl-4">
                  Client: {item.clientNumber}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${currentOrder.subtotal.toFixed(2)}</span>
        </div>
        {currentOrder.discount && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>
              {currentOrder.discount.type === "percentage"
                ? `-${currentOrder.discount.value}%`
                : `-$${currentOrder.discount.value.toFixed(2)}`}
            </span>
          </div>
        )}
        <div className="flex justify-between font-semibold mt-2">
          <span>Total:</span>
          <span>${currentOrder.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 pt-2 flex flex-col gap-2">
        <Button
          variant="default"
          className="w-full"
          onClick={sendOrder}
          disabled={loading || sending || currentOrder.items.length === 0}
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {sending ? "Sending..." : "Send to Kitchen"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={holdOrder}
          disabled={loading || currentOrder.items.length === 0}
        >
          Hold Order
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;
