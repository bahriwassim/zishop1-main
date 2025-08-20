import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { QrCode, ShoppingBag, MapPin, Star, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur ZiShop !",
      subtitle: "Découvrez les commerçants locaux depuis votre hôtel",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Logo variant="zishop-blue-yellow" size="xxl" className="text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              Votre marketplace de voyage
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              ZiShop vous connecte aux meilleurs commerçants locaux directement depuis votre chambre d'hôtel. 
              Découvrez des souvenirs authentiques et des produits uniques !
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">Simple</Badge>
            <Badge className="bg-green-100 text-green-800">Rapide</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Local</Badge>
          </div>
        </div>
      )
    },
    {
      title: "Scanner le QR Code",
      subtitle: "Connectez-vous à votre hôtel en un instant",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <QrCode className="text-white" size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              Scannez et c'est parti !
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Trouvez le QR code ZiShop dans votre chambre ou à la réception. 
              Un simple scan vous donne accès à tous les commerçants partenaires autour de votre hôtel.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <QrCode size={16} />
              <span className="text-sm font-medium">Code QR disponible 24h/24</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Découvrez & Commandez",
      subtitle: "Parcourez les boutiques locales",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="text-white" size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              Shopping local simplifié
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Explorez les catégories : souvenirs, artisanat, produits locaux... 
              Ajoutez vos articles favoris au panier et commandez en quelques clics.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <MapPin className="mx-auto text-yellow-600 mb-1" size={20} />
              <p className="text-xs text-yellow-800">À proximité</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <Star className="mx-auto text-green-600 mb-1" size={20} />
              <p className="text-xs text-green-800">Qualité</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <ShoppingBag className="mx-auto text-blue-600 mb-1" size={20} />
              <p className="text-xs text-blue-800">Livraison</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Livraison à la réception",
      subtitle: "Récupérez vos achats sans effort",
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Check className="text-white" size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">
              Livraison pratique
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Vos commandes sont livrées directement à la réception de votre hôtel. 
              Recevez une notification et récupérez vos achats quand vous le souhaitez !
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Check size={16} />
              <span className="text-sm font-medium">Livraison rapide (15-30 min)</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-800">
              <Check size={16} />
              <span className="text-sm font-medium">Récupération flexible</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden min-h-screen">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {currentStep + 1} sur {steps.length}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Passer
          </Button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {steps[currentStep].subtitle}
                </p>
              </div>
              
              <div className="py-6">
                {steps[currentStep].content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Précédent</span>
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-blue-600" : 
                  index < currentStep ? "bg-blue-300" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>{currentStep === steps.length - 1 ? "Commencer" : "Suivant"}</span>
            {currentStep === steps.length - 1 ? (
              <Check size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 