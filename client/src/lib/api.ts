import { apiRequest } from "./queryClient";
import type { Hotel, Merchant, Product, Order, InsertOrder, Client, InsertClient } from "@shared/schema";
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AdminProductValidation, AdminMerchantValidation, AdminHotelValidation } from '@/types';

// Configuration centralisée
const API_CONFIG = {
  BASE_URL: (() => {
    // Utiliser les variables d'environnement Vite si disponibles
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Forcer localhost en développement
    if (typeof window !== 'undefined') {
      // Côté client - vérifier l'URL actuelle
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
        return 'http://localhost:5000/api';
      }
    }
    
    // Fallback vers la production
    return '/api';
  })(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Types d'erreur personnalisés
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Gestionnaire d'erreurs centralisé
const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    // Erreur de réponse du serveur
    const status = error.response.status;
    const data = error.response.data as any;
    
    switch (status) {
      case 400:
        throw new ApiError(
          data.message || 'Données invalides',
          status,
          'VALIDATION_ERROR',
          data.errors
        );
      case 401:
        throw new ApiError(
          'Session expirée. Veuillez vous reconnecter.',
          status,
          'UNAUTHORIZED'
        );
      case 403:
        throw new ApiError(
          'Accès refusé',
          status,
          'FORBIDDEN'
        );
      case 404:
        throw new ApiError(
          'Ressource non trouvée',
          status,
          'NOT_FOUND'
        );
      case 429:
        throw new ApiError(
          'Trop de requêtes. Veuillez patienter.',
          status,
          'RATE_LIMITED'
        );
      case 500:
        throw new ApiError(
          'Erreur interne du serveur',
          status,
          'INTERNAL_ERROR'
        );
      default:
        throw new ApiError(
          data.message || `Erreur ${status}`,
          status,
          'UNKNOWN_ERROR'
        );
    }
  } else if (error.request) {
    // Erreur de réseau
    throw new NetworkError(
      'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
    );
  } else {
    // Erreur de configuration
    throw new Error('Erreur de configuration de la requête');
  }
};

// Gestionnaire de retry automatique
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof NetworkError) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

// Gestionnaire de token sécurisé
const tokenManager = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  },
  
  setToken: (token: string): void => {
    try {
      localStorage.setItem('token', token);
    } catch (error) {
      console.warn('Impossible de sauvegarder le token:', error);
    }
  },
  
  removeToken: (): void => {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Impossible de supprimer le token:', error);
    }
  },
  
  isTokenValid: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    
    try {
      // Vérifier si le token n'est pas expiré (JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Log de la configuration de l'API
console.log('🔧 Configuration API:', {
  BASE_URL: API_CONFIG.BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
});

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.getToken();
  if (token && tokenManager.isTokenValid()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      // Rediriger vers la page de connexion si nécessaire
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour les requêtes avec gestion d'erreur
const apiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  return withRetry(async () => {
    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof AxiosError) {
        handleApiError(error);
      }
      throw error;
    }
  });
};

