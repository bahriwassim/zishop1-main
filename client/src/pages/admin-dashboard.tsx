import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/admin-sidebar";
import AdvancedOrderManagement from "@/components/advanced-order-management";
import { Building, Store, ShoppingCart, Users, Clock, Plus, Edit, Gift, TrendingUp, Globe, Euro, AlertTriangle, Star } from "lucide-react";
import { api } from "@/lib/api";
import { Product, Merchant, Hotel } from '@/types';
import { ProductValidation } from '@/components/admin/product-validation';
import { MerchantValidation } from '@/components/admin/merchant-validation';
import { HotelValidation } from '@/components/admin/hotel-validation';
import { SimpleUserForm } from '@/components/admin/simple-user-form';
import { HotelAddForm } from '@/components/admin/hotel-add-form';
import { MerchantAddForm } from '@/components/admin/merchant-add-form';
import { HotelMerchantAssociation } from '@/components/admin/hotel-merchant-association';
import { HotelEditForm } from '@/components/admin/hotel-edit-form';
import { MerchantEditForm } from '@/components/admin/merchant-edit-form';
import AdminOrderAnalytics from '@/components/admin/admin-order-analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validationService } from '@/services/validation.service';
import { toast } from 'sonner';
import { UserManagement } from '@/components/admin/user-management';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import TestRealScenarios from '@/components/test-real-scenarios';
import { DebugPanel } from '@/components/debug-panel';
import { ApiConnectionTest } from '@/components/api-connection-test';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState({
    products: false,
    merchants: false,
    hotels: false
  });
  
  const queryClient = useQueryClient();
  
  // Get all data
  const { data: hotelsData = [], isLoading: hotelsLoading, refetch: refetchHotels } = useQuery({
    queryKey: ["hotels"],
    queryFn: api.getHotels,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });

  // Debug: Afficher les données des hôtels
  console.log('🔍 Debug - Hotels Data:', hotelsData);
  console.log('🔍 Debug - Hotels Loading:', hotelsLoading);
  console.log('🔍 Debug - Hotels Count:', hotelsData.length);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getAllOrders,
  });

  const { data: merchantsData = [] } = useQuery({
    queryKey: ["merchants"],
    queryFn: api.getAllMerchants,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats", "admin"],
    queryFn: api.getAdminStats,
  });

  // Get commission statistics for different periods
  const { data: commissionStatsToday } = useQuery({
    queryKey: ["stats", "commissions", "today"],
    queryFn: () => api.getCommissionStats("today"),
  });

  const { data: commissionStatsWeek } = useQuery({
    queryKey: ["stats", "commissions", "week"],
    queryFn: () => api.getCommissionStats("week"),
  });

  const { data: commissionStatsMonth } = useQuery({
    queryKey: ["stats", "commissions", "month"],
    queryFn: () => api.getCommissionStats("month"),
  });

  // Calculate recent activities
  const recentOrders = orders
    .slice(0, 10)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const recentActivities = recentOrders.map(order => ({
    id: order.id,
    type: "order",
    description: `Nouvelle commande #${order.order_number} pour €${order.total_amount}`,
    time: getRelativeTime(order.created_at),
  }));

  function getRelativeTime(date: Date | string): string {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minutes`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }

  const formatCurrency = (amount: string | number): string => {
    return parseFloat(amount.toString()).toFixed(2);
  };

  // Calculate financial data
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const zishopCommission = totalRevenue * 0.20;
  const hotelCommission = totalRevenue * 0.05;
  const merchantRevenue = totalRevenue * 0.75;

  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === today.toDateString();
  });

  const weekOrders = orders.filter(order => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const orderDate = new Date(order.created_at);
    return orderDate >= weekAgo;
  });

  const monthOrders = orders.filter(order => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const orderDate = new Date(order.created_at);
    return orderDate >= monthAgo;
  });

  // Filtrer les commandes problématiques
  const problematicOrders = orders.filter(order => 
    order.status === "pending" && new Date().getTime() - new Date(order.created_at).getTime() > 24 * 60 * 60 * 1000 // Plus de 24h en attente
  );

  // Charger les données en attente de validation
  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    try {
      setLoading({ products: true, merchants: true, hotels: true });
      
      const [pendingProducts, pendingMerchants, pendingHotels] = await Promise.all([
        validationService.getPendingProducts(),
        validationService.getPendingMerchants(),
        validationService.getPendingHotels()
      ]);

      setProducts(pendingProducts);
      setMerchants(pendingMerchants);
      setHotels(pendingHotels);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading({ products: false, merchants: false, hotels: false });
    }
  };

  const handleProductValidation = async (validation: any) => {
    try {
      await validationService.validateProduct(validation);
      toast.success('Produit validé avec succès');
      // Mettre à jour la liste des produits
      setProducts(products.filter(p => p.id !== validation.productId));
    } catch (error) {
      console.error('Erreur lors de la validation du produit:', error);
      toast.error('Erreur lors de la validation du produit');
    }
  };

  const handleMerchantValidation = async (validation: any) => {
    try {
      await validationService.validateMerchant(validation);
      toast.success('Commerçant validé avec succès');
      // Mettre à jour la liste des commerçants
      setMerchants(merchants.filter(m => m.id !== validation.merchantId));
    } catch (error) {
      console.error('Erreur lors de la validation du commerçant:', error);
      toast.error('Erreur lors de la validation du commerçant');
    }
  };

  const handleHotelValidation = async (validation: any) => {
    try {
      await validationService.validateHotel(validation);
      toast.success('Hôtel validé avec succès');
      // Mettre à jour la liste des hôtels
      setHotels(hotels.filter(h => h.id !== validation.hotelId));
    } catch (error) {
      console.error('Erreur lors de la validation de l\'hôtel:', error);
      toast.error('Erreur lors de la validation de l\'hôtel');
    }
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Admin Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Administration Zishop</h2>
                    <p className="text-gray-600">Plateforme de souvenirs pour hôtels - Gestion globale</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">€{formatCurrency(totalRevenue)}</div>
                      <div className="text-sm text-gray-500">Revenus totaux</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">€{formatCurrency(zishopCommission)}</div>
                      <div className="text-sm text-gray-500">Commission Zishop (20%)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="text-blue-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Hôtels partenaires</p>
                      <p className="text-2xl font-bold text-gray-800">{stats?.totalHotels || hotelsData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Store className="text-green-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Boutiques souvenirs</p>
                      <p className="text-2xl font-bold text-gray-800">{stats?.totalMerchants || 47}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Gift className="text-purple-600" size={24} />
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
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Commandes problématiques</p>
                      <p className="text-2xl font-bold text-gray-800">{problematicOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      €{commissionStatsToday?.stats?.merchantCommission?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-gray-600">Commissions commerçants aujourd'hui</div>
                    <div className="text-xs text-gray-500 mt-1">75% des ventes</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      €{commissionStatsToday?.stats?.zishopCommission?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-gray-600">Revenus Zishop aujourd'hui</div>
                    <div className="text-xs text-gray-500 mt-1">20% des ventes</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      €{commissionStatsToday?.stats?.hotelCommission?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-gray-600">Commissions hôtels aujourd'hui</div>
                    <div className="text-xs text-gray-500 mt-1">5% des ventes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "orders":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Supervision globale des commandes</h3>
              <AdvancedOrderManagement 
                orders={orders.slice(0, 20)} 
                userRole="admin"
              />
            </CardContent>
          </Card>
        );



      case "hotels":
        return (
          <div className="space-y-6">
            {showHotelForm ? (
              <HotelAddForm
                onSuccess={() => {
                  setShowHotelForm(false);
                  // Rafraîchir la liste des hôtels
                  refetchHotels();
                  // Forcer le rafraîchissement du cache
                  queryClient.invalidateQueries({ queryKey: ["hotels"] });
                  toast.success('Liste des hôtels mise à jour');
                }}
                onCancel={() => setShowHotelForm(false)}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Gestion des Hôtels Partenaires</h3>
                    <Button onClick={() => setShowHotelForm(true)} className="bg-primary">
                      <Plus className="mr-2" size={16} />
                      Nouvel hôtel
                    </Button>
                  </div>
                  
                  {/* Test de Connectivité API */}
                  <ApiConnectionTest />
                  
                  {/* Panel de Debug */}
                  <DebugPanel 
                    hotelsData={hotelsData}
                    merchantsData={hotelsData}
                    orders={orders}
                    hotelsLoading={hotelsLoading}
                  />
                  <div className="space-y-4">
                    {hotelsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement des hôtels...</p>
                      </div>
                    ) : hotelsData.length > 0 ? (
                      hotelsData.slice(0, 10).map((hotel) => {
                        const hotelOrders = orders.filter(o => o.hotel_id === hotel.id);
                        const hotelRevenue = hotelOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
                        const hotelCommissionAmount = hotelRevenue * 0.05;
                        
                        return (
                          <div key={hotel.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Building className="text-primary" size={24} />
                              <div>
                                <h4 className="font-medium text-gray-800">{hotel.name}</h4>
                                <p className="text-sm text-gray-600">{hotel.code}</p>
                                <p className="text-xs text-gray-500">
                                  {hotelOrders.length} commandes • €{hotelCommissionAmount.toFixed(2)} commission
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={hotel.is_active ? "bg-accent text-white" : "bg-gray-500 text-white"}>
                                {hotel.is_active ? "Actif" : "Inactif"}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingHotel(hotel)}
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Building className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">Aucun hôtel enregistré</p>
                        <Button onClick={() => setShowHotelForm(true)} className="mt-4">
                          Ajouter le premier hôtel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "merchants":
        return (
          <div className="space-y-6">
            {showMerchantForm ? (
              <MerchantAddForm
                onSuccess={() => {
                  setShowMerchantForm(false);
                  // Rafraîchir la liste des commerçants
                  queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
                  toast.success('Liste des commerçants mise à jour');
                }}
                onCancel={() => setShowMerchantForm(false)}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Gestion des Commerçants</h3>
                    <Button onClick={() => setShowMerchantForm(true)} className="bg-green-600">
                      <Plus className="mr-2" size={16} />
                      Nouveau commerçant
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {merchantsData.length === 0 ? (
                      <div className="text-center py-8">
                        <Store className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">Aucun commerçant enregistré</p>
                        <Button onClick={() => setShowMerchantForm(true)} className="mt-4">
                          Ajouter le premier commerçant
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {merchantsData.map((merchant) => (
                          <Card key={merchant.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-800">{merchant.name}</h4>
                                <Badge className="bg-green-500 text-white text-xs">
                                  {merchant.is_open ? 'Ouvert' : 'Fermé'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{merchant.category}</p>
                              <p className="text-xs text-gray-500 mb-2">{merchant.address}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  Note: {merchant.rating}/5 ({merchant.review_count} avis)
                                </span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingMerchant(merchant)}
                                >
                                  <Edit size={14} />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-primary" />
                  Gestion des Accès Utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-800 mb-2">Rôles selon le cahier des charges :</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Admin :</strong> Accès complet, supervision globale, validation des entités</p>
                    <p>• <strong>Hôtel :</strong> Gestion des commandes de l'hôtel, réception, commission 5%</p>
                    <p>• <strong>Commerçant :</strong> Gestion des produits, commandes, commission 75%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UserManagement hotels={hotelsData} merchants={merchantsData} />
                  <Card>
                    <CardHeader>
                      <CardTitle>API Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                          <strong>POST</strong> /api/users<br/>
                          <span className="text-gray-600">Créer un utilisateur</span>
                        </div>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                          <strong>GET</strong> /api/users<br/>
                          <span className="text-gray-600">Lister les utilisateurs</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Les logs de création sont visibles dans la console serveur
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "validation":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation des produits</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.products ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ProductValidation />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation des commerçants</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.merchants ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <MerchantValidation />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation des hôtels</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.hotels ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <HotelValidation />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Analytiques et Statistiques</h3>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="revenue">Revenus</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Répartition des revenus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Commerçants (75%)</span>
                            <span className="font-bold">€{(totalRevenue * 0.75).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Zishop (20%)</span>
                            <span className="font-bold">€{(totalRevenue * 0.20).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Hôtels (5%)</span>
                            <span className="font-bold">€{(totalRevenue * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Statistiques par période</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Aujourd'hui</span>
                              <span className="font-bold">{todayOrders.length} commandes</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              €{todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cette semaine</span>
                              <span className="font-bold">{weekOrders.length} commandes</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              €{weekOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Ce mois</span>
                              <span className="font-bold">{monthOrders.length} commandes</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              €{monthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="revenue">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top 5 Hôtels par revenus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {hotelsData.slice(0, 5).map((hotel) => {
                            const hotelOrders = orders.filter(o => o.hotel_id === hotel.id);
                            const revenue = hotelOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
                            return (
                              <div key={hotel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{hotel.name}</p>
                                  <p className="text-sm text-gray-600">{hotelOrders.length} commandes</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">€{revenue.toFixed(2)}</p>
                                  <p className="text-xs text-green-600">+€{(revenue * 0.05).toFixed(2)} commission</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="performance">
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
                          <Clock className="mx-auto text-blue-600 mb-2" size={32} />
                          <p className="text-sm text-gray-600">Temps moyen livraison</p>
                          <p className="text-2xl font-bold">45 min</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Star className="mx-auto text-yellow-600 mb-2" size={32} />
                          <p className="text-sm text-gray-600">Satisfaction client</p>
                          <p className="text-2xl font-bold">4.8/5</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );

      case "reversements":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="text-primary" />
                Reversements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Période</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Destinataire</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Exemple de données statiques, à remplacer par un mapping sur les reversements réels */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Juin 2024</td>
                      <td className="py-3 px-4">€1,200.00</td>
                      <td className="py-3 px-4">Commerçant #12</td>
                      <td className="py-3 px-4 text-green-600">Payé</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">Exporter CSV</Button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Juin 2024</td>
                      <td className="py-3 px-4">€300.00</td>
                      <td className="py-3 px-4">Hôtel #5</td>
                      <td className="py-3 px-4 text-yellow-600">En attente</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">Exporter CSV</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );

      case "tests":
        return <TestRealScenarios />;

      case "hotel-merchants":
        return (
          <div className="space-y-6">
            <HotelMerchantAssociation hotels={hotelsData} merchants={merchantsData} />
          </div>
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
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 p-8 bg-gray-50">
        {renderDashboardContent()}

        {/* Enhanced Financial Dashboard - Only show on dashboard */}
        {activeSection === "dashboard" && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Tableau financier détaillé - Commissions</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Période</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Commandes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Chiffre d'affaires</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Commission Zishop (20%)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Commission Hôtels (5%)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Reversé Commerçants (75%)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Ticket moyen</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">Aujourd'hui</td>
                      <td className="py-3 px-4">{commissionStatsToday?.stats?.orderCount || 0}</td>
                      <td className="py-3 px-4 font-semibold">
                        €{commissionStatsToday?.stats?.totalRevenue?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        €{commissionStatsToday?.stats?.zishopCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-secondary font-semibold">
                        €{commissionStatsToday?.stats?.hotelCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-accent font-semibold">
                        €{commissionStatsToday?.stats?.merchantCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        €{commissionStatsToday?.averageOrderValue?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">Cette semaine</td>
                      <td className="py-3 px-4">{commissionStatsWeek?.stats?.orderCount || 0}</td>
                      <td className="py-3 px-4 font-semibold">
                        €{commissionStatsWeek?.stats?.totalRevenue?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        €{commissionStatsWeek?.stats?.zishopCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-secondary font-semibold">
                        €{commissionStatsWeek?.stats?.hotelCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-accent font-semibold">
                        €{commissionStatsWeek?.stats?.merchantCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        €{commissionStatsWeek?.averageOrderValue?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">Ce mois</td>
                      <td className="py-3 px-4">{commissionStatsMonth?.stats?.orderCount || 0}</td>
                      <td className="py-3 px-4 font-semibold">
                        €{commissionStatsMonth?.stats?.totalRevenue?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-primary font-semibold">
                        €{commissionStatsMonth?.stats?.zishopCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-secondary font-semibold">
                        €{commissionStatsMonth?.stats?.hotelCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-accent font-semibold">
                        €{commissionStatsMonth?.stats?.merchantCommission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        €{commissionStatsMonth?.averageOrderValue?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals d'édition */}
        <HotelEditForm
          hotel={editingHotel}
          isOpen={!!editingHotel}
          onClose={() => setEditingHotel(null)}
        />
        
        <MerchantEditForm
          merchant={editingMerchant}
          isOpen={!!editingMerchant}
          onClose={() => setEditingMerchant(null)}
        />
      </div>
    </div>
  );
}
