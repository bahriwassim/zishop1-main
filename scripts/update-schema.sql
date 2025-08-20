-- ======================================
-- MISE À JOUR SCHÉMA POUR IMAGES & DESCRIPTIONS
-- ======================================

-- Ajouter la colonne image_url aux hôtels si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hotels' AND column_name='image_url') THEN
        ALTER TABLE hotels ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée à la table hotels';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà dans hotels';
    END IF;
END $$;

-- Ajouter la colonne description aux hôtels si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hotels' AND column_name='description') THEN
        ALTER TABLE hotels ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée à la table hotels';
    ELSE
        RAISE NOTICE 'Colonne description existe déjà dans hotels';
    END IF;
END $$;

-- Ajouter la colonne description aux marchands si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='merchants' AND column_name='description') THEN
        ALTER TABLE merchants ADD COLUMN description TEXT;
        RAISE NOTICE 'Colonne description ajoutée à la table merchants';
    ELSE
        RAISE NOTICE 'Colonne description existe déjà dans merchants';
    END IF;
END $$;

-- Ajout de la colonne stock à la table products
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 100;

-- Met à jour les produits existants avec un stock par défaut si besoin
UPDATE products SET stock = 100 WHERE stock IS NULL;

-- Index pour optimiser les requêtes sur le stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Vérifier les colonnes ajoutées
SELECT 'COLONNES AJOUTÉES:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('hotels', 'merchants') 
  AND column_name IN ('image_url', 'description')
ORDER BY table_name, column_name; 