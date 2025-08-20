@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    DÉMARRAGE ZISHOP EN DÉVELOPPEMENT
echo ========================================
echo.

echo 🔧 Configuration de l'environnement...
echo.

REM Définir les variables d'environnement pour le développement
set NODE_ENV=development
set DATABASE_URL=

echo ✅ NODE_ENV=development
echo ✅ DATABASE_URL=désactivée (stockage en mémoire)
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
echo 🚀 Démarrage du serveur en mode développement...
echo.

REM Démarrer le serveur avec la configuration de développement
npm run dev

echo.
echo 📱 Serveur arrêté
pause 