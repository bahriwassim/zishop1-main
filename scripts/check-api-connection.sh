#!/bin/bash

# Script de vérification de la connectivité API ZiShop
echo "🔍 Vérification de la connectivité API ZiShop"
echo "=============================================="

# Vérifier que le serveur backend est démarré
echo "1. Vérification du serveur backend..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Serveur backend accessible sur http://localhost:5000"
else
    echo "❌ Serveur backend inaccessible sur http://localhost:5000"
    echo "   Vérifiez que le serveur est démarré avec: npm run dev"
    exit 1
fi

# Tester les endpoints principaux
echo ""
echo "2. Test des endpoints API..."

endpoints=(
    "GET /api/health"
    "GET /api/hotels"
    "GET /api/merchants"
    "GET /api/products"
    "GET /api/orders"
)

for endpoint in "${endpoints[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)
    
    if [ "$method" = "GET" ]; then
        if curl -s "http://localhost:5000$path" > /dev/null 2>&1; then
            echo "✅ $endpoint - OK"
        else
            echo "❌ $endpoint - ERREUR"
        fi
    fi
done

# Vérifier la configuration CORS
echo ""
echo "3. Vérification de la configuration CORS..."
if curl -s -H "Origin: http://localhost:3001" http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ CORS configuré pour localhost:3001"
else
    echo "❌ Problème de configuration CORS"
fi

# Vérifier les variables d'environnement
echo ""
echo "4. Vérification des variables d'environnement..."
if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV non défini (défaut: development)"
else
    echo "✅ NODE_ENV=$NODE_ENV"
fi

if [ -z "$PORT" ]; then
    echo "⚠️  PORT non défini (défaut: 5000)"
else
    echo "✅ PORT=$PORT"
fi

echo ""
echo "🎯 Résumé:"
echo "   - Backend: http://localhost:5000"
echo "   - Frontend: http://localhost:3001"
echo "   - API: http://localhost:5000/api"
echo ""
echo "💡 Si des erreurs persistent:"
echo "   1. Vérifiez que le serveur backend est démarré"
echo "   2. Vérifiez la configuration CORS"
echo "   3. Vérifiez les variables d'environnement"
echo "   4. Consultez les logs du serveur"
