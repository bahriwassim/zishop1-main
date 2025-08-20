import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Hotel } from "@shared/schema";

interface HotelEditFormProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HotelEditForm({ hotel, isOpen, onClose }: HotelEditFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: hotel?.name || "",
    address: hotel?.address || "",
    latitude: hotel?.latitude || "",
    longitude: hotel?.longitude || "",
    is_active: hotel?.is_active ?? true,
  });

  const updateHotelMutation = useMutation({
    mutationFn: (data: any) => api.updateHotel(hotel!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hotels"] });
      toast.success("Hôtel mis à jour avec succès");
      onClose();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'hôtel");
      console.error("Update hotel error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;

    updateHotelMutation.mutate({
      ...formData,
      latitude: formData.latitude.toString(),
      longitude: formData.longitude.toString(),
    });
  };

  const handleClose = () => {
    setFormData({
      name: hotel?.name || "",
      address: hotel?.address || "",
      latitude: hotel?.latitude || "",
      longitude: hotel?.longitude || "",
      is_active: hotel?.is_active ?? true,
    });
    onClose();
  };

  if (!hotel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'hôtel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'hôtel *</Label>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Hôtel actif</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateHotelMutation.isPending}>
              {updateHotelMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}