import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Star,
  Globe,
  Info,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface MerchantProductManagementProps {
  merchantId: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isSouvenir: boolean;
  origin?: string;
  material?: string;
  stock?: number;
}

export default function MerchantProductManagement({ merchantId }: MerchantProductManagementProps) {
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Récupérer les produits du commerçant
  const { data: products = [] } = useQuery({
    queryKey: [`/api/products/merchant/${merchantId}`],
    queryFn: () => api.getProductsByMerchant(merchantId),
  });

  // Récupérer les commandes pour les statistiques
  const { data: orders = [] } = useQuery({
    queryKey: [`/api/orders/merchant/${merchantId}`],
    queryFn: () => api.getOrdersByMerchant(merchantId),
  });

  // Catégories uniques
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesTab = selectedTab === "active" ? product.isAvailable : !product.isAvailable;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Calculer les statistiques des produits
  const getProductStats = (productId: number) => {
    const productOrders = orders.filter(order => 
      order.items.some((item: any) => item.productId === productId)
    );
    
    const totalSold = productOrders.reduce((sum, order) => {
      const item = order.items.find((item: any) => item.productId === productId);
      return sum + (item ? item.quantity : 0);
    }, 0);
    
    const revenue = productOrders.reduce((sum, order) => {
      const item = order.items.find((item: any) => item.productId === productId);
      return sum + (item ? item.quantity * parseFloat(item.price) : 0);
    }, 0);
    
    return { totalSold, revenue };
  };

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      console.log("Creating product with data:", data);
      return api.createProduct({
        ...data,
        merchantId,
        price: data.price.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/merchant/${merchantId}`] });
      toast.success("Produit créé avec succès");
      setIsAddingProduct(false);
      setFormErrors({});
    },
    onError: (error: any) => {
      console.error("Product creation error:", error);
      toast.error("Erreur lors de la création du produit: " + (error.message || "Erreur inconnue"));
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) => 
      api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/merchant/${merchantId}`] });
      toast.success("Produit mis à jour avec succès");
      setEditingProduct(null);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du produit");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/merchant/${merchantId}`] });
      toast.success("Produit supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du produit");
    },
  });

  // Ajout d'une fonction de validation stricte pour le formulaire produit
  const validateProductForm = (formData: ProductFormData) => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2) errors.name = "Le nom doit contenir au moins 2 caractères";
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0.01) errors.price = "Le prix doit être un nombre positif (min 0.01€)";
    if (!formData.category) errors.category = "La catégorie est requise";
    if (formData.imageUrl && formData.imageUrl.length > 0 && !/^https?:\/\//.test(formData.imageUrl)) errors.imageUrl = "L'URL de l'image doit être valide";
    if (formData.description && formData.description.length > 0 && formData.description.length < 10) errors.description = "La description doit contenir au moins 10 caractères";
    if (formData.stock !== undefined && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) errors.stock = "Le stock doit être un nombre positif";
    return errors;
  };

  // Formulaire de produit
  const ProductForm = ({ product, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState<ProductFormData>({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      category: product?.category || "",
      imageUrl: product?.imageUrl || "",
      isAvailable: product?.isAvailable ?? true,
      isSouvenir: product?.isSouvenir ?? true,
      origin: product?.origin || "",
      material: product?.material || "",
      stock: product?.stock || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Form submitted with data:", formData);
      const errors = validateProductForm(formData);
      console.log("Validation errors:", errors);
      setFormErrors(errors);
      if (Object.keys(errors).length > 0) {
        console.log("Form has validation errors, not submitting");
        return;
      }
      console.log("No validation errors, submitting form");
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {formErrors.name && <p className="text-sm text-red-600">{formErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Prix (€) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            {formErrors.price && <p className="text-sm text-red-600">{formErrors.price}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          {formErrors.description && <p className="text-sm text-red-600">{formErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monuments">Monuments</SelectItem>
                <SelectItem value="Magnets">Magnets</SelectItem>
                <SelectItem value="Artisanat">Artisanat</SelectItem>
                <SelectItem value="Bijoux">Bijoux</SelectItem>
                <SelectItem value="Papeterie">Papeterie</SelectItem>
                <SelectItem value="Livres">Livres</SelectItem>
                <SelectItem value="Textile">Textile</SelectItem>
                <SelectItem value="Gastronomie">Gastronomie</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.category && <p className="text-sm text-red-600">{formErrors.category}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock disponible</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            />
            {formErrors.stock && <p className="text-sm text-red-600">{formErrors.stock}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL de l'image</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
            {formErrors.imageUrl && <p className="text-sm text-red-600">{formErrors.imageUrl}</p>}
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Pour l'instant, on utilise une URL d'exemple
                const exampleUrls = [
                  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                ];
                const randomUrl = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
                setFormData({ ...formData, imageUrl: randomUrl });
                toast.success("Image sélectionnée");
              }}
            >
              <Upload size={16} className="mr-1" />
              Sélectionner
            </Button>
          </div>
        </div>

        {formData.isSouvenir && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origine</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Ex: France, Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Matériau</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="Ex: Métal, Céramique"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
              />
              <Label htmlFor="isAvailable">Disponible</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSouvenir"
                checked={formData.isSouvenir}
                onCheckedChange={(checked) => setFormData({ ...formData, isSouvenir: checked })}
              />
              <Label htmlFor="isSouvenir">Souvenir</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {product ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    );
  };

  // Carte de produit
  const ProductCard = ({ product }: { product: any }) => {
    const stats = getProductStats(product.id);
    const isLowStock = product.stock !== undefined && product.stock < 10;

    return (
      <Card className={`${!product.isAvailable ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {product.isSouvenir && (
                    <Badge variant="outline" className="text-xs">
                      <Globe size={12} className="mr-1" />
                      Souvenir
                    </Badge>
                  )}
                  <Badge variant={product.isAvailable ? "default" : "secondary"}>
                    {product.isAvailable ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-lg">€{product.price}</span>
                  <Badge variant="outline">{product.category}</Badge>
                  {product.stock !== undefined && (
                    <span className={`flex items-center gap-1 ${isLowStock ? 'text-orange-600' : 'text-gray-600'}`}>
                      <Package size={14} />
                      {product.stock} en stock
                      {isLowStock && <AlertCircle size={14} />}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {stats.totalSold > 0 && (
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ShoppingCart size={12} />
                    {stats.totalSold} vendus
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    €{stats.revenue.toFixed(2)} générés
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Produits</CardTitle>
            <Button onClick={() => setIsAddingProduct(true)}>
              <Plus size={16} className="mr-1" />
              Nouveau produit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total produits</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isAvailable).length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock !== undefined && p.stock < 10).length}
                </p>
              </div>
              <AlertCircle className="text-orange-600" size={32} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="text-yellow-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des produits */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="active">
            Produits actifs ({products.filter(p => p.isAvailable).length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Produits inactifs ({products.filter(p => !p.isAvailable).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab} className="mt-4">
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <Package className="mx-auto mb-4 text-gray-300" size={48} />
                  <p>Aucun produit trouvé</p>
                </CardContent>
              </Card>
            ) : (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product}>
                  {typeof product.stock === 'number' ? (
                    <div style={{ fontSize: '0.9em', color: product.stock === 0 ? 'red' : '#555' }}>
                      Stock restant : {product.stock}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.9em', color: 'red' }}>
                      Stock restant : 0
                    </div>
                  )}
                </ProductCard>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={isAddingProduct || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setIsAddingProduct(false);
          setEditingProduct(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={(data: ProductFormData) => {
              if (editingProduct) {
                updateProductMutation.mutate({ id: editingProduct.id, data });
              } else {
                createProductMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 