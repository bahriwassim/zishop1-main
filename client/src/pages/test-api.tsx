import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestApi() {
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { test, success, data, timestamp: new Date().toISOString() }]);
  };

  const testEndpoint = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return {
        ok: response.ok,
        status: response.status,
        contentType,
        data
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message
      };
    }
  };

  const runTests = async () => {
    setResults([]);
    
    // Test 1: Direct API health check
    const healthCheck = await testEndpoint("/api/health");
    addResult("API Health Check", healthCheck.ok, healthCheck);
    
    // Test 2: Login endpoint
    const loginTest = await testEndpoint("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "jean.dupont@example.com",
        password: "password123"
      })
    });
    addResult("Login Test", loginTest.ok, loginTest);
    
    // Test 3: Check backend server
    const backendTest = await testEndpoint("http://localhost:5000/api/health");
    addResult("Direct Backend Check", backendTest.ok, backendTest);
    
    // Test 4: Check proxy
    const proxyTest = await testEndpoint("/api/test");
    addResult("Proxy Test", proxyTest.ok, proxyTest);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test de l'API</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} className="mb-4">
              Lancer les tests
            </Button>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✓ Succès' : '✗ Échec'}
                    </span>
                  </div>
                  <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 