import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit3, Save, X, Hotel, Calendar, MapPin } from "lucide-react";
import { api } from "@/lib/api";

interface ClientProfileProps {
  clientId: number;
  customerName: string;
  onUpdateProfile: (name: string) => void;
}

export default function ClientProfile({ 
  clientId,
  customerName, 
  onUpdateProfile 
}: ClientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customerName);
  const { toast } = useToast();

  // Get real client stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/clients/stats", clientId],
    queryFn: () => api.getClientStats(clientId),
  });

  const handleSave = () => {
    if (!editName.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez renseigner votre nom",
        variant: "destructive",
      });
      return;
    }

    onUpdateProfile(editName.trim());
    setIsEditing(false);
    
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été modifiées avec succès",
    });
  };

  const handleCancel = () => {
    setEditName(customerName);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const mockPreferences = {
    favoriteCategories: ["Souvenirs", "Artisanat local"],
    language: "Français",
    notifications: true,
    memberSince: "2024",
  };

  const displayStats = stats || {
    totalOrders: 0,
    totalSpent: "0.00",
    favoriteMerchant: "Aucun",
    loyaltyPoints: 0,
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-16 h-16 bg-blue-600">
              <AvatarFallback className="text-white text-lg font-bold">
                {getInitials(customerName)}
              </AvatarFallback>
            </Avatar>
            
            {!isEditing ? (
              <div className="space-y-1">
                <CardTitle className="text-xl">{customerName}</CardTitle>
              </div>
            ) : (
              <div className="space-y-3 w-full max-w-xs">
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-sm">Nom complet</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Edit3 size={14} className="mr-1" />
                  Modifier
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="border-gray-300"
                  >
                    <X size={14} className="mr-1" />
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save size={14} className="mr-1" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <User size={18} className="mr-2 text-blue-600" />
            Statistiques client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statsLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{displayStats.totalOrders}</div>
                  <div className="text-xs text-blue-800">Commandes</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{parseFloat(displayStats.totalSpent).toFixed(0)}€</div>
                  <div className="text-xs text-green-800">Dépensé</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Magasin favori</span>
                  <Badge variant="secondary" className="text-xs">
                    {displayStats.favoriteMerchant}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points de fidélité</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {displayStats.loyaltyPoints} pts
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin size={18} className="mr-2 text-blue-600" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Langue</span>
              <Badge variant="outline">{mockPreferences.language}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Notifications</span>
              <Badge className={mockPreferences.notifications ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {mockPreferences.notifications ? "Activées" : "Désactivées"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-gray-600">Catégories préférées</span>
              <div className="flex flex-wrap gap-2">
                {mockPreferences.favoriteCategories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar size={18} className="mr-2 text-blue-600" />
            Informations du compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Membre depuis</span>
            <span className="text-sm font-medium">{mockPreferences.memberSince}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Statut du compte</span>
            <Badge className="bg-green-100 text-green-800">Actif</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Niveau de fidélité</span>
            <Badge className="bg-yellow-100 text-yellow-800">
              {displayStats.loyaltyPoints > 200 ? "Or" : displayStats.loyaltyPoints > 100 ? "Argent" : "Bronze"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50">
          <User size={16} className="mr-2" />
          Paramètres de notification
        </Button>
      </div>
    </div>
  );
} 