import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Filter,
  Search,
  Reply,
  Flag,
  Heart,
  Calendar,
  User,
  Download,
  Settings,
  BarChart3
} from "lucide-react";

interface MerchantReviewsProps {
  merchantId: number;
}

export default function MerchantReviews({ merchantId }: MerchantReviewsProps) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Données simulées pour les avis
  const reviewsData = {
    averageRating: 4.8,
    totalReviews: 156,
    ratingDistribution: {
      5: 89,
      4: 45,
      3: 15,
      2: 4,
      1: 3
    } as Record<number, number>
  };

  const reviews = [
    {
      id: 1,
      customerName: "Marie Dupont",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent service ! Les produits sont de très bonne qualité et la livraison était rapide. Je recommande vivement.",
      hotel: "Hôtel Central",
      orderId: "ORD-001",
      helpful: 12,
      merchantReply: "Merci beaucoup Marie ! Nous sommes ravis que vous ayez apprécié nos produits.",
      replyDate: "2024-01-16"
    },
    {
      id: 2,
      customerName: "Jean Martin",
      rating: 4,
      date: "2024-01-14",
      comment: "Très satisfait de ma commande. Les souvenirs locaux sont authentiques et bien emballés.",
      hotel: "Hôtel Plaza",
      orderId: "ORD-002",
      helpful: 8,
      merchantReply: null
    },
    {
      id: 3,
      customerName: "Sophie Bernard",
      rating: 5,
      date: "2024-01-13",
      comment: "Service impeccable ! La réception à l'hôtel était parfaite et les produits correspondent exactement à la description.",
      hotel: "Hôtel Luxe",
      orderId: "ORD-003",
      helpful: 15,
      merchantReply: "Merci Sophie pour ce bel avis ! Nous travaillons dur pour maintenir cette qualité.",
      replyDate: "2024-01-14"
    },
    {
      id: 4,
      customerName: "Pierre Dubois",
      rating: 3,
      date: "2024-01-12",
      comment: "Produits corrects mais la livraison a pris plus de temps que prévu. Dommage car le reste était bien.",
      hotel: "Hôtel Central",
      orderId: "ORD-004",
      helpful: 3,
      merchantReply: "Nous nous excusons pour le délai. Nous avons amélioré notre processus de livraison.",
      replyDate: "2024-01-13"
    },
    {
      id: 5,
      customerName: "Anne Moreau",
      rating: 5,
      date: "2024-01-11",
      comment: "Fantastique ! Les produits artisanaux sont magnifiques et le service client est au top. Je reviendrai !",
      hotel: "Hôtel Plaza",
      orderId: "ORD-005",
      helpful: 20,
      merchantReply: null
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === "all" || 
      (filter === "positive" && review.rating >= 4) ||
      (filter === "negative" && review.rating <= 2) ||
      (filter === "unreplied" && !review.merchantReply);
    
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        size={16}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
          <p className="text-gray-600">Gérez vos avis et répondez aux clients</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2" size={16} />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques des avis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{reviewsData.averageRating}</p>
                <div className="flex items-center mt-2">
                  {renderStars(Math.round(reviewsData.averageRating))}
                </div>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total avis</p>
                <p className="text-2xl font-bold text-gray-900">{reviewsData.totalReviews}</p>
                <p className="text-sm text-gray-600 mt-2">Ce mois</p>
              </div>
              <MessageSquare className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avis positifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((reviewsData.ratingDistribution[5] + reviewsData.ratingDistribution[4]) / reviewsData.totalReviews * 100)}%
                </p>
                <p className="text-sm text-gray-600 mt-2">4-5 étoiles</p>
              </div>
              <ThumbsUp className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réponses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.merchantReply).length}
                </p>
                <p className="text-sm text-gray-600 mt-2">Sur {reviews.length} avis</p>
              </div>
              <Reply className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Répartition des notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="text-yellow-400 ml-1" size={14} />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${(reviewsData.ratingDistribution[rating] || 0) / reviewsData.totalReviews * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {reviewsData.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={filter === "positive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("positive")}
          >
            Positifs
          </Button>
          <Button
            variant={filter === "negative" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("negative")}
          >
            Négatifs
          </Button>
          <Button
            variant={filter === "unreplied" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unreplied")}
          >
            Sans réponse
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher dans les avis..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* En-tête de l'avis */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.customerName}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{review.date}</p>
                    <Badge variant="outline" className="text-xs">
                      {review.hotel}
                    </Badge>
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {/* Informations supplémentaires */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Commande: {review.orderId}</span>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="text-gray-400" size={14} />
                      <span>{review.helpful} utile</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Reply className="mr-2" size={14} />
                      Répondre
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="mr-2" size={14} />
                      Signaler
                    </Button>
                  </div>
                </div>

                {/* Réponse du commerçant */}
                {review.merchantReply && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-blue-900">Votre réponse</p>
                      <span className="text-xs text-blue-600">{review.replyDate}</span>
                    </div>
                    <p className="text-blue-800">{review.merchantReply}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions en masse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2" size={20} />
            Actions en masse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Reply className="mr-2" size={16} />
              Répondre aux avis non répondu
            </Button>
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Exporter les avis
            </Button>
            <Button variant="outline">
              <Heart className="mr-2" size={16} />
              Marquer comme favoris
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 