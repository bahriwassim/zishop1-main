#!/bin/bash

# Script de build Android pour ZiShop avec Capacitor
echo "🤖 Build Android ZiShop avec Capacitor"
echo "======================================"

# Vérifier que Capacitor CLI est installé
if ! command -v npx &> /dev/null; then
    echo "❌ Erreur: npx n'est pas disponible"
    exit 1
fi

# Vérifier que Android Studio est installé (optionnel)
if ! command -v adb &> /dev/null; then
    echo "⚠️  Avertissement: ADB n'est pas dans le PATH"
    echo "   Assurez-vous qu'Android Studio est installé"
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
if npx cap sync android; then
    echo "✅ Synchronisation Android réussie"
else
    echo "❌ Erreur lors de la synchronisation Android"
    exit 1
fi

echo ""
echo "3. 🏗️  Build du projet Android..."
if npx cap build android; then
    echo "✅ Build Android réussi"
else
    echo "❌ Erreur lors du build Android"
    echo ""
    echo "💡 Solutions possibles:"
    echo "   - Ouvrir le projet dans Android Studio: npx cap open android"
    echo "   - Vérifier que le SDK Android est installé"
    echo "   - Vérifier les variables d'environnement ANDROID_HOME"
    exit 1
fi

echo ""
echo "🎉 Build Android terminé avec succès!"
echo ""
echo "📱 Prochaines étapes:"
echo "   1. Ouvrir le projet dans Android Studio: npx cap open android"
echo "   2. Sélectionner un émulateur ou un appareil"
echo "   3. Cliquer sur le bouton Run (▶️)"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Ouvrir dans Android Studio: npm run mobile:android"
echo "   - Synchroniser: npm run mobile:sync"
echo "   - Build complet: npm run mobile:build:android"
echo ""
echo "📋 Variables d'environnement requises:"
echo "   - ANDROID_HOME: Chemin vers le SDK Android"
echo "   - JAVA_HOME: Chemin vers le JDK"
echo "   - PATH: Inclure platform-tools et tools"


