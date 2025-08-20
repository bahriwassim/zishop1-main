import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Phone, 
  Mail,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  CreditCard,
  BarChart3,
  Store,
  Truck,
  Clock,
  Gift,
  Package,
  Heart,
  Shield
} from "lucide-react";
import Logo from "@/components/Logo";

export default function ClientLandingPage() {
  const [email, setEmail] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", email);
    setEmail("");
    alert("Merci pour votre inscription ! Vous recevrez bientôt un lien pour télécharger l'application.");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="zishop-blue-yellow" size="xl" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-zishop-blue hover:text-yellow-500 transition-colors">Fonctionnalités</a>
              <a href="#benefits" className="text-zishop-blue hover:text-yellow-500 transition-colors">Avantages</a>
              <a href="#how-it-works" className="text-zishop-blue hover:text-yellow-500 transition-colors">Comment ça marche</a>
              <a href="#contact" className="text-zishop-blue hover:text-yellow-500 transition-colors">Contact</a>
            </nav>
            <Button className="bg-zishop-blue hover:bg-zishop-blue-light text-white transition-transform duration-300 hover:scale-105">
              Télécharger l'app
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-zishop-blue text-white border border-zishop-blue-light mb-6">
                Shopping local simplifié
              </Badge>
              <h1 className="text-5xl font-bold text-zishop-blue mb-6">
                Découvrez les meilleurs 
                <span className="text-yellow-500"> souvenirs locaux</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Commandez des produits locaux depuis votre hôtel et recevez-les à la réception. 
                Plus besoin de chercher, tout est livré directement chez vous.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-zishop-blue hover:bg-zishop-blue-light text-white shadow-lg">
                  <Smartphone className="mr-2" size={20} />
                  Télécharger l'app
                </Button>
                <Button size="lg" variant="outline" className="border-zishop-blue text-zishop-blue hover:bg-blue-50">
                  <Play className="mr-2" size={20} />
                  Voir la démo
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex items-center">
                  <Star className="text-yellow-500 fill-current" size={20} />
                  <span className="ml-1 text-gray-600">4.9/5 sur les stores</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-zishop-blue" size={20} />
                  <span className="ml-1 text-gray-600">Livraison gratuite</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 border border-zishop-blue/20">
                <div className="bg-zishop-blue rounded-lg p-6 text-white mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Logo variant="white-bg" size="md" />
                    <div>
                      <h3 className="text-xl font-semibold">Boutiques à proximité</h3>
                      <p className="text-blue-100">3km autour de votre hôtel</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-medium">Artisanat Local</span>
                    <span className="text-zishop-blue font-semibold">À 0.8km</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-medium">Souvenirs Paris</span>
                    <span className="text-zishop-blue font-semibold">À 1.2km</span>
                  </div>
                  <Button className="w-full bg-zishop-blue hover:bg-zishop-blue-light text-white">
                    Voir toutes les boutiques
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zishop-blue mb-4">
              Une expérience shopping unique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les meilleurs produits locaux sans quitter votre hôtel. 
              Simple, rapide et pratique.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <MapPin className="text-zishop-blue" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-zishop-blue mb-4">
                  Boutiques à proximité
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez les meilleurs commerçants dans un rayon de 3km autour de votre hôtel. 
                  Tous les produits sont livrés directement à la réception.
                </p>
                <Button variant="outline" className="w-full border-zishop-blue text-zishop-blue hover:bg-blue-50">
                  Explorer
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <Package className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Livraison simplifiée
                </h3>
                <p className="text-gray-600 mb-6">
                  Commandez quand vous voulez, recevez à la réception de votre hôtel. 
                  Plus besoin de transporter vos achats toute la journée.
                </p>
                <Button variant="outline" className="w-full border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                  En savoir plus
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Paiement sécurisé
                </h3>
                <p className="text-gray-600 mb-6">
                  Paiement 100% sécurisé par carte bancaire. 
                  Vous ne payez qu'une fois la commande reçue.
                </p>
                <Button variant="outline" className="w-full border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                  Découvrir
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Aperçu de l'expérience client */}
      <section className="py-16 bg-white animate-fadeIn animate-delay-300">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 animate-slide-up animate-delay-500">Aperçu de l'expérience client</h2>
          <div className="flex flex-col items-center">
            <img src="/assets/images/login-client.png" alt="Connexion espace client Zishop" className="rounded-2xl shadow-2xl w-full max-w-md mb-4 transition-transform duration-500 hover:scale-105 animate-fadeIn animate-delay-700" />
            <p className="text-gray-600 text-center animate-fadeIn animate-delay-1000">Accédez à votre espace client Zishop en toute sécurité pour commander et suivre vos achats locaux.</p>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En 3 étapes simples, découvrez les meilleurs produits locaux
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="text-zishop-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Téléchargez l'app</h3>
              <p className="text-gray-600">
                Disponible sur iOS et Android. Gratuite et sans publicité.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Commandez</h3>
              <p className="text-gray-600">
                Parcourez les boutiques à proximité et ajoutez vos produits au panier.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Recevez</h3>
              <p className="text-gray-600">
                Vos commandes sont livrées à la réception de votre hôtel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi utiliser Zishop ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Gain de temps
                    </h3>
                    <p className="text-gray-600">
                      Plus besoin de chercher les boutiques ou de transporter vos achats. 
                      Tout est livré directement à votre hôtel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Meilleurs prix
                    </h3>
                    <p className="text-gray-600">
                      Accédez aux meilleurs produits locaux aux prix des commerçants. 
                      Pas de surcoût touristique.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sécurité garantie
                    </h3>
                    <p className="text-gray-600">
                      Paiement sécurisé et livraison garantie. Vous ne payez qu'une fois 
                      la commande reçue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-zishop-blue mb-1">4.9/5</div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">10k+</div>
                    <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Star className="text-yellow-500 fill-current" size={20} />
                    <span className="text-gray-600">Application intuitive et rapide</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="text-red-500" size={20} />
                    <span className="text-gray-600">Produits locaux de qualité</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="text-green-500" size={20} />
                    <span className="text-gray-600">Livraison gratuite à l'hôtel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zishop-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Prêt à simplifier vos achats ?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Téléchargez l'application Zishop et découvrez les meilleurs produits locaux 
                livrés directement à votre hôtel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-zishop-blue hover:bg-gray-100">
                  <Smartphone className="mr-2" size={20} />
                  App Store
                </Button>
                <Button size="lg" className="bg-white text-zishop-blue hover:bg-gray-100">
                  <Smartphone className="mr-2" size={20} />
                  Play Store
                </Button>
              </div>
            </div>
            <div>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Soyez les premiers informés
                  </h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                    <Button type="submit" className="w-full bg-yellow-500 text-zishop-blue hover:bg-yellow-400 font-semibold">
                      M'informer du lancement
                    </Button>
                  </form>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    Disponible bientôt sur iOS et Android
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/assets/images/logo-footer.png" alt="Zishop logo" className="h-12 w-auto" />
              </div>
              <p className="text-slate-300">
                La meilleure façon de découvrir et commander des produits locaux 
                pendant votre séjour à l'hôtel.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Application</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Télécharger</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Nous contacter</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Presse</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Carrières</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
            <p>&copy; 2025 Zishop. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 