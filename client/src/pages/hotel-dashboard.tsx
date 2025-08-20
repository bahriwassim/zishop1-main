import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrderCard from "@/components/order-card";
import AdvancedOrderManagement from "@/components/advanced-order-management";
import HotelSidebar from "@/components/hotel-sidebar";
import HotelMerchantSelector from "@/components/hotel-merchant-selector";

import { QrCode, Download, Gift, MapPin, TrendingUp, Euro, Clock, Truck } from "lucide-react";
import { api } from "@/lib/api";

export default function HotelDashboard() {
  const [selectedHotelId] = useState(() => {
    // Récupérer l'ID de l'hôtel depuis localStorage
    const hotelStr = localStorage.getItem("hotel");
    if (hotelStr) {
      const hotel = JSON.parse(hotelStr);
      return hotel.id;
    }
    return 1; // Default to first hotel
  });
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();

  // Get hotel data
  const { data: hotel } = useQuery({
    queryKey: ["/api/hotels", selectedHotelId],
    queryFn: () => fetch(`/api/hotels/${selectedHotelId}`).then(res => res.json()),
  });

  // Get hotel orders
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders/hotel", selectedHotelId],
    queryFn: () => api.getOrdersByHotel(selectedHotelId),
  });

  // Get hotel statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/hotel", selectedHotelId],
    queryFn: () => api.getHotelStats(selectedHotelId),
  });

  // Get commission statistics
  const { data: commissionStats } = useQuery({
    queryKey: ["/api/orders/commissions/stats", "today"],
    queryFn: () => fetch("/api/orders/commissions/stats?period=today").then(res => res.json()),
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: (orderId: number) => api.updateOrderStatus(orderId, "delivered"),
    onSuccess: () => {
      toast({
        title: "Livraison confirmée",
        description: "La commande a été marquée comme livrée.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/hotel", selectedHotelId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/hotel", selectedHotelId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la livraison.",
        variant: "destructive",
      });
    },
  });

  const handleConfirmDelivery = (orderId: number) => {
    confirmDeliveryMutation.mutate(orderId);
  };

  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === today.toDateString();
  });

  // Calcul de la commission hôtel (5%)
  const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const hotelCommission = todayRevenue * 0.05;

  if (!hotel) {
    return <div>Chargement...</div>;
  }

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Hotel Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{hotel.name}</h2>
                    <p className="text-gray-600">{hotel.address}</p>
                    <p className="text-sm text-gray-500">
                      Code hôtel: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{hotel.code}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-primary text-white p-4 rounded-lg">
                      <div className="text-2xl font-bold">€{hotelCommission.toFixed(2)}</div>
                      <div className="text-sm text-white">Commission aujourd'hui (5%)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Cards avec logique de commission */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Gift className="text-blue-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
                      <p className="text-2xl font-bold text-gray-800">{todayOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Euro className="text-green-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Chiffre d'affaires total</p>
                      <p className="text-2xl font-bold text-gray-800">€{todayRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Truck className="text-purple-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">En livraison</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {orders.filter(order => order.status === "delivering").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <QrCode className="text-yellow-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Chambres actives</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {new Set(todayOrders.map(order => order.customer_room)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tableau de bord des commissions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des revenus aujourd'hui</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      €{(todayRevenue * 0.75).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Commerçants (75%)</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      €{(todayRevenue * 0.20).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Zishop (20%)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      €{hotelCommission.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Hôtel (5%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commandes récentes avec workflow */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Commandes récentes</h3>
                <AdvancedOrderManagement 
                  orders={todayOrders.slice(0, 5)} 
                  userRole="hotel" 
                  entityId={selectedHotelId}
                />
              </CardContent>
            </Card>
          </div>
        );
      
      case "orders":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Suivi des commandes</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Aujourd'hui</Button>
                  <Button variant="ghost" size="sm">Cette semaine</Button>
                </div>
              </div>
              <AdvancedOrderManagement 
                orders={orders} 
                userRole="hotel" 
                entityId={selectedHotelId}
              />
            </CardContent>
          </Card>
        );

      case "qr-management":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">QR Code Hôtel</h3>
                <div className="text-center">
                  <div className="bg-gray-50 p-4 rounded-lg inline-block mb-4">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="text-4xl text-gray-400" size={64} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">QR Code pour accès souvenirs locaux</p>
                  <Button className="bg-primary text-white">
                    <Download className="mr-2" size={16} />
                    Télécharger QR
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Instructions QR & Commission</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Placez le QR code à la réception</p>
                  <p>• Les clients scannent pour accéder aux souvenirs</p>
                  <p>• Rayon de 3km autour de l'hôtel</p>
                  <p>• Livraison directe à la réception</p>
                  <p className="font-semibold text-purple-600">• Commission de 5% sur chaque vente</p>
                  <p>• Paiement centralisé via Zishop</p>
                  <p>• Reversement automatique mensuel</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "merchants":
        return (
          <HotelMerchantSelector hotelId={selectedHotelId} />
        );

      case "analytics":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Statistiques détaillées</h3>
              <p className="text-gray-600 mt-2">Analyses approfondies des performances de l'hôtel.</p>
            </CardContent>
          </Card>
        );

      case "qrcode":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">QR Code Hôtel</h3>
                <div className="text-center">
                  <div className="bg-gray-50 p-4 rounded-lg inline-block mb-4">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="text-4xl text-gray-400" size={64} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">QR Code pour accès souvenirs locaux</p>
                  <Button className="bg-primary text-white">
                    <Download className="mr-2" size={16} />
                    Télécharger QR
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Instructions QR & Commission</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Placez le QR code à la réception</p>
                  <p>• Les clients scannent pour accéder aux souvenirs</p>
                  <p>• Rayon de 3km autour de l'hôtel</p>
                  <p>• Livraison directe à la réception</p>
                  <p className="font-semibold text-purple-600">• Commission de 5% sur chaque vente</p>
                  <p>• Paiement centralisé via Zishop</p>
                  <p>• Reversement automatique mensuel</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "reviews":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Avis clients</h3>
              <p className="text-gray-600 mt-2">Gestion et suivi des avis clients de l'hôtel.</p>
            </CardContent>
          </Card>
        );

      case "notifications":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
              <p className="text-gray-600 mt-2">Gestion des notifications et alertes de l'hôtel.</p>
            </CardContent>
          </Card>
        );

      case "settings":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Paramètres</h3>
              <p className="text-gray-600 mt-2">Configuration de l'hôtel et préférences.</p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">Section en développement</h3>
              <p className="text-gray-600 mt-2">Cette fonctionnalité sera disponible prochainement.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex">
      <HotelSidebar activeSection={activeSection} onSectionChange={setActiveSection} ordersCount={0} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderDashboardContent()}
      </div>
    </div>
  );
}
