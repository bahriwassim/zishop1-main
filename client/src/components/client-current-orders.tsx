import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, MapPin, Package, X, Edit3, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Order } from "@shared/schema";

interface ClientCurrentOrdersProps {
  clientId: number;
  customerName: string;
  customerRoom: string;
}

export default function ClientCurrentOrders({ clientId, customerName, customerRoom }: ClientCurrentOrdersProps) {
  const { toast } = useToast();

  // Get current orders for this client
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders/client/active", clientId],
    queryFn: async () => {
      return await api.getActiveOrdersByClient(clientId);
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return await api.updateOrder(orderId, { status: "cancelled" });
    },
    onSuccess: () => {
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/client/active", clientId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "delivering": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "preparing": return "En préparation";
      case "delivering": return "En livraison";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock size={16} />;
      case "preparing": return <Package size={16} />;
      case "delivering": return <MapPin size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const canCancelOrder = (status: string) => {
    return ["pending", "preparing"].includes(status);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande en cours</h3>
        <p className="text-gray-500 text-sm">
          Vos commandes actives apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Commandes en cours</h3>
        <Badge variant="secondary">
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Commande #{order.orderNumber}
                </CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </div>
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString('fr-FR')}
              </p>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              {/* Order Items */}
              <div className="space-y-2">
                {(order.items as any[]).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{parseFloat(order.totalAmount).toFixed(2)}€</span>
              </div>

              {/* Order Status Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Commande</span>
                  <span>Préparation</span>
                  <span>Livraison</span>
                  <span>Terminé</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-2 bg-blue-500 rounded"></div>
                  <div className={`flex-1 h-2 rounded ${
                    ["preparing", "delivering"].includes(order.status) 
                      ? "bg-yellow-500" : "bg-gray-200"
                  }`}></div>
                  <div className={`flex-1 h-2 rounded ${
                    order.status === "delivering" 
                      ? "bg-purple-500" : "bg-gray-200"
                  }`}></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Actions */}
              {canCancelOrder(order.status) && (
                <div className="flex gap-2 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                      >
                        <X size={14} className="mr-1" />
                        Annuler
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir annuler cette commande ? Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Non, garder</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => cancelOrderMutation.mutate(order.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Oui, annuler
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {order.status === "delivering" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <MapPin className="mx-auto text-blue-600 mb-2" size={20} />
                  <p className="text-sm text-blue-800 font-medium">
                    Livraison en cours
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Rendez-vous à la réception dans 5-15 minutes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 