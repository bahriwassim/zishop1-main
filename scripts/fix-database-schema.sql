-- Script de correction du schéma de base de données ZiShop
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- ==================================================
-- 1. SUPPRESSION DES CONTRAINTES EXISTANTES (SI BESOIN)
-- ==================================================

-- Supprimer les contraintes de clés étrangères existantes
ALTER TABLE IF EXISTS hotel_merchants DROP CONSTRAINT IF EXISTS hotel_merchants_hotel_id_fkey;
ALTER TABLE IF EXISTS hotel_merchants DROP CONSTRAINT IF EXISTS hotel_merchants_merchant_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_merchant_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_hotel_id_fkey;
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_merchant_id_fkey;
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_validated_by_fkey;

-- ==================================================
-- 2. AJOUT DES CONTRAINTES DE CLÉS ÉTRANGÈRES
-- ==================================================

-- Contraintes pour hotel_merchants
ALTER TABLE hotel_merchants 
ADD CONSTRAINT hotel_merchants_hotel_id_fkey 
FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;

ALTER TABLE hotel_merchants 
ADD CONSTRAINT hotel_merchants_merchant_id_fkey 
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- Contraintes pour orders
ALTER TABLE orders 
ADD CONSTRAINT orders_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_merchant_id_fkey 
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT orders_hotel_id_fkey 
FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;

-- Contraintes pour products
ALTER TABLE products 
ADD CONSTRAINT products_merchant_id_fkey 
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

ALTER TABLE products 
ADD CONSTRAINT products_validated_by_fkey 
FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ==================================================
-- 3. VÉRIFICATION DES INDEX
-- ==================================================

-- Créer les index manquants s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_hotel_merchants_hotel_id ON hotel_merchants(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_merchants_merchant_id ON hotel_merchants(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_validated_by ON products(validated_by);

-- ==================================================
-- 4. VÉRIFICATION DES DONNÉES
-- ==================================================

-- Vérifier qu'il n'y a pas de données orphelines
SELECT 'hotel_merchants avec hotel_id invalide' as check_type, COUNT(*) as count
FROM hotel_merchants hm
LEFT JOIN hotels h ON hm.hotel_id = h.id
WHERE h.id IS NULL
UNION ALL
SELECT 'hotel_merchants avec merchant_id invalide' as check_type, COUNT(*) as count
FROM hotel_merchants hm
LEFT JOIN merchants m ON hm.merchant_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT 'orders avec client_id invalide' as check_type, COUNT(*) as count
FROM orders o
LEFT JOIN clients c ON o.client_id = c.id
WHERE o.client_id IS NOT NULL AND c.id IS NULL
UNION ALL
SELECT 'orders avec merchant_id invalide' as check_type, COUNT(*) as count
FROM orders o
LEFT JOIN merchants m ON o.merchant_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT 'orders avec hotel_id invalide' as check_type, COUNT(*) as count
FROM orders o
LEFT JOIN hotels h ON o.hotel_id = h.id
WHERE h.id IS NULL
UNION ALL
SELECT 'products avec merchant_id invalide' as check_type, COUNT(*) as count
FROM products p
LEFT JOIN merchants m ON p.merchant_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT 'products avec validated_by invalide' as check_type, COUNT(*) as count
FROM products p
LEFT JOIN users u ON p.validated_by = u.id
WHERE p.validated_by IS NOT NULL AND u.id IS NULL; 