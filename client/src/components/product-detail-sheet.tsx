import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Package, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductDetailSheetProps {
  product: Product;
  merchantName?: string;
  onAddToCart: (product: Product) => void;
  children: React.ReactNode;
}

// Images de démonstration - dans un vrai projet, ces images viendraient du backend
const getProductImages = (product: Product): string[] => {
  const baseImages = [
    product.imageUrl || "",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  ];
  return baseImages.filter(Boolean);
};

export default function ProductDetailSheet({ 
  product, 
  merchantName, 
  onAddToCart, 
  children 
}: ProductDetailSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const images = getProductImages(product);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* En-tête avec titre et bouton fermer */}
          <SheetHeader className="px-4 py-3 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold text-gray-900">
                Détails du produit
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="pb-20">
              {/* Galerie d'images */}
              <div className="relative">
                {images.length > 0 ? (
                  <div className="relative h-80 bg-gray-100">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay avec badges */}
                    <div className="absolute top-3 left-3 space-y-2">
                      {product.isSouvenir && (
                        <Badge className="bg-accent text-white">
                          Souvenir Authentique
                        </Badge>
                      )}
                      {!product.isAvailable && (
                        <Badge variant="destructive" className="text-white">
                          Indisponible
                        </Badge>
                      )}
                    </div>

                    {/* Navigation des images */}
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={prevImage}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={nextImage}
                        >
                          <ChevronRight size={16} />
                        </Button>
                        
                        {/* Indicateurs de pagination */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-80 bg-gray-100 flex items-center justify-center">
                    <Package className="text-gray-400" size={64} />
                  </div>
                )}
              </div>

              {/* Informations du produit */}
              <div className="p-4 space-y-4">
                {/* Nom et prix */}
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
                    {product.name}
                  </h1>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {product.price}€
                    </div>
                  </div>
                </div>

                {/* Informations du commerçant */}
                {merchantName && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span className="font-medium">{merchantName}</span>
                    <div className="flex items-center ml-auto">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                )}

                {/* Description détaillée */}
                {product.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Caractéristiques */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Caractéristiques</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Catégorie</span>
                      <Badge variant="outline" className="block w-fit">
                        {product.category}
                      </Badge>
                    </div>
                    
                    {product.origin && (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Origine</span>
                        <Badge variant="outline" className="block w-fit">
                          {product.origin}
                        </Badge>
                      </div>
                    )}
                    
                    {product.material && (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500">Matériau</span>
                        <Badge variant="outline" className="block w-fit">
                          {product.material}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Disponibilité</span>
                      <Badge className={product.isAvailable ? "bg-accent" : "bg-red-500"}>
                        {product.isAvailable ? "En stock" : "Rupture"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Informations de livraison */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900">🚚 Livraison</h3>
                  <p className="text-sm text-blue-800">
                    Livraison gratuite directement à la réception de votre hôtel sous 30 minutes.
                  </p>
                </div>

                {/* Avis clients */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Avis clients</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className="fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">Marie L.</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Magnifique souvenir, très bonne qualité ! Parfait pour ramener un morceau de Paris."
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} size={14} className="fill-current" />
                          ))}
                          <Star size={14} className="text-gray-300" />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">Jean D.</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Livraison rapide à l'hôtel, très pratique ! Le produit correspond à la description."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Bouton d'action fixe en bas */}
          <div className="sticky bottom-0 bg-white border-t p-4">
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg"
              disabled={!product.isAvailable}
              variant={product.isAvailable ? "default" : "secondary"}
            >
              {product.isAvailable ? `Ajouter au panier - ${product.price}€` : "Produit indisponible"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 