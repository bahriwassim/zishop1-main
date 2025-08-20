import { useState } from "react";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell, 
  DollarSign, 
  Users, 
  Star,
  Plus,
  Edit,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Truck,
  Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface MerchantSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function MerchantSidebar({ activeSection, onSectionChange }: MerchantSidebarProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: Home },
    { id: "products", label: "Mes Produits", icon: Package },
    { id: "orders", label: "Commandes", icon: ShoppingCart, badge: "8" },
    { id: "hotels", label: "Hôtels Partenaires", icon: Building },
    { id: "analytics", label: "Analytique", icon: BarChart3 },
    { id: "revenue", label: "Revenus", icon: DollarSign },
    { id: "reviews", label: "Avis clients", icon: Star },
    { id: "delivery", label: "Livraisons", icon: Truck },
    { id: "schedule", label: "Horaires", icon: Calendar },
    { id: "location", label: "Emplacement", icon: MapPin },
    { id: "notifications", label: "Notifications", icon: Bell, badge: "5" },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Logo variant="primary" size="xl" />
          <span className="text-xl font-bold text-gray-900">Dashboard Commerçant</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        >
          <span className="text-sm font-medium text-gray-700">Performances du jour</span>
          {isStatsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {isStatsExpanded && (
          <div className="space-y-2">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">€1,247</div>
              <div className="text-xs text-gray-600">Revenus aujourd'hui</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">15</div>
              <div className="text-xs text-gray-600">Commandes reçues</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-lg font-bold text-yellow-600">4.8</div>
              <div className="text-xs text-gray-600">Note moyenne</div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              activeSection === item.id
                ? "bg-green-100 text-green-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3" size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <Badge className="bg-red-500 text-white text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
            <Plus className="mr-2" size={16} />
            Nouveau produit
          </Button>
          <Button variant="outline" className="w-full text-sm">
            <Edit className="mr-2" size={16} />
            Modifier profil
          </Button>
        </div>
      </div>
    </div>
  );
}