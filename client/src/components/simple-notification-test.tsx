import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SimpleNotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');

  const testNotificationEndpoint = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastResponse('✅ Notification envoyée avec succès');
        toast.success('Test de notification envoyé!');
      } else {
        setLastResponse('❌ Erreur: ' + response.statusText);
        toast.error('Erreur lors du test');
      }
    } catch (error) {
      setLastResponse('❌ Erreur de connexion: ' + (error as Error).message);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/test/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastResponse(`✅ Commande créée: ${data.order?.orderNumber || 'OK'}`);
        toast.success('Commande de test créée!');
      } else {
        setLastResponse('❌ Erreur: ' + response.statusText);
        toast.error('Erreur lors de la création');
      }
    } catch (error) {
      setLastResponse('❌ Erreur de connexion: ' + (error as Error).message);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test Simple des Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={testNotificationEndpoint} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Tester Endpoint Notification
              </>
            )}
          </Button>

          <Button 
            onClick={testCreateOrder} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Créer Commande de Test
              </>
            )}
          </Button>
        </div>

        {lastResponse && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono">{lastResponse}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Ces tests vérifient que les endpoints fonctionnent</p>
          <p>• Les notifications WebSocket nécessitent le serveur complet</p>
          <p>• Vérifiez la console du serveur pour les logs</p>
        </div>
      </CardContent>
    </Card>
  );
} 