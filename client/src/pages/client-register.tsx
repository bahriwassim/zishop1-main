import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

interface ClientRegisterProps {
  onRegisterSuccess: (clientData: any) => void;
  onBackToLogin: () => void;
}

export default function ClientRegister({ onRegisterSuccess, onBackToLogin }: ClientRegisterProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation nom et prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation téléphone
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    // Validation confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log("Attempting client registration:", { email: formData.email, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone });
      const clientData = await api.registerClient({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });
      console.log("Client registration successful:", clientData);
      
      // Store client data in localStorage
      localStorage.setItem("client", JSON.stringify(clientData));
      
      toast({
        title: "Compte créé avec succès",
        description: "Bienvenue sur ZiShop !",
      });

      onRegisterSuccess(clientData);
    } catch (error: any) {
      console.error("Client registration error:", error);
      
      // Gestion améliorée des erreurs
      let errorMessage = "Erreur lors de la création du compte";
      let errorTitle = "Erreur d'inscription";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error === "EMAIL_EXISTS") {
          errorTitle = "Email déjà utilisé";
          errorMessage = "Un compte avec cet email existe déjà. Veuillez vous connecter ou utiliser un autre email.";
        } else if (errorData.error === "VALIDATION_ERROR" && errorData.errors) {
          errorTitle = "Données invalides";
          errorMessage = errorData.errors.map((err: any) => `${err.field}: ${err.message}`).join(", ");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format French phone number
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(?=\d)/g, '$1 ');
    }
    return value;
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-zishop-blue px-6 py-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="text-blue-100 hover:text-white hover:bg-blue-700 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <Logo variant="zishop-blue-yellow" size="lg" />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Créer un compte</h2>
          <p className="text-blue-100 mt-2">Rejoignez la communauté ZiShop</p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="p-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
              <User className="text-blue-600" size={20} />
              Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`border-blue-200 focus:border-blue-500 ${errors.firstName ? 'border-red-300' : ''}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`border-blue-200 focus:border-blue-500 ${errors.lastName ? 'border-red-300' : ''}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 border-blue-200 focus:border-blue-500 ${errors.email ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Numéro de téléphone *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", formatPhoneNumber(e.target.value))}
                  className={`pl-10 border-blue-200 focus:border-blue-500 ${errors.phone ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
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

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Répétez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pl-10 pr-10 border-blue-200 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
            >
              {isLoading ? "Création du compte..." : "Créer mon compte"}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 