import { useState } from "react";
import { 
  Home, 
  ShoppingCart, 
  QrCode, 
  BarChart3, 
  Users, 
  Settings, 
  Bell, 
  DollarSign, 
  Package, 
  MapPin, 
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Key,
  Store,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface HotelSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  ordersCount: number;
}

export default function HotelSidebar({ activeSection, onSectionChange, ordersCount }: HotelSidebarProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: Home },
    { id: "orders", label: "Commandes clients", icon: ShoppingCart, badge: ordersCount > 0 ? ordersCount.toString() : undefined },
    { id: "merchants", label: "Partenaires", icon: Store },
    { id: "analytics", label: "Statistiques", icon: BarChart3 },
    { id: "qrcode", label: "QR Codes", icon: QrCode },
    { id: "notifications", label: "Notifications", icon: Bell, badge: "3" },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Logo variant="primary" size="xl" />
          <span className="text-xl font-bold text-gray-900">Dashboard Hôtel</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        >
          <span className="text-sm font-medium text-gray-700">Statistiques rapides</span>
          {isStatsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {isStatsExpanded && (
          <div className="space-y-2">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">€847</div>
              <div className="text-xs text-gray-600">Revenus aujourd'hui</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">23</div>
              <div className="text-xs text-gray-600">Commandes actives</div>
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
                ? "bg-blue-100 text-blue-600"
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
            <Download className="mr-2" size={16} />
            Télécharger QR
          </Button>
          <Button variant="outline" className="w-full text-sm">
            <Settings className="mr-2" size={16} />
            Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}