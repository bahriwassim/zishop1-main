@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    DÉMARRAGE ZISHOP EN PRODUCTION
echo ========================================
echo.

echo 🔧 Configuration de l'environnement...
echo.

REM Vérifier que NODE_ENV est défini
if "%NODE_ENV%"=="" (
    set NODE_ENV=production
    echo ✅ NODE_ENV=production (défini automatiquement)
) else (
    echo ✅ NODE_ENV=%NODE_ENV%
)

REM Vérifier la configuration de la base de données
if "%DATABASE_URL%"=="" (
    echo ❌ ERREUR: DATABASE_URL n'est pas définie
    echo.
    echo 📋 Configuration requise pour la production:
    echo    DATABASE_URL=postgresql://user:password@host:port/database
    echo.
    echo 💡 Exemple Supabase:
    echo    DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
    echo.
    echo 🔧 Solutions:
    echo    1. Créer un fichier .env avec DATABASE_URL
    echo    2. Définir la variable d'environnement DATABASE_URL
    echo    3. Utiliser le mode développement: start-dev.bat
    echo.
    pause
    exit /b 1
)

echo ✅ DATABASE_URL configurée
echo.

REM Valider l'URL de la base de données
echo 🔍 Validation de l'URL de base de données...
echo %DATABASE_URL% | findstr /i "postgres" >nul
if %errorlevel% neq 0 (
    echo ❌ ERREUR: DATABASE_URL doit commencer par postgres:// ou postgresql://
    pause
    exit /b 1
)

echo ✅ Format de l'URL valide
echo.

echo 📦 Vérification des dépendances...
if not exist "node_modules" (
    echo Installation des dépendances...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées
) else (
    echo ✅ Dépendances déjà installées
)

echo.
echo 🏗️  Construction de l'application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la construction
    pause
    exit /b 1
)

echo ✅ Application construite
echo.
echo 🚀 Démarrage du serveur en production...
echo.

REM Démarrer le serveur en production
npm start

echo.
echo 📱 Serveur arrêté
pause
