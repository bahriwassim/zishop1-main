import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function DebugAPI() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Test API - Début...');
      
      // Test 1: Hôtels
      console.log('📍 Test 1: Récupération des hôtels...');
      const hotelsData = await api.getHotels();
      console.log('✅ Hôtels récupérés:', hotelsData);
      setHotels(hotelsData);
      
      // Test 2: Marchands
      console.log('🏪 Test 2: Récupération des marchands...');
      const merchantsData = await api.getAllMerchants();
      console.log('✅ Marchands récupérés:', merchantsData);
      setMerchants(merchantsData);
      
      console.log('🎉 Tous les tests API réussis !');
      
    } catch (err: any) {
      console.error('❌ Erreur API:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Test Fetch Direct - Début...');
      
      // Test direct avec fetch
      const hotelsResponse = await fetch('/api/hotels');
      const hotelsData = await hotelsResponse.json();
      console.log('✅ Fetch direct hôtels:', hotelsData);
      setHotels(hotelsData);
      
      const merchantsResponse = await fetch('/api/merchants');
      const merchantsData = await merchantsResponse.json();
      console.log('✅ Fetch direct marchands:', merchantsData);
      setMerchants(merchantsData);
      
    } catch (err: any) {
      console.error('❌ Erreur Fetch Direct:', err);
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🐛 Debug API - Test des Endpoints
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testAPI} 
            disabled={loading}
            variant="default"
          >
            {loading ? 'Test en cours...' : 'Test API (via lib/api)'}
          </Button>
          
          <Button 
            onClick={testDirectFetch} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Test en cours...' : 'Test Fetch Direct'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">❌ Erreur:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hôtels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏨 Hôtels ({hotels.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {hotels.length > 0 ? (
                <div className="space-y-2">
                  {hotels.slice(0, 5).map((hotel: any) => (
                    <div key={hotel.id} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-600">Code: {hotel.code}</p>
                    </div>
                  ))}
                  {hotels.length > 5 && (
                    <p className="text-sm text-gray-500">... et {hotels.length - 5} autres</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Aucun hôtel récupéré</p>
              )}
            </CardContent>
          </Card>

          {/* Marchands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏪 Marchands ({merchants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {merchants.length > 0 ? (
                <div className="space-y-2">
                  {merchants.slice(0, 5).map((merchant: any) => (
                    <div key={merchant.id} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{merchant.name}</p>
                      <p className="text-sm text-gray-600">Catégorie: {merchant.category}</p>
                    </div>
                  ))}
                  {merchants.length > 5 && (
                    <p className="text-sm text-gray-500">... et {merchants.length - 5} autres</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Aucun marchand récupéré</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-medium">💡 Instructions de Debug:</p>
          <ol className="text-blue-700 text-sm mt-2 space-y-1">
            <li>1. Ouvrez la console du navigateur (F12)</li>
            <li>2. Cliquez sur "Test API" pour voir les logs détaillés</li>
            <li>3. Vérifiez les erreurs réseau dans l'onglet Network</li>
            <li>4. Comparez avec "Test Fetch Direct"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}



