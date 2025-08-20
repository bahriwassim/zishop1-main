import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

interface ClientAuthProps {
  onLogin: (clientData: any) => void;
  onRegisterClick: () => void;
}

export default function ClientAuth({ onLogin, onRegisterClick }: ClientAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log("Client login attempt with:", { email });
      const response = await api.login(email, password);
      console.log("Client login successful:", response);
      
      if (!response || !response.email) {
        throw new Error("Réponse invalide du serveur");
      }

      // Stocker les informations du client
      localStorage.setItem("userEmail", response.email);
      localStorage.setItem("userRole", "client");
      localStorage.setItem("userId", response.id.toString());
      localStorage.setItem("userName", response.firstName ? `${response.firstName} ${response.lastName}` : response.email);
      
      console.log("Client info stored, redirecting to dashboard");
      
      // Appeler onLogin avec les données du client
      onLogin(response);
    } catch (error) {
      console.error("Client login error:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Vérifiez vos identifiants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-zishop-blue px-6 py-8 text-white">
        <div className="text-center">
          <Logo variant="zishop-blue-yellow" size="xxl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Connexion</h2>
          <p className="text-blue-100 mt-2">Accédez à votre espace client</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="p-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
              <Mail className="text-blue-600" size={20} />
              Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 border-blue-200 focus:border-blue-500 ${errors.email ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pl-10 pr-10 border-blue-200 focus:border-blue-500 ${errors.password ? 'border-red-300' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </CardContent>
        </Card>

        {/* Register Section */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Nouveau sur ZiShop ?</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={onRegisterClick}
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Créer un compte
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Créez votre compte pour accéder aux meilleurs commerçants locaux
          </p>
        </div>
        
        {/* Test credentials info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            <strong>Identifiants de test:</strong><br/>
            Email: jean.dupont@example.com<br/>
            Mot de passe: password123
          </p>
        </div>
      </div>
    </div>
  );
} 