export const api = {
  // Hotels
  getHotels: (): Promise<Hotel[]> =>
    apiCall(() => axiosInstance.get('/hotels').then(res => res.data)),
  
  getHotelByCode: (code: string): Promise<Hotel> =>
    apiCall(() => axiosInstance.get(`/hotels/code/${code}`).then(res => res.data)),

  createHotel: (hotel: any): Promise<Hotel> =>
    apiCall(() => axiosInstance.post('/hotels', hotel).then(res => res.data)),

  updateHotel: (id: number, updates: any): Promise<Hotel> =>
    apiCall(() => axiosInstance.put(`/hotels/${id}`, updates).then(res => res.data)),

  deleteHotel: (id: number): Promise<void> =>
    apiCall(() => axiosInstance.delete(`/hotels/${id}`).then(() => {})),

  // Merchants
  getMerchantsNearHotel: (hotelId: number, radius: number = 3): Promise<Merchant[]> =>
    apiCall(() => axiosInstance.get(`/merchants/near/${hotelId}?radius=${radius}`).then(res => res.data)),

  getAllMerchants: (): Promise<Merchant[]> =>
    apiCall(() => axiosInstance.get('/merchants').then(res => res.data)),

  createMerchant: (merchant: any): Promise<Merchant> =>
    apiCall(() => axiosInstance.post('/merchants', merchant).then(res => res.data)),

  updateMerchant: (id: number, updates: any): Promise<Merchant> =>
    apiCall(() => axiosInstance.put(`/merchants/${id}`, updates).then(res => res.data)),

  deleteMerchant: (id: number): Promise<void> =>
    apiCall(() => axiosInstance.delete(`/merchants/${id}`).then(() => {})),

  // Products
  getProductsByMerchant: (merchantId: number): Promise<Product[]> =>
    apiCall(() => axiosInstance.get(`/products/merchant/${merchantId}`).then(res => res.data)),

  getAllProducts: (): Promise<Product[]> =>
    apiCall(() => axiosInstance.get('/products').then(res => res.data)),

  createProduct: (product: any): Promise<Product> =>
    apiCall(() => axiosInstance.post('/products', product).then(res => res.data)),

  updateProduct: (id: number, updates: any): Promise<Product> =>
    apiCall(() => axiosInstance.put(`/products/${id}`, updates).then(res => res.data)),

  deleteProduct: (id: number): Promise<void> =>
    apiCall(() => axiosInstance.delete(`/products/${id}`).then(() => {})),

  // Orders
  getOrdersByHotel: (hotelId: number): Promise<Order[]> =>
    apiCall(() => axiosInstance.get(`/orders/hotel/${hotelId}`).then(res => res.data)),

  getOrdersByMerchant: (merchantId: number): Promise<Order[]> =>
    apiCall(() => axiosInstance.get(`/orders/merchant/${merchantId}`).then(res => res.data)),

  getAllOrders: (): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data)),

  getOrder: (id: number): Promise<Order> =>
    apiCall(() => axiosInstance.get(`/orders/${id}`).then(res => res.data)),

  createOrder: (order: InsertOrder): Promise<Order> =>
    apiCall(() => axiosInstance.post("/orders", order).then(res => res.data)),

  updateOrder: (id: number, updates: any): Promise<Order> =>
    apiCall(() => axiosInstance.put(`/orders/${id}`, updates).then(res => res.data)),

  updateOrderStatus: (id: number, status: string): Promise<Order> =>
    apiCall(() => axiosInstance.put(`/orders/${id}`, { status }).then(res => res.data)),

  // Workflow et commission endpoints
  getOrderWorkflow: (): Promise<any> =>
    apiCall(() => axiosInstance.get('/orders/workflow').then(res => res.data)),

  getCommissionStats: (period: "today" | "week" | "month" = "today"): Promise<any> =>
    apiCall(() => axiosInstance.get(`/orders/commissions/stats?period=${period}`).then(res => res.data)),

  // Client-specific methods
  getOrdersByCustomer: (customerName: string, customerRoom: string): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data).then((orders: Order[]) => 
      orders.filter(order => 
        order.customer_name === customerName && 
        order.customer_room === customerRoom
      )
    )),

  getActiveOrdersByCustomer: (customerName: string, customerRoom: string): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data).then((orders: Order[]) => 
      orders.filter(order => 
        order.customer_name === customerName && 
        order.customer_room === customerRoom &&
        order.status !== 'delivered'
      )
    )),

  getOrdersByClient: (clientId: number): Promise<Order[]> =>
    apiCall(() => axiosInstance.get(`/orders/client/${clientId}`).then(res => res.data)),

  getActiveOrdersByClient: (clientId: number): Promise<Order[]> =>
    apiCall(() => axiosInstance.get(`/orders/client/${clientId}/active`).then(res => res.data)),

  // Client authentication and management
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ApiError('Email et mot de passe requis', 400, 'MISSING_CREDENTIALS');
    }
    
    try {
      const response = await axiosInstance.post('/clients/login', { email, password });
      const data = response.data;
      
      if (data.client && data.token) {
        tokenManager.setToken(data.token);
        return { ...data.client, token: data.token };
      }
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        handleApiError(error);
      }
      throw error;
    }
  },

  registerClient: (clientData: InsertClient): Promise<Client> =>
    apiCall(() => axiosInstance.post('/clients/register', clientData).then(res => res.data)),

  getClient: (id: number): Promise<Client> =>
    apiCall(() => axiosInstance.get(`/clients/${id}`).then(res => res.data)),

  updateClient: (id: number, updates: Partial<Client>): Promise<Client> =>
    apiCall(() => axiosInstance.put(`/clients/${id}`, updates).then(res => res.data)),

  getClientStats: (clientId: number): Promise<any> =>
    apiCall(() => axiosInstance.get(`/clients/${clientId}/stats`).then(res => res.data)),

  // Statistics
  getHotelStats: (hotelId: number): Promise<any> =>
    apiCall(() => axiosInstance.get(`/stats/hotel/${hotelId}`).then(res => res.data)),

  getMerchantStats: (merchantId: number): Promise<any> =>
    apiCall(() => axiosInstance.get(`/stats/merchant/${merchantId}`).then(res => res.data)),

  getAdminStats: (): Promise<any> =>
    apiCall(() => axiosInstance.get('/stats/admin').then(res => res.data)),

  // Nouvelles méthodes pour le suivi avancé des commandes
  getOrdersWithCommissions: (): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data)),

  getOrdersByStatus: (status: string): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data).then((orders: Order[]) => 
      orders.filter(order => order.status === status)
    )),

  getOrdersByDateRange: (startDate: string, endDate: string): Promise<Order[]> =>
    apiCall(() => axiosInstance.get('/orders').then(res => res.data).then((orders: Order[]) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return orders.filter(order => {
        const date = new Date((order as any).createdAt || (order as any).created_at);
        return date >= start && date <= end;
      });
    })),

  // Méthodes pour la gestion des notifications
  getNotifications: (userId: number, userType: string): Promise<any[]> =>
    apiCall(() => axiosInstance.get(`/notifications/${userType}/${userId}`).then(res => res.data)),

  markNotificationAsRead: (notificationId: number): Promise<void> =>
    apiCall(() => axiosInstance.put(`/notifications/${notificationId}/read`).then(() => {})),

  // Nouvelles méthodes pour la validation
  validateProduct: (validation: AdminProductValidation) => 
    apiCall(() => axiosInstance.post(`/products/${(validation as any).productId}/validate`, { 
      action: (validation as any).action, 
      note: (validation as any).note 
    }).then(res => res.data)),

  validateMerchant: (validation: AdminMerchantValidation) => 
    apiCall(() => axiosInstance.post('/admin/merchants/validate', validation).then(res => res.data)),

  validateHotel: (validation: AdminHotelValidation) => 
    apiCall(() => axiosInstance.post('/admin/hotels/validate', validation).then(res => res.data)),

  getPendingProducts: () => 
    apiCall(() => axiosInstance.get('/admin/products/pending').then(res => res.data)),

  getPendingMerchants: () => 
    apiCall(() => axiosInstance.get('/admin/merchants/pending').then(res => res.data)),

  getPendingHotels: () => 
    apiCall(() => axiosInstance.get('/admin/hotels/pending').then(res => res.data)),

  // Méthodes utilitaires
  logout: (): void => {
    tokenManager.removeToken();
  },

  isAuthenticated: (): boolean => {
    return tokenManager.isTokenValid();
  }
};

// Export des types d'erreur pour utilisation externe
export type { ApiError, NetworkError };
