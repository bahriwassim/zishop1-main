-- ======================================
-- AJOUT DES COLONNES MANQUANTES
-- ======================================

-- Ajouter image_url à la table hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ajouter description à la table hotels  
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS description TEXT;

-- Ajouter description à la table merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS description TEXT;

-- Vérifier que les colonnes ont été ajoutées
SELECT 'Colonnes ajoutées avec succès!' as message;

-- Afficher les colonnes des tables
\d hotels;
\d merchants; 