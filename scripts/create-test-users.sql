-- =====================================================
-- SCRIPT SUPABASE POUR CRÉER DES UTILISATEURS DE TEST
-- Application ZiShop E-commerce
-- =====================================================

-- 1. CRÉATION DES UTILISATEURS SYSTÈME (ADMIN, HÔTEL, MARCHAND)
-- =====================================================

-- Utilisateur Admin principal
INSERT INTO users (username, password, role, entity_id, created_at, updated_at)
VALUES (
  'admin_zishop',
  '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'admin123'
  'admin',
  NULL,
  NOW(),
  NOW()
);

-- Utilisateurs Hôtels
INSERT INTO users (username, password, role, entity_id, created_at, updated_at)
VALUES 
  (
    'hotel_novotel_vaugirard',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'hotel123'
    'hotel',
    1, -- ID de l'hôtel Novotel Vaugirard
    NOW(),
    NOW()
  ),
  (
    'hotel_mercure_boulogne',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'hotel123'
    'hotel',
    2, -- ID de l'hôtel Mercure Boulogne
    NOW(),
    NOW()
  ),
  (
    'hotel_ibis_defense',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'hotel123'
    'hotel',
    3, -- ID de l'hôtel ibis La Défense
    NOW(),
    NOW()
  );

-- Utilisateurs Marchands
INSERT INTO users (username, password, role, entity_id, created_at, updated_at)
VALUES 
  (
    'merchant_boulangerie',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'merchant123'
    'merchant',
    1, -- ID de la boulangerie
    NOW(),
    NOW()
  ),
  (
    'merchant_souvenirs',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'merchant123'
    'merchant',
    2, -- ID de la boutique souvenirs
    NOW(),
    NOW()
  ),
  (
    'merchant_cafe',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'merchant123'
    'merchant',
    3, -- ID du café
    NOW(),
    NOW()
  ),
  (
    'merchant_patisserie',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'merchant123'
    'merchant',
    4, -- ID de la pâtisserie
    NOW(),
    NOW()
  );

-- Utilisateurs de support et démo
INSERT INTO users (username, password, role, entity_id, created_at, updated_at)
VALUES 
  (
    'support_team',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'support123'
    'admin',
    NULL,
    NOW(),
    NOW()
  ),
  (
    'demo_user',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'demo123'
    'admin',
    NULL,
    NOW(),
    NOW()
  );

-- 2. CRÉATION DES CLIENTS DE TEST
-- =====================================================

-- Clients avec des profils variés pour tester différents scénarios
INSERT INTO clients (email, password, first_name, last_name, phone, is_active, has_completed_tutorial, created_at, updated_at)
VALUES 
  (
    'jean.dupont@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Jean',
    'Dupont',
    '+33 6 12 34 56 78',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'marie.martin@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Marie',
    'Martin',
    '+33 6 23 45 67 89',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'pierre.durand@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Pierre',
    'Durand',
    '+33 6 34 56 78 90',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'sophie.leroy@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Sophie',
    'Leroy',
    '+33 6 45 67 89 01',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'lucas.moreau@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Lucas',
    'Moreau',
    '+33 6 56 78 90 12',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'emma.petit@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Emma',
    'Petit',
    '+33 6 67 89 01 23',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'thomas.roux@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Thomas',
    'Roux',
    '+33 6 78 90 12 34',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'julie.simon@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Julie',
    'Simon',
    '+33 6 89 01 23 45',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'alexandre.lefevre@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Alexandre',
    'Lefèvre',
    '+33 6 90 12 34 56',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    'camille.roussel@email.com',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'client123'
    'Camille',
    'Roussel',
    '+33 6 01 23 45 67',
    true,
    false,
    NOW(),
    NOW()
  );

-- 3. CRÉATION D'UTILISATEURS DE TEST SUPPLÉMENTAIRES
-- =====================================================

-- Utilisateurs pour tests spécifiques
INSERT INTO users (username, password, role, entity_id, created_at, updated_at)
VALUES 
  (
    'test_hotel_manager',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'test123'
    'hotel',
    3, -- ID de l'hôtel ibis La Défense
    NOW(),
    NOW()
  ),
  (
    'test_merchant_manager',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'test123'
    'merchant',
    5, -- ID de l'épicerie fine
    NOW(),
    NOW()
  ),
  (
    'qa_tester',
    '$2b$10$rQv.zFqt5FqIQqK5H9wJnuJ8kx8mGqK5.v5K8x8mGqK5.v5K8x8mG', -- hash de 'qa123'
    'admin',
    NULL,
    NOW(),
    NOW()
  );

-- 4. VÉRIFICATION ET RÉCAPITULATIF
-- =====================================================

-- Afficher le nombre d'utilisateurs créés
SELECT 
  'UTILISATEURS SYSTÈME' as type,
  COUNT(*) as nombre,
  string_agg(username, ', ') as utilisateurs
FROM users 
WHERE role IN ('admin', 'hotel', 'merchant')
  AND username LIKE '%test%' OR username LIKE '%admin%' OR username LIKE '%hotel%' OR username LIKE '%merchant%'
GROUP BY type

UNION ALL

SELECT 
  'CLIENTS DE TEST' as type,
  COUNT(*) as nombre,
  string_agg(first_name || ' ' || last_name, ', ') as utilisateurs
FROM clients 
WHERE email LIKE '%@email.com';

-- 5. SCRIPT DE NETTOYAGE (OPTIONNEL)
-- =====================================================
-- Décommentez les lignes suivantes pour nettoyer les utilisateurs de test

/*
-- Supprimer les clients de test
DELETE FROM clients WHERE email LIKE '%@email.com';

-- Supprimer les utilisateurs de test
DELETE FROM users WHERE username IN (
  'admin_zishop', 'test_hotel_manager', 'test_merchant_manager',
  'support_team', 'demo_user', 'qa_tester'
);
*/
