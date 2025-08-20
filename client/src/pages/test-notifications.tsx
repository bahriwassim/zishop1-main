import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleNotificationTest } from '@/components/simple-notification-test';
import { toast } from 'sonner';
import { Bell, Package, Truck, CheckCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';

export default function TestNotifications() {
  const [selectedUserType, setSelectedUserType] = useState('admin');
  const [selectedEntityId, setSelectedEntityId] = useState(1);
  const [testOrderId, setTestOrderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast.success('Notification de test envoyée!');
      } else {
        toast.error('Erreur lors de l\'envoi de la notification');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestOrderId(data.order.id);
        toast.success(`Commande de test créée: ${data.order.orderNumber}`);
      } else {
        toast.error('Erreur lors de la création de la commande');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    if (!testOrderId) {
      toast.error('Aucune commande de test disponible');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/test/order/${testOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Statut mis à jour: ${status}`);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const orderStatuses = [
    { value: 'confirmed', label: 'Confirmée', icon: CheckCircle, color: 'bg-green-500' },
    { value: 'preparing', label: 'En préparation', icon: Package, color: 'bg-yellow-500' },
    { value: 'ready', label: 'Prête', icon: AlertCircle, color: 'bg-blue-500' },
    { value: 'delivering', label: 'En livraison', icon: Truck, color: 'bg-purple-500' },
    { value: 'delivered', label: 'Livrée', icon: CheckCircle, color: 'bg-green-600' },
    { value: 'cancelled', label: 'Annulée', icon: AlertCircle, color: 'bg-red-500' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🧪 Test des Notifications</h1>
          <p className="text-muted-foreground">
            Testez le système de notifications en temps réel et le flux des commandes
          </p>
        </div>
                 <SimpleNotificationTest />
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuration du Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userType">Type d'utilisateur</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="hotel">Hôtel</SelectItem>
                      <SelectItem value="merchant">Commerçant</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entityId">ID d'entité</Label>
                  <Input 
                    type="number" 
                    value={selectedEntityId} 
                    onChange={(e) => setSelectedEntityId(parseInt(e.target.value) || 1)} 
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Configurez votre type d'utilisateur et ID d'entité</li>
                  <li>2. Cliquez sur l'icône 🔔 en haut à droite pour ouvrir le panneau de notifications</li>
                  <li>3. Testez les notifications avec les boutons ci-dessous</li>
                  <li>4. Créez et gérez des commandes de test</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Test des Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={sendTestNotification} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4 mr-2" />
                  )}
                  Envoyer Notification de Test
                </Button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Conseil:</h4>
                <p className="text-sm text-yellow-800">
                  Après avoir envoyé une notification, vérifiez le panneau de notifications 
                  en cliquant sur l'icône cloche en haut à droite de la page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestion des Commandes de Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={createTestOrder} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Créer Commande de Test
                  </Button>
                  
                  {testOrderId && (
                    <Badge variant="secondary" className="py-2 px-3">
                      Commande actuelle: #{testOrderId}
                    </Badge>
                  )}
                </div>

                {!testOrderId && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-muted-foreground">
                      Créez d'abord une commande de test pour pouvoir tester les transitions de statut
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {testOrderId && (
              <Card>
                <CardHeader>
                  <CardTitle>Workflow des Statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {orderStatuses.map((status) => {
                      const Icon = status.icon;
                      return (
                        <Button
                          key={status.value}
                          onClick={() => updateOrderStatus(status.value)}
                          disabled={isLoading}
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                        >
                          <div className={`p-2 rounded-full ${status.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm">{status.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-6 bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Test Complet:</h4>
                    <ol className="text-sm text-green-800 space-y-1">
                      <li>1. Créez une commande de test</li>
                      <li>2. Changez son statut étape par étape</li>
                      <li>3. Observez les notifications en temps réel</li>
                      <li>4. Vérifiez que les différents utilisateurs reçoivent les bonnes notifications</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 