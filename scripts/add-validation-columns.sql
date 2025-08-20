-- Script pour ajouter les colonnes de validation aux tables hotels et merchants
-- Exécuter ce script si les colonnes n'existent pas déjà

-- Ajouter les colonnes de validation à la table hotels
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS validated_by INTEGER REFERENCES app_users(id) ON DELETE SET NULL;

-- Ajouter les colonnes de validation à la table merchants
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS validated_by INTEGER REFERENCES app_users(id) ON DELETE SET NULL;

-- Créer les index pour les colonnes de validation
CREATE INDEX IF NOT EXISTS idx_hotels_validation_status ON hotels(validation_status);
CREATE INDEX IF NOT EXISTS idx_merchants_validation_status ON merchants(validation_status);

-- Mettre à jour les enregistrements existants pour avoir un statut de validation
UPDATE hotels SET validation_status = 'approved' WHERE validation_status IS NULL;
UPDATE merchants SET validation_status = 'approved' WHERE validation_status IS NULL;

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('hotels', 'merchants') 
    AND column_name LIKE '%validation%'
ORDER BY table_name, column_name;
