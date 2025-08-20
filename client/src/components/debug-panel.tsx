import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Store, Package, ShoppingCart } from 'lucide-react';

interface DebugPanelProps {
  hotelsData: any[];
  merchantsData: any[];
  orders: any[];
  hotelsLoading: boolean;
}

export function DebugPanel({ hotelsData, merchantsData, orders, hotelsLoading }: DebugPanelProps) {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center">
          🔍 Panel de Debug
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Building className="mx-auto h-8 w-8 text-blue-600 mb-2" />
            <div className="text-lg font-bold text-blue-600">{hotelsData.length}</div>
            <div className="text-sm text-gray-600">Hôtels</div>
            <Badge variant={hotelsLoading ? "outline" : "default"} className="mt-1">
              {hotelsLoading ? "Chargement..." : "Prêt"}
            </Badge>
          </div>
          
          <div className="text-center">
            <Store className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-lg font-bold text-green-600">{merchantsData.length}</div>
            <div className="text-sm text-gray-600">Commerçants</div>
          </div>
          
          <div className="text-center">
            <Package className="mx-auto h-8 w-8 text-purple-600 mb-2" />
            <div className="text-lg font-bold text-purple-600">-</div>
            <div className="text-sm text-gray-600">Produits</div>
          </div>
          
          <div className="text-center">
            <ShoppingCart className="mx-auto h-8 w-8 text-orange-600 mb-2" />
            <div className="text-lg font-bold text-orange-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Commandes</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold mb-2">Hôtels récents:</h4>
          <div className="space-y-1">
            {hotelsData.slice(0, 3).map((hotel) => (
              <div key={hotel.id} className="text-sm">
                • {hotel.name} (ID: {hotel.id})
              </div>
            ))}
            {hotelsData.length === 0 && (
              <div className="text-sm text-gray-500">Aucun hôtel</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 