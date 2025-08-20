import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

// Configuration des notifications
const NOTIFICATION_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 2000,
  MAX_NOTIFICATIONS: 50,
  HEARTBEAT_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 10000
};

// Dynamic import for socket.io-client to avoid build issues
let io: any = null;
let Socket: any = null;

const loadSocketIO = async () => {
  if (!io) {
    try {
      const socketModule = await import('socket.io-client');
      io = socketModule.io;
      Socket = socketModule.Socket;
    } catch (error) {
      console.warn('[NOTIFICATIONS] Socket.io-client not available:', error);
      return null;
    }
  }
  return { io, Socket };
};

export interface Notification {
  type: string;
  title: string;
  message: string;
  timestamp: string;
  orderId?: number;
  orderNumber?: string;
  status?: string;
  id?: string;
  isRead?: boolean;
}

export interface NotificationConfig {
  userType: string;
  entityId?: number;
  userId?: number;
  autoReconnect?: boolean;
  enableHeartbeat?: boolean;
}

export function useNotifications(config: NotificationConfig) {
  const [socket, setSocket] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { toast } = useToast();
  
  // Refs pour gérer les timers et la reconnexion
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  // Fonction de nettoyage des timers
  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // Fonction de reconnexion
  const attemptReconnect = useCallback(async () => {
    if (reconnectAttempts >= NOTIFICATION_CONFIG.RECONNECT_ATTEMPTS) {
      setConnectionStatus('error');
      console.warn('[NOTIFICATIONS] Max reconnection attempts reached');
      return;
    }

    if (socketRef.current?.connected) {
      return; // Déjà connecté
    }

    setConnectionStatus('connecting');
    setReconnectAttempts(prev => prev + 1);

    try {
      const { io } = await loadSocketIO();
      if (!io) {
        throw new Error('Socket.io not available');
      }

      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        timeout: NOTIFICATION_CONFIG.CONNECTION_TIMEOUT,
        forceNew: true
      });

      // Gestion des événements de connexion
      newSocket.on('connect', () => {
        console.log('[NOTIFICATIONS] Reconnected to WebSocket server');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Rejoindre la salle appropriée
        newSocket.emit('join_room', { 
          userType: config.userType, 
          entityId: config.entityId, 
          userId: config.userId 
        });
      });

      newSocket.on('connect_error', (error: any) => {
        console.warn('[NOTIFICATIONS] Reconnection failed:', error);
        setConnectionStatus('error');
        
        // Programmer une nouvelle tentative
        reconnectTimerRef.current = setTimeout(() => {
          attemptReconnect();
        }, NOTIFICATION_CONFIG.RECONNECT_DELAY * (reconnectAttempts + 1));
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.error('[NOTIFICATIONS] Reconnection error:', error);
      setConnectionStatus('error');
      
      // Programmer une nouvelle tentative
      reconnectTimerRef.current = setTimeout(() => {
        attemptReconnect();
      }, NOTIFICATION_CONFIG.RECONNECT_DELAY * (reconnectAttempts + 1));
    }
  }, [reconnectAttempts, config.userType, config.entityId, config.userId]);

  // Fonction d'initialisation de la connexion
  const initializeConnection = useCallback(async () => {
    try {
      const { io } = await loadSocketIO();
      if (!io) {
        console.warn('[NOTIFICATIONS] Socket.io not available');
        setConnectionStatus('error');
        return;
      }

      setConnectionStatus('connecting');
      
      // Timeout de connexion
      connectionTimeoutRef.current = setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setConnectionStatus('error');
          console.warn('[NOTIFICATIONS] Connection timeout');
        }
      }, NOTIFICATION_CONFIG.CONNECTION_TIMEOUT);

      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        timeout: NOTIFICATION_CONFIG.CONNECTION_TIMEOUT,
        forceNew: true
      });

      // Gestion des événements de connexion
      newSocket.on('connect', () => {
        console.log('[NOTIFICATIONS] Connected to WebSocket server');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Nettoyer le timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Rejoindre la salle appropriée
        newSocket.emit('join_room', { 
          userType: config.userType, 
          entityId: config.entityId, 
          userId: config.userId 
        });

        // Démarrer le heartbeat si activé
        if (config.enableHeartbeat) {
          heartbeatTimerRef.current = setInterval(() => {
            if (newSocket.connected) {
              newSocket.emit('heartbeat');
            }
          }, NOTIFICATION_CONFIG.HEARTBEAT_INTERVAL);
        }
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('[NOTIFICATIONS] Disconnected from WebSocket server:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Nettoyer le heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        // Tenter la reconnexion automatique si activée
        if (config.autoReconnect && reason !== 'io client disconnect') {
          attemptReconnect();
        }
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('[NOTIFICATIONS] Connection error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        
        // Nettoyer le timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        // Tenter la reconnexion automatique si activée
        if (config.autoReconnect) {
          attemptReconnect();
        }
      });

      // Gestion des notifications
      newSocket.on('notification', (notification: Notification) => {
        console.log('[NOTIFICATIONS] Received notification:', notification);
        
        // Ajouter un ID unique si absent
        const notificationWithId = {
          ...notification,
          id: notification.id || `notif_${Date.now()}_${Math.random()}`,
          timestamp: notification.timestamp || new Date().toISOString(),
          isRead: false
        };
        
        // Ajouter aux notifications et garder seulement les 50 plus récentes
        setNotifications(prev => [notificationWithId, ...prev.slice(0, NOTIFICATION_CONFIG.MAX_NOTIFICATIONS - 1)]);
        
        // Afficher une toast notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
      });

      // Gestion des erreurs
      newSocket.on('error', (error: any) => {
        console.error('[NOTIFICATIONS] Socket error:', error);
        setConnectionStatus('error');
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (error) {
      console.error('[NOTIFICATIONS] Failed to initialize connection:', error);
      setConnectionStatus('error');
    }
  }, [config, attemptReconnect]);

  // Initialisation de la connexion
  useEffect(() => {
    initializeConnection();

    return () => {
      clearTimers();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeConnection, clearTimers]);

  // Nettoyage lors du changement de configuration
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('join_room', { 
        userType: config.userType, 
        entityId: config.entityId, 
        userId: config.userId 
      });
    }
  }, [socket, config.userType, config.entityId, config.userId]);

  // Fonctions utilitaires
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const sendTestNotification = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('test_notification');
    }
  }, [socket]);

  const forceReconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    setReconnectAttempts(0);
    initializeConnection();
  }, [socket, initializeConnection]);

  // Calcul du nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return {
    notifications,
    isConnected,
    connectionStatus,
    reconnectAttempts,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestNotification,
    forceReconnect,
    unreadCount,
    totalCount: notifications.length
  };
} 