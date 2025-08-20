import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  ShoppingCart, 
  Users,
  Building,
  Store,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Download,
  Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export default function AdminOrderAnalytics() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  const [selectedMerchant, setSelectedMerchant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Récupérer toutes les données
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: api.getAllOrders,
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ["/api/hotels"],
    queryFn: api.getHotels,
  });

  const { data: merchants = [] } = useQuery({
    queryKey: ["/api/merchants"],
    queryFn: api.getAllMerchants,
  });

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    const matchesHotel = selectedHotel === "all" || order.hotelId === parseInt(selectedHotel);
    const matchesMerchant = selectedMerchant === "all" || order.merchantId === parseInt(selectedMerchant);
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    return matchesDate && matchesHotel && matchesMerchant && matchesStatus;
  });

  // Calculer les statistiques
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
    avgOrderValue: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) / filteredOrders.length 
      : 0,
    completedOrders: filteredOrders.filter(o => o.status === "delivered").length,
    cancelledOrders: filteredOrders.filter(o => o.status === "cancelled").length,
    pendingOrders: filteredOrders.filter(o => ["pending", "confirmed", "preparing", "ready", "delivering"].includes(o.status)).length,
    conversionRate: filteredOrders.length > 0 
      ? (filteredOrders.filter(o => o.status === "delivered").length / filteredOrders.length) * 100 
      : 0,
  };

  // Données pour les graphiques
  const ordersByDay = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
    
    return {
      date: format(date, "dd/MM"),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      zishopCommission: dayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount) * 0.20, 0),
    };
  });

  const ordersByStatus = [
    { name: "En attente", value: filteredOrders.filter(o => o.status === "pending").length, color: "#f59e0b" },
    { name: "Confirmées", value: filteredOrders.filter(o => o.status === "confirmed").length, color: "#3b82f6" },
    { name: "En préparation", value: filteredOrders.filter(o => o.status === "preparing").length, color: "#f97316" },
    { name: "Prêtes", value: filteredOrders.filter(o => o.status === "ready").length, color: "#8b5cf6" },
    { name: "En livraison", value: filteredOrders.filter(o => o.status === "delivering").length, color: "#6366f1" },
    { name: "Livrées", value: filteredOrders.filter(o => o.status === "delivered").length, color: "#10b981" },
    { name: "Annulées", value: filteredOrders.filter(o => o.status === "cancelled").length, color: "#ef4444" },
  ].filter(item => item.value > 0);

  const topHotels = hotels.map(hotel => {
    const hotelOrders = filteredOrders.filter(o => o.hotelId === hotel.id);
    return {
      name: hotel.name,
      orders: hotelOrders.length,
      revenue: hotelOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      commission: hotelOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount) * 0.05, 0),
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const topMerchants = merchants.map(merchant => {
    const merchantOrders = filteredOrders.filter(o => o.merchantId === merchant.id);
    return {
      name: merchant.name,
      orders: merchantOrders.length,
      revenue: merchantOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      commission: merchantOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount) * 0.75, 0),
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Temps moyen de livraison
  const deliveredOrders = filteredOrders.filter(o => o.status === "delivered" && o.deliveredAt);
  const avgDeliveryTime = deliveredOrders.length > 0
    ? deliveredOrders.reduce((sum, order) => {
        const created = new Date(order.createdAt).getTime();
        const delivered = new Date(order.deliveredAt!).getTime();
        return sum + (delivered - created) / (1000 * 60); // en minutes
      }, 0) / deliveredOrders.length
    : 0;

  const exportData = () => {
    // Logique d'export CSV
    const csv = [
      ["Date", "Numéro", "Client", "Hôtel", "Commerçant", "Montant", "Statut", "Commission Zishop"],
      ...filteredOrders.map(order => [
        format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
        order.orderNumber,
        order.customerName,
        hotels.find(h => h.id === order.hotelId)?.name || "",
        merchants.find(m => m.id === order.merchantId)?.name || "",
        order.totalAmount,
        order.status,
        (parseFloat(order.totalAmount) * 0.20).toFixed(2),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zishop-orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Analyse des Commandes</CardTitle>
            <Button onClick={exportData} variant="outline">
              <Download size={16} className="mr-1" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => range && setDateRange(range)}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les hôtels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les hôtels</SelectItem>
                {hotels.map(hotel => (
                  <SelectItem key={hotel.id} value={hotel.id.toString()}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les commerçants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les commerçants</SelectItem>
                {merchants.map(merchant => (
                  <SelectItem key={merchant.id} value={merchant.id.toString()}>
                    {merchant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="preparing">En préparation</SelectItem>
                <SelectItem value="ready">Prête</SelectItem>
                <SelectItem value="delivering">En livraison</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <Euro className="text-green-600" size={32} />
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
              <TrendingUp className="text-purple-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de conversion</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="status">Statuts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ranking">Classements</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus et commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    name="Chiffre d'affaires" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="zishopCommission" 
                    stackId="2"
                    stroke="#10b981" 
                    fill="#10b981" 
                    name="Commission Zishop (20%)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Statistiques de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={24} />
                      <span className="font-medium">Livrées</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{stats.completedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="text-orange-600" size={24} />
                      <span className="font-medium">En cours</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="text-red-600" size={24} />
                      <span className="font-medium">Annulées</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Temps moyen de livraison</p>
                    <p className="text-2xl font-bold text-blue-600">{avgDeliveryTime.toFixed(0)} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance par jour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={ordersByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Nombre de commandes" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenus (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="text-blue-600" size={20} />
                  Top 5 Hôtels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topHotels.map((hotel, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{hotel.name}</p>
                        <p className="text-sm text-gray-600">{hotel.orders} commandes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{hotel.revenue.toFixed(2)}</p>
                        <p className="text-xs text-green-600">+€{hotel.commission.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="text-purple-600" size={20} />
                  Top 5 Commerçants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topMerchants.map((merchant, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{merchant.name}</p>
                        <p className="text-sm text-gray-600">{merchant.orders} commandes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{merchant.revenue.toFixed(2)}</p>
                        <p className="text-xs text-orange-600">€{merchant.commission.toFixed(2)} gagné</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 