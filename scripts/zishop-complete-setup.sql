-- ======================================
-- SCRIPT COMPLET ZISHOP SUPABASE
-- Configuration complète de la base de données
-- URL: https://lcyevhpexzcrmbfozqwt.supabase.co
-- ======================================

-- 1. SUPPRESSION ET CRÉATION DES TABLES
-- ======================================

-- Supprimer les tables existantes dans le bon ordre
DROP TABLE IF EXISTS hotel_merchants CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- Supprimer les séquences et fonctions
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Table des hôtels
CREATE TABLE hotels (
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des marchands
CREATE TABLE merchants (
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des produits
CREATE TABLE products (
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
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des clients
CREATE TABLE clients (
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
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_room TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
  merchant_commission DECIMAL(10,2),
  zishop_commission DECIMAL(10,2),
  hotel_commission DECIMAL(10,2),
  delivery_notes TEXT,
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  estimated_delivery TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table des utilisateurs (admin, hotel, merchant)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'hotel', 'merchant')),
  entity_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Table de liaison hôtel-marchand
CREATE TABLE hotel_merchants (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(hotel_id, merchant_id)
);

-- 2. CRÉATION DES INDEX
-- ======================================

CREATE INDEX idx_hotels_code ON hotels(code);
CREATE INDEX idx_hotels_active ON hotels(is_active);
CREATE INDEX idx_merchants_category ON merchants(category);
CREATE INDEX idx_merchants_open ON merchants(is_open);
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_souvenir ON products(is_souvenir);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_orders_hotel_id ON orders(hotel_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_hotel_merchants_hotel_id ON hotel_merchants(hotel_id);
CREATE INDEX idx_hotel_merchants_merchant_id ON hotel_merchants(merchant_id);

-- 3. FONCTIONS ET TRIGGERS
-- ======================================

-- Fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour la mise à jour automatique
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotel_merchants_updated_at BEFORE UPDATE ON hotel_merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Séquence et fonction pour les numéros de commande
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ZS-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') || '-' || LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction de calcul de distance (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 6371;
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

-- 4. CONFIGURATION RLS (ROW LEVEL SECURITY)
-- ======================================

-- Activer RLS sur toutes les tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_merchants ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Lecture publique pour les données de base
CREATE POLICY "Public read access" ON hotels FOR SELECT USING (true);
CREATE POLICY "Public read access" ON merchants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);

-- Politiques RLS - Écriture pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert" ON hotels FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON hotels FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert" ON merchants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON merchants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Politiques RLS - Accès restreint pour clients, commandes et utilisateurs
CREATE POLICY "Users can read own data" ON clients FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON clients FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Authenticated access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON hotel_merchants FOR ALL USING (auth.role() = 'authenticated');

-- 5. INSERTION DES DONNÉES DE TEST
-- ======================================

-- Hôtels parisiens
INSERT INTO hotels (name, address, code, latitude, longitude, qr_code, image_url, description) VALUES
('Novotel Paris Vaugirard Montparnasse', '257 Rue de Vaugirard, 75015 Paris', 'NPV001', 48.8414, 2.2970, 'NPV001_QR_CODE_DATA', 'https://via.placeholder.com/400x300?text=Novotel+Vaugirard', 'Hôtel moderne près de la Tour Eiffel'),
('Hôtel Mercure Paris Boulogne', '78 Avenue Edouard Vaillant, 92100 Boulogne-Billancourt', 'MPB002', 48.8354, 2.2463, 'MPB002_QR_CODE_DATA', 'https://via.placeholder.com/400x300?text=Mercure+Boulogne', 'Hôtel élégant à Boulogne-Billancourt'),
('ibis Paris La Défense Esplanade', '4 Boulevard de Neuilly, 92400 Courbevoie', 'IPD003', 48.8917, 2.2361, 'IPD003_QR_CODE_DATA', 'https://via.placeholder.com/400x300?text=Ibis+Defense', 'Hôtel au cœur du quartier d''affaires'),
('Novotel Paris la Défense Esplanade', '2 Boulevard de Neuilly, 92400 Courbevoie', 'NDE004', 48.8920, 2.2355, 'NDE004_QR_CODE_DATA', 'https://via.placeholder.com/400x300?text=Novotel+Defense', 'Vue panoramique sur La Défense');

-- Boutiques et marchands
INSERT INTO merchants (name, address, category, latitude, longitude, rating, review_count, is_open, image_url, description) VALUES
('Souvenirs Tour Eiffel', 'Avenue de Suffren, 75015 Paris', 'Souvenirs Parisiens', 48.8558, 2.2954, 4.7, 245, true, 'https://via.placeholder.com/300x200?text=Souvenirs+Tour+Eiffel', 'Boutique officielle souvenirs Tour Eiffel'),
('Paris Memories', '15 Rue du Commerce, 75015 Paris', 'Souvenirs Artisanaux', 48.8470, 2.2890, 4.5, 189, true, 'https://via.placeholder.com/300x200?text=Paris+Memories', 'Souvenirs artisanaux authentiques'),
('Artisanat de Montmartre', '2 Place du Tertre, 75018 Paris', 'Art & Souvenirs', 48.8865, 2.3403, 4.8, 312, true, 'https://via.placeholder.com/300x200?text=Artisanat+Montmartre', 'Art et artisanat de Montmartre'),
('Boutique du Marais', '35 Rue des Rosiers, 75004 Paris', 'Cadeaux Parisiens', 48.8571, 2.3625, 4.6, 178, true, 'https://via.placeholder.com/300x200?text=Boutique+Marais', 'Cadeaux raffinés du Marais'),
('Galerie des Souvenirs', 'Centre Commercial Les Quatre Temps, 92400 Courbevoie', 'Souvenirs Luxe', 48.8925, 2.2365, 4.4, 156, true, 'https://via.placeholder.com/300x200?text=Galerie+Souvenirs', 'Souvenirs haut de gamme'),
('Restaurant Le Petit Paris', '12 Avenue de la Grande Armée, 75017 Paris', 'Restaurant', 48.8738, 2.2874, 4.3, 234, true, 'https://via.placeholder.com/300x200?text=Le+Petit+Paris', 'Cuisine française traditionnelle'),
('Boulangerie Artisanale', '5 Rue de Vaugirard, 75015 Paris', 'Boulangerie', 48.8420, 2.2965, 4.6, 156, true, 'https://via.placeholder.com/300x200?text=Boulangerie', 'Pains et viennoiseries artisanales'),
('Café des Deux Mondes', '8 Place de la Défense, 92400 Courbevoie', 'Café', 48.8919, 2.2370, 4.2, 98, true, 'https://via.placeholder.com/300x200?text=Cafe+Deux+Mondes', 'Café cosy avec terrasse');

-- Produits souvenirs et autres
INSERT INTO products (merchant_id, name, description, price, image_url, is_available, category, is_souvenir, origin, material) VALUES
-- Souvenirs Tour Eiffel
(1, 'Tour Eiffel Lumineuse', 'Tour Eiffel miniature avec LED intégrées, 25cm de hauteur', 29.90, 'https://via.placeholder.com/300x300?text=Tour+Eiffel+LED', true, 'Monuments', true, 'France', 'Métal & LED'),
(1, 'Set Tour Eiffel Collector', 'Collection de 3 tours Eiffel en différentes tailles et finitions', 45.00, 'https://via.placeholder.com/300x300?text=Set+Tour+Eiffel', true, 'Monuments', true, 'France', 'Métal doré'),
(1, 'Boule à Neige Paris', 'Boule à neige avec monuments parisiens en miniature', 19.90, 'https://via.placeholder.com/300x300?text=Boule+Neige', true, 'Décorations', true, 'France', 'Verre & Résine'),
(1, 'Magnet Tour Eiffel', 'Magnet décoratif Tour Eiffel pour réfrigérateur', 8.90, 'https://via.placeholder.com/300x300?text=Magnet', true, 'Décorations', true, 'France', 'Métal'),

-- Paris Memories
(2, 'Béret Parisien', 'Béret traditionnel français en laine véritable', 24.90, 'https://via.placeholder.com/300x300?text=Beret', true, 'Mode', true, 'France', 'Laine'),
(2, 'Set Macarons Factices', 'Reproduction parfaite de macarons parisiens pour décoration', 15.90, 'https://via.placeholder.com/300x300?text=Macarons', true, 'Décorations', true, 'France', 'Résine'),
(2, 'Plaque Émaillée Métro', 'Reproduction authentique plaque métro parisien personnalisable', 34.90, 'https://via.placeholder.com/300x300?text=Plaque+Metro', true, 'Décorations', true, 'France', 'Émail'),
(2, 'Calendrier Paris', 'Calendrier perpétuel avec photos de Paris', 18.90, 'https://via.placeholder.com/300x300?text=Calendrier', true, 'Papeterie', true, 'France', 'Papier'),

-- Artisanat de Montmartre
(3, 'Portrait au Fusain', 'Portrait artistique style Montmartre réalisé sur commande', 50.00, 'https://via.placeholder.com/300x300?text=Portrait', true, 'Art', true, 'France', 'Fusain'),
(3, 'Aquarelle de Paris', 'Vue de Paris peinte à l''aquarelle par artiste local', 45.00, 'https://via.placeholder.com/300x300?text=Aquarelle', true, 'Art', true, 'France', 'Aquarelle'),
(3, 'Set Cartes Postales Artistiques', '10 cartes postales originales d''artistes de Montmartre', 12.90, 'https://via.placeholder.com/300x300?text=Cartes+Postales', true, 'Art', true, 'France', 'Papier'),

-- Boutique du Marais
(4, 'Parfum "Paris Je T''aime"', 'Parfum exclusif aux notes parisiennes, 50ml', 55.00, 'https://via.placeholder.com/300x300?text=Parfum', true, 'Parfums', true, 'France', 'Verre'),
(4, 'Sac "Paris Fashion"', 'Sac en toile avec motifs parisiens authentiques', 29.90, 'https://via.placeholder.com/300x300?text=Sac', true, 'Mode', true, 'France', 'Toile'),
(4, 'Bijou Tour Eiffel', 'Collier plaqué or avec pendentif Tour Eiffel', 39.90, 'https://via.placeholder.com/300x300?text=Bijou', true, 'Bijoux', true, 'France', 'Plaqué Or'),

-- Galerie des Souvenirs
(5, 'Montre Paris Luxe', 'Montre avec cadran représentant les monuments de Paris', 89.90, 'https://via.placeholder.com/300x300?text=Montre', true, 'Accessoires', true, 'France', 'Acier & Cuir'),
(5, 'Foulard "Paris Chic"', 'Foulard en soie avec motifs parisiens de luxe', 69.90, 'https://via.placeholder.com/300x300?text=Foulard', true, 'Mode', true, 'France', 'Soie'),
(5, 'Stylo Tour Eiffel', 'Stylo de luxe avec Tour Eiffel en relief doré', 49.90, 'https://via.placeholder.com/300x300?text=Stylo', true, 'Papeterie', true, 'France', 'Métal précieux'),

-- Restaurant Le Petit Paris
(6, 'Menu Traditionnel', 'Entrée, plat, dessert de la cuisine française', 35.00, 'https://via.placeholder.com/300x300?text=Menu', true, 'Restauration', false, 'France', 'Culinaire'),
(6, 'Plateau de Fromages', 'Sélection de fromages français avec pain', 18.00, 'https://via.placeholder.com/300x300?text=Fromages', true, 'Restauration', false, 'France', 'Culinaire'),

-- Boulangerie Artisanale
(7, 'Croissants Artisanaux (6)', 'Pack de 6 croissants pur beurre', 12.00, 'https://via.placeholder.com/300x300?text=Croissants', true, 'Boulangerie', false, 'France', 'Pâtisserie'),
(7, 'Baguette Tradition', 'Baguette tradition française croustillante', 1.50, 'https://via.placeholder.com/300x300?text=Baguette', true, 'Boulangerie', false, 'France', 'Pain'),

-- Café des Deux Mondes
(8, 'Café Espresso', 'Café espresso italien de qualité premium', 3.50, 'https://via.placeholder.com/300x300?text=Espresso', true, 'Boissons', false, 'Italie', 'Café'),
(8, 'Chocolat Chaud Maison', 'Chocolat chaud fait maison avec chantilly', 5.50, 'https://via.placeholder.com/300x300?text=Chocolat', true, 'Boissons', false, 'France', 'Chocolat');

-- Clients de test
INSERT INTO clients (email, password, first_name, last_name, phone) VALUES
('john.smith@email.com', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'John', 'Smith', '+33123456789'),
('marie.dupont@email.com', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'Marie', 'Dupont', '+33987654321'),
('pierre.martin@email.com', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'Pierre', 'Martin', '+33567890123');

-- Utilisateurs système
INSERT INTO users (username, password, role, entity_id) VALUES
('admin', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'admin', null),
('hotel_novotel_vaugirard', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'hotel', 1),
('hotel_mercure_boulogne', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'hotel', 2),
('hotel_ibis_defense', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'hotel', 3),
('hotel_novotel_defense', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'hotel', 4),
('merchant_tour_eiffel', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'merchant', 1),
('merchant_paris_memories', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'merchant', 2),
('merchant_montmartre', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'merchant', 3),
('merchant_marais', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'merchant', 4),
('merchant_galerie', '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', 'merchant', 5);

-- Relations hôtel-marchand
INSERT INTO hotel_merchants (hotel_id, merchant_id, is_active) VALUES
-- Novotel Vaugirard avec boutiques locales
(1, 1, true), -- Souvenirs Tour Eiffel
(1, 2, true), -- Paris Memories
(1, 6, true), -- Restaurant Le Petit Paris
(1, 7, true), -- Boulangerie
-- Mercure Boulogne avec boutiques artistiques
(2, 2, true), -- Paris Memories
(2, 3, true), -- Artisanat de Montmartre
(2, 4, true), -- Boutique du Marais
-- ibis Défense avec commerces modernes
(3, 5, true), -- Galerie des Souvenirs
(3, 8, true), -- Café des Deux Mondes
-- Novotel Défense avec tous types de commerces
(4, 1, true), -- Souvenirs Tour Eiffel
(4, 5, true), -- Galerie des Souvenirs
(4, 6, true), -- Restaurant Le Petit Paris
(4, 8, true); -- Café des Deux Mondes

-- Commandes de test
INSERT INTO orders (hotel_id, merchant_id, client_id, order_number, customer_name, customer_room, items, total_amount, status, merchant_commission, zishop_commission, hotel_commission) VALUES
(1, 1, 1, generate_order_number(), 'John Smith', '205', 
'[{"product_id": 1, "name": "Tour Eiffel Lumineuse", "price": 29.90, "quantity": 1}, {"product_id": 3, "name": "Boule à Neige Paris", "price": 19.90, "quantity": 2}]'::jsonb, 
69.70, 'pending', 52.28, 13.94, 3.48),

(2, 3, 2, generate_order_number(), 'Marie Dupont', '312', 
'[{"product_id": 9, "name": "Portrait au Fusain", "price": 50.00, "quantity": 1}]'::jsonb, 
50.00, 'confirmed', 37.50, 10.00, 2.50),

(3, 5, 3, generate_order_number(), 'Pierre Martin', '108', 
'[{"product_id": 14, "name": "Montre Paris Luxe", "price": 89.90, "quantity": 1}, {"product_id": 16, "name": "Stylo Tour Eiffel", "price": 49.90, "quantity": 1}]'::jsonb, 
139.80, 'preparing', 104.85, 27.96, 6.99);

-- 6. CRÉATION DES VUES UTILES
-- ======================================

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

-- Vue des commandes détaillées
CREATE OR REPLACE VIEW orders_detailed AS
SELECT 
  o.*,
  h.name as hotel_name,
  h.code as hotel_code,
  h.image_url as hotel_image_url,
  m.name as merchant_name,
  m.category as merchant_category,
  m.image_url as merchant_image_url,
  c.first_name as client_first_name,
  c.last_name as client_last_name,
  c.email as client_email
FROM orders o
JOIN hotels h ON o.hotel_id = h.id
JOIN merchants m ON o.merchant_id = m.id
LEFT JOIN clients c ON o.client_id = c.id;

-- Vue des hôtels avec leurs marchands
CREATE OR REPLACE VIEW hotels_with_merchants AS
SELECT 
  h.*,
  COUNT(hm.merchant_id) as merchant_count,
  STRING_AGG(m.name, ', ') as merchant_names
FROM hotels h
LEFT JOIN hotel_merchants hm ON h.id = hm.hotel_id AND hm.is_active = true
LEFT JOIN merchants m ON hm.merchant_id = m.id
GROUP BY h.id, h.name, h.address, h.code, h.latitude, h.longitude, h.qr_code, h.is_active, h.image_url, h.description, h.created_at, h.updated_at;

-- 7. CONFIGURATION DES BUCKETS STORAGE
-- ======================================

-- Créer les buckets pour le stockage des images
INSERT INTO storage.buckets (id, name, public) VALUES 
('hotels', 'hotels', true),
('merchants', 'merchants', true), 
('products', 'products', true),
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les buckets storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('hotels', 'merchants', 'products', 'avatars'));
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');

-- ======================================
-- VÉRIFICATIONS ET RÉSUMÉ
-- ======================================

-- Afficher le résumé des données
SELECT 'ZISHOP DATABASE SETUP COMPLETED!' as status;

SELECT 'SUMMARY:' as info;
SELECT 
  'Hotels' as table_name, 
  count(*) as count, 
  string_agg(name, ', ') as items
FROM hotels
UNION ALL
SELECT 
  'Merchants', 
  count(*), 
  string_agg(name, ', ')
FROM merchants  
UNION ALL
SELECT 
  'Products', 
  count(*), 
  string_agg(name, ', ')
FROM products
UNION ALL
SELECT 
  'Clients', 
  count(*), 
  string_agg(email, ', ')
FROM clients
UNION ALL
SELECT 
  'Users', 
  count(*), 
  string_agg(username, ', ')
FROM users
UNION ALL
SELECT 
  'Orders', 
  count(*), 
  string_agg(order_number, ', ')
FROM orders
UNION ALL
SELECT 
  'Hotel-Merchant Relations', 
  count(*), 
  count(*)::text
FROM hotel_merchants;

-- Connexions recommandées pour test
SELECT 'TEST CONNECTIONS:' as info;
SELECT 'Admin: admin / password123' as credentials
UNION ALL SELECT 'Hotel Novotel: hotel_novotel_vaugirard / password123'
UNION ALL SELECT 'Merchant Tour Eiffel: merchant_tour_eiffel / password123'
UNION ALL SELECT 'Client: john.smith@email.com / password123';

-- ======================================
-- FIN DU SCRIPT
-- ====================================== 