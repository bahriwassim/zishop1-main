# Instructions pour publier ZiShop sur l'App Store

## Configuration actuelle
- **Bundle ID**: `com.startindev.zishop`
- **App Name**: ZiShop
- **Serveur de production**: http://66.29.155.41:5000
- **Compte Apple Developer**: contact@startindev.com

## Étape 1: Configuration App Store Connect

1. **Se connecter sur App Store Connect**
   - URL: https://appstoreconnect.apple.com
   - Email: contact@startindev.com
   - Mot de passe: Startindev#25

2. **Créer une nouvelle app**
   - Cliquer sur "My Apps" → "+"
   - Bundle ID: `com.startindev.zishop`
   - Name: "ZiShop"
   - Platform: iOS
   - Language: French (France)
   - SKU: zishop-ios-v1

## Étape 2: Option 1 - GitHub Actions (Recommandé)

1. **Pousser le code sur GitHub**
   ```bash
   git add .
   git commit -m "Configure iOS build for production"
   git push origin main
   ```

2. **Configurer les secrets GitHub**
   - Aller sur GitHub → Settings → Secrets and variables → Actions
   - Ajouter ces secrets:
     - `APPLE_ID`: contact@startindev.com
     - `APPLE_ID_PASSWORD`: Startindev#25
     - `APPLE_TEAM_ID`: [À récupérer depuis developer.apple.com]

3. **Lancer le workflow**
   - Aller sur Actions → "Build iOS App"
   - Cliquer "Run workflow"

## Étape 3: Option 2 - Codemagic (Alternative)

1. **Créer compte Codemagic**
   - URL: https://codemagic.io
   - Se connecter avec GitHub

2. **Connecter le repository**
   - Le fichier `codemagic.yaml` sera détecté automatiquement
   - Configurer les certificats iOS dans les paramètres

3. **Lancer le build**
   - Le build se lancera automatiquement sur push

## Étape 4: Métadonnées App Store

### Informations requises:
- **Description**: "Marketplace de souvenirs locaux pour hôtels. Commandez directement dans votre chambre."
- **Mots-clés**: "hôtel,souvenir,shopping,commande,tourisme"
- **Catégorie**: Commerce ou Voyages
- **Screenshots**: Préparer pour iPhone (6.5", 5.5") et iPad

### Icône App Store:
- Format: PNG, 1024x1024 pixels
- Pas de transparence, pas d'effets arrondis
- Fichier disponible: `client/src/assets/images/logos/icon-primary.png`

## Étape 5: TestFlight puis App Store

1. **TestFlight** (test interne):
   - L'app apparaîtra automatiquement après le build
   - Inviter des testeurs avec l'email contact@startindev.com

2. **Soumission App Store**:
   - Après tests → "Submit for Review"
   - Temps d'approbation: 24-48h généralement

## Commandes utiles

```bash
# Build local pour test
npm run build
npm run mobile:sync

# Vérifier la configuration
cat app.json
cat capacitor.config.ts

# Test API production
curl http://66.29.155.41:5000/api/hotels
```

## Troubleshooting

- **Problème de certificat**: Vérifier dans Apple Developer console
- **Build qui échoue**: Vérifier les logs dans le service CI/CD
- **API non accessible**: Vérifier que le serveur 66.29.155.41 est actif

## Notes importantes

⚠️ **Bundle ID unique**: `com.startindev.zishop` doit être créé dans Apple Developer
⚠️ **HTTPS recommandé**: Pour la production, migrer vers HTTPS
⚠️ **Certificats**: Générer les certificats iOS dans Apple Developer Console