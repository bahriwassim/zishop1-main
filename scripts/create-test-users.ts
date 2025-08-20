import { supabase } from '../shared/supabase.js'
import bcrypt from 'bcrypt'

// Types basés sur le schéma
interface TestUser {
  username: string
  password: string
  role: 'admin' | 'hotel' | 'merchant' | 'client'
  entity_id?: number
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
}

interface TestClient {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs de test pour ZiShop...')
  console.log('=' .repeat(60))

  try {
    // 1. Créer des utilisateurs système (admin, hotel, merchant)
    console.log('\n👥 1. Création des utilisateurs système...')
    
    const systemUsers: TestUser[] = [
      {
        username: 'admin_zishop',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'hotel_novotel_vaugirard',
        password: 'hotel123',
        role: 'hotel',
        entity_id: 1 // ID de l'hôtel Novotel Vaugirard
      },
      {
        username: 'hotel_mercure_boulogne',
        password: 'hotel123',
        role: 'hotel',
        entity_id: 2 // ID de l'hôtel Mercure Boulogne
      },
      {
        username: 'merchant_boulangerie',
        password: 'merchant123',
        role: 'merchant',
        entity_id: 1 // ID de la boulangerie
      },
      {
        username: 'merchant_souvenirs',
        password: 'merchant123',
        role: 'merchant',
        entity_id: 2 // ID de la boutique souvenirs
      },
      {
        username: 'merchant_cafe',
        password: 'merchant123',
        role: 'merchant',
        entity_id: 3 // ID du café
      },
      {
        username: 'merchant_patisserie',
        password: 'merchant123',
        role: 'merchant',
        entity_id: 4 // ID de la pâtisserie
      }
    ]

    // Hasher les mots de passe et insérer les utilisateurs système
    for (const user of systemUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: user.username,
          password: hashedPassword,
          role: user.role,
          entity_id: user.entity_id
        })
        .select()

