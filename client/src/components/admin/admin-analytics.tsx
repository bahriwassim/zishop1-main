import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Euro, ShoppingCart, Users, Building, Store, Package } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminAnalytics() {
  // Récupérer toutes les données nécessaires
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getAllOrders,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    queryFn: api.getHotels,
  });

  const { data: merchants = [] } = useQuery({
    queryKey: ["merchants"],
    queryFn: api.getAllMerchants,
  });

  // Calculer les statistiques
  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
    
    // Revenus par jour (7 derniers jours)
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      revenueByDay.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
        commission: dayRevenue * 0.20, // Commission Zishop
      });
    }

    // Top 5 hôtels par revenus
    const hotelStats = hotels.map(hotel => {
      const hotelOrders = orders.filter(o => o.hotelId === hotel.id);
      const revenue = hotelOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      return {
        name: hotel.name,
        revenue,
        orders: hotelOrders.length,
        commission: revenue * 0.05,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Top 5 commerçants par revenus
    const merchantStats = merchants.map(merchant => {
      const merchantOrders = orders.filter(o => o.merchantId === merchant.id);
      const revenue = merchantOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      return {
        name: merchant.name,
        revenue,
        orders: merchantOrders.length,
        commission: revenue * 0.75,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Répartition par statut
    const statusDistribution = [
      { name: "En attente", value: orders.filter(o => o.status === "pending").length, color: "#f59e0b" },
      { name: "Confirmées", value: orders.filter(o => o.status === "confirmed").length, color: "#3b82f6" },
      { name: "En préparation", value: orders.filter(o => o.status === "preparing").length, color: "#f97316" },
      { name: "Prêtes", value: orders.filter(o => o.status === "ready").length, color: "#8b5cf6" },
      { name: "En livraison", value: orders.filter(o => o.status === "delivering").length, color: "#6366f1" },
      { name: "Livrées", value: orders.filter(o => o.status === "delivered").length, color: "#10b981" },
      { name: "Annulées", value: orders.filter(o => o.status === "cancelled").length, color: "#ef4444" },
    ];

    return {
      totalRevenue,
      totalOrders,
      activeOrders,
      revenueByDay,
      hotelStats,
      merchantStats,
      statusDistribution,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      zishopRevenue: totalRevenue * 0.20,
      hotelCommissions: totalRevenue * 0.05,
      merchantCommissions: totalRevenue * 0.75,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires total</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <Euro className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus Zishop (20%)</p>
                <p className="text-2xl font-bold">€{stats.zishopRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="text-purple-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Panier moyen</p>
                <p className="text-2xl font-bold">€{stats.avgOrderValue.toFixed(2)}</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="hotels">Hôtels</TabsTrigger>
          <TabsTrigger value="merchants">Commerçants</TabsTrigger>
          <TabsTrigger value="status">Statuts</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenus" />
                  <Line type="monotone" dataKey="commission" stroke="#10b981" name="Commission Zishop" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600">Total semaine</p>
                  <p className="font-bold text-blue-600">
                    €{stats.revenueByDay.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Commission semaine</p>
                  <p className="font-bold text-green-600">
                    €{stats.revenueByDay.reduce((sum, day) => sum + day.commission, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Commandes semaine</p>
                  <p className="font-bold text-purple-600">
                    {stats.revenueByDay.reduce((sum, day) => sum + day.orders, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Hôtels par chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.hotelStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Chiffre d'affaires" />
                  <Bar dataKey="commission" fill="#10b981" name="Commission hôtel (5%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchants">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Commerçants par chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.merchantStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Chiffre d'affaires" />
                  <Bar dataKey="commission" fill="#f59e0b" name="Commission commerçant (75%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des commandes par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 