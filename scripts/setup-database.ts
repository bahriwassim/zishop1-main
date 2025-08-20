import { db } from "../server/storage";
import { sql } from "drizzle-orm";

async function setupDatabase() {
  console.log("🔧 Configuration de la base de données...");

  try {
    // 1. Créer les tables si elles n'existent pas
    console.log("\n1. Création des tables...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        qr_code TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        latitude TEXT NOT NULL,
        longitude TEXT NOT NULL,
        rating TEXT DEFAULT '0.0' NOT NULL,
        review_count INTEGER DEFAULT 0 NOT NULL,
        is_open BOOLEAN DEFAULT TRUE NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        entity_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        has_completed_tutorial BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT TRUE NOT NULL,
        category TEXT NOT NULL,
        is_souvenir BOOLEAN DEFAULT FALSE NOT NULL,
        origin TEXT,
        material TEXT,
        stock INTEGER DEFAULT 100,
        validation_status TEXT DEFAULT 'pending' NOT NULL,
        rejection_reason TEXT,
        validated_at TIMESTAMP,
        validated_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        hotel_id INTEGER NOT NULL,
        merchant_id INTEGER NOT NULL,
        client_id INTEGER,
        order_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_room TEXT NOT NULL,
        items JSONB NOT NULL,
        total_amount TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        merchant_commission TEXT,
        zishop_commission TEXT,
        hotel_commission TEXT,
        delivery_notes TEXT,
        confirmed_at TIMESTAMP,
        delivered_at TIMESTAMP,
        estimated_delivery TIMESTAMP,
        picked_up BOOLEAN DEFAULT FALSE,
        picked_up_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hotel_merchants (
        id SERIAL PRIMARY KEY,
        hotel_id INTEGER NOT NULL,
        merchant_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log("✅ Tables créées avec succès");

    // 2. Créer les contraintes de clés étrangères
    console.log("\n2. Création des contraintes de clés étrangères...");

    // Supprimer les contraintes existantes si elles existent
    await db.execute(sql`DROP CONSTRAINT IF EXISTS hotel_merchants_hotel_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS hotel_merchants_merchant_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS orders_client_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS orders_merchant_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS orders_hotel_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS products_merchant_id_fkey`);
    await db.execute(sql`DROP CONSTRAINT IF EXISTS products_validated_by_fkey`);

    // Créer les nouvelles contraintes
    await db.execute(sql`
      ALTER TABLE hotel_merchants 
      ADD CONSTRAINT hotel_merchants_hotel_id_fkey 
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE hotel_merchants 
      ADD CONSTRAINT hotel_merchants_merchant_id_fkey 
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    `);

    await db.execute(sql`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_merchant_id_fkey 
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE orders 
      ADD CONSTRAINT orders_hotel_id_fkey 
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE products 
      ADD CONSTRAINT products_merchant_id_fkey 
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
    `);

    await db.execute(sql`
      ALTER TABLE products 
      ADD CONSTRAINT products_validated_by_fkey 
      FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
    `);

    console.log("✅ Contraintes de clés étrangères créées avec succès");

    // 3. Créer des index pour améliorer les performances
    console.log("\n3. Création des index...");

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_hotels_code ON hotels(code)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_hotel_merchants_hotel_id ON hotel_merchants(hotel_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_hotel_merchants_merchant_id ON hotel_merchants(merchant_id)`);

    console.log("✅ Index créés avec succès");

    // 4. Vérifier la structure finale
    console.log("\n4. Vérification de la structure...");

    const constraints = await db.execute(sql`
      SELECT 
        tc.constraint_name,
        tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_name as target_table,
        ccu.column_name as target_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);

    console.log("\n📋 Contraintes créées:");
    constraints.forEach((constraint: any) => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.source_table}.${constraint.source_column} -> ${constraint.target_table}.${constraint.target_column}`);
    });

    console.log("\n🎉 Configuration de la base de données terminée avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
    throw error;
  }
}

// Exécuter la configuration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log("✅ Configuration terminée avec succès !");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Configuration échouée:", error);
      process.exit(1);
    });
}

export { setupDatabase };