      if (error) {
        console.error(`❌ Erreur création ${user.username}:`, error.message)
      } else {
        console.log(`✅ ${user.username} créé avec succès (${user.role})`)
      }
    }

    // 2. Créer des clients de test
    console.log('\n👤 2. Création des clients de test...')
    
    const testClients: TestClient[] = [
      {
        email: 'jean.dupont@email.com',
        password: 'client123',
        first_name: 'Jean',
        last_name: 'Dupont',
        phone: '+33 6 12 34 56 78'
      },
      {
        email: 'marie.martin@email.com',
        password: 'client123',
        first_name: 'Marie',
        last_name: 'Martin',
        phone: '+33 6 23 45 67 89'
      },
      {
        email: 'pierre.durand@email.com',
        password: 'client123',
        first_name: 'Pierre',
        last_name: 'Durand',
        phone: '+33 6 34 56 78 90'
      },
      {
        email: 'sophie.leroy@email.com',
        password: 'client123',
        first_name: 'Sophie',
        last_name: 'Leroy',
        phone: '+33 6 45 67 89 01'
      },
      {
        email: 'lucas.moreau@email.com',
        password: 'client123',
        first_name: 'Lucas',
        last_name: 'Moreau',
        phone: '+33 6 56 78 90 12'
      },
      {
        email: 'emma.petit@email.com',
        password: 'client123',
        first_name: 'Emma',
        last_name: 'Petit',
        phone: '+33 6 67 89 01 23'
      },
      {
        email: 'thomas.roux@email.com',
        password: 'client123',
        first_name: 'Thomas',
        last_name: 'Roux',
        phone: '+33 6 78 90 12 34'
      },
      {
        email: 'julie.simon@email.com',
        password: 'client123',
        first_name: 'Julie',
        last_name: 'Simon',
        phone: '+33 6 89 01 23 45'
      }
    ]

    // Insérer les clients
    for (const client of testClients) {
      const hashedPassword = await bcrypt.hash(client.password, 10)
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          email: client.email,
          password: hashedPassword,
          first_name: client.first_name,
          last_name: client.last_name,
          phone: client.phone,
          is_active: true,
          has_completed_tutorial: false
        })
        .select()

      if (error) {
        console.error(`❌ Erreur création client ${client.email}:`, error.message)
      } else {
        console.log(`✅ Client ${client.first_name} ${client.last_name} créé avec succès`)
      }
    }

    // 3. Créer des utilisateurs de test supplémentaires pour différents scénarios
    console.log('\n🔧 3. Création d\'utilisateurs de test supplémentaires...')
    
    const additionalUsers: TestUser[] = [
      {
        username: 'test_hotel_manager',
        password: 'test123',
        role: 'hotel',
        entity_id: 3 // ID de l'hôtel ibis La Défense
      },
      {
        username: 'test_merchant_manager',
        password: 'test123',
        role: 'merchant',
        entity_id: 5 // ID de l'épicerie fine
      },
      {
        username: 'support_team',
        password: 'support123',
        role: 'admin'
      },
      {
        username: 'demo_user',
        password: 'demo123',
        role: 'admin'
      }
    ]

    // Insérer les utilisateurs supplémentaires
    for (const user of additionalUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: user.username,
          password: hashedPassword,
          role: user.role,
          entity_id: user.entity_id
        })
        .select()

      if (error) {
        console.error(`❌ Erreur création ${user.username}:`, error.message)
      } else {
        console.log(`✅ ${user.username} créé avec succès (${user.role})`)
      }
    }

    // 4. Afficher le récapitulatif des connexions de test
    console.log('\n📋 4. Récapitulatif des connexions de test...')
    console.log('=' .repeat(60))
    
    console.log('\n🔑 UTILISATEURS SYSTÈME:')
    console.log('Admin: admin_zishop / admin123')
    console.log('Hôtels: hotel_novotel_vaugirard / hotel123, hotel_mercure_boulogne / hotel123')
    console.log('Marchands: merchant_boulangerie / merchant123, merchant_souvenirs / merchant123')
    console.log('Support: support_team / support123, demo_user / demo123')
    
    console.log('\n👤 CLIENTS DE TEST:')
    testClients.forEach(client => {
      console.log(`${client.first_name} ${client.last_name}: ${client.email} / client123`)
    })
    
    console.log('\n📱 UTILISATEURS MOBILE:')
    console.log('Les clients peuvent se connecter avec leur email et mot de passe')
    console.log('Les hôtels et marchands utilisent leur nom d\'utilisateur et mot de passe')
    
    console.log('\n🎯 SCÉNARIOS DE TEST:')
    console.log('- Connexion admin: Gestion des utilisateurs, analytics')
    console.log('- Connexion hôtel: Gestion des commandes, QR codes')
    console.log('- Connexion marchand: Gestion des produits, commandes')
    console.log('- Connexion client: Parcours d\'achat, commandes')
    
    console.log('\n✅ Création des utilisateurs de test terminée avec succès!')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error)
    process.exit(1)
  }
}

// Fonction pour nettoyer les utilisateurs de test (optionnel)
async function cleanupTestUsers() {
  console.log('🧹 Nettoyage des utilisateurs de test...')
  
  try {
    // Supprimer les clients de test
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .like('email', '%@email.com')
    
    if (clientError) {
      console.error('❌ Erreur nettoyage clients:', clientError.message)
    } else {
      console.log('✅ Clients de test supprimés')
    }
    
    // Supprimer les utilisateurs de test
    const testUsernames = [
      'admin_zishop', 'test_hotel_manager', 'test_merchant_manager',
      'support_team', 'demo_user'
    ]
    
    for (const username of testUsernames) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', username)
      
      if (error) {
        console.error(`❌ Erreur suppression ${username}:`, error.message)
      } else {
        console.log(`✅ ${username} supprimé`)
      }
    }
    
    console.log('✅ Nettoyage terminé')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Exécuter le script principal
if (process.argv.includes('--cleanup')) {
  cleanupTestUsers().catch(console.error)
} else {
  createTestUsers().catch(console.error)
}

export { createTestUsers, cleanupTestUsers }
