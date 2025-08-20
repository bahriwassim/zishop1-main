// Classes d'erreur personnalisées pour l'application ZiShop

export class ZiShopError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ZiShopError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details, true);
  }
}

export class AuthenticationError extends ZiShopError {
  constructor(message: string = 'Authentification requise') {
    super(message, 401, 'UNAUTHORIZED', undefined, true);
  }
}

export class AuthorizationError extends ZiShopError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403, 'FORBIDDEN', undefined, true);
  }
}

export class NotFoundError extends ZiShopError {
  constructor(resource: string = 'Ressource') {
    super(`${resource} non trouvée`, 404, 'NOT_FOUND', undefined, true);
  }
}

export class ConflictError extends ZiShopError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details, true);
  }
}

export class RateLimitError extends ZiShopError {
  constructor(message: string = 'Trop de requêtes') {
    super(message, 429, 'RATE_LIMITED', undefined, true);
  }
}

export class DatabaseError extends ZiShopError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DATABASE_ERROR', details, false);
  }
}

export class ExternalServiceError extends ZiShopError {
  constructor(service: string, message: string, details?: any) {
    super(`Erreur du service ${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', details, false);
  }
}

export class NetworkError extends ZiShopError {
  constructor(message: string = 'Erreur de réseau') {
    super(message, 503, 'NETWORK_ERROR', undefined, false);
  }
}

// Fonction utilitaire pour créer des erreurs à partir de codes
export const createError = (code: string, message?: string, details?: any): ZiShopError => {
  switch (code) {
    case 'VALIDATION_ERROR':
      return new ValidationError(message || 'Données invalides', details);
    case 'UNAUTHORIZED':
      return new AuthenticationError(message);
    case 'FORBIDDEN':
      return new AuthorizationError(message);
    case 'NOT_FOUND':
      return new NotFoundError(message);
    case 'CONFLICT':
      return new ConflictError(message || 'Conflit de données', details);
    case 'RATE_LIMITED':
      return new RateLimitError(message);
    case 'DATABASE_ERROR':
      return new DatabaseError(message || 'Erreur de base de données', details);
    case 'EXTERNAL_SERVICE_ERROR':
      return new ExternalServiceError('Externe', message || 'Erreur de service externe', details);
    case 'NETWORK_ERROR':
      return new NetworkError(message);
    default:
      return new ZiShopError(message || 'Erreur inconnue', 500, code, details);
  }
};

// Fonction pour formater les erreurs pour l'API
export const formatErrorForAPI = (error: Error | ZiShopError) => {
  if (error instanceof ZiShopError) {
    return {
      error: true,
      message: error.message,
      status: error.statusCode,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }

  // Erreur générique
  return {
    error: true,
    message: error.message || 'Erreur interne du serveur',
    status: 500,
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

// Fonction pour logger les erreurs
export const logError = (error: Error | ZiShopError, context?: any) => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(error instanceof ZiShopError && {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
      isOperational: error.isOperational
    }),
    context
  };

  if (error instanceof ZiShopError && error.isOperational) {
    console.warn('Erreur opérationnelle:', errorInfo);
  } else {
    console.error('Erreur critique:', errorInfo);
  }

  return errorInfo;
};

// Middleware Express pour la gestion des erreurs
export const errorHandler = (error: Error | ZiShopError, req: any, res: any, next: any) => {
  // Logger l'erreur
  logError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Formater l'erreur pour l'API
  const formattedError = formatErrorForAPI(error);

  // Envoyer la réponse
  res.status(formattedError.status).json(formattedError);
};

// Fonction pour gérer les promesses rejetées
export const handlePromiseRejection = (reason: any, promise: Promise<any>) => {
  console.error('Promesse rejetée non gérée:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
};

// Fonction pour gérer les erreurs non capturées
export const handleUncaughtException = (error: Error) => {
  console.error('Erreur non capturée:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Fermer gracieusement l'application
  process.exit(1);
};

// Configuration des gestionnaires d'erreurs globaux
export const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', handlePromiseRejection);
  process.on('uncaughtException', handleUncaughtException);
};

// Types d'erreur pour TypeScript
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR';

export interface ErrorResponse {
  error: true;
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
  stack?: string;
}
