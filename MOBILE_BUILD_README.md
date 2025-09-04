# 📱 Guide de Build Mobile - ZiShop avec Capacitor

Ce guide explique comment construire l'application mobile ZiShop en utilisant Capacitor (pas Expo).

## 🚨 Important

**ZiShop utilise Capacitor, pas Expo !** Ne pas utiliser `eas build` ou d'autres commandes Expo.

## 📋 Prérequis

### Pour iOS (macOS uniquement)
- ✅ macOS (requis pour le développement iOS)
- ✅ Xcode installé depuis l'App Store
- ✅ Xcode Command Line Tools
- ✅ Capacitor CLI

### Pour Android
- ✅ Android Studio
- ✅ Android SDK
- ✅ Java JDK (version 11 ou 17)
- ✅ Capacitor CLI

## 🔧 Installation des Dépendances

```bash
# Installer Capacitor CLI globalement
npm install -g @capacitor/cli

# Installer les dépendances du projet
npm install

# Initialiser Capacitor (si pas déjà fait)
npx cap init
```

## 🏗️ Build de l'Application

### 1. Build Web
```bash
# Construire l'application web
npm run build

# Le résultat sera dans dist/public/
```

### 2. Synchronisation Capacitor
```bash
# Synchroniser avec iOS
npx cap sync ios

# Synchroniser avec Android
npx cap sync android
```

### 3. Build Mobile

#### iOS (macOS uniquement)
```bash
# Option 1: Script automatisé
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh

# Option 2: Commandes manuelles
npm run mobile:build:ios
```

#### Android
```bash
# Option 1: Script automatisé
chmod +x scripts/build-android.sh
./scripts/build-android.sh

# Option 2: Commandes manuelles
npm run mobile:build:android
```

## 📱 Ouverture dans les IDEs

### iOS - Xcode
```bash
# Ouvrir le projet dans Xcode
npx cap open ios

# Ou utiliser le script npm
npm run mobile:ios
```

### Android - Android Studio
```bash
# Ouvrir le projet dans Android Studio
npx cap open android

# Ou utiliser le script npm
npm run mobile:android
```

## 🎯 Scripts NPM Disponibles

```json
{
  "mobile:build:web": "vite build",
  "mobile:sync": "npx cap sync",
  "mobile:android": "npx cap sync android && npx cap open android",
  "mobile:ios": "npx cap sync ios && npx cap open ios",
  "mobile:build:ios": "npm run build && npx cap sync ios && npx cap build ios",
  "mobile:build:android": "npm run build && npx cap sync android && npx cap build android"
}
```

## 🔍 Résolution des Problèmes

### Erreur "Cannot find 'expo-modules-autolinking'"
- **Cause** : Vous essayez d'utiliser Expo au lieu de Capacitor
- **Solution** : Utilisez les commandes Capacitor, pas EAS Build

### Erreur "Xcode not found"
- **Cause** : Xcode n'est pas installé sur macOS
- **Solution** : Installer Xcode depuis l'App Store

### Erreur "Android SDK not found"
- **Cause** : Variables d'environnement Android manquantes
- **Solution** : Configurer ANDROID_HOME et JAVA_HOME

### Erreur "Build failed"
- **Cause** : Problème de configuration ou de dépendances
- **Solution** : 
  1. Vérifier que le build web fonctionne
  2. Synchroniser avec Capacitor
  3. Ouvrir dans l'IDE natif pour plus de détails

## 📋 Configuration

### Capacitor Config (`capacitor.config.ts`)
```typescript
{
  appId: 'com.ckizzy1.restexpress',
  appName: 'ZiShop',
  webDir: 'dist/public',
  server: { androidScheme: 'https' },
  ios: { scheme: 'zishop' },
  android: { scheme: 'zishop' }
}
```

### Variables d'Environnement
```bash
# iOS
export CAPACITOR_IOS_TEAM_ID="votre_team_id"
export CAPACITOR_IOS_PROVISIONING_PROFILE="votre_profile"

# Android
export ANDROID_HOME="/path/to/android/sdk"
export JAVA_HOME="/path/to/java/jdk"
```

## 🚀 Déploiement

### iOS App Store
1. Ouvrir le projet dans Xcode
2. Configurer les certificats et profils
3. Archiver l'application
4. Uploader via Organizer

### Google Play Store
1. Ouvrir le projet dans Android Studio
2. Générer un APK signé ou AAB
3. Uploader sur Google Play Console

## 📚 Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide iOS](https://capacitorjs.com/docs/ios)
- [Guide Android](https://capacitorjs.com/docs/android)
- [Configuration Capacitor](https://capacitorjs.com/docs/config)

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de build
2. Consultez la documentation Capacitor
3. Ouvrez le projet dans l'IDE natif pour plus de détails
4. Vérifiez la configuration dans `capacitor.config.ts`


