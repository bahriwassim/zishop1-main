import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Store, MapPin, Star, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface HotelMerchantAssociationProps {
  hotels: any[];
  merchants: any[];
}

export function HotelMerchantAssociation({ hotels, merchants }: HotelMerchantAssociationProps) {
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [selectedMerchants, setSelectedMerchants] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  // Récupérer les associations pour l'hôtel sélectionné
  const { data: hotelMerchants = [], refetch: refetchHotelMerchants } = useQuery({
    queryKey: [`/api/hotels/${selectedHotel}/merchants`],
    queryFn: async () => {
      if (!selectedHotel) return [];
      const response = await fetch(`/api/hotels/${selectedHotel}/merchants`);
      if (!response.ok) throw new Error("Failed to fetch hotel merchants");
      return response.json();
    },
    enabled: !!selectedHotel,
  });

  // Initialiser les commerçants sélectionnés
  useEffect(() => {
    if (hotelMerchants.length > 0) {
      const selected = new Set(
        hotelMerchants
          .filter((hm: any) => hm.isActive)
          .map((hm: any) => hm.merchantId)
      );
      setSelectedMerchants(selected);
    } else {
      setSelectedMerchants(new Set());
    }
  }, [hotelMerchants]);

  // Mutation pour ajouter une association
  const addAssociation = useMutation({
    mutationFn: async (merchantId: number) => {
      const response = await fetch("/api/hotel-merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: parseInt(selectedHotel), merchantId }),
      });
      if (!response.ok) throw new Error("Failed to add association");
      return response.json();
    },
    onSuccess: () => {
      refetchHotelMerchants();
      toast.success("Commerçant ajouté avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du commerçant");
    },
  });

  // Mutation pour mettre à jour une association
  const updateAssociation = useMutation({
    mutationFn: async ({ merchantId, isActive }: { merchantId: number; isActive: boolean }) => {
      const response = await fetch(`/api/hotel-merchants/${selectedHotel}/${merchantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update association");
      return response.json();
    },
    onSuccess: () => {
      refetchHotelMerchants();
      toast.success("Association mise à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const handleToggleMerchant = async (merchantId: number, isActive: boolean) => {
    try {
      if (isActive) {
        // Vérifier si l'association existe déjà
        const existingAssociation = hotelMerchants.find((hm: any) => hm.merchantId === merchantId);
        if (existingAssociation) {
          // Mettre à jour l'association existante
          updateAssociation.mutate({ merchantId, isActive: true });
        } else {
          // Créer une nouvelle association
          addAssociation.mutate(merchantId);
        }
      } else {
        // Désactiver l'association
        updateAssociation.mutate({ merchantId, isActive: false });
      }
    } catch (error) {
      console.error('Erreur lors du toggle:', error);
      toast.error("Erreur lors de la modification de l'association");
    }
  };

  const selectedHotelData = hotels.find(h => h.id.toString() === selectedHotel);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="text-primary" />
            Gestion des Associations Hôtel-Commerçants
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sélectionnez un hôtel pour gérer ses commerçants partenaires
          </p>
        </CardHeader>
        <CardContent>
          {/* Sélection d'hôtel */}
          <div className="mb-6">
            <Label htmlFor="hotel-select">Sélectionner un hôtel</Label>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un hôtel" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id.toString()}>
                    {hotel.name} - {hotel.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHotel && selectedHotelData && (
            <div className="space-y-4">
              {/* Informations de l'hôtel sélectionné */}
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building className="text-blue-600" size={24} />
                    <div>
                      <h4 className="font-medium text-blue-800">{selectedHotelData.name}</h4>
                      <p className="text-sm text-blue-600">Code: {selectedHotelData.code}</p>
                      <p className="text-sm text-blue-600">{selectedHotelData.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des commerçants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {merchants.map((merchant) => {
                  const isSelected = selectedMerchants.has(merchant.id);
                  return (
                    <div
                      key={merchant.id}
                      className={`p-4 border rounded-lg transition-all ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Store className="text-blue-600" size={20} />
                            <h4 className="font-medium">{merchant.name}</h4>
                            {isSelected && <CheckCircle className="text-green-500" size={16} />}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{merchant.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-500" />
                              <span>{merchant.rating} ({merchant.review_count} avis)</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {merchant.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`merchant-${merchant.id}`} className="text-sm">
                            {isSelected ? "Actif" : "Inactif"}
                          </Label>
                          <Switch
                            id={`merchant-${merchant.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleToggleMerchant(merchant.id, checked)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statistiques */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedMerchants.size} commerçant(s) associé(s) sur {merchants.length} total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-600">
                      {selectedMerchants.size} Actifs
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      {merchants.length - selectedMerchants.size} Inactifs
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedHotel && (
            <div className="text-center py-8">
              <Building className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Sélectionnez un hôtel pour gérer ses associations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 