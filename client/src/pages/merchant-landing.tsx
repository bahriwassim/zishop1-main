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
  PieChart,
  Calculator,
  X,
  Euro
} from "lucide-react";
import Logo from "@/components/Logo";

export default function MerchantLandingPage() {
  const [email, setEmail] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    nombreProduits: "",
    margeUnitaire: "",
    ventesParMois: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", email);
    setEmail("");
    alert("Merci pour votre intérêt ! Nous vous contacterons sous 24h.");
  };

  const handleCalculatorChange = (field: string, value: string) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateGains = () => {
    const { nombreProduits, margeUnitaire, ventesParMois } = calculatorData;
    if (!nombreProduits || !margeUnitaire || !ventesParMois) return null;

    const chiffresAffaires = parseFloat(margeUnitaire) * parseFloat(ventesParMois);
    const commissionZishop = chiffresAffaires * 0.20; // 20% commission
    const gainsNet = chiffresAffaires - commissionZishop;
    const gainsAnnuel = gainsNet * 12;

    return {
      chiffresAffaires,
      commissionZishop,
      gainsNet,
      gainsAnnuel
    };
  };

  const gains = calculateGains();

  return (
    <div className="min-h-screen bg-white">
      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calculator className="mr-3 text-blue-600" size={32} />
                  Calculateur de gains
                </h2>
                <button
                  onClick={() => setShowCalculator(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Formulaire */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Vos informations
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de produits que vous vendez
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 50"
                        value={calculatorData.nombreProduits}
                        onChange={(e) => handleCalculatorChange("nombreProduits", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marge moyenne par produit (€)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15.50"
                        value={calculatorData.margeUnitaire}
                        onChange={(e) => handleCalculatorChange("margeUnitaire", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de ventes estimées par mois
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 120"
                        value={calculatorData.ventesParMois}
                        onChange={(e) => handleCalculatorChange("ventesParMois", e.target.value)}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Basé sur votre activité actuelle + clients hôtels
                      </p>
                    </div>
                  </div>
                </div>

                {/* Résultats */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Vos gains potentiels
                  </h3>
                  
                  {gains ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Chiffre d'affaires mensuel
                          </span>
                          <span className="text-lg font-semibold text-blue-600">
                            {gains.chiffresAffaires.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Commission Zishop (20%)
                          </span>
                          <span className="text-lg font-semibold text-yellow-600">
                            -{gains.commissionZishop.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Vos gains nets mensuels
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {gains.gainsNet.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Gains annuels estimés
                          </span>
                          <span className="text-2xl font-bold">
                            {gains.gainsAnnuel.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">💡 Avantages supplémentaires :</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Nouveaux clients depuis les hôtels partenaires</li>
                          <li>• Pas de frais marketing ou publicitaire</li>
                          <li>• Paiements sécurisés et garantis</li>
                          <li>• Support et accompagnement inclus</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <Euro size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>Remplissez les champs pour voir vos gains potentiels</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {gains && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setShowCalculator(false);
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Devenir partenaire maintenant
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                      onClick={() => {
                        const results = `Mes gains potentiels avec Zishop:\n\n• CA mensuel: ${gains.chiffresAffaires.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n• Gains nets/mois: ${gains.gainsNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n• Gains annuels: ${gains.gainsAnnuel.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                        navigator.clipboard.writeText(results);
                        alert('Résultats copiés dans le presse-papier !');
                      }}
                    >
                      Partager les résultats
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="zishop-blue-yellow" size="xl" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">Avantages</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Tarifs</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-transform duration-300 hover:scale-105">
              Devenir partenaire
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 mb-6">
                Plateforme dédiée aux commerçants locaux
              </Badge>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Développez votre business avec 
                <span className="text-blue-600"> Zishop</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Vendez vos produits aux clients d'hôtels dans votre quartier. 
                Augmentez votre chiffre d'affaires de 30% en moyenne grâce à notre réseau d'hôtels partenaires.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Play className="mr-2" size={20} />
                  Voir la démo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => setShowCalculator(true)}
                >
                  <Calculator className="mr-2" size={20} />
                  Calculer mes gains
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-6">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={20} />
                  <span className="ml-1 text-gray-600">4.8/5 satisfaction partenaires</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-blue-500" size={20} />
                  <span className="ml-1 text-gray-600">Inscription gratuite</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform -rotate-3 border border-yellow-200">
                <div className="bg-blue-600 rounded-lg p-6 text-white mb-6">
                  <h3 className="text-xl font-semibold mb-2">Boutique Les Souvenirs</h3>
                  <p className="text-blue-100">Commandes depuis 5 hôtels partenaires</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="font-medium">Commandes aujourd'hui</span>
                    <span className="text-blue-600 font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="font-medium">CA ce mois</span>
                    <span className="text-blue-600 font-semibold">2,480€</span>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Gérer mes commandes
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
              <div className="text-4xl font-bold text-blue-600 mb-2">1200+</div>
              <div className="text-gray-600">Commerçants actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">30%</div>
              <div className="text-gray-600">Augmentation CA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">250+</div>
              <div className="text-gray-600">Hôtels partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">0€</div>
              <div className="text-gray-600">Frais d'inscription</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-blue-50 animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tous les outils pour développer votre activité
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zishop vous connecte automatiquement aux clients des hôtels environnants. 
              Gérez facilement vos produits et suivez vos performances en temps réel.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Store className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Boutique en ligne automatique
                </h3>
                <p className="text-gray-600 mb-6">
                  Ajoutez vos produits une fois, ils apparaissent automatiquement sur toutes 
                  les marketplaces des hôtels dans votre zone de livraison.
                </p>
                <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                  Voir exemple
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                  <Truck className="text-yellow-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Livraison simplifiée
                </h3>
                <p className="text-gray-600 mb-6">
                  Livrez directement aux hôtels ou utilisez notre réseau de livreurs partenaires. 
                  Pas de gestion complexe, plus de clients satisfaits.
                </p>
                <Button variant="outline" className="w-full border-yellow-200 text-yellow-600 hover:bg-yellow-50">
                  En savoir plus
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <PieChart className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Analytics avancés
                </h3>
                <p className="text-gray-600 mb-6">
                  Suivez vos ventes, identifiez vos produits populaires et optimisez 
                  votre stratégie grâce à nos rapports détaillés.
                </p>
                <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                  Découvrir
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Aperçu du dashboard */}
      <section className="py-16 bg-white animate-fadeIn animate-delay-300">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 animate-slide-up animate-delay-500">Aperçu du dashboard commerçant</h2>
          <div className="flex flex-col items-center">
            <img src="/assets/images/dashboard-merchant.png" alt="Dashboard commerçant Zishop" className="rounded-2xl shadow-2xl w-full max-w-3xl mb-4 transition-transform duration-500 hover:scale-105 animate-fadeIn animate-delay-700" />
            <p className="text-gray-600 text-center animate-fadeIn animate-delay-1000">Gérez vos produits, commandes et revenus facilement depuis votre espace commerçant.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi rejoindre le réseau Zishop ?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nouveaux clients automatiques
                    </h3>
                    <p className="text-gray-600">
                      Accédez instantanément à des milliers de clients potentiels séjournant 
                      dans les hôtels de votre quartier. Aucun effort marketing nécessaire.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Paiements garantis
                    </h3>
                    <p className="text-gray-600">
                      Tous les paiements sont sécurisés par Zishop. Recevez vos gains 
                      directement sur votre compte, sans risque d'impayés.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Support dédié
                    </h3>
                    <p className="text-gray-600">
                      Notre équipe vous accompagne dans l'optimisation de vos ventes 
                      et vous aide à maximiser votre présence sur la plateforme.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 mb-1">€3,245</div>
                    <div className="text-sm text-gray-600">CA ce mois</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">89</div>
                    <div className="text-sm text-gray-600">Commandes</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Croissance</span>
                    <span className="text-sm text-blue-600">+45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tarification Simple et Transparente
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pas de frais cachés, pas d'abonnement. Vous ne payez que si vous vendez.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Commission Unique</h3>
                      <p className="text-gray-600">Une seule commission de 25% sur vos ventes, incluant tous les services</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Zéro Frais Fixes</h3>
                      <p className="text-gray-600">Pas d'abonnement, pas de frais mensuels, pas de frais d'inscription</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Paiement Garanti</h3>
                      <p className="text-gray-600">Vos gains sont versés automatiquement chaque mois</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Répartition des Gains</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Votre part</span>
                      <span className="text-2xl font-bold text-green-600">75%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Part Zishop</span>
                      <span className="text-2xl font-bold text-blue-600">20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Part Hôtel</span>
                      <span className="text-2xl font-bold text-yellow-600">5%</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        * La commission inclut tous les services : plateforme, paiement, livraison et support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-zishop-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Prêt à booster vos ventes ?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Rejoignez plus de 1200 commerçants qui ont déjà choisi Zishop pour développer 
                leur activité et toucher une nouvelle clientèle de voyageurs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">commercants@zishop.co</span>
                </div>
                <div className="flex items-center">
                  <Globe className="text-yellow-300 mr-4" size={20} />
                  <span className="text-blue-100">Support 7j/7 en français</span>
                </div>
              </div>
            </div>
            <div>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Rejoindre le réseau Zishop
                  </h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Nom de votre commerce"
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
                    <Button type="submit" className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400 font-semibold">
                      Devenir partenaire gratuitement
                    </Button>
                  </form>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    Inscription gratuite • Configuration en 2h • Support inclus
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
                Développez votre commerce local grâce au réseau d'hôtels Zishop. 
                Rejoignez des milliers de commerçants partenaires.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Commerçants</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Devenir partenaire</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Gérer mes produits</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Tarification</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Guide du vendeur</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Ressources</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Études de cas</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Webinaires</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
            <p>&copy; 2025 Zishop - Commerçants. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 