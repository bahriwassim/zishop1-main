import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/qr-scanner";
import MerchantCard from "@/components/merchant-card";
import ProductCard from "@/components/product-card";
import ShoppingCartComponent from "@/components/shopping-cart";
import ClientAuth from "@/pages/client-auth";
import ClientRegister from "@/pages/client-register";
import ClientDashboard from "@/pages/client-dashboard";
import OnboardingTutorial from "@/components/onboarding-tutorial";
import RoomNumberModal from "@/components/room-number-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Landmark, Hammer, BookOpen, LogOut, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import type { Hotel, Product, Merchant } from "@shared/schema";
import Logo from "@/components/Logo";

interface CartItem extends Product {
  quantity: number;
}

type AppState = "auth" | "register" | "tutorial" | "client-dashboard" | "hotel-selection" | "shopping";

export default function MobileApp() {
  const [appState, setAppState] = useState<AppState>(() => {
    // Check if client is already logged in
    const savedClient = localStorage.getItem("client");
    if (savedClient) {
      return "client-dashboard";
    }
    return "auth";
  });
  const [client, setClient] = useState<any>(() => {
    // Load client from localStorage if available
    const savedClient = localStorage.getItem("client");
    return savedClient ? JSON.parse(savedClient) : null;
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [lastHotel, setLastHotel] = useState<Hotel | null>(() => {
    // Load last hotel from localStorage if available
    const savedHotel = localStorage.getItem("lastHotel");
    return savedHotel ? JSON.parse(savedHotel) : null;
  });
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {}
    }
  }, []);

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [customerRoom, setCustomerRoom] = useState("");
  const { toast } = useToast();

  // Get merchants near hotel
  const { data: merchants = [] } = useQuery({
    queryKey: ["/api/merchants/near", selectedHotel?.id],
    queryFn: () => selectedHotel ? api.getMerchantsNearHotel(selectedHotel.id) : Promise.resolve([]),
    enabled: !!selectedHotel,
  });

  // Get products for selected merchant
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products/merchant", selectedMerchant?.id],
    queryFn: () => selectedMerchant ? api.getProductsByMerchant(selectedMerchant.id) : Promise.resolve([]),
    enabled: !!selectedMerchant,
  });

  // Get popular products
  const { data: allProducts = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: api.getAllProducts,
  });

  const popularProducts = allProducts.slice(0, 4);

  // Déclarer handleOrderSuccess AVANT useMutation
  const handleOrderSuccess = (newOrder: any) => {
    setCurrentOrder(newOrder);
    setCartItems([]);
    setShowRoomModal(false);
    toast({
      title: "Commande créée",
      description: `Votre commande #${newOrder.orderNumber} a été envoyée.`,
    });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    localStorage.removeItem("cartItems"); // Clear cart from localStorage
  };

  const createOrderMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: handleOrderSuccess,
    onError: (error: any) => {
      let description = "Impossible de créer la commande.";
      if (error?.response?.data?.message) {
        description = error.response.data.message;
      }
      toast({
        title: "Erreur",
        description,
        variant: "destructive",
      });
    },
  });

  const handleClientLogin = (clientData: any) => {
    setClient(clientData);
    // Save client to localStorage
    localStorage.setItem("client", JSON.stringify(clientData));
    
    if (!clientData.hasCompletedTutorial) {
      setAppState("tutorial");
    } else {
      setAppState("client-dashboard");
    }
  };

  const handleRegisterClick = () => {
    setAppState("tutorial");
  };

  const handleTutorialComplete = () => {
    if (client) {
      // Update client tutorial status after login
      const updatedClient = { ...client, hasCompletedTutorial: true };
      setClient(updatedClient);
      localStorage.setItem("client", JSON.stringify(updatedClient));
      setAppState("client-dashboard");
    } else {
      // Coming from register flow, go to register
      setAppState("register");
    }
  };

  const handleRegisterSuccess = (clientData: any) => {
    const newClient = { ...clientData, hasCompletedTutorial: true };
    setClient(newClient);
    localStorage.setItem("client", JSON.stringify(newClient));
    setAppState("client-dashboard");
    
    // Afficher un message de succès
    toast({
      title: "Compte créé avec succès",
      description: `Bienvenue ${newClient.firstName} !`,
    });
  };

  const handleClientLogout = () => {
    // Clear all client data
    setClient(null);
    setSelectedHotel(null);
    setSelectedMerchant(null);
    setCartItems([]);
    setCurrentOrder(null);
    setCustomerRoom("");
    
    // Clear localStorage
    localStorage.removeItem("client");
    localStorage.removeItem("lastHotel");
    
    setAppState("auth");
  };

  const handleStartShopping = () => {
    setAppState("hotel-selection");
  };

  const handleHotelScan = async (hotelCode: string) => {
    try {
      console.log("Scanning hotel code:", hotelCode);
      const hotel = await api.getHotelByCode(hotelCode);
      console.log("Hotel found:", hotel);
      
      setSelectedHotel(hotel);
      setLastHotel(hotel); // Save as last hotel
      
      // Save last hotel to localStorage
      localStorage.setItem("lastHotel", JSON.stringify(hotel));
      
      setAppState("shopping");
      toast({
        title: "Hôtel connecté",
        description: `Bienvenue au ${hotel.name}`,
      });
    } catch (error) {
      console.error("Hotel scan error:", error);
      toast({
        title: "Erreur",
        description: "Code hôtel invalide",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Produit ajouté",
      description: `${product.name} ajouté au panier`,
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleCheckout = () => {
    if (!selectedHotel || cartItems.length === 0 || !client) return;

    // Vérification du stock pour chaque produit du panier
    const insufficientStock = cartItems.find(item => {
      // On suppose que chaque item a un champ 'stock' à jour
      return typeof item.stock === 'number' && item.quantity > item.stock;
    });
    if (insufficientStock) {
      toast({
        title: "Stock insuffisant",
        description: `Le produit ${insufficientStock.name} n'est plus disponible en quantité suffisante.`,
        variant: "destructive",
      });
      return;
    }

    // Show room number modal
    setShowRoomModal(true);
  };

  const handleRoomConfirm = (roomNumber: string) => {
    setCustomerRoom(roomNumber);
    
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // Group items by merchant
    const merchantOrders = cartItems.reduce((acc, item) => {
      const merchantId = item.merchant_id;
      if (!acc[merchantId]) {
        acc[merchantId] = [];
      }
      acc[merchantId].push({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Create order for the first merchant (simplified for MVP)
    const firstMerchantId = Object.keys(merchantOrders)[0];
    const orderData = {
      hotel_id: selectedHotel!.id,
      merchant_id: parseInt(firstMerchantId),
      client_id: client.id,
      customer_name: `${client.firstName} ${client.lastName}`,
      customer_room: roomNumber,
      items: merchantOrders[parseInt(firstMerchantId)],
      total_amount: totalAmount.toFixed(2),
      status: "pending",
    };

    console.log("=== DONNÉES DE COMMANDE ENVOYÉES ===");
    console.log("orderData:", JSON.stringify(orderData, null, 2));
    console.log("selectedHotel:", selectedHotel);
    console.log("client:", client);
    console.log("roomNumber:", roomNumber);
    console.log("totalAmount:", totalAmount);
    console.log("merchantOrders:", merchantOrders);
    console.log("=====================================");

    createOrderMutation.mutate(orderData);
  };

  const calculateDistance = (merchant: Merchant): number => {
    if (!selectedHotel) return 0;
    // Simplified distance calculation
    const lat1 = parseFloat(selectedHotel.latitude);
    const lon1 = parseFloat(selectedHotel.longitude);
    const lat2 = parseFloat(merchant.latitude);
    const lon2 = parseFloat(merchant.longitude);
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Simulate order status updates
  useEffect(() => {
    if (currentOrder && currentOrder.status !== "delivered") {
      const timer = setTimeout(() => {
        const statusProgression = {
          "pending": "preparing",
          "preparing": "delivering",
          "delivering": "delivered"
        };
        const nextStatus = statusProgression[currentOrder.status as keyof typeof statusProgression];
        if (nextStatus) {
          setCurrentOrder({ ...currentOrder, status: nextStatus });
        }
      }, 10000); // Update every 10 seconds

      return () => clearTimeout(timer);
    }
  }, [currentOrder]);

  // Render based on app state
  if (appState === "auth") {
    return (
      <ClientAuth 
        onLogin={handleClientLogin} 
        onRegisterClick={handleRegisterClick}
      />
    );
  }

  if (appState === "tutorial") {
    return <OnboardingTutorial onComplete={handleTutorialComplete} />;
  }

  if (appState === "register") {
    return (
      <ClientRegister
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={() => setAppState("auth")}
      />
    );
  }

  if (appState === "client-dashboard") {
    return (
      <ClientDashboard
        client={client}
        lastHotel={lastHotel}
        onLogout={handleClientLogout}
        onStartShopping={handleStartShopping}
      />
    );
  }

  if (appState === "hotel-selection") {
    return (
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-zishop-blue px-6 py-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Scanner le QR Code</h2>
            <Logo variant="zishop-blue-yellow" size="xxl" className="mx-auto mb-4" />
            <p className="text-blue-100 mt-2">Trouvez le QR code dans votre chambre ou à la réception</p>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setAppState("client-dashboard")}
              className="text-blue-100 hover:text-white hover:bg-blue-700"
            >
              ← Retour à mon espace
            </Button>
          </div>
        </div>
        <QRScanner onScan={handleHotelScan} />
      </div>
    );
  }

  // Shopping state (existing functionality with updates)
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
            onClick={handleClientLogout}
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
            onClick={handleStartShopping}
            className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 text-sm px-3 py-1"
          >
            <QrCode size={14} className="mr-1" />
            Scanner QR
          </Button>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="text-blue-600" size={16} />
            <span className="text-sm text-gray-600">Rayon: 3km autour de l'hôtel</span>
          </div>
          <Badge className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
            {merchants.length} commerçants
          </Badge>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 bg-white">
        <h4 className="font-semibold text-gray-800 mb-3">Catégories de Souvenirs</h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Souvenir Category: Monuments */}
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <Landmark className="text-2xl text-blue-600 mb-2 mx-auto" size={32} />
            <p className="text-xs font-medium text-blue-800">Monuments</p>
          </div>
          {/* Souvenir Category: Artisanat */}
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
            <Hammer className="text-2xl text-yellow-600 mb-2 mx-auto" size={32} />
            <p className="text-xs font-medium text-yellow-800">Artisanat</p>
          </div>
          {/* Souvenir Category: Livres */}
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <BookOpen className="text-2xl text-blue-600 mb-2 mx-auto" size={32} />
            <p className="text-xs font-medium text-blue-800">Livres</p>
          </div>
        </div>
      </div>

      {/* Merchants List */}
      {!selectedMerchant && (
        <div className="p-4 bg-white">
          <h4 className="font-semibold text-gray-800 mb-3">Commerçants à proximité</h4>
          <div className="space-y-3">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                distance={calculateDistance(merchant)}
                onClick={() => setSelectedMerchant(merchant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Merchant Products */}
      {selectedMerchant && (
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">{selectedMerchant.name}</h4>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => setSelectedMerchant(null)}
            >
              Retour
            </Button>
          </div>
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Popular Products */}
      {!selectedMerchant && (
        <div className="p-4 bg-white border-t">
          <h4 className="font-semibold text-gray-800 mb-3">Produits populaires</h4>
          <div className="space-y-4">
            {popularProducts.map((product) => {
              const merchant = merchants.find(m => m.id === product.merchant_id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  merchantName={merchant?.name}
                  onAddToCart={addToCart}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Shopping Cart */}
      <ShoppingCartComponent
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Room Number Modal */}
      <RoomNumberModal
        isOpen={showRoomModal}
        hotelName={selectedHotel?.name || ""}
        clientName={`${client?.firstName} ${client?.lastName}` || ""}
        onConfirm={handleRoomConfirm}
        onCancel={() => setShowRoomModal(false)}
      />

      {/* Current Order Status */}
      {currentOrder && (
        <div className="p-4 bg-white border-t">
          <h4 className="font-semibold text-gray-800 mb-3">Commande en cours</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">#{currentOrder.orderNumber}</span>
              <Badge className={`text-white text-xs ${
                currentOrder.status === "delivered" ? "bg-yellow-500" :
                currentOrder.status === "delivering" ? "bg-yellow-600" : "bg-blue-600"
              }`}>
                {currentOrder.status === "pending" ? "En attente" :
                 currentOrder.status === "preparing" ? "Préparation" :
                 currentOrder.status === "delivering" ? "En livraison" :
                 currentOrder.status === "delivered" ? "Livré" : currentOrder.status}
              </Badge>
            </div>
            <p className="text-sm text-blue-700">
              {currentOrder.status === "delivered" 
                ? "Commande livrée à la réception !"
                : "Livraison prévue à la réception dans 15-30 min"}
            </p>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  ["preparing", "delivering", "delivered"].includes(currentOrder.status) 
                    ? "bg-yellow-500" : "bg-gray-300"
                }`}></div>
                <div className={`w-3 h-3 rounded-full ${
                  ["delivering", "delivered"].includes(currentOrder.status) 
                    ? "bg-yellow-500" : "bg-gray-300"
                }`}></div>
                <div className={`w-3 h-3 rounded-full ${
                  currentOrder.status === "delivering" ? "bg-blue-600" : 
                  currentOrder.status === "delivered" ? "bg-yellow-500" : "bg-gray-300"
                }`}></div>
                <div className={`w-3 h-3 rounded-full ${
                  currentOrder.status === "delivered" ? "bg-yellow-500" : "bg-gray-300"
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
