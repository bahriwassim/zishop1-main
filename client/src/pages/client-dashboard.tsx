import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import ClientOrderHistory from "@/components/client-order-history";
import ClientProfile from "@/components/client-profile";
import ClientCurrentOrders from "@/components/client-current-orders";
import { GeolocationWidget } from "@/components/geolocation-widget";
import { ShoppingBag, User, Clock, QrCode, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { Location } from "@/services/geolocation.service";

interface ClientDashboardProps {
  client: any;
  lastHotel: any;
  onLogout: () => void;
  onStartShopping: () => void;
}

export default function ClientDashboard({ 
  client, 
  lastHotel, 
  onLogout, 
  onStartShopping 
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState("current");
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const customerName = `${client.firstName} ${client.lastName}`;

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-zishop-blue px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo variant="white-bg" size="lg" />
            <div>
              <h2 className="text-lg font-bold">Espace Client</h2>
              <p className="text-blue-100 text-sm">Bienvenue {client.firstName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-blue-100 hover:text-white hover:bg-blue-700"
          >
            <LogOut size={16} />
          </Button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
              {lastHotel ? `Dernier hôtel: ${lastHotel.name}` : "Aucun hôtel visité"}
            </Badge>
          </div>
          <Button
            onClick={onStartShopping}
            className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 text-sm px-3 py-1"
          >
            <QrCode size={14} className="mr-1" />
            Scanner QR
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50">
            <TabsTrigger 
              value="current" 
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Clock size={14} className="mr-1" />
              En cours
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <ShoppingBag size={14} className="mr-1" />
              Historique
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <User size={14} className="mr-1" />
              Profil
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="current" className="space-y-4">
              <GeolocationWidget 
                onLocationUpdate={setUserLocation}
                showDetails={false}
                className="mb-4"
              />
              <ClientCurrentOrders 
                clientId={client.id}
                customerName={customerName} 
                customerRoom="Non défini" 
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <ClientOrderHistory 
                clientId={client.id}
                customerName={customerName} 
                customerRoom="Non défini" 
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <ClientProfile 
                clientId={client.id}
                customerName={customerName} 
                onUpdateProfile={(name: string) => {
                  // For now, just log the update - in a real app this would update the client data
                  console.log("Profile updated:", name);
                  // Note: This would typically make an API call to update the client's profile
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 