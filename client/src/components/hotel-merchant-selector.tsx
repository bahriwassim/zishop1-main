import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, MapPin, Star } from "lucide-react";
import { api } from "@/lib/api";

interface HotelMerchantSelectorProps {
  hotelId: number;
}

export default function HotelMerchantSelector({ hotelId }: HotelMerchantSelectorProps) {
  const queryClient = useQueryClient();
  const [selectedMerchants, setSelectedMerchants] = useState<Set<number>>(new Set());

  // Récupérer tous les commerçants
  const { data: allMerchants = [] } = useQuery({
    queryKey: ["/api/merchants"],
    queryFn: api.getAllMerchants,
  });

  // Récupérer les associations actuelles
  const { data: hotelMerchants = [] } = useQuery({
    queryKey: [`/api/hotels/${hotelId}/merchants`],
    queryFn: async () => {
      const response = await fetch(`/api/hotels/${hotelId}/merchants`);
      if (!response.ok) throw new Error("Failed to fetch hotel merchants");
      return response.json();
    },
  });

  // Initialiser les commerçants sélectionnés
  useEffect(() => {
    const selected = new Set(
      hotelMerchants
        .filter((hm: any) => hm.isActive)
        .map((hm: any) => hm.merchantId)
    );
    setSelectedMerchants(selected);
  }, [hotelMerchants]);

  // Mutation pour ajouter une association
  const addAssociation = useMutation({
    mutationFn: async (merchantId: number) => {
      const response = await fetch("/api/hotel-merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, merchantId }),
      });
      if (!response.ok) throw new Error("Failed to add association");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hotels/${hotelId}/merchants`] });
      toast.success("Commerçant ajouté avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du commerçant");
    },
  });

  // Mutation pour mettre à jour une association
  const updateAssociation = useMutation({
    mutationFn: async ({ merchantId, isActive }: { merchantId: number; isActive: boolean }) => {
      const response = await fetch(`/api/hotel-merchants/${hotelId}/${merchantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update association");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/hotels/${hotelId}/merchants`] });
    },
  });

  const handleToggleMerchant = async (merchantId: number, isSelected: boolean) => {
    const existingAssociation = hotelMerchants.find((hm: any) => hm.merchantId === merchantId);

    if (isSelected) {
      if (existingAssociation) {
        // Réactiver l'association existante
        await updateAssociation.mutateAsync({ merchantId, isActive: true });
      } else {
        // Créer une nouvelle association
        await addAssociation.mutateAsync(merchantId);
      }
      setSelectedMerchants(new Set([...selectedMerchants, merchantId]));
    } else {
      // Désactiver l'association
      if (existingAssociation) {
        await updateAssociation.mutateAsync({ merchantId, isActive: false });
      }
      const newSelected = new Set(selectedMerchants);
      newSelected.delete(merchantId);
      setSelectedMerchants(newSelected);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Commerçants Partenaires</CardTitle>
        <p className="text-sm text-gray-600">
          Sélectionnez les commerçants qui peuvent recevoir des commandes de votre hôtel
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allMerchants.map((merchant) => {
            const isSelected = selectedMerchants.has(merchant.id);
            return (
              <div
                key={merchant.id}
                className={`p-4 border rounded-lg transition-all ${
                  isSelected ? "border-zishop-blue bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="text-zishop-blue" size={20} />
                      <h4 className="font-medium">{merchant.name}</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{merchant.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span>{merchant.rating} ({merchant.reviewCount} avis)</span>
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
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{selectedMerchants.size} commerçant(s) sélectionné(s)</p>
        </div>
      </CardContent>
    </Card>
  );
} 