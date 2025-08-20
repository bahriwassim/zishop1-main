import { supabase, STORAGE_BUCKETS } from '../shared/supabase'
import { createStorageBuckets } from '../shared/storage-utils'
import path from 'path'
import fs from 'fs'

async function setupStorage() {
  console.log('🚀 Configuration du stockage Supabase...')

  try {
    // 1. Créer les buckets
    console.log('📁 Création des buckets...')
    const results = await createStorageBuckets()
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ Bucket ${result.bucket} créé/vérifié`)
      } else {
        console.error(`❌ Erreur bucket ${result.bucket}:`, result.error)
      }
    })

    // 2. Upload des images par défaut
    console.log('\n📸 Upload des images par défaut...')

    // Structure des dossiers d'images
    const defaultImages = {
      hotels: [
        { name: 'novotel-vaugirard.jpg', path: 'default/hotels/novotel-vaugirard.jpg' },
        { name: 'mercure-boulogne.jpg', path: 'default/hotels/mercure-boulogne.jpg' },
        { name: 'ibis-defense.jpg', path: 'default/hotels/ibis-defense.jpg' },
        { name: 'novotel-defense.jpg', path: 'default/hotels/novotel-defense.jpg' }
      ],
      merchants: [
        { name: 'paris-memories.jpg', path: 'default/merchants/paris-memories.jpg' },
        { name: 'art-collection.jpg', path: 'default/merchants/art-collection.jpg' },
        { name: 'luxury-gifts.jpg', path: 'default/merchants/luxury-gifts.jpg' },
        { name: 'boulogne-artisanat.jpg', path: 'default/merchants/boulogne-artisanat.jpg' },
        { name: 'paris-ouest.jpg', path: 'default/merchants/paris-ouest.jpg' },
        { name: 'defense-souvenirs.jpg', path: 'default/merchants/defense-souvenirs.jpg' },
        { name: 'premium-gifts.jpg', path: 'default/merchants/premium-gifts.jpg' },
        { name: 'art-france.jpg', path: 'default/merchants/art-france.jpg' }
      ],
      products: [
        { name: 'tour-eiffel-deluxe.jpg', path: 'default/products/tour-eiffel-deluxe.jpg' },
        { name: 'set-art-vivre.jpg', path: 'default/products/set-art-vivre.jpg' },
        { name: 'reproduction-orsay.jpg', path: 'default/products/reproduction-orsay.jpg' },
        { name: 'collection-monuments.jpg', path: 'default/products/collection-monuments.jpg' },
        { name: 'foulard-soie.jpg', path: 'default/products/foulard-soie.jpg' },
        { name: 'coffret-parfum.jpg', path: 'default/products/coffret-parfum.jpg' },
        { name: 'tableau-paris.jpg', path: 'default/products/tableau-paris.jpg' },
        { name: 'bijoux-paris.jpg', path: 'default/products/bijoux-paris.jpg' },
        { name: 'photo-book.jpg', path: 'default/products/photo-book.jpg' },
        { name: 'montre-paris.jpg', path: 'default/products/montre-paris.jpg' },
        { name: 'poster-defense.jpg', path: 'default/products/poster-defense.jpg' },
        { name: 'mug-collection.jpg', path: 'default/products/mug-collection.jpg' },
        { name: 'stylo-paris.jpg', path: 'default/products/stylo-paris.jpg' },
        { name: 'maroquinerie-paris.jpg', path: 'default/products/maroquinerie-paris.jpg' },
        { name: 'sculpture-paris.jpg', path: 'default/products/sculpture-paris.jpg' },
        { name: 'lithographie-paris.jpg', path: 'default/products/lithographie-paris.jpg' }
      ]
    }

    // Upload pour chaque bucket
    for (const [bucketName, images] of Object.entries(defaultImages)) {
      console.log(`\n🗂️  Upload images ${bucketName}...`)
      
      for (const image of images) {
        try {
          const filePath = path.join(__dirname, '..', image.path)
          
          // Vérifier si le fichier existe
          if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  Image non trouvée: ${filePath}`)
            continue
          }

          const fileBuffer = fs.readFileSync(filePath)
          const { error } = await supabase.storage
            .from(bucketName)
            .upload(image.name, fileBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            })

          if (error) {
            console.error(`❌ Erreur upload ${image.name}:`, error.message)
          } else {
            console.log(`✅ Image uploadée: ${image.name}`)
          }
        } catch (error) {
          console.error(`❌ Erreur traitement ${image.name}:`, error)
        }
      }
    }

    console.log('\n🎉 Configuration du stockage terminée !')
    
  } catch (error) {
    console.error('❌ Erreur configuration storage:', error)
    process.exit(1)
  }
}

// Exécuter le script
setupStorage().catch(console.error) 