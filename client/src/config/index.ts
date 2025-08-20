// Configuration centralisée pour l'application client ZiShop

export const CONFIG = {
  // Configuration de l'environnement
  ENV: process.env.NODE_ENV || 'development',
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Configuration de l'API
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    VERSION: 'v1',
  },

  // Configuration des WebSockets
  WEBSOCKET: {
    URL: process.env.REACT_APP_WS_URL || 'http://localhost:5000',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 2000,
    HEARTBEAT_INTERVAL: 30000,
    CONNECTION_TIMEOUT: 10000,
  },

  // Configuration de l'authentification
  AUTH: {
    TOKEN_KEY: 'zishop_token',
    USER_KEY: 'zishop_user',
    REFRESH_TOKEN_KEY: 'zishop_refresh_token',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
    AUTO_LOGOUT_DELAY: 30 * 60 * 1000, // 30 minutes
  },

  // Configuration des notifications
  NOTIFICATIONS: {
    MAX_NOTIFICATIONS: 50,
    TOAST_DURATION: 5000,
    SOUND_ENABLED: true,
    VIBRATION_ENABLED: true,
  },

  // Configuration de la pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // Configuration des limites de fichiers
  UPLOADS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGE_QUALITY: 0.8,
    THUMBNAIL_SIZE: 150,
  },

  // Configuration de la géolocalisation
  GEOLOCATION: {
    TIMEOUT: 10000,
    MAX_AGE: 5 * 60 * 1000, // 5 minutes
    HIGH_ACCURACY: true,
    ENABLE_HIGH_ACCURACY: true,
  },

  // Configuration des cartes
  MAPS: {
    DEFAULT_ZOOM: 15,
    DEFAULT_CENTER: { lat: 48.8566, lng: 2.3522 }, // Paris
    MAX_ZOOM: 18,
    MIN_ZOOM: 10,
  },

  // Configuration des thèmes
  THEME: {
    DEFAULT: 'light',
    AVAILABLE: ['light', 'dark', 'auto'],
    STORAGE_KEY: 'zishop_theme',
  },

  // Configuration des langues
  I18N: {
    DEFAULT_LOCALE: 'fr',
    AVAILABLE_LOCALES: ['fr', 'en'],
    STORAGE_KEY: 'zishop_locale',
    FALLBACK_LOCALE: 'fr',
  },

  // Configuration des logs
  LOGGING: {
    LEVEL: process.env.REACT_APP_LOG_LEVEL || 'warn',
    ENABLE_CONSOLE: process.env.REACT_APP_ENABLE_CONSOLE_LOGS === 'true',
    ENABLE_REMOTE: process.env.REACT_APP_ENABLE_REMOTE_LOGS === 'true',
    REMOTE_ENDPOINT: process.env.REACT_APP_LOG_ENDPOINT,
  },

  // Configuration des tests
  TESTING: {
    MOCK_API: process.env.REACT_APP_MOCK_API === 'true',
    MOCK_WEBSOCKET: process.env.REACT_APP_MOCK_WEBSOCKET === 'true',
    ENABLE_DEBUG: process.env.REACT_APP_ENABLE_DEBUG === 'true',
  },

  // Configuration des fonctionnalités
  FEATURES: {
    ENABLE_PWA: true,
    ENABLE_OFFLINE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_TRACKING: process.env.REACT_APP_ENABLE_ERROR_TRACKING === 'true',
  },

  // Configuration des URLs
  URLS: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    HELP: '/help',
    PRIVACY: '/privacy',
    TERMS: '/terms',
  },

  // Configuration des messages d'erreur
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
    SERVER_ERROR: 'Erreur du serveur. Veuillez réessayer plus tard.',
    VALIDATION_ERROR: 'Données invalides. Vérifiez vos informations.',
    AUTH_ERROR: 'Session expirée. Veuillez vous reconnecter.',
    PERMISSION_ERROR: 'Vous n\'avez pas les permissions nécessaires.',
    NOT_FOUND_ERROR: 'Ressource non trouvée.',
    TIMEOUT_ERROR: 'Délai d\'attente dépassé. Veuillez réessayer.',
  },

  // Configuration des succès
  SUCCESS_MESSAGES: {
    SAVE_SUCCESS: 'Données sauvegardées avec succès.',
    DELETE_SUCCESS: 'Élément supprimé avec succès.',
    UPDATE_SUCCESS: 'Mise à jour effectuée avec succès.',
    LOGIN_SUCCESS: 'Connexion réussie.',
    LOGOUT_SUCCESS: 'Déconnexion réussie.',
    REGISTER_SUCCESS: 'Inscription réussie.',
  },

  // Configuration des délais
  DELAYS: {
    DEBOUNCE: 300,
    THROTTLE: 1000,
    AUTO_SAVE: 2000,
    TYPING_INDICATOR: 1000,
    LOADING_MINIMUM: 500,
  },
};

// Configuration spécifique à l'environnement
export const getEnvConfig = () => {
  if (CONFIG.IS_DEV) {
    return {
      ...CONFIG,
      API: {
        ...CONFIG.API,
        BASE_URL: 'http://localhost:5000/api',
      },
      WEBSOCKET: {
        ...CONFIG.WEBSOCKET,
        URL: 'http://localhost:5000',
      },
      LOGGING: {
        ...CONFIG.LOGGING,
        LEVEL: 'debug',
        ENABLE_CONSOLE: true,
      },
    };
  }

  if (CONFIG.IS_PROD) {
    return {
      ...CONFIG,
      API: {
        ...CONFIG.API,
        BASE_URL: 'https://api.zishop.co/api',
      },
      WEBSOCKET: {
        ...CONFIG.WEBSOCKET,
        URL: 'https://api.zishop.co',
      },
      LOGGING: {
        ...CONFIG.LOGGING,
        LEVEL: 'error',
        ENABLE_CONSOLE: false,
      },
    };
  }

  return CONFIG;
};

// Configuration dynamique
export const getConfig = () => {
  const envConfig = getEnvConfig();
  
  // Surcharger avec les variables d'environnement si disponibles
  if (process.env.REACT_APP_API_URL) {
    envConfig.API.BASE_URL = process.env.REACT_APP_API_URL;
  }
  
  if (process.env.REACT_APP_WS_URL) {
    envConfig.WEBSOCKET.URL = process.env.REACT_APP_WS_URL;
  }

  return envConfig;
};

// Export de la configuration par défaut
export default getConfig();
