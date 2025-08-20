import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Building2,
  Wallet,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Settings
} from "lucide-react";

interface MerchantRevenueProps {
  merchantId: number;
}

export default function MerchantRevenue({ merchantId }: MerchantRevenueProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Données simulées pour les revenus
  const revenueData = {
    totalEarnings: 12470,
    pendingPayout: 3240,
    thisMonth: 8470,
    lastMonth: 11800,
    commissionRate: 75, // 75% du total
    zishopCommission: 20, // 20% pour Zishop
    hotelCommission: 5 // 5% pour les hôtels
  };

  const recentTransactions = [
    {
      id: 1,
      orderId: "ORD-001",
      amount: 150.00,
      commission: 112.50,
      status: "completed",
      date: "2024-01-15",
      hotel: "Hôtel Central"
    },
    {
      id: 2,
      orderId: "ORD-002",
      amount: 89.50,
      commission: 67.13,
      status: "pending",
      date: "2024-01-14",
      hotel: "Hôtel Plaza"
    },
    {
      id: 3,
      orderId: "ORD-003",
      amount: 234.00,
      commission: 175.50,
      status: "completed",
      date: "2024-01-13",
      hotel: "Hôtel Luxe"
    },
    {
      id: 4,
      orderId: "ORD-004",
      amount: 67.80,
      commission: 50.85,
      status: "processing",
      date: "2024-01-12",
      hotel: "Hôtel Central"
    }
  ];

  const payoutHistory = [
    {
      id: 1,
      amount: 3240.50,
      date: "2024-01-01",
      method: "Virement bancaire",
      status: "completed",
      reference: "PAY-2024-001"
    },
    {
      id: 2,
      amount: 2870.25,
      date: "2023-12-01",
      method: "Virement bancaire",
      status: "completed",
      reference: "PAY-2023-012"
    },
    {
      id: 3,
      amount: 3150.75,
      date: "2023-11-01",
      method: "Virement bancaire",
      status: "completed",
      reference: "PAY-2023-011"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "processing":
        return <AlertCircle className="text-blue-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenus & Paiements</h2>
          <p className="text-gray-600">Gérez vos revenus et suivez vos paiements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            Semaine
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            Mois
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("year")}
          >
            Année
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">€{revenueData.totalEarnings.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="text-green-500 mr-1" size={16} />
                  <span className="text-sm text-green-600">+7.5% ce mois</span>
                </div>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">€{revenueData.pendingPayout.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">Paiement le 1er février</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-2xl font-bold text-gray-900">{revenueData.commissionRate}%</p>
                <p className="text-sm text-gray-600 mt-2">Du montant total</p>
              </div>
              <Receipt className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">€{revenueData.thisMonth.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="text-green-500 mr-1" size={16} />
                  <span className="text-sm text-green-600">+12.3%</span>
                </div>
              </div>
              <Calendar className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des commissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2" size={20} />
            Répartition des commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{revenueData.commissionRate}%</div>
              <div className="text-sm text-gray-600">Pour vous</div>
              <div className="text-xs text-gray-500 mt-1">Commission commerçant</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{revenueData.zishopCommission}%</div>
              <div className="text-sm text-gray-600">Zishop</div>
              <div className="text-xs text-gray-500 mt-1">Commission plateforme</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{revenueData.hotelCommission}%</div>
              <div className="text-sm text-gray-600">Hôtels</div>
              <div className="text-xs text-gray-500 mt-1">Commission hôtel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions récentes et historique des paiements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CreditCard className="mr-2" size={20} />
                Transactions récentes
              </span>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Exporter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{transaction.orderId}</p>
                      <p className="text-xs text-gray-600">{transaction.hotel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">€{transaction.amount}</p>
                    <p className="text-xs text-gray-600">Commission: €{transaction.commission}</p>
                    <Badge className={`mt-1 ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historique des paiements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Building2 className="mr-2" size={20} />
                Historique des paiements
              </span>
              <Button variant="outline" size="sm">
                <Download className="mr-2" size={16} />
                Relevés
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payout.reference}</p>
                      <p className="text-xs text-gray-600">{payout.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">€{payout.amount}</p>
                    <p className="text-xs text-gray-600">{payout.date}</p>
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2" size={20} />
            Informations de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Compte bancaire</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Banque:</span> Crédit Agricole</p>
                <p><span className="font-medium">IBAN:</span> FR76 1234 5678 9012 3456 7890 123</p>
                <p><span className="font-medium">BIC:</span> AGRIFRPP123</p>
                <p><span className="font-medium">Titulaire:</span> Votre Nom</p>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="mr-2" size={16} />
                Modifier
              </Button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Paramètres de paiement</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Fréquence:</span> Mensuelle (1er du mois)</p>
                <p><span className="font-medium">Seuil minimum:</span> €50</p>
                <p><span className="font-medium">Méthode:</span> Virement automatique</p>
                <p><span className="font-medium">Délai:</span> 2-3 jours ouvrés</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="mr-2" size={16} />
                Configurer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 