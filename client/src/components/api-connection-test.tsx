import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  response?: any;
  error?: string;
  timestamp: string;
}

export function ApiConnectionTest() {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const endpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Hôtels', url: '/api/hotels' },
    { name: 'Commerçants', url: '/api/merchants' },
    { name: 'Produits', url: '/api/products' },
    { name: 'Commandes', url: '/api/orders' },
  ];

  const testEndpoint = async (endpoint: { name: string; url: string }): Promise<ApiTestResult> => {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint.url);
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        endpoint: endpoint.name,
        status: 'success',
        response: data,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const results: ApiTestResult[] = [];
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.push(result);
      setTestResults([...results]);
      
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Succès</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'pending':
        return <Badge variant="secondary">En cours</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  useEffect(() => {
    // Test automatique au chargement
    runAllTests();
  }, []);

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Test de Connectivité API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Badge variant="outline">Total: {testResults.length}</Badge>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Succès: {successCount}
            </Badge>
            <Badge variant="destructive">
              Erreurs: {errorCount}
            </Badge>
          </div>
          <Button 
            onClick={runAllTests} 
            disabled={isTesting}
            size="sm"
          >
            {isTesting ? 'Test en cours...' : 'Relancer les tests'}
          </Button>
        </div>

        {errorCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorCount} endpoint(s) en erreur. Vérifiez que le serveur backend est démarré sur le port 5000.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="font-medium">{result.endpoint}</div>
                  <div className="text-sm text-gray-500">
                    {result.timestamp}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(result.status)}
                {result.status === 'success' && result.response && (
                  <div className="text-xs text-gray-500">
                    {Array.isArray(result.response) 
                      ? `${result.response.length} éléments`
                      : 'OK'
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {testResults.length === 0 && !isTesting && (
          <div className="text-center text-gray-500 py-8">
            Aucun test effectué
          </div>
        )}

        {isTesting && (
          <div className="text-center text-gray-500 py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Tests en cours...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
