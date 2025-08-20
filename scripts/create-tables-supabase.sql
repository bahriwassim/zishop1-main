-- ======================================
-- SCRIPT DE CRÉATION DES TABLES SUPABASE
-- ZiShop E-commerce Hotel System
-- Compatibilité avec Supabase Auth
-- ======================================

-- Note: La table 'users' est automatiquement créée par Supabase Auth
-- Nous créons 'app_users' pour nos données métier

-- 1. Créer les tables principales

-- Table des hôtels
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des marchands
CREATE TABLE IF NOT EXISTS merchants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  rating TEXT DEFAULT '0.0' NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,
  is_open BOOLEAN DEFAULT true NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des utilisateurs métier (séparée de auth.users)
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  entity_id INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true NOT NULL,
  category TEXT NOT NULL,
  is_souvenir BOOLEAN DEFAULT false NOT NULL,
  origin TEXT,
  material TEXT,
  stock INTEGER DEFAULT 100,
  validation_status TEXT DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  validated_at TIMESTAMP,
  validated_by INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  has_completed_tutorial BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
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
  picked_up BOOLEAN DEFAULT false,
  picked_up_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des associations hôtel-marchand
CREATE TABLE IF NOT EXISTS hotel_merchants (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(hotel_id, merchant_id)
);

-- 2. Créer les index pour optimiser les performances

-- Index pour hotels
CREATE INDEX IF NOT EXISTS idx_hotels_code ON hotels(code);
CREATE INDEX IF NOT EXISTS idx_hotels_active ON hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_latitude ON hotels(latitude);
CREATE INDEX IF NOT EXISTS idx_hotels_longitude ON hotels(longitude);

-- Index pour merchants
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_latitude ON merchants(latitude);
CREATE INDEX IF NOT EXISTS idx_merchants_longitude ON merchants(longitude);
CREATE INDEX IF NOT EXISTS idx_merchants_open ON merchants(is_open);

-- Index pour app_users
CREATE INDEX IF NOT EXISTS idx_users_username ON app_users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_users_entity_id ON app_users(entity_id);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON app_users(supabase_user_id);

-- Index pour products
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_validation_status ON products(validation_status);

-- Index pour clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Index pour orders
CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 3. Créer les fonctions de mise à jour automatique des timestamps

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Appliquer les triggers de mise à jour automatique

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_merchants_updated_at BEFORE UPDATE ON hotel_merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Insérer des données de test (optionnel)

-- Insertion des hôtels de test
INSERT INTO hotels (name, address, code, latitude, longitude, qr_code) VALUES
('Hôtel des Champs-Élysées', '123 Avenue des Champs-Élysées, 75008 Paris', 'ZI75015', '48.8698679', '2.3072976', 'QR_ZI75015'),
('Le Grand Hôtel', '2 Rue Scribe, 75009 Paris', 'ZI75001', '48.8708679', '2.3312976', 'QR_ZI75001'),
('Hôtel Marais', '12 Rue de Rivoli, 75004 Paris', 'ZI75003', '48.8558679', '2.3552976', 'QR_ZI75003')
ON CONFLICT (code) DO NOTHING;

-- Insertion des marchands de test
INSERT INTO merchants (name, address, category, latitude, longitude, rating, review_count) VALUES
('Souvenirs de Paris', '45 Rue de Rivoli, 75001 Paris', 'Souvenirs', '48.8718679', '2.3082976', '4.8', 127),
('Art & Craft Paris', '78 Boulevard Saint-Germain, 75005 Paris', 'Artisanat', '48.8688679', '2.3102976', '4.2', 89),
('Galerie Française', '25 Rue du Louvre, 75001 Paris', 'Galerie', '48.8638679', '2.3122976', '4.9', 203)
ON CONFLICT DO NOTHING;

-- Insertion des utilisateurs de test (admin, hotel, merchant)
INSERT INTO app_users (username, role, entity_id) VALUES
('admin', 'admin', NULL),
('hotel1', 'hotel', 1),
('merchant1', 'merchant', 1)
ON CONFLICT (username) DO NOTHING;

-- Politique de sécurité RLS (Row Level Security) pour Supabase
-- Activer RLS sur toutes les tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_merchants ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité de base (ajustables selon les besoins)
-- Permettre la lecture publique pour les hôtels et marchands
CREATE POLICY "Allow public read access on hotels" ON hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access on merchants" ON merchants FOR SELECT USING (is_open = true);

-- Permettre aux utilisateurs authentifiés de lire les produits
CREATE POLICY "Allow authenticated read access on products" ON products FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre aux admins de tout faire
CREATE POLICY "Allow admin full access" ON hotels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM app_users 
    WHERE supabase_user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- ======================================
-- FIN DU SCRIPT
-- ======================================

-- Pour exécuter ce script dans Supabase :
-- 1. Copiez le contenu
-- 2. Allez dans l'éditeur SQL de Supabase
-- 3. Collez et exécutez le script
-- 4. Vérifiez que toutes les tables et index sont créés

