import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";
import { Shield, Users, BarChart3, Settings, CheckCircle } from "lucide-react";

export default function AdminLogin() {
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
      console.log("Login response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user.role !== "admin") {
        throw new Error("Accès non autorisé");
      }

      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      console.log("User stored in localStorage:", data.user); // Debug log
      
      toast.success("Connexion réussie!");
      
      // Force navigation with window.location for better reliability
      setTimeout(() => {
        window.location.href = "/admin";
      }, 100);
    } catch (error) {
      console.error("Login error:", error); // Debug log
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
            <p className="text-gray-600">Connectez-vous pour gérer la plateforme Zishop</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
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
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Identifiants de test: <span className="font-mono">admin / admin123</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Information */}
      <div className="flex-1 bg-gradient-to-br from-zishop-blue to-zishop-blue-light text-white p-8 flex items-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="mb-8">
            <Shield className="w-16 h-16 mb-6 text-zishop-yellow" />
            <h2 className="text-4xl font-bold mb-4">Tableau de Bord Administrateur</h2>
            <p className="text-xl text-white/90 mb-8">
              Gérez et supervisez l'ensemble de la plateforme Zishop avec des outils puissants et des analyses détaillées.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Gestion des Utilisateurs</h3>
                <p className="text-white/80">Validez et gérez les hôtels et commerçants</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Analyses Avancées</h3>
                <p className="text-white/80">Suivez les performances et les tendances</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Configuration Système</h3>
                <p className="text-white/80">Paramétrez et optimisez la plateforme</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <CheckCircle className="w-8 h-8 text-zishop-yellow" />
              <div>
                <h3 className="text-lg font-semibold">Validation des Contenus</h3>
                <p className="text-white/80">Approuvez les produits et les établissements</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h4 className="font-semibold mb-2">🚀 Fonctionnalités Premium</h4>
            <p className="text-sm text-white/80">
              Accédez à des outils d'analyse avancés, de reporting en temps réel et de gestion complète de la plateforme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 