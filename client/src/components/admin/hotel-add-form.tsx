import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, QrCode, Save, X } from 'lucide-react';
import { api } from '@/lib/api';

const hotelSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit être plus détaillée'),
  latitude: z.string()
    .min(1, 'La latitude est requise')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, 
      'Latitude invalide (doit être entre -90 et 90)'),
  longitude: z.string()
    .min(1, 'La longitude est requise')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, 
      'Longitude invalide (doit être entre -180 et 180)'),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface HotelAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HotelAddForm({ onSuccess, onCancel }: HotelAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '',
      address: '',
      latitude: '',
      longitude: '',
    },
  });

  const generateHotelCode = (name: string): string => {
    const prefix = 'ZI';
    const nameCode = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${nameCode}${randomNum}`;
  };

  const generateQRCode = (hotelCode: string): string => {
    return `https://zishop.co/hotel/${hotelCode}`;
  };

  const onSubmit = async (data: HotelFormData) => {
    setIsSubmitting(true);
    try {
      const hotelCode = generateHotelCode(data.name);
      const qrCode = generateQRCode(hotelCode);

      const hotelData = {
        name: data.name,
        address: data.address,
        code: hotelCode,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        qr_code: qrCode,
        is_active: true,
      };

      console.log('Tentative de création d\'hôtel:', hotelData);

      const response = await api.createHotel(hotelData);
      console.log('Réponse du serveur:', response);
      
      toast.success('Hôtel créé avec succès', {
        description: `Code hôtel: ${hotelCode}`,
      });

      form.reset();
      
      // Recharger la page pour s'assurer que les données sont à jour
      setTimeout(() => {
        onSuccess?.();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'hôtel:', error);
      toast.error(`Erreur lors de la création de l'hôtel: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-primary" />
          Ajouter un nouvel hôtel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'hôtel *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Hôtel des Champs-Élysées"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                {...form.register('address')}
                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                {...form.register('latitude')}
                placeholder="48.8566"
                type="number"
                step="any"
              />
              {form.formState.errors.latitude && (
                <p className="text-sm text-red-600">{form.formState.errors.latitude.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                {...form.register('longitude')}
                placeholder="2.3522"
                type="number"
                step="any"
              />
              {form.formState.errors.longitude && (
                <p className="text-sm text-red-600">{form.formState.errors.longitude.message}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="text-blue-600" size={20} />
              <span className="font-medium text-blue-800">Configuration automatique</span>
            </div>
            <p className="text-sm text-blue-700">
              Un code hôtel unique et un QR code seront générés automatiquement lors de la création.
              Rayon de recherche par défaut : 3 km.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                <X className="mr-2" size={16} />
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2" size={16} />
              {isSubmitting ? 'Création...' : 'Créer l\'hôtel'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 