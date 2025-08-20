import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
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
  BarChart3
} from "lucide-react";
import Logo from "@/components/Logo";
import DebugAPI from "@/components/debug-api";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the contact form data
    console.log("Contact form submitted:", email);
    setEmail("");
    alert("Merci pour votre intérêt ! Nous vous contacterons sous 24h.");
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
              <a href="#pricing" className="text-zishop-blue hover:text-yellow-500 transition-colors">Tarifs</a>
              <a href="#contact" className="text-zishop-blue hover:text-yellow-500 transition-colors">Contact</a>
            </nav>
            <Button className="bg-zishop-blue hover:bg-zishop-blue-light text-white transition-transform duration-300 hover:scale-105">
              Demander une démo
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
                Plateforme de souvenirs pour hôtels
              </Badge>
              <h1 className="text-5xl font-bold text-zishop-blue mb-6">
                Transformez l'expérience de vos clients avec 
                <span className="text-yellow-500"> Zishop</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Une marketplace mobile dédiée aux souvenirs locaux, directement dans votre hôtel. 
                Augmentez vos revenus de 15% en moyenne avec notre solution clé en main.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-zishop-blue hover:bg-zishop-blue-light text-white shadow-lg">
                  <Play className="mr-2" size={20} />
                  Voir la démo
                </Button>
                <Button size="lg" variant="outline" className="border-zishop-blue text-zishop-blue hover:bg-blue-50">
                  Planifier un appel
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex items-center">
                  <Star className="text-yellow-500 fill-current" size={20} />
                  <span className="ml-1 text-gray-600">4.9/5 satisfaction client</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-zishop-blue" size={20} />
                  <span className="ml-1 text-gray-600">Installation en 24h</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 border border-zishop-blue/20">
                <div className="bg-zishop-blue rounded-lg p-6 text-white mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Logo variant="white-bg" size="md" />
                    <div>
                      <h3 className="text-xl font-semibold">Hôtel des Champs-Élysées</h3>
                      <p className="text-blue-100">QR Code scanné - Marketplace activée</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-medium">Tour Eiffel Miniature</span>
                    <span className="text-zishop-blue font-semibold">12.50€</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="font-medium">Magnet Paris</span>
                    <span className="text-zishop-blue font-semibold">4.90€</span>
                  </div>
                  <Button className="w-full bg-zishop-blue hover:bg-zishop-blue-light text-white">
                    Commander - Livraison à l'hôtel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-zishop-blue mb-2">250+</div>
              <div className="text-gray-600">Hôtels partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">15%</div>
              <div className="text-gray-600">Augmentation revenus</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-zishop-blue mb-2">98%</div>
              <div className="text-gray-600">Satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">24h</div>
              <div className="text-gray-600">Délai d'installation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-blue-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zishop-blue mb-4">
              Une solution complète pour votre hôtel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zishop vous propose une marketplace de souvenirs locaux avec QR codes personnalisés, 
              livraison directe et dashboard de gestion en temps réel.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <Smartphone className="text-zishop-blue" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-zishop-blue mb-4">
                  QR Code Personnalisé
                </h3>
                <p className="text-gray-600 mb-6">
                  Chaque hôtel dispose de son QR code unique. Vos clients scannent et accèdent 
                  instantanément aux souvenirs locaux dans un rayon de 3km.
                </p>
                <Button variant="outline" className="w-full border-zishop-blue text-zishop-blue hover:bg-blue-50">
                  Voir exemple
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <MapPin className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Livraison à l'hôtel
                </h3>
                <p className="text-gray-600 mb-6">
                  Les commandes sont livrées directement à la réception de votre hôtel. 
                  Aucune logistique à gérer de votre côté.
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
                  <BarChart3 className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Dashboard Temps Réel
                </h3>
                <p className="text-gray-600 mb-6">
                  Suivez vos commandes, revenus et statistiques en temps réel. 
                  Interface simple et intuitive pour votre équipe.
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

      {/* Aperçu du dashboard hôtel */}
      <section className="py-16 bg-white animate-fadeIn animate-delay-300">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 animate-slide-up animate-delay-500">Aperçu du dashboard hôtel</h2>
          <div className="flex flex-col items-center">
            <img src="/assets/images/dashboard-hotel.png" alt="Dashboard hôtel Zishop" className="rounded-2xl shadow-2xl w-full max-w-3xl mb-4 transition-transform duration-500 hover:scale-105 animate-fadeIn animate-delay-700" />
            <p className="text-gray-600 text-center animate-fadeIn animate-delay-1000">Suivez vos commandes, revenus et la répartition des gains en temps réel depuis votre espace hôtel.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi les hôtels choisissent Zishop ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Revenus supplémentaires garantis
                    </h3>
                    <p className="text-gray-600">
                      Percevez 5% de commission sur chaque vente, sans effort de votre part. 
                      Nos hôtels partenaires génèrent en moyenne 1500€/mois de revenus additionnels.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expérience client améliorée
                    </h3>
                    <p className="text-gray-600">
                      Offrez un service moderne et pratique à vos clients. 98% d'entre eux 
                      recommandent les hôtels équipés de Zishop.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Installation sans effort
                    </h3>
                    <p className="text-gray-600">
                      Notre équipe s'occupe de tout : installation, formation de votre personnel, 
                      et support technique 7j/7.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">€1,847</div>
                    <div className="text-sm text-gray-600">Revenus ce mois</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">156</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Performance</span>
                    <span className="text-sm text-yellow-500">+23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-zishop-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tarification transparente
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Aucun frais caché, aucun engagement. Payez uniquement au succès.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Essai</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">Gratuit</div>
                <div className="text-gray-600 mb-6">30 jours d'essai</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">QR code personnalisé</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Dashboard basique</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Support email</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-500/10">Commencer l'essai</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-400 relative hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white">Populaire</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Standard</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">5%</div>
                <div className="text-gray-600 mb-6">de commission par vente</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Tout de l'essai</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Dashboard avancé</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Support téléphonique</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Rapports détaillés</span>
                  </li>
                </ul>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-zishop-blue">Choisir Standard</Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium</h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">3%</div>
                <div className="text-gray-600 mb-6">de commission par vente</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Tout du Standard</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Gestionnaire dédié</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">Intégration PMS</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-yellow-500 mr-3" size={16} />
                    <span className="text-gray-600">White label</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-500/10">Nous contacter</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-zishop-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Prêt à augmenter vos revenus ?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Rejoignez plus de 250 hôtels qui ont déjà choisi Zishop pour améliorer 
                l'expérience de leurs clients et générer des revenus supplémentaires.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">contact@zishop.co</span>
                </div>
                <div className="flex items-center">
                  <Globe className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">Disponible dans toute l'Europe</span>
                </div>
              </div>
            </div>
            <div>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Demander une démonstration
                  </h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Nom de l'hôtel"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <Input
                      type="email"
                      placeholder="Email professionnel"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Téléphone"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <Button type="submit" className="w-full bg-yellow-500 text-zishop-blue hover:bg-yellow-400 font-semibold">
                      Planifier une démo gratuite
                    </Button>
                  </form>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    Réponse sous 2h • Démo de 15 minutes • Sans engagement
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Debug API Section - Temporaire pour diagnostiquer le problème */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🐛 Debug API - Test des Endpoints
          </h2>
          <DebugAPI />
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
                La marketplace de souvenirs pour hôtels. Augmentez vos revenus et 
                l'expérience client avec notre solution clé en main.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Intégrations</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Presse</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Partenaires</a></li>
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