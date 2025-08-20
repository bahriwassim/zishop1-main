import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Package, Eye } from "lucide-react";
import ProductDetailSheet from "./product-detail-sheet";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  merchantName?: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, merchantName, onAddToCart }: ProductCardProps) {
  return (
    <ProductDetailSheet
      product={product}
      merchantName={merchantName}
      onAddToCart={onAddToCart}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-blue-200">
        <div className="relative">
          {!product.imageUrl ? (
            <div className="w-full h-48 bg-yellow-50 flex items-center justify-center">
              <Package className="text-blue-400" size={48} />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-gray-600 flex items-center justify-center">
                  <Badge variant="destructive" className="text-white">
                    Indisponible
                  </Badge>
                </div>
              )}
            </div>
          )}
          {product.isSouvenir && (
            <Badge className="absolute top-3 left-3 bg-yellow-500 text-blue-900">
              Souvenir
            </Badge>
          )}
          
          {/* Icône pour indiquer qu'on peut voir plus de détails */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-blue-700 border border-blue-200">
              <Eye size={12} className="mr-1" />
              Voir détails
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* En-tête avec nom et prix */}
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-blue-900 line-clamp-2">
                {product.name}
              </h3>
              <div className="text-right ml-2 flex-shrink-0">
                <div className="text-xl font-bold text-yellow-600">
                  {product.price}€
                </div>
              </div>
            </div>
            {typeof product.stock === 'number' && (
              <div style={{ fontSize: '0.9em', color: product.stock === 0 ? 'red' : '#555' }}>
                Stock restant : {product.stock}
              </div>
            )}
            
            {/* Informations sur le commerçant */}
            {merchantName && (
              <div className="flex items-center text-sm text-blue-600">
                <MapPin size={14} className="mr-1" />
                <span>{merchantName}</span>
              </div>
            )}
            
            {/* Description du produit */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
            
            {/* Badges pour catégorie, origine et matériau */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                {product.category}
              </Badge>
              {product.origin && (
                <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-600">
                  {product.origin}
                </Badge>
              )}
              {product.material && (
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                  {product.material}
                </Badge>
              )}
            </div>
            
            {/* Bouton d'ajout au panier rapide */}
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Empêche l'ouverture de la fiche détaillée
                onAddToCart(product);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!product.isAvailable}
              variant={product.isAvailable ? "default" : "secondary"}
            >
              {product.isAvailable ? "Ajouter au panier" : "Indisponible"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </ProductDetailSheet>
  );
}
