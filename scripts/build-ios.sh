#!/bin/bash

# Script de build iOS pour ZiShop avec Capacitor
echo "🍎 Build iOS ZiShop avec Capacitor"
echo "=================================="

# Vérifier que nous sommes sur macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Erreur: Ce script doit être exécuté sur macOS pour le build iOS"
    echo "   Utilisez 'npm run mobile:build:android' sur Windows/Linux"
    exit 1
fi

# Vérifier que Xcode est installé
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Erreur: Xcode n'est pas installé"
    echo "   Installez Xcode depuis l'App Store"
    exit 1
fi

# Vérifier que Capacitor CLI est installé
if ! command -v npx &> /dev/null; then
    echo "❌ Erreur: npx n'est pas disponible"
    exit 1
fi

echo "1. 🔨 Build de l'application web..."
if npm run build; then
    echo "✅ Build web réussi"
else
    echo "❌ Erreur lors du build web"
    exit 1
fi

echo ""
echo "2. 📱 Synchronisation avec Capacitor..."
if npx cap sync ios; then
    echo "✅ Synchronisation iOS réussie"
else
    echo "❌ Erreur lors de la synchronisation iOS"
    exit 1
fi

echo ""
echo "3. 🏗️  Build du projet iOS..."
if npx cap build ios; then
    echo "✅ Build iOS réussi"
else
    echo "❌ Erreur lors du build iOS"
    echo ""
    echo "💡 Solutions possibles:"
    echo "   - Ouvrir le projet dans Xcode: npx cap open ios"
    echo "   - Vérifier la configuration iOS dans Xcode"
    echo "   - Vérifier les certificats de développement"
    exit 1
fi

echo ""
echo "🎉 Build iOS terminé avec succès!"
echo ""
echo "📱 Prochaines étapes:"
echo "   1. Ouvrir le projet dans Xcode: npx cap open ios"
echo "   2. Sélectionner un simulateur ou un appareil"
echo "   3. Cliquer sur le bouton Run (▶️)"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Ouvrir dans Xcode: npm run mobile:ios"
echo "   - Synchroniser: npm run mobile:sync"
echo "   - Build complet: npm run mobile:build:ios"


