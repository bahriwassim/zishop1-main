import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  ShoppingCart,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download
} from "lucide-react";

interface HotelGuestsProps {
  hotelId: number;
}

export default function HotelGuests({ hotelId }: HotelGuestsProps) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Données simulées pour les clients
  const guestsStats = {
    totalGuests: 234,
    activeGuests: 45,
    checkedIn: 32,
    checkedOut: 13,
    averageStay: "3.2 jours"
  };

  const guests = [
    {
      id: 1,
      name: "Marie Dupont",
      roomNumber: "205",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      status: "checked_in",
      phone: "+33 6 12 34 56 78",
      email: "marie.dupont@email.com",
      nationality: "Française",
      orders: 3,
      totalSpent: 156.50,
      rating: 5,
      preferences: ["Souvenirs locaux", "Artisanat"]
    },
    {
      id: 2,
      name: "Jean Martin",
      roomNumber: "312",
      checkIn: "2024-01-14",
      checkOut: "2024-01-17",
      status: "checked_in",
      phone: "+33 6 98 76 54 32",
      email: "jean.martin@email.com",
      nationality: "Française",
      orders: 1,
      totalSpent: 89.50,
      rating: 4,
      preferences: ["Produits régionaux"]
    },
    {
      id: 3,
      name: "Sophie Bernard",
      roomNumber: "108",
      checkIn: "2024-01-13",
      checkOut: "2024-01-16",
      status: "checked_out",
      phone: "+33 6 11 22 33 44",
      email: "sophie.bernard@email.com",
      nationality: "Suisse",
      orders: 2,
      totalSpent: 234.00,
      rating: 5,
      preferences: ["Accessoires", "Souvenirs locaux"]
    },
    {
      id: 4,
      name: "Pierre Dubois",
      roomNumber: "401",
      checkIn: "2024-01-12",
      checkOut: "2024-01-15",
      status: "checked_out",
      phone: "+33 6 55 44 33 22",
      email: "pierre.dubois@email.com",
      nationality: "Belge",
      orders: 0,
      totalSpent: 0,
      rating: null,
      preferences: []
    },
    {
      id: 5,
      name: "Anne Moreau",
      roomNumber: "203",
      checkIn: "2024-01-16",
      checkOut: "2024-01-19",
      status: "reserved",
      phone: "+33 6 77 88 99 00",
      email: "anne.moreau@email.com",
      nationality: "Française",
      orders: 0,
      totalSpent: 0,
      rating: null,
      preferences: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "checked_in":
        return <CheckCircle className="text-green-500" size={16} />;
      case "checked_out":
        return <Clock className="text-gray-500" size={16} />;
      case "reserved":
        return <Calendar className="text-blue-500" size={16} />;
      default:
        return <User className="text-gray-500" size={16} />;
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesFilter = filter === "all" || guest.status === filter;
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.roomNumber.includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        size={14}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des clients</h2>
          <p className="text-gray-600">Suivez vos clients et leurs préférences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2" size={16} />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques des clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total clients</p>
                <p className="text-2xl font-bold text-gray-900">{guestsStats.totalGuests}</p>
                <p className="text-sm text-gray-600 mt-2">Ce mois</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients actifs</p>
                <p className="text-2xl font-bold text-green-600">{guestsStats.activeGuests}</p>
                <p className="text-sm text-gray-600 mt-2">En séjour</p>
              </div>
              <User className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="text-2xl font-bold text-blue-600">{guestsStats.checkedIn}</p>
                <p className="text-sm text-gray-600 mt-2">Aujourd'hui</p>
              </div>
              <CheckCircle className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="text-2xl font-bold text-gray-600">{guestsStats.checkedOut}</p>
                <p className="text-sm text-gray-600 mt-2">Aujourd'hui</p>
              </div>
              <Clock className="text-gray-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Séjour moyen</p>
                <p className="text-2xl font-bold text-gray-900">{guestsStats.averageStay}</p>
                <p className="text-sm text-gray-600 mt-2">Par client</p>
              </div>
              <Calendar className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={filter === "checked_in" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("checked_in")}
          >
            Check-in
          </Button>
          <Button
            variant={filter === "checked_out" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("checked_out")}
          >
            Check-out
          </Button>
          <Button
            variant={filter === "reserved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("reserved")}
          >
            Réservés
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des clients */}
      <div className="space-y-4">
        {filteredGuests.map((guest) => (
          <Card key={guest.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* En-tête du client */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(guest.status)}
                    <div>
                      <p className="font-medium text-gray-900">{guest.name}</p>
                      <p className="text-sm text-gray-600">Chambre {guest.roomNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(guest.status)}`}>
                      {guest.status === "checked_in" ? "Check-in" : 
                       guest.status === "checked_out" ? "Check-out" : "Réservé"}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">{guest.nationality}</p>
                  </div>
                </div>

                {/* Informations du client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        {guest.checkIn} - {guest.checkOut}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{guest.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">{guest.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        {guest.orders} commande(s) - €{guest.totalSpent}
                      </span>
                    </div>
                    {guest.rating && (
                      <div className="flex items-center space-x-2">
                        <Star className="text-gray-400" size={16} />
                        <div className="flex">
                          {renderStars(guest.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{guest.rating}/5</span>
                      </div>
                    )}
                    {guest.preferences.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-600">
                          {guest.preferences.join(", ")}
                        </span>
                      </div>
                    )}
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
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="mr-2" size={14} />
                      Commandes
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {guest.status === "checked_in" && (
                      <Button size="sm">
                        <Clock className="mr-2" size={14} />
                        Check-out
                      </Button>
                    )}
                    {guest.status === "reserved" && (
                      <Button size="sm">
                        <CheckCircle className="mr-2" size={14} />
                        Check-in
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par nationalité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" size={20} />
              Répartition par nationalité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Française</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Suisse</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Belge</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Autres</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '5%' }} />
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Préférences des clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2" size={20} />
              Préférences des clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Souvenirs locaux</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Artisanat</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Produits régionaux</span>
                <span className="text-sm font-medium">52%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accessoires</span>
                <span className="text-sm font-medium">38%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 