import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Star, 
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface MerchantAnalyticsProps {
  merchantId: number;
}

export default function MerchantAnalytics({ merchantId }: MerchantAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("week");

  // Données simulées pour l'analytique
  const analyticsData = {
    revenue: {
      current: 12470,
      previous: 11800,
      change: 5.7
    },
    orders: {
      current: 156,
      previous: 142,
      change: 9.9
    },
    customers: {
      current: 89,
      previous: 76,
      change: 17.1
    },
    rating: {
      current: 4.8,
      previous: 4.6,
      change: 4.3
    }
  };

  const topProducts = [
    { name: "Souvenir Local", sales: 45, revenue: 2250 },
    { name: "Artisanat", sales: 32, revenue: 1600 },
    { name: "Produits Régionaux", sales: 28, revenue: 1400 },
    { name: "Accessoires", sales: 25, revenue: 1250 }
  ];

  const salesByDay = [
    { day: "Lun", sales: 12, revenue: 600 },
    { day: "Mar", sales: 18, revenue: 900 },
    { day: "Mer", sales: 15, revenue: 750 },
    { day: "Jeu", sales: 22, revenue: 1100 },
    { day: "Ven", sales: 25, revenue: 1250 },
    { day: "Sam", sales: 30, revenue: 1500 },
    { day: "Dim", sales: 20, revenue: 1000 }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytique</h2>
          <p className="text-gray-600">Suivez vos performances et optimisez votre activité</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Semaine
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Mois
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            Année
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">€{analyticsData.revenue.current.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.revenue.change > 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${analyticsData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.revenue.change}%
                  </span>
                </div>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.orders.current}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.orders.change > 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${analyticsData.orders.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.orders.change}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.customers.current}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.customers.change > 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${analyticsData.customers.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.customers.change}%
                  </span>
                </div>
              </div>
              <Eye className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.rating.current}</p>
                <div className="flex items-center mt-2">
                  {analyticsData.rating.change > 0 ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm ${analyticsData.rating.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.rating.change}%
                  </span>
                </div>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventes par jour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Ventes par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByDay.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(day.revenue / 1500) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">€{day.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Produits les plus vendus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2" size={20} />
              Produits les plus vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`} />
                    <span className="text-sm text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.sales} ventes</p>
                    <p className="text-xs text-gray-600">€{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2" size={20} />
            Insights et recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Points forts</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Croissance des ventes</p>
                    <p className="text-xs text-gray-600">+9.9% par rapport à la période précédente</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Satisfaction client</p>
                    <p className="text-xs text-gray-600">Note moyenne de 4.8/5 étoiles</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nouveaux clients</p>
                    <p className="text-xs text-gray-600">+17.1% de nouveaux clients</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Recommandations</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Optimiser les horaires</p>
                    <p className="text-xs text-gray-600">Augmenter les ventes en soirée</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Diversifier l'offre</p>
                    <p className="text-xs text-gray-600">Ajouter des produits saisonniers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Promouvoir les avis</p>
                    <p className="text-xs text-gray-600">Encourager les clients à laisser des avis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 