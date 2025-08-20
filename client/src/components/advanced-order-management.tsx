import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle, Truck, Package, AlertCircle, Euro, MapPin, Calendar } from "lucide-react";
import type { Order } from "@shared/schema";
import { api } from "@/lib/api";

interface AdvancedOrderManagementProps {
  orders: Order[];
  userRole: "hotel" | "merchant" | "admin";
  entityId?: number;
}

export default function AdvancedOrderManagement({
  orders,
  userRole,
  entityId,
}: AdvancedOrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const { toast } = useToast();

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }: { orderId: number; updates: any }) => 
      api.updateOrder(orderId, updates),
    onSuccess: () => {
      toast({
        title: "Commande mise à jour",
        description: "Les informations de la commande ont été mises à jour.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, newStatus: string, additionalData?: any) => {
    const updates: any = { 
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...additionalData
    };

    // Ajouter les timestamps selon le statut
    if (newStatus === "confirmed") {
      updates.confirmedAt = new Date().toISOString();
    } else if (newStatus === "delivered") {
      updates.deliveredAt = new Date().toISOString();
    }

    updateOrderMutation.mutate({ orderId, updates });
  };

  const calculateCommissions = (totalAmount: string) => {
    const total = parseFloat(totalAmount);
    return {
      merchant: (total * 0.75).toFixed(2),
      zishop: (total * 0.20).toFixed(2),
      hotel: (total * 0.05).toFixed(2),
    };
  };

  const getStatusInfo = (status: string, pickedUp?: boolean) => {
    if (status === "delivered" && pickedUp) {
      return {
        color: "bg-green-700",
        icon: CheckCircle,
        text: "Remis au client",
        description: "Commande remise au client (terminée)"
      };
    }
    const statusConfig = {
      pending: { 
        color: "bg-yellow-500", 
        icon: Clock, 
        text: "En attente", 
        description: "En attente de confirmation du commerçant" 
      },
      confirmed: { 
        color: "bg-blue-500", 
        icon: CheckCircle, 
        text: "Confirmée", 
        description: "Confirmée par le commerçant" 
      },
      preparing: { 
        color: "bg-orange-500", 
        icon: Package, 
        text: "Préparation", 
        description: "En cours de préparation" 
      },
      ready: { 
        color: "bg-purple-500", 
        icon: CheckCircle, 
        text: "Prête", 
        description: "Prête pour livraison" 
      },
      delivering: { 
        color: "bg-indigo-500", 
        icon: Truck, 
        text: "En livraison", 
        description: "En cours de livraison vers l'hôtel" 
      },
      delivered: { 
        color: "bg-green-500", 
        icon: CheckCircle, 
        text: "Livrée", 
        description: "Livrée à la réception de l'hôtel" 
      },
      cancelled: { 
        color: "bg-red-500", 
        icon: AlertCircle, 
        text: "Annulée", 
        description: "Commande annulée" 
      },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getAvailableActions = (order: Order) => {
    const actions = [];

    switch (userRole) {
      case "merchant":
        if (order.status === "pending") {
          actions.push({
            label: "Confirmer la commande",
            action: () => handleStatusUpdate(order.id, "confirmed"),
            variant: "default" as const,
          });
          actions.push({
            label: "Refuser",
            action: () => handleStatusUpdate(order.id, "cancelled"),
            variant: "destructive" as const,
          });
        }
        if (order.status === "confirmed") {
          actions.push({
            label: "Commencer préparation",
            action: () => handleStatusUpdate(order.id, "preparing"),
            variant: "default" as const,
          });
        }
        if (order.status === "preparing") {
          actions.push({
            label: "Prêt pour livraison",
            action: () => {
              setSelectedOrder(order);
            },
            variant: "default" as const,
          });
        }
        if (order.status === "ready") {
          actions.push({
            label: "Marquer en livraison",
            action: () => handleStatusUpdate(order.id, "delivering"),
            variant: "default" as const,
          });
        }
        break;

      case "hotel":
        if (order.status === "delivering") {
          actions.push({
            label: "Confirmer réception",
            action: () => handleStatusUpdate(order.id, "delivered"),
            variant: "default" as const,
          });
        }
        if (order.status === "delivered" && !order.pickedUp) {
          actions.push({
            label: "Remis au client",
            action: () => handleStatusUpdate(order.id, "delivered", { 
              pickedUp: true, 
              pickedUpAt: new Date().toISOString() 
            }),
            variant: "outline" as const,
          });
        }
        break;

      case "admin":
        if (!["delivered", "cancelled"].includes(order.status)) {
          actions.push({
            label: "Voir détails",
            action: () => setSelectedOrder(order),
            variant: "outline" as const,
          });
        }
        break;
    }

    return actions;
  };

  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("fr-FR");
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status, order.pickedUp);
        const StatusIcon = statusInfo.icon;
        const commissions = calculateCommissions(order.totalAmount);
        const actions = getAvailableActions(order);

        return (
          <Card key={order.id} className="border-l-4" style={{ borderLeftColor: statusInfo.color }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
                  <div>
                    <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-600">{statusInfo.description}</p>
                  </div>
                  <Badge className={`${statusInfo.color} text-white`}>
                    {statusInfo.text}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{order.totalAmount}€</div>
                  <div className="text-sm text-gray-500">
                    {formatTimestamp(order.createdAt)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Informations client */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Client</h4>
                  <div className="text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>Chambre {order.customerRoom}</span>
                    </div>
                    <div>{order.customerName}</div>
                  </div>
                </div>

                {/* Articles commandés */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Articles</h4>
                  <div className="text-sm space-y-1">
                    {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>{(parseFloat(item.price) * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commissions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">
                    {userRole === "hotel" ? "Commission Hôtel" : "Répartition"}
                  </h4>
                  <div className="text-sm space-y-1">
                    {userRole === "hotel" ? (
                      <div className="flex justify-between">
                        <span>Commission Hôtel (5%)</span>
                        <span className="font-semibold text-purple-600">{commissions.hotel}€</span>
                      </div>
                    ) : userRole === "merchant" ? (
                      <>
                        <div className="flex justify-between">
                          <span>Votre commission (75%)</span>
                          <span className="font-semibold text-green-600">{commissions.merchant}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zishop (20%)</span>
                          <span className="font-semibold text-blue-600">{commissions.zishop}€</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Commerçant (75%)</span>
                          <span className="font-semibold text-green-600">{commissions.merchant}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Zishop (20%)</span>
                          <span className="font-semibold text-blue-600">{commissions.zishop}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hôtel (5%)</span>
                          <span className="font-semibold text-purple-600">{commissions.hotel}€</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline des statuts */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {order.confirmedAt && (
                    <span>Confirmée: {formatTimestamp(order.confirmedAt)}</span>
                  )}
                  {order.estimatedDelivery && (
                    <span>• Livraison estimée: {formatTimestamp(order.estimatedDelivery)}</span>
                  )}
                  {order.deliveredAt && (
                    <span>• Livrée: {formatTimestamp(order.deliveredAt)}</span>
                  )}
                  {order.pickedUp && order.pickedUpAt && (
                    <span>• Remise client: {formatTimestamp(order.pickedUpAt)}</span>
                  )}
                </div>
              </div>

              {/* Actions disponibles */}
              <div className="flex space-x-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant}
                    onClick={action.action}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog pour préparer la livraison */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Préparer la livraison</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="deliveryNotes">Notes de livraison</Label>
                <Textarea
                  id="deliveryNotes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Instructions spéciales pour la livraison..."
                />
              </div>
              <div>
                <Label htmlFor="estimatedDelivery">Heure de livraison estimée</Label>
                <Input
                  id="estimatedDelivery"
                  type="datetime-local"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  handleStatusUpdate(selectedOrder.id, "ready", {
                    deliveryNotes,
                    estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
                  });
                  setDeliveryNotes("");
                  setEstimatedDelivery("");
                }}
                className="w-full"
              >
                Marquer comme prêt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 