import React, { useState, useEffect } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import { ImageUpload } from '../components/ImageUpload'
import { STORAGE_BUCKETS } from '../../../shared/supabase'
import { supabase } from '../../../shared/supabase'

interface Merchant {
  id: number
  name: string
  category: string
}

interface ProductFormData {
  name: string
  description: string
  price: number
  merchant_id: number
  category: string
  is_souvenir: boolean
  origin: string
  material: string
  image_url: string
  is_available: boolean
}

export function AdminProductForm({ productId, onClose }: { productId?: number, onClose?: () => void }) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    merchant_id: 0,
    category: '',
    is_souvenir: false,
    origin: '',
    material: '',
    image_url: '',
    is_available: true
  })

  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Charger les marchands
  useEffect(() => {
    loadMerchants()
    if (productId) {
      loadProduct(productId)
    }
  }, [productId])

  const loadMerchants = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name, category')
        .eq('is_open', true)
        .order('name')

      if (error) throw error
      setMerchants(data || [])
    } catch (error) {
      console.error('Erreur chargement marchands:', error)
    }
  }

  const loadProduct = async (id: number) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          merchant_id: data.merchant_id || 0,
          category: data.category || '',
          is_souvenir: data.is_souvenir || false,
          origin: data.origin || '',
          material: data.material || '',
          image_url: data.image_url || '',
          is_available: data.is_available ?? true
        })
      }
    } catch (error) {
      console.error('Erreur chargement produit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleImageUploaded = (url: string, path: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: url
    }))
  }

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (productId) {
        // Mise à jour
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', productId)

        if (error) throw error
        alert('Produit mis à jour avec succès !')
      } else {
        // Création
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) throw error
        alert('Produit créé avec succès !')
        
        // Reset du formulaire
        setFormData({
          name: '',
          description: '',
          price: 0,
          merchant_id: 0,
          category: '',
          is_souvenir: false,
          origin: '',
          material: '',
          image_url: '',
          is_available: true
        })
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {productId ? 'Modifier le produit' : 'Ajouter un produit'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Croissant aux amandes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description du produit..."
          />
        </div>

        {/* Marchand et catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marchand *
            </label>
            <select
              name="merchant_id"
              value={formData.merchant_id}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner un marchand</option>
              {merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name} ({merchant.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Viennoiserie, Boisson..."
            />
          </div>
        </div>

        {/* Options souvenir */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_souvenir"
              checked={formData.is_souvenir}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              C'est un souvenir
            </label>
          </div>

          {formData.is_souvenir && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origine
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: France, Provence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matériau
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Métal, Bois, Textile..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Upload d'image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Image du produit
          </label>
          <ImageUpload
            bucket={STORAGE_BUCKETS.PRODUCTS}
            currentImage={formData.image_url}
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            placeholder="Uploader une photo du produit"
            maxWidth={600}
            maxHeight={400}
          />
        </div>

        {/* Disponibilité */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_available"
            checked={formData.is_available}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Produit disponible
          </label>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-6">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </form>
    </div>
  )
} 