import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TestValidation() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('🔍 Chargement des produits...');
      const response = await fetch('http://localhost:5000/api/products');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Produits chargés:', data);
        setProducts(data);
        setTestResult(`✅ ${data.length} produits chargés`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setTestResult(`❌ Erreur: ${error.message}`);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const testValidation = async (productId: number, action: string) => {
    try {
      console.log(`🧪 Test validation: Produit ${productId}, Action: ${action}`);
      
      const token = localStorage.getItem('token') || 'fake-admin-token';
      console.log('🔑 Token utilisé:', token);
      
      const response = await fetch(`http://localhost:5000/api/products/${productId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action,
          note: `Test depuis l'interface - ${new Date().toLocaleTimeString()}`
        })
      });

      console.log('📡 Réponse serveur:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Succès:', result);
        setTestResult(`✅ ${action} réussi pour produit ${productId}: ${result.message}`);
        toast.success(`Produit ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès!`);
        loadProducts(); // Recharger
      } else {
        const errorText = await response.text();
        console.log('❌ Erreur réponse:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      setTestResult(`❌ Erreur validation: ${error.message}`);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Chargement des produits de test...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test de Validation des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Statut du test:</h4>
              <p className="text-blue-700">{testResult}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ouvrez la console du navigateur (F12)</li>
                <li>• Cliquez sur les boutons de test</li>
                <li>• Vérifiez les logs dans la console</li>
                <li>• Observez les messages de toast</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📦 Produits Disponibles ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucun produit trouvé. Créez d'abord des produits avec:<br/>
                <code className="bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  node test-product-validation.js
                </code>
              </p>
            ) : (
              products.slice(0, 3).map((product: any) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">ID: {product.id} • Prix: €{product.price}</p>
                      <p className="text-xs text-gray-500">Status: {product.validation_status || 'pending'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => testValidation(product.id, 'approve')}
                      >
                        ✅ Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => testValidation(product.id, 'reject')}
                      >
                        ❌ Rejeter
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔧 Actions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={loadProducts} variant="outline">
              🔄 Recharger Produits
            </Button>
            <Button 
              onClick={() => {
                localStorage.setItem('token', 'test-admin-token');
                setTestResult('🔑 Token de test défini');
              }}
              variant="outline"
            >
              🔑 Définir Token
            </Button>
            <Button 
              onClick={() => {
                console.clear();
                setTestResult('🧹 Console nettoyée');
              }}
              variant="outline"
            >
              🧹 Nettoyer Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}