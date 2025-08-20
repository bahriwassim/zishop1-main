import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { uploadImage, validateImageFile, resizeImage } from '../../../shared/storage-utils'
import { StorageBucket } from '../../../shared/supabase'

interface ImageUploadProps {
  bucket: StorageBucket
  currentImage?: string
  onImageUploaded: (url: string, path: string) => void
  onImageRemoved?: () => void
  className?: string
  placeholder?: string
  maxWidth?: number
  maxHeight?: number
  showPreview?: boolean
}

export function ImageUpload({ 
  bucket, 
  currentImage, 
  onImageUploaded, 
  onImageRemoved,
  className = '',
  placeholder = 'Cliquez pour uploader une image',
  maxWidth = 800,
  maxHeight = 600,
  showPreview = true
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Fichier sélectionné:', file.name, file.size, file.type)

    // Validation du fichier
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide')
      return
    }

    setIsUploading(true)
    setError(null)
    setDebugInfo('Début de l\'upload...')

    try {
      // Prévisualisation
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      setDebugInfo('Prévisualisation créée')

      // Redimensionner l'image si nécessaire
      let fileToUpload = file
      if (file.size > 1024 * 1024) { // Si > 1MB, redimensionner
        try {
          setDebugInfo('Redimensionnement en cours...')
          fileToUpload = await resizeImage(file, maxWidth, maxHeight, 0.8)
          setDebugInfo('Image redimensionnée')
        } catch (resizeError) {
          console.warn('Erreur redimensionnement, upload du fichier original:', resizeError)
          setDebugInfo('Redimensionnement échoué, utilisation du fichier original')
        }
      }

      // Upload vers Supabase
      setDebugInfo('Upload vers Supabase...')
      const result = await uploadImage({
        file: fileToUpload,
        bucket,
        path: `${bucket}/${Date.now()}-${file.name}`
      })

      console.log('Résultat upload:', result)

      if (result.success && result.url && result.path) {
        onImageUploaded(result.url, result.path)
        setPreview(result.url)
        setError(null)
        setDebugInfo('Upload réussi!')
      } else {
        const errorMsg = result.error || 'Erreur lors de l\'upload'
        setError(errorMsg)
        setPreview(null)
        setDebugInfo(`Échec: ${errorMsg}`)
        console.error('Erreur upload:', result)
      }
    } catch (uploadError) {
      console.error('Erreur upload:', uploadError)
      const errorMsg = uploadError instanceof Error ? uploadError.message : 'Erreur lors de l\'upload de l\'image'
      setError(errorMsg)
      setPreview(null)
      setDebugInfo(`Exception: ${errorMsg}`)
    } finally {
      setIsUploading(false)
      // Reset du file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setError(null)
    setDebugInfo(null)
    if (onImageRemoved) {
      onImageRemoved()
    }
  }

  const displayImage = preview || currentImage
  const bucketLabels: Record<StorageBucket, string> = {
    hotels: 'hôtel',
    merchants: 'marchand',
    products: 'produit',
    avatars: 'avatar'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Zone d'upload */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id={`image-upload-${bucket}`}
        />
        <label
          htmlFor={`image-upload-${bucket}`}
          className={`block w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading 
              ? 'border-blue-300 bg-blue-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-center">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-600">Upload en cours...</span>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés: JPEG, PNG, WebP, GIF (max 5MB)
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Informations de debug */}
      {debugInfo && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          Debug: {debugInfo}
        </div>
      )}

      {/* Prévisualisation */}
      {showPreview && displayImage && (
        <div className="relative">
          <img
            src={displayImage}
            alt={`Image ${bucketLabels[bucket]}`}
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Informations de debug */}
      <div className="text-xs text-gray-500">
        <p>Bucket: <code className="bg-gray-100 px-1 rounded">{bucket}</code></p>
        {displayImage && (
          <p>URL: <code className="bg-gray-100 px-1 rounded break-all">{displayImage}</code></p>
        )}
      </div>
    </div>
  )
}

// Composant simplifié pour les formulaires
export function SimpleImageUpload({ 
  bucket, 
  onImageUploaded, 
  className = ''
}: {
  bucket: StorageBucket
  onImageUploaded: (url: string) => void
  className?: string
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadImage({
        file,
        bucket,
        path: `${bucket}/${Date.now()}-${file.name}`
      })

      if (result.success && result.url) {
        onImageUploaded(result.url)
        setError(null)
      } else {
        setError(result.error || 'Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      setError('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {isUploading && (
        <p className="text-sm text-blue-600 mt-1">Upload en cours...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
} 