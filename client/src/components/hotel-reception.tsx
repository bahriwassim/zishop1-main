import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  User,
  Hash,
  Calendar,
  Truck,
  Phone,
  MessageSquare
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface HotelReceptionProps {
  hotelId: number;
}

export default function HotelReception({ hotelId }: HotelReceptionProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Récupérer les commandes de l'hôtel
  const { data: orders = [], refetch } = useQuery({
    queryKey: [`/api/orders/hotel/${hotelId}`],
    queryFn: () => api.getOrdersByHotel(hotelId),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerRoom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Grouper les commandes par statut pour la réception
  const ordersByStatus = {
    arriving: filteredOrders.filter(o => o.status === "delivering"),
    waiting: filteredOrders.filter(o => o.status === "delivered" && !o.pickedUp),
    completed: filteredOrders.filter(o => o.status === "delivered" && o.pickedUp),
  };

  // Mutation pour confirmer la réception
  const confirmDeliveryMutation = useMutation({
    mutationFn: (orderId: number) => api.updateOrder(orderId, { 
      status: "delivered",
      deliveredAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/hotel/${hotelId}`] });
      toast.success("Commande marquée comme livrée");
      refetch();
    },
  });

  // Mutation pour confirmer la remise au client
  const confirmPickupMutation = useMutation({
    mutationFn: (orderId: number) => api.updateOrder(orderId, { 
      pickedUp: true,
      pickedUpAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/hotel/${hotelId}`] });
      toast.success("Commande remise au client");
      refetch();
    },
  });

  // Composant pour afficher une commande
  const OrderCard = ({ order, showActions = true }: { order: any; showActions?: boolean }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "delivering": return "bg-blue-100 text-blue-800";
        case "delivered": return order.pickedUp ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };

    const getStatusText = (status: string) => {
      if (status === "delivered" && !order.pickedUp) return "En attente client";
      if (status === "delivered" && order.pickedUp) return "Remis au client";
      if (status === "delivering") return "En livraison";
      return status;
    };

    return (
      <div 
        className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedOrder(order)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash className="text-gray-500" size={16} />
              <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package size={14} />
                <span>Chambre {order.customerRoom}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">€{order.totalAmount}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(order.createdAt), "HH:mm", { locale: fr })}
            </p>
          </div>
        </div>

        {/* Détails des articles avec cases à cocher */}
        {order.items && (
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">Articles à vérifier :</div>
            <div className="space-y-1">
              {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={`item-${order.id}-${index}`}
                      className="rounded"
                      defaultChecked={order.status === "delivered"}
                      disabled={order.status === "delivered"}
                    />
                    <label htmlFor={`item-${order.id}-${index}`} className="cursor-pointer">
                      {item.quantity}x {item.productName}
                    </label>
                  </div>
                  <span className="text-gray-500">€{(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-3">
            {order.status === "delivering" && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span>Vérifiez tous les articles avant de confirmer</span>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeliveryMutation.mutate(order.id);
                  }}
                >
                  <CheckCircle size={16} className="mr-1" />
                  ✓ Réception complète confirmée
                </Button>
              </div>
            )}
            {order.status === "delivered" && !order.pickedUp && (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <User size={16} className="text-blue-600" />
                  <span>En attente du client - Chambre {order.customerRoom}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmPickupMutation.mutate(order.id);
                  }}
                >
                  <User size={16} className="mr-1" />
                  ✓ Remis au client
                </Button>
              </div>
            )}
            {order.status === "delivered" && order.pickedUp && (
              <div className="w-full">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>✓ Commande terminée - Remise confirmée</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="text-blue-600" />
            Gestion de la Réception
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Rechercher par n° commande, nom ou chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Toutes
              </Button>
              <Button
                variant={filterStatus === "delivering" ? "default" : "outline"}
                onClick={() => setFilterStatus("delivering")}
                size="sm"
              >
                En livraison
              </Button>
              <Button
                variant={filterStatus === "delivered" ? "default" : "outline"}
                onClick={() => setFilterStatus("delivered")}
                size="sm"
              >
                À la réception
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En livraison</p>
                <p className="text-2xl font-bold text-blue-600">{ordersByStatus.arriving.length}</p>
              </div>
              <Truck className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente client</p>
                <p className="text-2xl font-bold text-orange-600">{ordersByStatus.waiting.length}</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remises aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{ordersByStatus.completed.length}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections de commandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes en livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="text-blue-600" size={20} />
              En livraison ({ordersByStatus.arriving.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByStatus.arriving.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune commande en livraison
                </p>
              ) : (
                ordersByStatus.arriving.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commandes en attente de récupération */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="text-orange-600" size={20} />
              En attente client ({ordersByStatus.waiting.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByStatus.waiting.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune commande en attente
                </p>
              ) : (
                ordersByStatus.waiting.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de détails (si une commande est sélectionnée) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Numéro de commande</p>
                  <p className="font-mono font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chambre</p>
                    <p className="font-medium">{selectedOrder.customerRoom}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Articles</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.productName}</span>
                        <span>€{(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>€{selectedOrder.totalAmount}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Fermer
                  </Button>
                  {selectedOrder.customerPhone && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`tel:${selectedOrder.customerPhone}`)}
                    >
                      <Phone size={16} className="mr-1" />
                      Appeler
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 