import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Package,
  Route,
  Calendar,
  User,
  Phone,
  Mail,
  Navigation
} from "lucide-react";

interface MerchantDeliveryProps {
  merchantId: number;
}

export default function MerchantDelivery({ merchantId }: MerchantDeliveryProps) {
  const [filter, setFilter] = useState("all");

  // Données simulées pour les livraisons
  const deliveryStats = {
    totalDeliveries: 156,
    completedToday: 23,
    inProgress: 8,
    pending: 5,
    averageDeliveryTime: "45 min"
  };

  const deliveries = [
    {
      id: 1,
      orderId: "ORD-001",
      customerName: "Marie Dupont",
      hotel: "Hôtel Central",
      roomNumber: "205",
      status: "completed",
      deliveryTime: "14:30",
      estimatedTime: "45 min",
      actualTime: "42 min",
      driver: "Jean Martin",
      phone: "+33 6 12 34 56 78",
      address: "123 Rue de la Paix, Paris",
      items: ["Souvenir Local", "Artisanat"]
    },
    {
      id: 2,
      orderId: "ORD-002",
      customerName: "Pierre Dubois",
      hotel: "Hôtel Plaza",
      roomNumber: "312",
      status: "in_progress",
      deliveryTime: "15:45",
      estimatedTime: "30 min",
      actualTime: null,
      driver: "Sophie Bernard",
      phone: "+33 6 98 76 54 32",
      address: "456 Avenue des Champs, Paris",
      items: ["Produits Régionaux"]
    },
    {
      id: 3,
      orderId: "ORD-003",
      customerName: "Anne Moreau",
      hotel: "Hôtel Luxe",
      roomNumber: "108",
      status: "pending",
      deliveryTime: "16:15",
      estimatedTime: "40 min",
      actualTime: null,
      driver: null,
      phone: "+33 6 11 22 33 44",
      address: "789 Boulevard Saint-Germain, Paris",
      items: ["Accessoires", "Souvenir Local"]
    },
    {
      id: 4,
      orderId: "ORD-004",
      customerName: "Jean Martin",
      hotel: "Hôtel Central",
      roomNumber: "401",
      status: "completed",
      deliveryTime: "13:20",
      estimatedTime: "35 min",
      actualTime: "38 min",
      driver: "Marie Dupont",
      phone: "+33 6 55 44 33 22",
      address: "123 Rue de la Paix, Paris",
      items: ["Artisanat"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "in_progress":
        return <Truck className="text-blue-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === "all") return true;
    return delivery.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des livraisons</h2>
          <p className="text-gray-600">Suivez et gérez vos livraisons en temps réel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Route className="mr-2" size={16} />
            Optimiser les routes
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2" size={16} />
            Planifier
          </Button>
        </div>
      </div>

      {/* Statistiques des livraisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total livraisons</p>
                <p className="text-2xl font-bold text-gray-900">{deliveryStats.totalDeliveries}</p>
                <p className="text-sm text-gray-600 mt-2">Ce mois</p>
              </div>
              <Truck className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminées aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{deliveryStats.completedToday}</p>
                <p className="text-sm text-gray-600 mt-2">Livraisons</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{deliveryStats.inProgress}</p>
                <p className="text-sm text-gray-600 mt-2">Livraisons</p>
              </div>
              <Truck className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{deliveryStats.pending}</p>
                <p className="text-sm text-gray-600 mt-2">Livraisons</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-2xl font-bold text-gray-900">{deliveryStats.averageDeliveryTime}</p>
                <p className="text-sm text-gray-600 mt-2">Par livraison</p>
              </div>
              <Clock className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex items-center space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Toutes
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Terminées
        </Button>
        <Button
          variant={filter === "in_progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("in_progress")}
        >
          En cours
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          En attente
        </Button>
      </div>

      {/* Liste des livraisons */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* En-tête de la livraison */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <p className="font-medium text-gray-900">{delivery.orderId}</p>
                      <p className="text-sm text-gray-600">{delivery.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(delivery.status)}`}>
                      {delivery.status === "completed" ? "Terminée" : 
                       delivery.status === "in_progress" ? "En cours" : "En attente"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{delivery.deliveryTime}</p>
                  </div>
                </div>

                {/* Informations de livraison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{delivery.hotel} - Chambre {delivery.roomNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{delivery.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{delivery.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Estimé: {delivery.estimatedTime}
                        {delivery.actualTime && ` | Réel: ${delivery.actualTime}`}
                      </span>
                    </div>
                    {delivery.driver && (
                      <div className="flex items-center space-x-2">
                        <User className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-600">Livreur: {delivery.driver}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Package className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{delivery.items.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2" size={14} />
                      Appeler
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2" size={14} />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Navigation className="mr-2" size={14} />
                      Itinéraire
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {delivery.status === "pending" && (
                      <Button size="sm">
                        <Truck className="mr-2" size={14} />
                        Assigner
                      </Button>
                    )}
                    {delivery.status === "in_progress" && (
                      <Button size="sm">
                        <CheckCircle className="mr-2" size={14} />
                        Marquer livré
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carte de livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2" size={20} />
            Zone de livraison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <div className="w-64 h-64 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <MapPin className="text-gray-400" size={48} />
            </div>
            <p className="text-sm text-gray-600">
              Rayon de livraison: 3km autour de votre boutique
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Hôtels partenaires: 12 établissements
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 