import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Store, Package, TrendingUp, Users, MapPin, Sparkles } from "lucide-react";

export default function MerchantLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Merchant login response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user.role !== "merchant") {
        throw new Error("Accès non autorisé");
      }

      // Store user, merchant data and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      if (data.entity) {
        localStorage.setItem("merchant", JSON.stringify(data.entity));
      }
      console.log("Merchant user stored:", data.user); // Debug log
      
      toast.success("Connexion réussie!");
      
      // Force navigation with window.location for better reliability
      setTimeout(() => {
        window.location.href = "/merchant";
      }, 100);
    } catch (error) {
      console.error("Merchant login error:", error); // Debug log
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="yellow-blue" size="xl" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Store className="text-zishop-blue w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-900">Espace Commerçant</h1>
            </div>
            <p className="text-gray-600">Gérez votre boutique de souvenirs</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Votre identifiant commerçant"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
              <div className="mt-6 space-y-2 text-center text-sm text-gray-600">
                <p>Identifiants de test: <span className="font-mono">merchant1 / merchant123</span></p>
                <p className="text-xs">Nouveau commerçant? Contactez-nous pour créer votre compte</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Information */}
      <div className="flex-1 bg-gradient-to-br from-zishop-yellow to-yellow-500 text-gray-900 p-8 flex items-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-8">
            <Store className="w-16 h-16 mb-6 text-zishop-blue" />
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Boutique Digitale</h2>
            <p className="text-xl text-gray-800 mb-8">
              Développez votre activité avec notre plateforme de vente de souvenirs. Atteignez des clients dans les hôtels partenaires.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-zishop-blue" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gestion des Produits</h3>
                <p className="text-gray-800">Ajoutez et gérez facilement votre catalogue</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 text-zishop-blue" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Livraison Ciblée</h3>
                <p className="text-gray-800">Livrez directement aux clients dans les hôtels</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-zishop-blue" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Augmentez vos Ventes</h3>
                <p className="text-gray-800">Accédez à une nouvelle clientèle touristique</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-zishop-blue" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Relation Client</h3>
                <p className="text-gray-800">Suivez vos commandes et la satisfaction client</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Sparkles className="w-8 h-8 text-zishop-blue" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Souvenirs Authentiques</h3>
                <p className="text-gray-800">Partagez la culture locale avec les voyageurs</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm">
            <h4 className="font-semibold mb-2 text-gray-900">🚀 Développez votre Business</h4>
            <p className="text-sm text-gray-800">
              Rejoignez notre réseau de commerçants et bénéficiez d'outils marketing, d'analyses de ventes et d'un support personnalisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 