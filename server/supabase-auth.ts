import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Configuration Supabase manquante - fonctionnement en mode local');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Service d'authentification Supabase pour ZiShop
 */
export class SupabaseAuthService {
  
  /**
   * Créer un utilisateur dans Supabase Auth et dans notre table app_users
   */
  async createUser(userData: {
    email: string;
    password: string;
    username: string;
    role: string;
    entity_id?: number;
  }) {
    if (!supabaseAdmin) {
      throw new Error('Supabase non configuré');
    }

    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirmer l'email en mode admin
      });

      if (authError) {
        throw new Error(`Erreur création auth: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Utilisateur auth non créé');
      }

      // 2. Créer l'entrée métier dans app_users
      const appUser = await storage.createUser({
        supabase_user_id: authData.user.id,
        username: userData.username,
        role: userData.role,
        entity_id: userData.entity_id || null,
        is_active: true,
      });

      return {
        supabase_user: authData.user,
        app_user: appUser
      };

    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  }

  /**
   * Authentifier un utilisateur avec email/password
   */
  async signInWithPassword(email: string, password: string) {
    if (!supabaseAdmin) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Erreur authentification: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer les données métier
      const appUser = await storage.getUserBySupabaseId(data.user.id);
      
      if (!appUser) {
        throw new Error('Données métier utilisateur non trouvées');
      }

      if (!appUser.is_active) {
        throw new Error('Compte utilisateur désactivé');
      }

      return {
        supabase_user: data.user,
        app_user: appUser,
        session: data.session
      };

    } catch (error) {
      console.error('Erreur authentification:', error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par son token JWT
   */
  async getUserFromToken(token: string) {
    if (!supabaseAdmin) {
      throw new Error('Supabase non configuré');
    }

    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (error) {
        throw new Error(`Token invalide: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer les données métier
      const appUser = await storage.getUserBySupabaseId(data.user.id);
      
      if (!appUser) {
        throw new Error('Données métier utilisateur non trouvées');
      }

      return {
        supabase_user: data.user,
        app_user: appUser
      };

    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur (Supabase Auth + app_users)
   */
  async deleteUser(supabaseUserId: string) {
    if (!supabaseAdmin) {
      throw new Error('Supabase non configuré');
    }

    try {
      // 1. Supprimer de app_users
      const appUser = await storage.getUserBySupabaseId(supabaseUserId);
      if (appUser) {
        await storage.deleteUser(appUser.id);
      }

      // 2. Supprimer de Supabase Auth
      const { error } = await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      
      if (error) {
        throw new Error(`Erreur suppression auth: ${error.message}`);
      }

      return true;

    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le rôle ou l'entité d'un utilisateur
   */
  async updateUserRole(supabaseUserId: string, role: string, entityId?: number) {
    try {
      const appUser = await storage.getUserBySupabaseId(supabaseUserId);
      
      if (!appUser) {
        throw new Error('Utilisateur non trouvé');
      }

      const updatedUser = await storage.updateUser(appUser.id, {
        role,
        entity_id: entityId || null,
      });

      return updatedUser;

    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      throw error;
    }
  }

  /**
   * Désactiver/réactiver un utilisateur
   */
  async toggleUserActive(supabaseUserId: string, isActive: boolean) {
    try {
      const appUser = await storage.getUserBySupabaseId(supabaseUserId);
      
      if (!appUser) {
        throw new Error('Utilisateur non trouvé');
      }

      const updatedUser = await storage.updateUser(appUser.id, {
        is_active: isActive,
      });

      return updatedUser;

    } catch (error) {
      console.error('Erreur activation/désactivation:', error);
      throw error;
    }
  }
}

export const supabaseAuth = new SupabaseAuthService();

