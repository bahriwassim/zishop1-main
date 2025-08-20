-- ======================================
-- SCRIPT DE CRÉATION DES TABLES SUPABASE
-- ZiShop E-commerce Hotel System
-- ======================================

-- 1. Supprimer les tables existantes si nécessaire (à décommenter si besoin)
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS merchants CASCADE;
-- DROP TABLE IF EXISTS hotels CASCADE;

-- 2. Créer les tables

-- Table des hôtels
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  qr_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des marchands
CREATE TABLE IF NOT EXISTS merchants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0 NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,
  is_open BOOLEAN DEFAULT true NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true NOT NULL,
  category TEXT NOT NULL,
  is_souvenir BOOLEAN DEFAULT false NOT NULL,
  origin TEXT,
  material TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_room TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'hotel', 'merchant')),
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_hotels_code ON hotels(code);
CREATE INDEX IF NOT EXISTS idx_hotels_active ON hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_open ON merchants(is_open);
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_souvenir ON products(is_souvenir);
CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Créer la fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Créer les triggers pour la mise à jour automatique
DROP TRIGGER IF EXISTS update_hotels_updated_at ON hotels;
CREATE TRIGGER update_hotels_updated_at 
  BEFORE UPDATE ON hotels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
CREATE TRIGGER update_merchants_updated_at 
  BEFORE UPDATE ON merchants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Activer Row Level Security (RLS)
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques de sécurité simplifiées

-- Politiques pour les hôtels (lecture publique, écriture pour authentifiés)
DROP POLICY IF EXISTS "Enable read access for all users" ON hotels;
CREATE POLICY "Enable read access for all users" ON hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON hotels;
CREATE POLICY "Enable insert for authenticated users" ON hotels FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON hotels;
CREATE POLICY "Enable update for authenticated users" ON hotels FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour les marchands (lecture publique, écriture pour authentifiés)
DROP POLICY IF EXISTS "Enable read access for all users" ON merchants;
CREATE POLICY "Enable read access for all users" ON merchants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON merchants;
CREATE POLICY "Enable insert for authenticated users" ON merchants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON merchants;
CREATE POLICY "Enable update for authenticated users" ON merchants FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour les produits (lecture publique, écriture pour authentifiés)
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON products;
CREATE POLICY "Enable insert for authenticated users" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON products;
CREATE POLICY "Enable update for authenticated users" ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour les commandes (lecture et écriture pour utilisateurs authentifiés)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
CREATE POLICY "Enable read access for authenticated users" ON orders FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON orders;
CREATE POLICY "Enable insert for authenticated users" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;
CREATE POLICY "Enable update for authenticated users" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques pour les utilisateurs (accès restreint aux authentifiés)
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON users;
CREATE POLICY "Enable read access for authenticated users only" ON users FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Créer des vues utiles

-- Vue des produits avec informations du marchand
CREATE OR REPLACE VIEW products_with_merchant AS
SELECT 
  p.*,
  m.name as merchant_name,
  m.category as merchant_category,
  m.rating as merchant_rating,
  m.is_open as merchant_is_open,
  m.address as merchant_address,
  m.image_url as merchant_image_url,
  m.description as merchant_description
FROM products p
JOIN merchants m ON p.merchant_id = m.id;

-- Vue des commandes avec détails
CREATE OR REPLACE VIEW orders_detailed AS
SELECT 
  o.*,
  h.name as hotel_name,
  h.code as hotel_code,
  h.image_url as hotel_image_url,
  m.name as merchant_name,
  m.category as merchant_category,
  m.image_url as merchant_image_url
FROM orders o
JOIN hotels h ON o.hotel_id = h.id
JOIN merchants m ON o.merchant_id = m.id;

-- 9. Créer des fonctions utiles

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Séquence pour les numéros de commande
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Fonction pour calculer la distance entre deux points (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371; -- Rayon de la Terre en km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);
  
  a := SIN(dLat/2) * SIN(dLat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dLon/2) * SIN(dLon/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- FIN DU SCRIPT
-- ======================================

-- Pour vérifier que tout s'est bien passé :
SELECT 'Tables créées avec succès!' as message;

-- Compter les tables créées
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('hotels', 'merchants', 'products', 'orders', 'users')
ORDER BY tablename; 