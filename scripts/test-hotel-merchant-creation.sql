-- Script de test pour vérifier la création d'hôtels et de commerçants
-- Exécuter ce script après avoir testé l'interface utilisateur

-- 1. Vérifier que les tables ont les bonnes colonnes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('hotels', 'merchants') 
    AND column_name IN ('validation_status', 'rejection_reason', 'validated_at', 'validated_by')
ORDER BY table_name, column_name;

-- 2. Vérifier les index de validation
SELECT 
    indexname, 
    tablename, 
    indexdef
FROM pg_indexes 
WHERE tablename IN ('hotels', 'merchants') 
    AND indexname LIKE '%validation%';

-- 3. Tester l'insertion d'un hôtel (si les colonnes existent)
-- INSERT INTO hotels (name, address, code, latitude, longitude, qr_code, is_active, validation_status)
-- VALUES ('Hôtel Test ZiShop', '123 Rue de Test, 75001 Paris', 'ZITEST123', '48.8566', '2.3522', 'https://zishop.co/hotel/ZITEST123', true, 'pending');

-- 4. Vérifier les données existantes
SELECT 
    'hotels' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN validation_status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN validation_status = 'pending' THEN 1 END) as pending_count
FROM hotels
UNION ALL
SELECT 
    'merchants' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN validation_status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN validation_status = 'pending' THEN 1 END) as pending_count
FROM merchants;

-- 5. Afficher un exemple d'hôtel et de commerçant
SELECT 'Hôtels existants:' as info;
SELECT id, name, code, validation_status, created_at FROM hotels LIMIT 3;

SELECT 'Commerçants existants:' as info;
SELECT id, name, category, validation_status, created_at FROM merchants LIMIT 3;
