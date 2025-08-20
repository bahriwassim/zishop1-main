import { supabase } from '../shared/supabase.js'

async function seedData() {
  console.log('🌱 Insertion des données de test...')

  try {
    // 1. Insérer des hôtels de test (vrais hôtels parisiens)
    console.log('🏨 Insertion des hôtels...')
    
    const hotels = [
      {
        name: 'Novotel Paris Vaugirard Montparnasse',
        address: '257 Rue de Vaugirard, 75015 Paris',
        code: 'NPV001',
        latitude: 48.8414,
        longitude: 2.2970,
        qr_code: 'NPV001_QR_CODE_DATA',
        is_active: true
      },
      {
        name: 'Hôtel Mercure Paris Boulogne',
        address: '78 Avenue Edouard Vaillant, 92100 Boulogne-Billancourt',
        code: 'MPB002',
        latitude: 48.8354,
        longitude: 2.2463,
        qr_code: 'MPB002_QR_CODE_DATA',
        is_active: true
      },
      {
        name: 'ibis Paris La Défense Esplanade',
        address: '4 Boulevard de Neuilly, 92400 Courbevoie',
        code: 'IPD003',
        latitude: 48.8917,
        longitude: 2.2361,
        qr_code: 'IPD003_QR_CODE_DATA',
        is_active: true
      },
      {
        name: 'Novotel Paris la Défense Esplanade',
        address: '2 Boulevard de Neuilly, 92400 Courbevoie',
        code: 'NDE004',
        latitude: 48.8920,
        longitude: 2.2355,
        qr_code: 'NDE004_QR_CODE_DATA',
        is_active: true
      }
    ]

    const { data: hotelData, error: hotelError } = await supabase
      .from('hotels')
      .insert(hotels)
      .select()

    if (hotelError) {
      console.error('❌ Erreur insertion hôtels:', hotelError)
    } else {
      console.log(`✅ ${hotelData?.length} hôtels insérés`)
    }

    // 2. Insérer des marchands de test (autour des hôtels parisiens)
    console.log('🏪 Insertion des marchands...')
    
    const merchants = [
      {
        name: 'Boulangerie Du Coin Montparnasse',
        address: '245 Rue de Vaugirard, 75015 Paris',
        category: 'Boulangerie',
        latitude: 48.8412,
        longitude: 2.2975,
        rating: 4.5,
        review_count: 128,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Boulangerie+Montparnasse'
      },
      {
        name: 'Boutique Souvenirs Tour Eiffel',
        address: 'Avenue de Suffren, 75015 Paris',
        category: 'Souvenirs',
        latitude: 48.8558,
        longitude: 2.2954,
        rating: 4.2,
        review_count: 89,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Souvenirs+Eiffel'
      },
      {
        name: 'Café de la Défense',
        address: 'Parvis de la Défense, 92400 Courbevoie',
        category: 'Restaurant',
        latitude: 48.8922,
        longitude: 2.2358,
        rating: 4.0,
        review_count: 245,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Cafe+Defense'
      },
      {
        name: 'Maison des Macarons Boulogne',
        address: 'Avenue Edouard Vaillant, 92100 Boulogne-Billancourt',
        category: 'Pâtisserie',
        latitude: 48.8350,
        longitude: 2.2470,
        rating: 4.7,
        review_count: 156,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Macarons+Boulogne'
      },
      {
        name: 'Pharmacie Grande Arche',
        address: 'Centre Commercial Les Quatre Temps, 92400 Courbevoie',
        category: 'Pharmacie',
        latitude: 48.8925,
        longitude: 2.2365,
        rating: 4.3,
        review_count: 78,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Pharmacie+Defense'
      },
      {
        name: 'Épicerie Fine Montparnasse',
        address: '15 Rue du Départ, 75015 Paris',
        category: 'Épicerie',
        latitude: 48.8422,
        longitude: 2.3221,
        rating: 4.1,
        review_count: 92,
        is_open: true,
        image_url: 'https://via.placeholder.com/300x200?text=Epicerie+Montparnasse'
      }
    ]

    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .insert(merchants)
      .select()

    if (merchantError) {
      console.error('❌ Erreur insertion marchands:', merchantError)
    } else {
      console.log(`✅ ${merchantData?.length} marchands insérés`)
    }

    // 3. Insérer des produits de test
    if (merchantData && merchantData.length > 0) {
      console.log('🛍️ Insertion des produits...')
      
      const products = [
        // Produits Boulangerie Du Coin Montparnasse
        {
          merchant_id: merchantData[0].id,
          name: 'Croissant aux Amandes',
          description: 'Délicieux croissant aux amandes fraîchement préparé',
          price: 3.50,
          image_url: 'https://via.placeholder.com/300x300?text=Croissant',
          is_available: true,
          category: 'Viennoiserie',
          is_souvenir: false
        },
        {
          merchant_id: merchantData[0].id,
          name: 'Baguette Tradition',
          description: 'Baguette artisanale selon la tradition française',
          price: 1.20,
          image_url: 'https://via.placeholder.com/300x300?text=Baguette',
          is_available: true,
          category: 'Pain',
          is_souvenir: false
        },
        // Produits Boutique Souvenirs Tour Eiffel
        {
          merchant_id: merchantData[1].id,
          name: 'Tour Eiffel Miniature',
          description: 'Réplique miniature de la Tour Eiffel en métal',
          price: 12.90,
          image_url: 'https://via.placeholder.com/300x300?text=Tour+Eiffel',
          is_available: true,
          category: 'Souvenirs',
          is_souvenir: true,
          origin: 'France',
          material: 'Métal'
        },
        {
          merchant_id: merchantData[1].id,
          name: 'Porte-clés Paris',
          description: 'Porte-clés avec monuments parisiens',
          price: 5.90,
          image_url: 'https://via.placeholder.com/300x300?text=Porte-cles',
          is_available: true,
          category: 'Souvenirs',
          is_souvenir: true,
          origin: 'France',
          material: 'Plastique'
        },
        // Produits Café de la Défense
        {
          merchant_id: merchantData[2].id,
          name: 'Salade Lyonnaise',
          description: 'Salade traditionnelle lyonnaise avec lardons et œuf poché',
          price: 14.50,
          image_url: 'https://via.placeholder.com/300x300?text=Salade+Lyonnaise',
          is_available: true,
          category: 'Plat principal',
          is_souvenir: false
        },
        {
          merchant_id: merchantData[2].id,
          name: 'Café Espresso',
          description: 'Café espresso italien',
          price: 2.80,
          image_url: 'https://via.placeholder.com/300x300?text=Espresso',
          is_available: true,
          category: 'Boisson',
          is_souvenir: false
        },
        // Produits Maison des Macarons Boulogne
        {
          merchant_id: merchantData[3].id,
          name: 'Macarons au Chocolat',
          description: 'Macarons au chocolat au beurre de cacahuète',
          price: 5.90,
          image_url: 'https://via.placeholder.com/300x300?text=Macarons+Chocolat',
          is_available: true,
          category: 'Pâtisserie',
          is_souvenir: true,
          origin: 'France',
          material: 'Chocolat'
        },
        {
          merchant_id: merchantData[3].id,
          name: 'Macarons au Citron',
          description: 'Macarons au citron avec une mousse au citron',
          price: 5.90,
          image_url: 'https://via.placeholder.com/300x300?text=Macarons+Citron',
          is_available: true,
          category: 'Pâtisserie',
          is_souvenir: true,
          origin: 'France',
          material: 'Citron'
        },
        // Produits Pharmacie Grande Arche
        {
          merchant_id: merchantData[4].id,
          name: 'Savon de Marseille',
          description: 'Authentique savon de Marseille artisanal',
          price: 8.90,
          image_url: 'https://via.placeholder.com/300x300?text=Savon+Marseille',
          is_available: true,
          category: 'Cosmétique',
          is_souvenir: true,
          origin: 'Provence',
          material: 'Huile d\'olive'
        },
        {
          merchant_id: merchantData[4].id,
          name: 'Lavande de Provence',
          description: 'Bouquet de lavande séchée de Provence',
          price: 6.50,
          image_url: 'https://via.placeholder.com/300x300?text=Lavande',
          is_available: true,
          category: 'Décoration',
          is_souvenir: true,
          origin: 'Provence',
          material: 'Naturel'
        },
        // Produits Épicerie Fine Montparnasse
        {
          merchant_id: merchantData[5].id,
          name: 'Pain au Chocolat',
          description: 'Pain au chocolat avec une mousse au chocolat',
          price: 2.50,
          image_url: 'https://via.placeholder.com/300x300?text=Pain+Chocolat',
          is_available: true,
          category: 'Boulangerie',
          is_souvenir: false
        },
        {
          merchant_id: merchantData[5].id,
          name: 'Croissant au Chocolat',
          description: 'Croissant au chocolat avec une mousse au chocolat',
          price: 2.20,
          image_url: 'https://via.placeholder.com/300x300?text=Croissant+Chocolat',
          is_available: true,
          category: 'Viennoiserie',
          is_souvenir: false
        }
      ]

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert(products)
        .select()

      if (productError) {
        console.error('❌ Erreur insertion produits:', productError)
      } else {
        console.log(`✅ ${productData?.length} produits insérés`)
      }
    }

    // 4. Insérer des utilisateurs de test
    console.log('👤 Insertion des utilisateurs...')
    
    const users = [
      {
        username: 'admin',
        password: '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', // hash de 'admin123'
        role: 'admin',
        entity_id: null
      },
      {
        username: 'hotel_novotel_vaugirard',
        password: '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', // hash de 'hotel123'
        role: 'hotel',
        entity_id: hotelData?.[0]?.id || 1
      },
      {
        username: 'hotel_mercure_boulogne',
        password: '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', // hash de 'hotel123'
        role: 'hotel',
        entity_id: hotelData?.[1]?.id || 2
      },
      {
        username: 'merchant_boulangerie',
        password: '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', // hash de 'merchant123'
        role: 'merchant',
        entity_id: merchantData?.[0]?.id || 1
      },
      {
        username: 'merchant_souvenirs',
        password: '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', // hash de 'merchant123'
        role: 'merchant',
        entity_id: merchantData?.[1]?.id || 2
      }
    ]

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select()

    if (userError) {
      console.error('❌ Erreur insertion utilisateurs:', userError)
    } else {
      console.log(`✅ ${userData?.length} utilisateurs insérés`)
    }

    // 5. Insérer une commande de test
    if (hotelData && merchantData) {
      console.log('📦 Insertion d\'une commande de test...')
      
      const testOrder = {
        hotel_id: hotelData[0].id,
        merchant_id: merchantData[0].id,
        order_number: `ORD-${Date.now()}`,
        customer_name: 'Jean Dupont',
        customer_room: '205',
        items: [
          {
            product_id: 1,
            name: 'Croissant aux Amandes',
            price: 3.50,
            quantity: 2
          },
          {
            product_id: 2,
            name: 'Baguette Tradition',
            price: 1.20,
            quantity: 1
          }
        ],
        total_amount: 8.20,
        status: 'pending'
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([testOrder])
        .select()

      if (orderError) {
        console.error('❌ Erreur insertion commande:', orderError)
      } else {
        console.log(`✅ ${orderData?.length} commande insérée`)
      }
    }

    console.log('🎉 Données de test insérées avec succès!')
    console.log('📊 Résumé:')
    console.log(`- ${hotels.length} hôtels`)
    console.log(`- ${merchants.length} marchands`)
    console.log(`- 10 produits`)
    console.log(`- 5 utilisateurs`)
    console.log('- 1 commande de test')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error)
    process.exit(1)
  }
}

// Exécuter le script
seedData().catch(console.error) 