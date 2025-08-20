import { useState } from "react";
import { 
  Home, 
  Building, 
  Store, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell, 
  DollarSign, 
  Users, 
  Globe,
  Shield,
  FileText,
  Headphones,
  Database,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Vue d'ensemble", icon: Home },
    { id: "hotels", label: "Gestion Hôtels", icon: Building },
    { id: "merchants", label: "Gestion Commerçants", icon: Store },
    { id: "hotel-merchants", label: "Association Hôtel-Commerçants", icon: Globe },
    { id: "orders", label: "Toutes les commandes", icon: ShoppingCart },
    { id: "users", label: "Gestion Accès", icon: Users },
    { id: "validation", label: "Validation Entités", icon: Shield },
    { id: "orders-analytics", label: "Analyse Commandes", icon: Activity },
    { id: "analytics", label: "Analytique globale", icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Logo variant="primary" size="xl" />
          <span className="text-xl font-bold text-gray-900">Dashboard Admin</span>
        </div>
      </div>

      {/* Global Stats */}
      <div className="p-4 border-b">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
        >
          <span className="text-sm font-medium text-gray-700">Métriques plateforme</span>
          {isStatsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {isStatsExpanded && (
          <div className="space-y-2">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-lg font-bold text-purple-600">€47,892</div>
              <div className="text-xs text-gray-600">Revenus totaux ce mois</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">1,247</div>
              <div className="text-xs text-gray-600">Commandes ce mois</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">98.7%</div>
              <div className="text-xs text-gray-600">Uptime plateforme</div>
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
                ? "bg-purple-100 text-purple-600"
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
          <Button 
            onClick={() => onSectionChange("hotels")} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
          >
            <Plus className="mr-2" size={16} />
            Nouvel hôtel
          </Button>
          <Button 
            onClick={() => onSectionChange("merchants")} 
            variant="outline" 
            className="w-full text-sm"
          >
            <Plus className="mr-2" size={16} />
            Nouveau commerçant
          </Button>
        </div>
      </div>
    </div>
  );
}