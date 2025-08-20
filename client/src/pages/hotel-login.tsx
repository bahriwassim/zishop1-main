import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Building, Users, Calendar, Star, TrendingUp, Shield } from "lucide-react";

export default function HotelLogin() {
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
      console.log("Hotel login response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user.role !== "hotel") {
        throw new Error("Accès non autorisé");
      }

      // Store user, hotel data and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      if (data.entity) {
        localStorage.setItem("hotel", JSON.stringify(data.entity));
      }
      console.log("Hotel user stored:", data.user); // Debug log
      
      toast.success("Connexion réussie!");
      
      // Force navigation with window.location for better reliability
      setTimeout(() => {
        window.location.href = "/hotel";
      }, 100);
    } catch (error) {
      console.error("Hotel login error:", error); // Debug log
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
              <Building className="text-zishop-blue w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-900">Espace Hôtel</h1>
            </div>
            <p className="text-gray-600">Connectez-vous pour gérer votre établissement</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Votre identifiant hôtel"
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
                <p>Identifiants de test: <span className="font-mono">hotel1 / hotel123</span></p>
                <p className="text-xs">Besoin d'aide? Contactez le support Zishop</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Information */}
      <div className="flex-1 bg-gradient-to-br from-zishop-blue to-zishop-blue-light text-white p-8 flex items-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-8">
            <Building className="w-16 h-16 mb-6 text-zishop-yellow" />
            <h2 className="text-4xl font-bold mb-4">Gestion Hôtelière</h2>
            <p className="text-xl text-white/90 mb-8">
              Offrez à vos clients une expérience unique avec notre service de livraison de souvenirs directement en chambre.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Gestion des Clients</h3>
                <p className="text-white/80">Suivez les commandes et la satisfaction client</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Réservations & Livraisons</h3>
                <p className="text-white/80">Coordonnez les livraisons avec les séjours</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Star className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Service Premium</h3>
                <p className="text-white/80">Améliorez l'expérience de vos invités</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Revenus Supplémentaires</h3>
                <p className="text-white/80">Générez des revenus avec notre partenariat</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Sécurité & Fiabilité</h3>
                <p className="text-white/80">Service sécurisé et fiable pour vos clients</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h4 className="font-semibold mb-2">🏨 Avantages Exclusifs</h4>
            <p className="text-sm text-white/80">
              Interface de gestion intuitive, rapports détaillés et support dédié pour optimiser votre service client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 