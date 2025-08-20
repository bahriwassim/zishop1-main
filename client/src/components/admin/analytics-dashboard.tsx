import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Euro, 
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";

interface AnalyticsDashboardProps {
  hotels: any[];
  merchants: any[];
  orders: any[];
  stats: any;
}

export default function AnalyticsDashboard({ hotels, merchants, orders, stats }: AnalyticsDashboardProps) {
  // Calculer les statistiques
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalOrders = orders.length;
  const activeHotels = hotels.filter(h => h.is_active).length;
  const activeMerchants = merchants.filter(m => m.isOpen).length;
  
  // Commandes par statut
  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Revenus par période (7 derniers jours)
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
    
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      orders: dayOrders.length,
    };
  }).reverse();

  // Top hôtels par revenus
  const topHotels = hotels.map(hotel => {
    const hotelOrders = orders.filter(o => o.hotelId === hotel.id);
    const revenue = hotelOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return {
      name: hotel.name,
      revenue,
      orders: hotelOrders.length,
      commission: revenue * 0.05, // 5% commission
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top commerçants par revenus
  const topMerchants = merchants.map(merchant => {
    const merchantOrders = orders.filter(o => o.merchantId === merchant.id);
    const revenue = merchantOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return {
      name: merchant.name,
      revenue,
      orders: merchantOrders.length,
      commission: revenue * 0.75, // 75% commission
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires total</p>
                <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
              </div>
              <Euro className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold">{ordersByStatus.pending + ordersByStatus.confirmed}</p>
              </div>
              <ShoppingCart className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hôtels actifs</p>
                <p className="text-2xl font-bold">{activeHotels}</p>
              </div>
              <MapPin className="text-purple-600" size={32} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commerçants actifs</p>
                <p className="text-2xl font-bold">{activeMerchants}</p>
              </div>
              <Users className="text-orange-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="hotels">Hôtels</TabsTrigger>
          <TabsTrigger value="merchants">Commerçants</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commandes par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En attente</span>
                    <Badge variant="secondary">{ordersByStatus.pending}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confirmées</span>
                    <Badge variant="secondary">{ordersByStatus.confirmed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En préparation</span>
                    <Badge variant="secondary">{ordersByStatus.preparing}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prêtes</span>
                    <Badge variant="secondary">{ordersByStatus.ready}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">En livraison</span>
                    <Badge variant="secondary">{ordersByStatus.delivering}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Livrées</span>
                    <Badge className="bg-green-500">{ordersByStatus.delivered}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenus par jour (7 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueByDay.map((day, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{day.day}</span>
                      <div className="text-right">
                        <div className="font-semibold">€{day.revenue.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{day.orders} commandes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Hôtels par revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topHotels.map((hotel, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-600">{hotel.orders} commandes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{hotel.revenue.toFixed(2)}</p>
                      <p className="text-xs text-green-600">+€{hotel.commission.toFixed(2)} commission</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Commerçants par revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMerchants.map((merchant, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{merchant.name}</p>
                      <p className="text-sm text-gray-600">{merchant.orders} commandes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{merchant.revenue.toFixed(2)}</p>
                      <p className="text-xs text-green-600">+€{merchant.commission.toFixed(2)} commission</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="mx-auto text-green-600 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Taux de conversion</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Calendar className="mx-auto text-blue-600 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Temps moyen livraison</p>
                  <p className="text-2xl font-bold">45 min</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Activity className="mx-auto text-purple-600 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Satisfaction client</p>
                  <p className="text-2xl font-bold">4.8/5</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 