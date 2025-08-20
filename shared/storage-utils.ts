import { supabase, STORAGE_BUCKETS, StorageBucket } from './supabase.js'

export interface UploadImageOptions {
  file: File
  bucket: StorageBucket
  path?: string
  upsert?: boolean
}

export interface UploadImageResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload une image vers un bucket Supabase Storage
 */
export async function uploadImage(options: UploadImageOptions): Promise<UploadImageResult> {
  try {
    const { file, bucket, path, upsert = false } = options
    
    console.log('Début upload:', { bucket, fileName: file.name, size: file.size })
    
    // Vérifier la configuration Supabase
    if (!supabase) {
      console.error('Client Supabase non initialisé')
      return {
        success: false,
        error: 'Configuration Supabase manquante'
      }
    }
    
    // Générer un nom de fichier unique si pas de path fourni
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`
    
    console.log('Nom de fichier généré:', fileName)
    
    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert
      })

    if (error) {
      console.error('Erreur upload Supabase:', error)
      return {
        success: false,
        error: `Erreur Supabase: ${error.message}`
      }
    }

    console.log('Upload réussi, données:', data)

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log('URL publique générée:', urlData.publicUrl)

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName
    }
  } catch (error) {
    console.error('Erreur upload image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Supprimer une image d'un bucket
 */
export async function deleteImage(bucket: StorageBucket, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Erreur suppression:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erreur suppression image:', error)
    return false
  }
}

/**
 * Lister les fichiers d'un bucket
 */
export async function listImages(bucket: StorageBucket, folder?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('Erreur listage:', error)
      return []
    }

    return data.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      lastModified: file.updated_at,
      url: supabase.storage.from(bucket).getPublicUrl(folder ? `${folder}/${file.name}` : file.name).data.publicUrl
    }))
  } catch (error) {
    console.error('Erreur listage images:', error)
    return []
  }
}

/**
 * Créer les buckets de storage s'ils n'existent pas
 */
export async function createStorageBuckets() {
  const results = []
  
  for (const [key, bucketName] of Object.entries(STORAGE_BUCKETS)) {
    try {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error && error.message !== 'Bucket already exists') {
        results.push({ bucket: bucketName, success: false, error: error.message })
      } else {
        results.push({ bucket: bucketName, success: true })
      }
    } catch (error) {
      results.push({ 
        bucket: bucketName, 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      })
    }
  }
  
  return results
}

/**
 * Utilitaire pour valider les types de fichiers d'image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non autorisé. Utilisez: JPEG, PNG, WebP ou GIF'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Fichier trop volumineux. Taille maximum: 5MB'
    }
  }
  
  return { valid: true }
}

/**
 * Utilitaire pour redimensionner une image côté client
 */
export function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convertir en blob puis en File
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        } else {
          reject(new Error('Erreur lors du redimensionnement'))
        }
      }, file.type, quality)
    }
    
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
    img.src = URL.createObjectURL(file)
  })
} 