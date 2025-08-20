import fs from 'fs';
import path from 'path';
import { storage } from '../server/storage';

async function setupEnvironment() {
  console.log('🚀 Configuration de l\'environnement ZiShop...\n');
  
  // 1. Créer le fichier .env s'il n'existe pas
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📁 Création du fichier .env...');
    const envTemplate = `# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/zishop"

# Supabase Configuration (optionnel)
SUPABASE_URL="your_supabase_url_here"
SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Session Configuration
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Environment
NODE_ENV="development"
`;
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Fichier .env créé');
  } else {
    console.log('✅ Fichier .env existe déjà');
  }
  
  // 2. Test de connexion à la base de données
  console.log('\n🔌 Test de connexion à la base de données...');
  try {
    await storage.getAllHotels();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.log('❌ Erreur de connexion à la base de données:', error);
    console.log('\n📝 Instructions pour configurer la base de données:');
    console.log('1. Installer PostgreSQL');
    console.log('2. Créer une base de données "zishop"');
    console.log('3. Mettre à jour DATABASE_URL dans le fichier .env');
    console.log('4. Exécuter: npm run db:push');
    return false;
  }
  
  // 3. Vérifier/créer les utilisateurs par défaut
  console.log('\n👤 Configuration des utilisateurs par défaut...');
  try {
    const adminUser = await storage.getUserByUsername('admin');
    if (!adminUser) {
      console.log('Creating default admin user...');
      await storage.createUser({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        entityId: null
      });
      console.log('✅ Utilisateur admin créé (admin/admin123)');
    } else {
      console.log('✅ Utilisateur admin existe déjà');
    }
  } catch (error) {
    console.log('❌ Erreur lors de la création de l\'utilisateur admin:', error);
  }
  
  console.log('\n🎉 Configuration terminée!');
  console.log('\n🚀 Pour démarrer l\'application:');
  console.log('   npm run dev');
  console.log('\n🔑 Connexion admin:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  
  return true;
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnvironment().catch(console.error);
}

export { setupEnvironment }; 