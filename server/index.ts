import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { notificationService } from "./notifications";

// Configuration de l'environnement
const isDev = (process.env.NODE_ENV || "development") !== "production";
const PORT = parseInt(process.env.PORT || "5000");

const app = express();

// Configuration de sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:", "http:"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Configuration CORS sécurisée
const corsOptions = {
  origin: isDev 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:5000']
    : ['https://zishop.co', 'https://www.zishop.co'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting pour prévenir les attaques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // Limite très élevée en dev pour les tests, normale en prod
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting pour localhost en développement
    return isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('localhost'));
  }
});

app.use('/api/', limiter);

// Middleware de parsing sécurisé
app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res: any, buf: Buffer) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'JSON invalide' });
      throw new Error('JSON invalide');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10mb' 
}));

// Middleware de logging amélioré
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    if (path.startsWith("/api")) {
      let logLine = `${method} ${path} ${status} in ${duration}ms - IP: ${ip} - UA: ${userAgent}`;
      
      if (capturedJsonResponse && status >= 400) {
        logLine += ` :: Error: ${JSON.stringify(capturedJsonResponse).substring(0, 200)}`;
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Middleware de validation des headers
app.use((req, res, next) => {
  // Vérifier la taille des requêtes
  const contentLength = parseInt(req.get('Content-Length') || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB max
    return res.status(413).json({ 
      error: 'Taille de requête trop importante' 
    });
  }

  // Vérifier le type de contenu pour les requêtes POST/PUT
  if ((req.method === 'POST' || req.method === 'PUT') && req.path.startsWith('/api/')) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ 
        error: 'Content-Type doit être application/json' 
      });
    }
  }

  next();
});

// Gestionnaire d'erreurs global
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log de l'erreur
  console.error('Erreur serveur:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Déterminer le type d'erreur
  let status = 500;
  let message = 'Erreur interne du serveur';

  if (err.status || err.statusCode) {
    status = err.status || err.statusCode;
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Données invalides';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Non autorisé';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Accès interdit';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Ressource non trouvée';
  } else if (err.name === 'RateLimitError') {
    status = 429;
    message = 'Trop de requêtes';
  } else if (err.message) {
    message = err.message;
  }

  // Réponse d'erreur
  const errorResponse = {
    error: true,
    message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(isDev && { stack: err.stack })
  };

  res.status(status).json(errorResponse);
};

// Middleware de gestion des routes non trouvées
const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: 'Route non trouvée',
    status: 404,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

// Initialisation du serveur
(async () => {
  try {
    const server = await registerRoutes(app);
    
    // Initialiser le service de notifications WebSocket
    notificationService.init(server);
    
    console.log(`🔔 WebSocket server running on port ${server.address()?.port || PORT}`);

    // Configuration Vite en développement
    if (isDev) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Gestionnaire d'erreurs global
    app.use(errorHandler);
    
    // Gestionnaire des routes non trouvées (doit être en dernier)
    app.use(notFoundHandler);

    // Démarrer le serveur
    server.listen({
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`🚀 Serveur démarré sur le port ${PORT} en mode ${isDev ? 'développement' : 'production'}`);
      log(`📱 API disponible sur http://localhost:${PORT}/api`);
      if (isDev) {
        log(`🌐 Interface de développement sur http://localhost:${PORT}`);
      }
    });

    // Gestion gracieuse de l'arrêt
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Signal ${signal} reçu, arrêt gracieux...`);
      
      server.close(() => {
        console.log('✅ Serveur HTTP fermé');
        process.exit(0);
      });

      // Force l'arrêt après 10 secondes
      setTimeout(() => {
        console.error('❌ Arrêt forcé du serveur');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Gestion des erreurs non capturées
    process.on('uncaughtException', (err) => {
      console.error('❌ Erreur non capturée:', err);
      console.error('💡 Détails de l\'erreur:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesse rejetée non gérée:', reason);
      console.error('💡 Promise:', promise);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
})();
