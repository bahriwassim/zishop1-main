import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Merchant } from "@shared/schema";

interface MerchantEditFormProps {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MerchantEditForm({ merchant, isOpen, onClose }: MerchantEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: merchant?.name || "",
    address: merchant?.address || "",
    category: merchant?.category || "",
    latitude: merchant?.latitude || "",
    longitude: merchant?.longitude || "",
    rating: merchant?.rating || "0.0",
    is_open: merchant?.is_open ?? true,
  });

  const updateMerchantMutation = useMutation({
    mutationFn: (data: any) => api.updateMerchant(merchant!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
      toast.success("Commerçant mis à jour avec succès");
      onClose();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du commerçant");
      console.error("Update merchant error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    updateMerchantMutation.mutate({
      ...formData,
      latitude: formData.latitude.toString(),
      longitude: formData.longitude.toString(),
    });
  };

  const handleClose = () => {
    setFormData({
      name: merchant?.name || "",
      address: merchant?.address || "",
      category: merchant?.category || "",
      latitude: merchant?.latitude || "",
      longitude: merchant?.longitude || "",
      rating: merchant?.rating || "0.0",
      is_open: merchant?.is_open ?? true,
    });
    onClose();
  };

  if (!merchant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le commerçant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du commerçant *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Souvenirs">Souvenirs</SelectItem>
                <SelectItem value="Artisanat">Artisanat</SelectItem>
                <SelectItem value="Bijoux">Bijoux</SelectItem>
                <SelectItem value="Gastronomie">Gastronomie</SelectItem>
                <SelectItem value="Mode">Mode</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Note (0-5)</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_open"
              checked={formData.is_open}
              onCheckedChange={(checked) => setFormData({ ...formData, is_open: checked })}
            />
            <Label htmlFor="is_open">Commerçant ouvert</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateMerchantMutation.isPending}>
              {updateMerchantMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}