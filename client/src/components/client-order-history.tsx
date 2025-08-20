import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, RotateCcw, Package, Star, Filter } from "lucide-react";
import { api } from "@/lib/api";
import type { Order } from "@shared/schema";

interface ClientOrderHistoryProps {
  clientId: number;
  customerName: string;
  customerRoom: string;
}

export default function ClientOrderHistory({ clientId, customerName, customerRoom }: ClientOrderHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  // Get order history for this client
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders/client/history", clientId],
    queryFn: async () => {
      const orders = await api.getOrdersByClient(clientId);
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const requestRefundMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await api.updateOrder(orderId, { status: "refund_requested" });
    },
    onSuccess: () => {
      toast({
        title: "Demande de remboursement",
        description: "Votre demande de remboursement a été envoyée",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/client/history", clientId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande de remboursement",
        variant: "destructive",
      });
    },
  });

  // Mutation pour confirmer la remise au client
  const confirmPickupMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await api.updateOrder(orderId, { pickedUp: true, pickedUpAt: new Date().toISOString() });
    },
    onSuccess: () => {
      toast({
        title: "Commande reçue",
        description: "Vous avez confirmé la réception de la commande.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/client/history", clientId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la réception.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  const getStatusColor = (status: string, pickedUp?: boolean) => {
    if (status === "delivered" && pickedUp) return "bg-green-100 text-green-800";
    if (status === "delivered" && !pickedUp) return "bg-orange-100 text-orange-800";
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      case "refund_requested": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string, pickedUp?: boolean) => {
    if (status === "delivered" && pickedUp) return "Remis au client";
    if (status === "delivered" && !pickedUp) return "En attente de remise";
    switch (status) {
      case "delivered": return "Livré";
      case "cancelled": return "Annulé";
      case "refunded": return "Remboursé";
      case "refund_requested": return "Remboursement en cours";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle size={16} />;
      case "cancelled": return <XCircle size={16} />;
      case "refunded": return <RotateCcw size={16} />;
      case "refund_requested": return <RotateCcw size={16} />;
      default: return <Package size={16} />;
    }
  };

  const canRequestRefund = (order: Order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
    
    return order.status === "delivered" && daysDiff <= 7; // Refund within 7 days
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(order => !["cancelled", "refunded"].includes(order.status))
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const completedOrders = orders.filter(order => order.status === "delivered").length;
    
    return { totalOrders, totalSpent, completedOrders };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
        <p className="text-gray-500 text-sm">
          Votre historique de commandes apparaîtra ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-xs text-blue-800">Commandes</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">{stats.completedOrders}</div>
          <div className="text-xs text-green-800">Livrées</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600">{stats.totalSpent.toFixed(0)}€</div>
          <div className="text-xs text-yellow-800">Dépensé</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historique</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter size={14} className="mr-2" />
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="delivered">Livrées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
            <SelectItem value="refunded">Remboursées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  #{order.orderNumber}
                </CardTitle>
                <Badge className={getStatusColor(order.status, order.pickedUp)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status, order.pickedUp)}
                  </div>
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                <span className="font-medium text-gray-900">
                  {parseFloat(order.totalAmount).toFixed(2)}€
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Order Items Summary */}
              <div className="space-y-1 mb-3">
                {(order.items as any[]).slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>{(parseFloat(item.price) * item.quantity).toFixed(2)}€</span>
                  </div>
                ))}
                {(order.items as any[]).length > 2 && (
                  <div className="text-xs text-gray-500 italic">
                    +{(order.items as any[]).length - 2} autre(s) produit(s)
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {canRequestRefund(order) && order.status === "delivered" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <RotateCcw size={12} className="mr-1" />
                        Remboursement
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Demander un remboursement</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vous pouvez demander un remboursement dans les 7 jours suivant la livraison. 
                          Votre demande sera traitée par notre équipe.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => requestRefundMutation.mutate(order.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Demander le remboursement
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {order.status === "delivered" && !order.pickedUp && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    onClick={() => confirmPickupMutation.mutate(order.id)}>
                    ✓ Confirmer réception
                  </Button>
                )}

                {order.status === "delivered" && order.pickedUp && (
                  <span className="flex-1 text-xs text-green-700">Commande terminée</span>
                )}

                {order.status === "delivered" && (
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Star size={12} className="mr-1" />
                    Noter
                  </Button>
                )}
              </div>

              {/* Special Messages */}
              {order.status === "refund_requested" && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2 text-center">
                  <p className="text-xs text-orange-800">
                    Demande de remboursement en cours de traitement
                  </p>
                </div>
              )}

              {order.status === "refunded" && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 text-center">
                  <p className="text-xs text-blue-800">
                    Remboursement effectué sur votre moyen de paiement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && statusFilter !== "all" && (
        <div className="text-center py-8">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-500 text-sm">
            Aucune commande ne correspond au filtre sélectionné
          </p>
        </div>
      )}
    </div>
  );
} 