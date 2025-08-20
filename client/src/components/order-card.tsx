import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order;
  showCustomer?: boolean;
  showMerchant?: boolean;
  onUpdateStatus?: (orderId: number, status: string) => void;
  onConfirmDelivery?: (orderId: number) => void;
}

export default function OrderCard({
  order,
  showCustomer = false,
  showMerchant = false,
  onUpdateStatus,
  onConfirmDelivery,
}: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-secondary";
      case "delivering":
        return "bg-secondary";
      case "delivered":
        return "bg-accent";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "preparing":
        return "Préparation";
      case "ready":
        return "Prêt";
      case "delivering":
        return "En livraison";
      case "delivered":
        return "Livré";
      default:
        return status;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-800">#{order.orderNumber}</span>
          <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
        <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
      </div>

      {showCustomer && (
        <div className="mb-2">
          <div className="font-medium text-gray-800">{order.customerRoom}</div>
          <div className="text-sm text-gray-500">{order.customerName}</div>
        </div>
      )}

      {showMerchant && (
        <div className="mb-2">
          <div className="text-gray-800">Merchant #{order.merchantId}</div>
        </div>
      )}

      <div className="space-y-2 mb-3">
        {Array.isArray(order.items) &&
          order.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <span>{(parseFloat(item.price) * item.quantity).toFixed(2)}€</span>
            </div>
          ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div>
          <span className="font-semibold text-gray-800">Total: </span>
          <span className="font-semibold text-accent">{order.totalAmount}€</span>
        </div>
        <div className="space-x-2">
          {onUpdateStatus && order.status === "preparing" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, "ready")}
              className="bg-secondary text-white"
            >
              Prêt pour livraison
            </Button>
          )}
          {onUpdateStatus && order.status === "ready" && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, "delivering")}
              className="bg-primary text-white"
            >
              En livraison
            </Button>
          )}
          {onConfirmDelivery && order.status === "delivering" && (
            <Button
              size="sm"
              onClick={() => onConfirmDelivery(order.id)}
              className="bg-accent text-white"
            >
              Confirmer réception
            </Button>
          )}
          {order.status === "delivered" && (
            <span className="text-xs text-gray-500">Terminé</span>
          )}
        </div>
      </div>
    </div>
  );
}
