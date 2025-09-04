@echo off
echo.
echo ==========================================
echo    ZISHOP - DEPLOIEMENT iOS APP STORE
echo ==========================================
echo.

echo 🚀 Etape 1: Build de l'application...
call npm run build
if errorlevel 1 (
    echo ❌ Erreur lors du build
    pause
    exit /b 1
)
echo ✅ Build terminé avec succès !
echo.

echo 📱 Etape 2: Vérification des assets iOS...
if exist "dist\public\manifest.webmanifest" (
    echo ✅ Manifest PWA trouvé
) else (
    echo ❌ Manifest PWA manquant
    pause
    exit /b 1
)

if exist "dist\public\pwa-192x192.png" (
    echo ✅ Icons PWA trouvées
) else (
    echo ❌ Icons PWA manquantes
    pause
    exit /b 1
)

if exist "dist\public\sw.js" (
    echo ✅ Service Worker trouvé
) else (
    echo ❌ Service Worker manquant
    pause
    exit /b 1
)

echo.
echo 🎉 VOTRE APP EST PRÊTE POUR L'APP STORE !
echo.
echo 📋 Informations de l'app:
echo    • Nom: ZiShop - Marketplace Mobile
echo    • Bundle ID: com.startindev.zishop  
echo    • Version: 1.0.0
echo    • Taille: ~885KB
echo.
echo 🔗 PROCHAINES ÉTAPES:
echo.
echo 1. APPLE DEVELOPER PROGRAM (OBLIGATOIRE):
echo    👉 https://developer.apple.com/programs/
echo    💰 99$ USD/an
echo    📧 contact@startindev.com / Startindev#25
echo.
echo 2. PWABUILDER - GÉNÉRATION iOS (5 min):
echo    👉 https://www.pwabuilder.com
echo    🌐 URL: http://66.29.155.41:5000
echo    📥 Télécharger le package iOS
echo.
echo 3. APP STORE CONNECT:
echo    👉 https://appstoreconnect.apple.com  
echo    📱 Créer nouvelle app avec Bundle ID: com.startindev.zishop
echo    📤 Upload du package iOS
echo.
echo ⚡ ALTERNATIVE RAPIDE - CORDOVA:
echo    Voulez-vous générer un build Cordova local? (o/n)

set /p choice="Votre choix: "
if /i "%choice%"=="o" (
    echo.
    echo 🔧 Installation et build Cordova...
    call npm install -g cordova
    call cordova create zishop-ios com.startindev.zishop "ZiShop"
    cd zishop-ios
    xcopy "..\dist\public\*" "www\" /E /Y
    call cordova platform add ios
    call cordova prepare ios
    echo.
    echo ✅ Projet Cordova créé dans le dossier 'zishop-ios'
    echo 📁 Utilisez un service cloud pour build iOS (PhoneGap Build, etc.)
    cd ..
)

echo.
echo 🏆 VOTRE ZISHOP SERA SUR L'APP STORE BIENTÔT !
echo.
pause