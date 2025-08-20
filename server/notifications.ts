import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export interface NotificationData {
  type: 'order_update' | 'new_order' | 'order_confirmed' | 'order_delivered';
  orderId: number;
  orderNumber: string;
  status: string;
  hotelId?: number;
  merchantId?: number;
  clientId?: number;
  message: string;
}

class NotificationService {
  private io: SocketIOServer | null = null;

  init(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[NOTIFICATIONS] Client connected: ${socket.id}`);

      // Join user to specific rooms based on their role
      socket.on('join_room', (data: { userType: string; entityId?: number; userId?: number }) => {
        const { userType, entityId, userId } = data;
        
        if (userType === 'admin') {
          socket.join('admin');
          console.log(`[NOTIFICATIONS] Admin ${socket.id} joined admin room`);
        } else if (userType === 'hotel' && entityId) {
          socket.join(`hotel_${entityId}`);
          console.log(`[NOTIFICATIONS] Hotel user ${socket.id} joined hotel_${entityId} room`);
        } else if (userType === 'merchant' && entityId) {
          socket.join(`merchant_${entityId}`);
          console.log(`[NOTIFICATIONS] Merchant user ${socket.id} joined merchant_${entityId} room`);
        } else if (userType === 'client' && userId) {
          socket.join(`client_${userId}`);
          console.log(`[NOTIFICATIONS] Client ${socket.id} joined client_${userId} room`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[NOTIFICATIONS] Client disconnected: ${socket.id}`);
      });
    });

    console.log('[NOTIFICATIONS] WebSocket server initialized');
  }

  // Notify about order updates
  notifyOrderUpdate(notification: NotificationData) {
    if (!this.io) return;

    console.log(`[NOTIFICATIONS] Broadcasting order update: ${notification.type} for order ${notification.orderNumber}`);

    // Notify admin
    this.io.to('admin').emit('notification', {
      ...notification,
      title: 'Mise à jour commande',
      timestamp: new Date().toISOString()
    });

    // Notify hotel if hotelId is provided
    if (notification.hotelId) {
      this.io.to(`hotel_${notification.hotelId}`).emit('notification', {
        ...notification,
        title: 'Commande mise à jour',
        timestamp: new Date().toISOString()
      });
    }

    // Notify merchant if merchantId is provided
    if (notification.merchantId) {
      this.io.to(`merchant_${notification.merchantId}`).emit('notification', {
        ...notification,
        title: 'Commande mise à jour',
        timestamp: new Date().toISOString()
      });
    }

    // Notify client if clientId is provided
    if (notification.clientId) {
      this.io.to(`client_${notification.clientId}`).emit('notification', {
        ...notification,
        title: 'Votre commande',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Notify about new orders
  notifyNewOrder(order: any) {
    const notification: NotificationData = {
      type: 'new_order',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      hotelId: order.hotelId,
      merchantId: order.merchantId,
      clientId: order.clientId,
      message: `Nouvelle commande ${order.orderNumber} de ${order.customerName}`
    };

    this.notifyOrderUpdate(notification);
  }

  // Send test notification (for debugging)
  sendTestNotification() {
    if (!this.io) return;
    
    const testNotification = {
      type: 'test',
      title: 'Test de notification',
      message: 'Système de notifications WebSocket fonctionnel!',
      timestamp: new Date().toISOString()
    };

    this.io.emit('notification', testNotification);
    console.log('[NOTIFICATIONS] Test notification sent to all connected clients');
  }
}

export const notificationService = new NotificationService();
export default notificationService; 