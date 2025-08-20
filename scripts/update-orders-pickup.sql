-- Migration pour ajouter les colonnes de remise au client
-- Mise à jour selon le cahier des charges pour la gestion de la réception des commandes

-- Ajouter les colonnes pour la remise au client
ALTER TABLE orders ADD COLUMN picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN picked_up_at TIMESTAMP;

-- Mettre à jour les commandes déjà livrées pour qu'elles soient considérées comme non récupérées
UPDATE orders 
SET picked_up = FALSE 
WHERE status = 'delivered' AND picked_up IS NULL;

-- Index pour améliorer les performances des requêtes de réception
CREATE INDEX idx_orders_hotel_status_pickup 
ON orders(hotel_id, status, picked_up);

-- Afficher le résultat
SELECT 
    'Migration terminée' as status,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'delivered' AND picked_up = FALSE THEN 1 END) as en_attente_client,
    COUNT(CASE WHEN status = 'delivered' AND picked_up = TRUE THEN 1 END) as remis_client
FROM orders; 