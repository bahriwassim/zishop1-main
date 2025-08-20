import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Hotel, 
  Store, 
  ShoppingCart, 
  Users, 
  Euro, 
  CheckCircle,
  Clock,
  Truck,
  Package,
  Star,
  MapPin,
  QrCode
} from "lucide-react";

export default function TestRealScenarios() {
  const [testResults, setTestResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runScenario = async (scenario: string) => {
    setIsRunning(true);
    setTestResults(prev => ({ ...prev, [scenario]: { status: 'running', message: 'Test en cours...' } }));

    try {
      switch (scenario) {
        case 'hotel-creation':
          await testHotelCreation();
          break;
        case 'merchant-creation':
          await testMerchantCreation();
          break;
        case 'order-workflow':
          await testOrderWorkflow();
          break;
        case 'notifications':
          await testNotifications();
          break;
        default:
          throw new Error('Scénario non reconnu');
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [scenario]: { 
          status: 'error', 
          message: error.message || 'Erreur inconnue' 
        } 
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const testHotelCreation = async () => {
    const hotelData = {
      name: "Hôtel Test ZiShop",
      address: "123 Rue de Test, 75001 Paris",
      latitude: 48.8566,
      longitude: 2.3522,
      qr_code: "https://zishop.co/hotel/ZITEST123",
      is_active: true
    };

    const response = await fetch('/api/hotels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
      throw new Error(`Erreur création hôtel: ${response.status}`);
    }

    const hotel = await response.json();
    
    // Vérifier que l'hôtel apparaît dans la liste
    const hotelsResponse = await fetch('/api/hotels');
    const hotels = await hotelsResponse.json();
    const hotelExists = hotels.some((h: any) => h.name === hotelData.name);

    if (!hotelExists) {
      throw new Error('Hôtel créé mais non trouvé dans la liste');
    }

    setTestResults(prev => ({ 
      ...prev, 
      'hotel-creation': { 
        status: 'success', 
        message: `Hôtel créé avec succès (ID: ${hotel.id})` 
      } 
    }));
  };

  const testMerchantCreation = async () => {
    const merchantData = {
      name: "Boutique Test ZiShop",
      address: "456 Avenue de Test, 75002 Paris",
      category: "Souvenirs",
      latitude: 48.8606,
      longitude: 2.3376,
      rating: "4.5",
      reviewCount: 0,
      isOpen: true,
      imageUrl: null
    };

    const response = await fetch('/api/merchants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merchantData)
    });

    if (!response.ok) {
      throw new Error(`Erreur création commerçant: ${response.status}`);
    }

    const merchant = await response.json();
    
    // Vérifier que le commerçant apparaît dans la liste
    const merchantsResponse = await fetch('/api/merchants');
    const merchants = await merchantsResponse.json();
    const merchantExists = merchants.some((m: any) => m.name === merchantData.name);

    if (!merchantExists) {
      throw new Error('Commerçant créé mais non trouvé dans la liste');
    }

    setTestResults(prev => ({ 
      ...prev, 
      'merchant-creation': { 
        status: 'success', 
        message: `Commerçant créé avec succès (ID: ${merchant.id})` 
      } 
    }));
  };

  const testOrderWorkflow = async () => {
    // 1. Créer une commande
    const orderData = {
      hotelId: 1,
      merchantId: 1,
      clientId: 1,
      customerName: "Client Test",
      customerRoom: "101",
      items: [
        { productId: 1, productName: "Souvenir Test", quantity: 2, price: "15.00" }
      ],
      totalAmount: "30.00",
      status: "pending"
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Erreur création commande: ${response.status}`);
    }

    const order = await response.json();

    // 2. Simuler l'acceptation par le commerçant
    const updateResponse = await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' })
    });

    if (!updateResponse.ok) {
      throw new Error('Erreur mise à jour commande');
    }

    setTestResults(prev => ({ 
      ...prev, 
      'order-workflow': { 
        status: 'success', 
        message: `Workflow commande testé avec succès (ID: ${order.id})` 
      } 
    }));
  };

  const testNotifications = async () => {
    // Tester les notifications WebSocket
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test notification ZiShop' })
    });

    if (!response.ok) {
      throw new Error('Erreur test notifications');
    }

    setTestResults(prev => ({ 
      ...prev, 
      'notifications': { 
        status: 'success', 
        message: 'Système de notifications testé avec succès' 
      } 
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const scenarios = [
    {
      id: 'hotel-creation',
      title: 'Création d\'hôtel',
      description: 'Ajouter un hôtel et vérifier qu\'il apparaît dans la liste',
      icon: Hotel,
      category: 'Entités'
    },
    {
      id: 'merchant-creation',
      title: 'Création de commerçant',
      description: 'Ajouter un commerçant et vérifier qu\'il apparaît dans la liste',
      icon: Store,
      category: 'Entités'
    },
    {
      id: 'order-workflow',
      title: 'Workflow de commande',
      description: 'Créer une commande et tester le workflow complet',
      icon: ShoppingCart,
      category: 'Commandes'
    },
    {
      id: 'notifications',
      title: 'Système de notifications',
      description: 'Tester les notifications en temps réel',
      icon: Package,
      category: 'Système'
    }
  ];

  const categories = ['Entités', 'Commandes', 'Système'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="text-primary" />
            Tests des Scénarios Réels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Testez les fonctionnalités principales de l'application avec des données réelles.
          </p>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous les tests</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category.toLowerCase()}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category.toLowerCase()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios
                    .filter(scenario => scenario.category === category)
                    .map(scenario => {
                      const Icon = scenario.icon;
                      const result = testResults[scenario.id];
                      
                      return (
                        <Card key={scenario.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon className="text-primary" size={20} />
                                <h3 className="font-semibold">{scenario.title}</h3>
                              </div>
                              {result && (
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`} />
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {scenario.description}
                            </p>
                            
                            {result && (
                              <div className="mb-3">
                                <Badge 
                                  variant={result.status === 'success' ? 'default' : 
                                         result.status === 'error' ? 'destructive' : 'secondary'}
                                >
                                  {result.status === 'success' ? 'Succès' :
                                   result.status === 'error' ? 'Erreur' : 'En cours'}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">{result.message}</p>
                              </div>
                            )}
                            
                            <Button 
                              onClick={() => runScenario(scenario.id)}
                              disabled={isRunning}
                              size="sm"
                              className="w-full"
                            >
                              {isRunning && testResults[scenario.id]?.status === 'running' ? (
                                <>
                                  <Clock className="mr-2" size={16} />
                                  Test en cours...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2" size={16} />
                                  Lancer le test
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map(scenario => {
                  const Icon = scenario.icon;
                  const result = testResults[scenario.id];
                  
                  return (
                    <Card key={scenario.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="text-primary" size={20} />
                            <h3 className="font-semibold">{scenario.title}</h3>
                          </div>
                          {result && (
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`} />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {scenario.description}
                        </p>
                        
                        {result && (
                          <div className="mb-3">
                            <Badge 
                              variant={result.status === 'success' ? 'default' : 
                                     result.status === 'error' ? 'destructive' : 'secondary'}
                            >
                              {result.status === 'success' ? 'Succès' :
                               result.status === 'error' ? 'Erreur' : 'En cours'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{result.message}</p>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => runScenario(scenario.id)}
                          disabled={isRunning}
                          size="sm"
                          className="w-full"
                        >
                          {isRunning && testResults[scenario.id]?.status === 'running' ? (
                            <>
                              <Clock className="mr-2" size={16} />
                              Test en cours...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2" size={16} />
                              Lancer le test
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 