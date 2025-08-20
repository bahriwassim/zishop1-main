import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, QrCode } from "lucide-react";

interface MerchantHotelsDisplayProps {
  merchantId: number;
}

export default function MerchantHotelsDisplay({ merchantId }: MerchantHotelsDisplayProps) {
  // Récupérer les hôtels associés au commerçant
  const { data: merchantHotels = [], isLoading } = useQuery({
    queryKey: [`/api/merchants/${merchantId}/hotels`],
    enabled: !!merchantId,
    queryFn: async () => {
      if (!merchantId) return [];
      const response = await fetch(`/api/merchants/${merchantId}/hotels`);
      if (!response.ok) throw new Error("Failed to fetch merchant hotels");
      return response.json();
    },
  });

  const activeHotels = merchantHotels.filter((mh: any) => mh.isActive);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="text-zishop-blue" size={24} />
          Hôtels Partenaires
        </CardTitle>
        <p className="text-sm text-gray-600">
          {activeHotels.length} hôtel(s) acceptent vos produits
        </p>
      </CardHeader>
      <CardContent>
        {activeHotels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building className="mx-auto mb-4 text-gray-300" size={48} />
            <p>Aucun hôtel partenaire actif</p>
            <p className="text-sm mt-2">
              Les hôtels peuvent vous ajouter à leur liste de commerçants depuis leur tableau de bord
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeHotels.map((mh: any) => {
              const hotel = mh.hotel;
              if (!hotel) return null;
              
              return (
                <div
                  key={hotel.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-zishop-blue transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{hotel.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <QrCode size={12} className="mr-1" />
                          {hotel.code}
                        </Badge>
                        {hotel.isActive ? (
                          <Badge className="bg-green-500 text-white text-xs">Actif</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactif</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{hotel.address}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Partenaire depuis {new Date(mh.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-sm text-blue-800 mb-2">
            Comment obtenir plus d'hôtels partenaires?
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Maintenez vos produits à jour et attractifs</li>
            <li>• Assurez une livraison rapide et fiable</li>
            <li>• Proposez des produits souvenirs uniques et locaux</li>
            <li>• Les hôtels vous ajouteront automatiquement s'ils sont intéressés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 