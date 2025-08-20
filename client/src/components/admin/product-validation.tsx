import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Eye, 
  Store, 
  Euro,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  category: string;
  isSouvenir: boolean;
  origin?: string;
  material?: string;
  isAvailable: boolean;
  imageUrl?: string;
  merchantId: number;
  merchant?: {
    id: number;
    name: string;
    category: string;
  };
}

export function ProductValidation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [validationNote, setValidationNote] = useState('');

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log('Produits chargés:', data);
        setProducts(data);
        setFilteredProducts(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const validateProduct = async (productId: number, action: 'approve' | 'reject') => {
    try {
      console.log(`Validation produit ${productId}: ${action}`, { note: validationNote });
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          action,
          note: validationNote
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Validation réussie:', result);
        toast.success(`Produit ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`);
        setValidationNote('');
        setSelectedProduct(null);
        loadProducts();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Erreur validation:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.merchant?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut / catégorie
    if (filter === 'pending') {
      filtered = filtered.filter((p: any) => (p.validationStatus || p.validation_status || 'pending') === 'pending');
    } else if (filter === 'approved') {
      filtered = filtered.filter((p: any) => (p.validationStatus || p.validation_status) === 'approved');
    } else if (filter === 'rejected') {
      filtered = filtered.filter((p: any) => (p.validationStatus || p.validation_status) === 'rejected');
    } else if (filter === 'issues') {
      filtered = filtered.filter(p => checkProductCompliance(p).length > 0);
    } else if (filter === 'souvenirs') {
      filtered = filtered.filter(p => p.isSouvenir);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, filter, products]);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'souvenirs': 'bg-purple-500',
      'artisanat': 'bg-orange-500',
      'gastronomie': 'bg-green-500',
      'textile': 'bg-blue-500',
      'bijoux': 'bg-yellow-500',
      'default': 'bg-gray-500'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const checkProductCompliance = (product: Product) => {
    const issues = [];
    
    // Vérifications selon le cahier des charges
    if (!product.description || product.description.length < 20) {
      issues.push('Description trop courte (minimum 20 caractères)');
    }
    
    if (parseFloat(product.price) < 1) {
      issues.push('Prix trop bas (minimum 1€)');
    }
    
    if (product.isSouvenir && !product.origin) {
      issues.push('Origine manquante pour un souvenir');
    }
    
    if (product.isSouvenir && !product.material) {
      issues.push('Matériau manquant pour un souvenir');
    }
    
    if (!product.imageUrl) {
      issues.push('Image manquante');
    }

    return issues;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p>Chargement des produits...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="text-primary" />
            Validation des Produits
          </CardTitle>
      </CardHeader>
      <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-800 mb-2">Critères de validation selon le cahier des charges :</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Description complète (minimum 20 caractères)</p>
              <p>• Prix cohérent (minimum 1€)</p>
              <p>• Image de qualité représentative</p>
              <p>• Pour les souvenirs : origine et matériau obligatoires</p>
              <p>• Conformité avec la catégorie du commerçant</p>
              <p>• Respect des standards Zishop</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher par nom, catégorie, commerçant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <Filter size={16} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="issues">Avec problèmes</SelectItem>
                <SelectItem value="souvenirs">Souvenirs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aucun produit à valider</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const issues = checkProductCompliance(product);
                const hasIssues = issues.length > 0;

                return (
                  <Card key={product.id} className={`border ${hasIssues ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <Badge className={`${getCategoryBadgeColor(product.category)} text-white text-xs`}>
                              {product.category}
                            </Badge>
                            {product.isSouvenir && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                Souvenir
                              </Badge>
                            )}
                            {hasIssues && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle size={12} />
                                {issues.length} problème{issues.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                <Store className="inline mr-1" size={14} />
                                {product.merchant?.name || 'Commerçant inconnu'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <Euro className="inline mr-1" size={14} />
                                {product.price}€
                              </p>
                            </div>
                            <div>
                              {product.isSouvenir && (
                                <>
                                  {product.origin && <p className="text-sm text-gray-600">Origine: {product.origin}</p>}
                                  {product.material && <p className="text-sm text-gray-600">Matériau: {product.material}</p>}
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3">
                            {product.description || 'Aucune description'}
                          </p>

                          {hasIssues && (
                            <div className="bg-orange-100 border border-orange-200 rounded p-3 mb-3">
                              <h4 className="font-medium text-orange-800 mb-2">Problèmes détectés :</h4>
                              <ul className="text-sm text-orange-700 space-y-1">
                                {issues.map((issue, idx) => (
                                  <li key={idx}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye size={14} className="mr-1" />
                            Détails
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              console.log('🟢 Approbation rapide produit:', product.id);
                              validateProduct(product.id, 'approve');
                            }}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              console.log('🔴 Rejet rapide produit:', product.id);
                              setSelectedProduct(product);
                              // Le rejet nécessite une note, donc on ouvre le modal
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="text-blue-600" />
              Validation de "{selectedProduct.name}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="validation-note">Note de validation (optionnelle)</Label>
              <Textarea
                id="validation-note"
                placeholder="Raison de l'approbation/rejet, suggestions d'amélioration..."
                value={validationNote}
                onChange={(e) => setValidationNote(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => validateProduct(selectedProduct.id, 'approve')}
                >
                  <CheckCircle className="mr-2" size={16} />
                  Approuver
                </Button>
                <Button
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => validateProduct(selectedProduct.id, 'reject')}
                >
                  <XCircle className="mr-2" size={16} />
                  Rejeter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
          )}
        </div>
  );
} 