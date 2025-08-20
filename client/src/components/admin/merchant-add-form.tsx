import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Store, Save, X, MapPin } from 'lucide-react';

const merchantSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  address: z.string().min(5, 'L\'adresse doit être plus détaillée'),
  category: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  description: z.string().optional(),
  latitude: z.string()
    .min(1, 'La latitude est requise')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, 
      'Latitude invalide (doit être entre -90 et 90)'),
  longitude: z.string()
    .min(1, 'La longitude est requise')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, 
      'Longitude invalide (doit être entre -180 et 180)'),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type MerchantFormData = z.infer<typeof merchantSchema>;

interface MerchantAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categories = [
  { value: 'souvenirs', label: 'Souvenirs et Cadeaux' },
  { value: 'artisanat', label: 'Artisanat Local' },
  { value: 'bijoux', label: 'Bijoux et Accessoires' },
  { value: 'art', label: 'Art et Galeries' },
  { value: 'livres', label: 'Livres et Cartes Postales' },
  { value: 'textile', label: 'Textile et Mode' },
  { value: 'gastronomie', label: 'Spécialités Gastronomiques' },
  { value: 'parfums', label: 'Parfums et Cosmétiques' },
  { value: 'autres', label: 'Autres' },
];

export function MerchantAddForm({ onSuccess, onCancel }: MerchantAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MerchantFormData>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      name: '',
      address: '',
      category: '',
      description: '',
      latitude: '',
      longitude: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (data: MerchantFormData) => {
    setIsSubmitting(true);
    try {
      const merchantData = {
        name: data.name,
        address: data.address,
        category: data.category,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        rating: "0.0",
        review_count: 0,
        is_open: true,
        image_url: data.imageUrl || null,
      };

      console.log('Tentative de création de commerçant:', merchantData);

      const response = await api.createMerchant(merchantData);
      console.log('Réponse du serveur:', response);
      
      toast.success('Commerçant créé avec succès', {
        description: `${data.name} a été ajouté à la plateforme`,
      });

      form.reset();
      
      // Recharger la page pour s'assurer que les données sont à jour
      setTimeout(() => {
        onSuccess?.();
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Erreur lors de la création du commerçant:', error);
      toast.error(`Erreur lors de la création du commerçant: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="text-green-600" />
          Ajouter un nouveau commerçant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du commerce *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Souvenirs de Paris"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select onValueChange={(value) => form.setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse complète *</Label>
            <Input
              id="address"
              {...form.register('address')}
              placeholder="15 Rue de Rivoli, 75001 Paris"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Boutique spécialisée dans les souvenirs authentiques de Paris..."
              rows={3}
            />
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

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
            <Input
              id="imageUrl"
              {...form.register('imageUrl')}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-sm text-red-600">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-green-600" size={20} />
              <span className="font-medium text-green-800">Géolocalisation</span>
            </div>
            <p className="text-sm text-green-700">
              Le commerçant sera visible dans un rayon de 3 km autour des hôtels partenaires.
              Commission: 75% du chiffre d'affaires généré.
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
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2" size={16} />
              {isSubmitting ? 'Création...' : 'Créer le commerçant'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 