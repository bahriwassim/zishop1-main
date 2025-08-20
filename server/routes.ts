import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHotelSchema, insertMerchantSchema, insertProductSchema, insertOrderSchema, insertClientSchema } from "@shared/schema";
import { authenticateUser, generateToken, requireAuth, requireRole, requireEntityAccess } from "./auth";
import { notificationService } from "./notifications";

export async function registerRoutes(app: Express): Promise<Server> {
  // Test endpoint pour vérifier la connectivité
  app.get("/api/health", async (req, res) => {
    try {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        message: "API ZiShop fonctionnelle",
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({ message: "API error" });
    }
  });

  // Hotels
  app.get("/api/hotels", async (req, res) => {
    try {
      const hotels = await storage.getAllHotels();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.get("/api/hotels/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const hotel = await storage.getHotelByCode(code);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post("/api/hotels", async (req, res) => {
    try {
      console.log("Hotel data received:", req.body);
      
      // Validation basique des champs requis
      if (!req.body.name || !req.body.address) {
        return res.status(400).json({ 
          message: "Name and address are required",
          received: req.body 
        });
      }
      
      // Generate unique hotel code if not provided
      const hotelCode = req.body.code || `ZI${Date.now().toString().slice(-6)}`;
      
      // Generate QR code automatically
      const qrCode = `https://zishop.co/hotel/${hotelCode}`;
      
      // Clean and prepare hotel data with better handling
      const hotelData = {
        name: req.body.name,
        address: req.body.address,
        code: hotelCode,
        qr_code: qrCode,
        latitude: req.body.latitude?.toString() || "48.8566", // Paris par défaut
        longitude: req.body.longitude?.toString() || "2.3522", // Paris par défaut
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
      };
      
      console.log("Processed hotel data:", hotelData);
      
      // Validation avec le schéma, mais avec gestion d'erreur améliorée
      let validatedData;
      try {
        validatedData = insertHotelSchema.parse(hotelData);
      } catch (validationError: any) {
        console.error("Schema validation error:", validationError.errors);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationError.errors,
          data: hotelData
        });
      }
      
      const hotel = await storage.createHotel(validatedData);
      console.log("Hotel created successfully:", hotel);
      res.status(201).json(hotel);
    } catch (error: any) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ 
        message: "Failed to create hotel", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.put("/api/hotels/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        ...req.body,
        latitude: req.body.latitude?.toString(),
        longitude: req.body.longitude?.toString(),
        updated_at: new Date()
      };
      
      const hotel = await storage.updateHotel(id, updates);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error: any) {
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel", error: error.message });
    }
  });

  // Merchants
  app.get("/api/merchants", async (req, res) => {
    try {
      const merchants = await storage.getAllMerchants();
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchants" });
    }
  });

  app.get("/api/merchants/near/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const radius = parseInt(req.query.radius as string) || 3;
      const merchants = await storage.getMerchantsNearHotel(hotelId, radius);
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby merchants" });
    }
  });

  app.get("/api/merchants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const merchant = await storage.getMerchant(id);
      if (!merchant) {
        return res.status(404).json({ message: "Merchant not found" });
      }
      res.json(merchant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant" });
    }
  });

  app.post("/api/merchants", async (req, res) => {
    try {
      console.log("Received merchant data:", req.body);
      
      // Validation basique des champs requis
      if (!req.body.name || !req.body.address || !req.body.category) {
        return res.status(400).json({ 
          message: "Name, address and category are required",
          received: req.body 
        });
      }
      
      // Clean and prepare merchant data with better handling
      const merchantData = {
        name: req.body.name,
        address: req.body.address,
        category: req.body.category,
        latitude: req.body.latitude?.toString() || "48.8566", // Paris par défaut
        longitude: req.body.longitude?.toString() || "2.3522", // Paris par défaut
        rating: req.body.rating ? parseFloat(req.body.rating).toString() : "0.0",
        review_count: req.body.review_count ? parseInt(req.body.review_count) : 0,
        is_open: req.body.is_open !== undefined ? req.body.is_open : true,
        image_url: req.body.image_url || null
      };
      
      console.log("Processed merchant data:", merchantData);
      
      // Validation avec le schéma, mais avec gestion d'erreur améliorée
      let validatedData;
      try {
        validatedData = insertMerchantSchema.parse(merchantData);
      } catch (validationError: any) {
        console.error("Schema validation error:", validationError.errors);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationError.errors,
          data: merchantData
        });
      }
      
      const merchant = await storage.createMerchant(validatedData);
      console.log("Merchant created successfully:", merchant);
      res.status(201).json(merchant);
    } catch (error: any) {
      console.error("Error creating merchant:", error);
      res.status(500).json({ 
        message: "Failed to create merchant", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.put("/api/merchants/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        ...req.body,
        latitude: req.body.latitude?.toString(),
        longitude: req.body.longitude?.toString(),
        updated_at: new Date()
      };
      
      const merchant = await storage.updateMerchant(id, updates);
      if (!merchant) {
        return res.status(404).json({ message: "Merchant not found" });
      }
      res.json(merchant);
    } catch (error: any) {
      console.error("Error updating merchant:", error);
      res.status(500).json({ message: "Failed to update merchant", error: error.message });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/merchant/:merchantId", async (req, res) => {
    try {
      const merchantId = parseInt(req.params.merchantId);
      const products = await storage.getProductsByMerchant(merchantId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Endpoint pour la validation des produits par l'admin
  app.post("/api/products/:id/validate", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { action, note } = req.body;
      
      console.log(`Validation produit ${id}: ${action}`, { note });
      
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Mettre à jour le statut de validation du produit
      const validationStatus = action === 'approve' ? 'approved' : 'rejected';
      const updates: any = {
        // snake_case pour une éventuelle implémentation SQL
        validation_status: validationStatus,
        rejection_reason: action === 'reject' ? note : null,
        validated_at: new Date(),
        validated_by: req.user!.id,
        // camelCase pour le storage mémoire
        validationStatus,
        rejectionReason: action === 'reject' ? note : null,
        validatedAt: new Date().toISOString(),
        validatedBy: req.user!.id,
      };
      
      const updatedProduct = await storage.updateProduct(id, updates);
      
      // Log de validation pour audit
      console.log(`Produit ${product.name} ${action === 'approve' ? 'approuvé' : 'rejeté'} par admin`, {
        productId: id,
        action,
        note,
        adminId: req.user!.id,
        timestamp: new Date().toISOString()
      });
      
      // TODO: Envoyer une notification au commerçant
      
      res.json({ 
        message: `Product ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        product: updatedProduct,
        validation: { action, note, timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error("Error validating product:", error);
      res.status(500).json({ message: "Failed to validate product" });
    }
  });

  // Orders
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/hotel/:hotelId", requireAuth, requireEntityAccess, async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const orders = await storage.getOrdersByHotel(hotelId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel orders" });
    }
  });

  app.get("/api/orders/merchant/:merchantId", requireAuth, requireEntityAccess, async (req, res) => {
    try {
      const merchantId = parseInt(req.params.merchantId);
      const orders = await storage.getOrdersByMerchant(merchantId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant orders" });
    }
  });

  app.get("/api/orders/client/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const orders = await storage.getOrdersByClient(clientId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client orders" });
    }
  });

  app.get("/api/orders/client/:clientId/active", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const orders = await storage.getActiveOrdersByClient(clientId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active client orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log("=== DONNÉES REÇUES PAR LE SERVEUR ===");
      console.log("req.body:", JSON.stringify(req.body, null, 2));
      console.log("=====================================");
      
      const orderData = insertOrderSchema.parse(req.body);
      
      // Vérification du stock pour chaque produit commandé
      if (!Array.isArray(orderData.items)) {
        return res.status(400).json({ message: "Le champ 'items' doit être un tableau." });
      }
      for (const item of orderData.items) {
        if (!item || typeof item !== 'object' || !('productId' in item) || !('quantity' in item)) {
          return res.status(400).json({ message: "Chaque item doit contenir productId (number) et quantity (number)." });
        }
        const productId = (item as any).productId;
        const quantity = (item as any).quantity;
        if (typeof productId !== "number" || typeof quantity !== "number") {
          return res.status(400).json({ message: "Chaque item doit contenir productId (number) et quantity (number)." });
        }
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(400).json({ message: `Produit ID ${productId} introuvable.` });
        }
        if (typeof product.stock !== "number" || product.stock < quantity) {
          return res.status(400).json({ message: `Stock insuffisant pour le produit ${product.name}. Stock actuel: ${product.stock}, demandé: ${quantity}` });
        }
      }
      // Décrémenter le stock de chaque produit
      for (const item of orderData.items) {
        if (item && typeof item === 'object' && 'productId' in item && 'quantity' in item) {
          const productId = (item as any).productId;
          const quantity = (item as any).quantity;
          const product = await storage.getProduct(productId);
          if (product) {
            const currentStock = typeof (product as any).stock === "number" ? (product as any).stock : 0;
            await storage.updateProduct((product as any).id, { stock: currentStock - quantity });
          }
        }
      }
      // Laisser le storage gérer la génération du numéro de commande
      // et le calcul des commissions, en restant en camelCase pour cohérence.
      const order = await storage.createOrder({
        hotelId: orderData.hotelId,
        merchantId: orderData.merchantId,
        clientId: orderData.clientId,
        customerName: orderData.customerName,
        customerRoom: orderData.customerRoom,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: orderData.status || "pending",
        deliveryNotes: orderData.deliveryNotes,
        estimatedDelivery: orderData.estimatedDelivery,
      } as any);
      
      // Send notification about new order
      notificationService.notifyNewOrder(order);
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Erreur création commande:", error);
      console.error("Détails de l'erreur:", JSON.stringify(error, null, 2));
      res.status(400).json({ message: "Invalid order data", details: error.message });
    }
  });

  app.put("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatesInput = req.body || {};
      // Normaliser les champs snake_case -> camelCase pour compatibilité MemStorage
      const normalizedUpdates: any = { ...updatesInput };
      const map: Record<string, string> = {
        order_number: 'orderNumber',
        hotel_id: 'hotelId',
        merchant_id: 'merchantId',
        client_id: 'clientId',
        customer_name: 'customerName',
        customer_room: 'customerRoom',
        total_amount: 'totalAmount',
        merchant_commission: 'merchantCommission',
        zishop_commission: 'zishopCommission',
        hotel_commission: 'hotelCommission',
        delivery_notes: 'deliveryNotes',
        confirmed_at: 'confirmedAt',
        delivered_at: 'deliveredAt',
        estimated_delivery: 'estimatedDelivery',
        picked_up: 'pickedUp',
        picked_up_at: 'pickedUpAt',
      };
      for (const [k, v] of Object.entries(map)) {
        if (k in normalizedUpdates && !(v in normalizedUpdates)) {
          normalizedUpdates[v] = (normalizedUpdates as any)[k];
        }
      }
      const updates = normalizedUpdates;
      
      // Validation des transitions de statut selon le workflow
      if (typeof updates.status === 'string' && updates.status.length > 0) {
        const currentOrder = await storage.getOrder(id);
        if (!currentOrder) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        const validTransitions: Record<string, string[]> = {
          "pending": ["confirmed", "cancelled"],
          "confirmed": ["preparing", "cancelled"],
          "preparing": ["ready", "cancelled"],
          // autoriser raccourci : ready -> delivered
          "ready": ["delivering", "delivered", "cancelled"],
          "delivering": ["delivered", "cancelled"],
          "delivered": [], // État final
          "cancelled": [], // État final
        };
        
        const allowedNextStates = validTransitions[currentOrder.status] || [];
        // Autoriser mise à jour des méta-infos même si statut inchangé
        if (!allowedNextStates.includes(updates.status)) {
          if (currentOrder.status === updates.status) {
            const idempotentOrder = await storage.updateOrder(id, updates);
            return res.json(idempotentOrder);
          }
          return res.status(400).json({ 
            message: `Transition de statut invalide: ${currentOrder.status} → ${updates.status}` 
          });
        }
        
        // Ajouter automatiquement les timestamps appropriés
        if (updates.status === "confirmed" && !updates.confirmedAt) {
          updates.confirmedAt = new Date().toISOString();
        }
        if (updates.status === "delivered" && !updates.deliveredAt) {
          updates.deliveredAt = new Date().toISOString();
        }
      }
      // Si pas de changement de statut (ou pas fourni), on autorise les mises à jour de métadonnées (pickedUp,...)
      
      const order = await storage.updateOrder(id, updates);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send notification about order status change
      if (updates.status) {
        const statusMessages: Record<string, string> = {
          "confirmed": "Votre commande a été confirmée par le commerçant",
          "preparing": "Votre commande est en cours de préparation",
          "ready": "Votre commande est prête",
          "delivering": "Votre commande est en cours de livraison",
          "delivered": "Votre commande a été livrée à la réception",
          "cancelled": "Votre commande a été annulée"
        };

        notificationService.notifyOrderUpdate({
          type: 'order_update',
          orderId: (order as any).id,
          orderNumber: (order as any).orderNumber || (order as any).order_number,
          status: updates.status,
          hotelId: (order as any).hotelId || (order as any).hotel_id,
          merchantId: (order as any).merchantId || (order as any).merchant_id,
          clientId: (order as any).clientId || (order as any).client_id || undefined,
          message: statusMessages[updates.status] || `Statut de commande mis à jour: ${updates.status}`
        });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Erreur mise à jour commande:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Nouveau endpoint pour obtenir le workflow des commandes
  app.get("/api/orders/workflow", async (req, res) => {
    try {
      const workflow = {
        statuses: [
          {
            id: "pending",
            name: "En attente",
            description: "Commande créée, en attente de confirmation du commerçant",
            color: "#f59e0b",
            nextStates: ["confirmed", "cancelled"]
          },
          {
            id: "confirmed", 
            name: "Confirmée",
            description: "Commande confirmée par le commerçant",
            color: "#3b82f6",
            nextStates: ["preparing", "cancelled"]
          },
          {
            id: "preparing",
            name: "En préparation", 
            description: "Commande en cours de préparation",
            color: "#f97316",
            nextStates: ["ready", "cancelled"]
          },
          {
            id: "ready",
            name: "Prête",
            description: "Commande prête pour livraison",
            color: "#8b5cf6",
            nextStates: ["delivering", "cancelled"]
          },
          {
            id: "delivering",
            name: "En livraison",
            description: "Commande en cours de livraison vers l'hôtel",
            color: "#6366f1", 
            nextStates: ["delivered", "cancelled"]
          },
          {
            id: "delivered",
            name: "Livrée",
            description: "Commande livrée à la réception de l'hôtel",
            color: "#10b981",
            nextStates: []
          },
          {
            id: "cancelled",
            name: "Annulée",
            description: "Commande annulée",
            color: "#ef4444",
            nextStates: []
          }
        ],
        commissionStructure: {
          merchant: { percentage: 75, description: "Commission commerçant" },
          zishop: { percentage: 20, description: "Commission Zishop" },
          hotel: { percentage: 5, description: "Commission hôtel" }
        }
      };
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  // Endpoint pour les statistiques de commissions par période
  app.get("/api/orders/commissions/stats", async (req, res) => {
    try {
      const { period = "today" } = req.query;
      const orders = await storage.getAllOrders();
      
      let filteredOrders = orders;
      const now = new Date();
      
      switch (period) {
        case "today":
          filteredOrders = orders.filter(order => {
            const orderDate = new Date((order as any).createdAt || (order as any).created_at);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredOrders = orders.filter(order => new Date((order as any).createdAt || (order as any).created_at) >= weekAgo);
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredOrders = orders.filter(order => new Date((order as any).createdAt || (order as any).created_at) >= monthAgo);
          break;
      }
      
      interface StatsAccumulator {
        totalRevenue: number;
        merchantCommission: number;
        zishopCommission: number;
        hotelCommission: number;
        orderCount: number;
      }
      
      const stats = filteredOrders
        .filter(order => !["cancelled"].includes((order as any).status))
        .reduce((acc: StatsAccumulator, order) => {
          const total = parseFloat((order as any).totalAmount || (order as any).total_amount);
          acc.totalRevenue += total;
          acc.merchantCommission += total * 0.75;
          acc.zishopCommission += total * 0.20;
          acc.hotelCommission += total * 0.05;
          acc.orderCount++;
          return acc;
        }, {
          totalRevenue: 0,
          merchantCommission: 0,
          zishopCommission: 0,
          hotelCommission: 0,
          orderCount: 0
        } as StatsAccumulator);
      
      // Arrondir les montants
      const keys: (keyof StatsAccumulator)[] = ['totalRevenue', 'merchantCommission', 'zishopCommission', 'hotelCommission'];
      keys.forEach(key => {
        stats[key] = parseFloat(stats[key].toFixed(2));
      });
      
      res.json({
        period,
        stats,
        averageOrderValue: stats.orderCount > 0 ? parseFloat((stats.totalRevenue / stats.orderCount).toFixed(2)) : 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch commission stats" });
    }
  });

  // Users management endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Enrichir les utilisateurs avec les informations d'entité et formater les dates
      const usersResponse = await Promise.all(users.map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        
        // Formater les dates avec des valeurs par défaut
        const formattedUser: any = {
          ...userWithoutPassword,
          created_at: userWithoutPassword.created_at ? new Date(userWithoutPassword.created_at).toISOString() : new Date().toISOString(),
          updated_at: userWithoutPassword.updated_at ? new Date(userWithoutPassword.updated_at).toISOString() : new Date().toISOString(),
          entityId: userWithoutPassword.entity_id // Ajouter entityId pour la compatibilité
        };
        
        // Ajouter les informations d'entité
        if (user.role === "hotel" && user.entity_id) {
          const hotel = await storage.getHotel(user.entity_id);
          if (hotel) {
            formattedUser.entityName = hotel.name;
            formattedUser.entityDescription = hotel.address;
          } else {
            formattedUser.entityName = "Hôtel non trouvé";
            formattedUser.entityDescription = "Non assigné";
          }
        } else if (user.role === "merchant" && user.entity_id) {
          const merchant = await storage.getMerchant(user.entity_id);
          if (merchant) {
            formattedUser.entityName = merchant.name;
            formattedUser.entityDescription = merchant.address;
          } else {
            formattedUser.entityName = "Commerçant non trouvé";
            formattedUser.entityDescription = "Non assigné";
          }
        } else if (user.role === "admin") {
          formattedUser.entityName = "Administrateur";
          formattedUser.entityDescription = "Admin global";
        } else if (user.role === "hotel" && !user.entity_id) {
          formattedUser.entityName = "Hôtel";
          formattedUser.entityDescription = "Non assigné";
        } else if (user.role === "merchant" && !user.entity_id) {
          formattedUser.entityName = "Commerçant";
          formattedUser.entityDescription = "Non assigné";
        } else {
          formattedUser.entityName = "Non assigné";
          formattedUser.entityDescription = "Non assigné";
        }
        
        return formattedUser;
      }));
      
      res.json(usersResponse);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      console.log("Création d'utilisateur:", userData);
      
      // Validation basique
      if (!userData.username || !userData.password || !userData.role) {
        return res.status(400).json({ message: "Username, password and role are required" });
      }
      
      if (!["admin", "hotel", "merchant"].includes(userData.role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Pour les rôles hotel et merchant, entityId est requis
      if ((userData.role === "hotel" || userData.role === "merchant") && !userData.entityId) {
        return res.status(400).json({ message: `Entity ID is required for ${userData.role} role` });
      }

      // Vérifier que l'entité existe
      if (userData.role === "hotel") {
        const hotel = await storage.getHotel(userData.entityId);
        if (!hotel) {
          return res.status(400).json({ message: "Hotel not found" });
        }
      } else if (userData.role === "merchant") {
        const merchant = await storage.getMerchant(userData.entityId);
        if (!merchant) {
          return res.status(400).json({ message: "Merchant not found" });
        }
      }
      
      // Créer l'utilisateur dans la base de données (camelCase pour compat stockage mémoire)
      const newUser = await storage.createUser({
        username: userData.username,
        password: userData.password,
        role: userData.role,
        entityId: userData.entityId ?? userData.entity_id ?? null
      } as any);
      
      // Ne pas retourner le mot de passe et formater les dates
      const { password, ...userResponse } = newUser;
      
      // Formater les dates pour l'affichage et corriger entityId
      const formattedResponse = {
        ...userResponse,
        created_at: (userResponse as any).created_at ? new Date((userResponse as any).created_at).toISOString() : ((userResponse as any).createdAt ? new Date((userResponse as any).createdAt).toISOString() : null),
        updated_at: (userResponse as any).updated_at ? new Date((userResponse as any).updated_at).toISOString() : ((userResponse as any).updatedAt ? new Date((userResponse as any).updatedAt).toISOString() : null),
        entityId: (userResponse as any).entity_id ?? (userResponse as any).entityId
      };
      
      console.log("Utilisateur créé:", formattedResponse);
      res.status(201).json(formattedResponse);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user", error: error.message });
    }
  });

  // Modification d'utilisateur
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      console.log("Modification d'utilisateur:", userId, userData);
      
      // Validation basique
      if (!userData.username || !userData.role) {
        return res.status(400).json({ message: "Username and role are required" });
      }
      
      if (!["admin", "hotel", "merchant"].includes(userData.role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Pour les rôles hotel et merchant, entityId est requis
      if ((userData.role === "hotel" || userData.role === "merchant") && !userData.entityId) {
        return res.status(400).json({ message: `Entity ID is required for ${userData.role} role` });
      }

      // Vérifier que l'entité existe
      if (userData.role === "hotel") {
        const hotel = await storage.getHotel(userData.entityId);
        if (!hotel) {
          return res.status(400).json({ message: "Hotel not found" });
        }
      } else if (userData.role === "merchant") {
        const merchant = await storage.getMerchant(userData.entityId);
        if (!merchant) {
          return res.status(400).json({ message: "Merchant not found" });
        }
      }
      
      // Préparer les données de mise à jour
      const updateData: any = {
        username: userData.username,
        role: userData.role,
        entityId: userData.entityId ?? userData.entity_id ?? null,
        entity_id: userData.entityId ?? userData.entity_id ?? null,
        updatedAt: new Date()
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (userData.password) {
        updateData.password = userData.password;
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ne pas retourner le mot de passe et formater les dates
      const { password, ...userResponse } = updatedUser;
      
      // Formater les dates pour l'affichage et corriger entityId
      const formattedResponse = {
        ...userResponse,
        created_at: (userResponse as any).created_at ? new Date((userResponse as any).created_at).toISOString() : ((userResponse as any).createdAt ? new Date((userResponse as any).createdAt).toISOString() : null),
        updated_at: (userResponse as any).updated_at ? new Date((userResponse as any).updated_at).toISOString() : ((userResponse as any).updatedAt ? new Date((userResponse as any).updatedAt).toISOString() : null),
        entityId: (userResponse as any).entity_id ?? (userResponse as any).entityId
      };
      
      console.log("Utilisateur modifié:", formattedResponse);
      res.json(formattedResponse);
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user", error: error.message });
    }
  });

  // Suppression d'utilisateur
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log("Suppression d'utilisateur:", userId);
      
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Utilisateur supprimé:", userId);
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
  });

  // Clients
  app.post("/api/clients/register", async (req, res) => {
    try {
      console.log("Client registration request:", req.body);
      // Normaliser les champs avant validation (supporte snake_case)
      const raw = req.body || {};
      const normalized = {
        email: raw.email,
        password: raw.password,
        firstName: raw.firstName || raw.first_name,
        lastName: raw.lastName || raw.last_name,
        phone: raw.phone,
      };
      const clientData = insertClientSchema.parse(normalized);
      console.log("Validated client data:", clientData);
      
      // Vérifier si l'email existe déjà
      const existingClient = await storage.getClientByEmail(clientData.email);
      if (existingClient) {
        return res.status(400).json({ 
          message: "Un compte avec cet email existe déjà",
          error: "EMAIL_EXISTS"
        });
      }
      
      const client = await storage.createClient(clientData);
      console.log("Client created successfully:", { id: client.id, email: client.email });
      
      // Don't return password in response
      const { password, ...clientResponse } = client;
      res.status(201).json({ client: clientResponse });
    } catch (error: any) {
      console.error("Client registration error:", error);
      
      // Gestion spécifique des erreurs de validation
      if (error.name === 'ZodError') {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({ 
          message: "Données invalides",
          errors: validationErrors,
          error: "VALIDATION_ERROR"
        });
      }
      
      res.status(400).json({ 
        message: "Erreur lors de la création du compte", 
        error: error.message 
      });
    }
  });

  app.post("/api/clients/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      const client = await storage.authenticateClient(email, password);
      if (!client) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token for client session
      const token = generateToken({
        id: client.id,
        username: client.email,
        role: 'client' as any,
        entityId: client.id
      });
      
      // Don't return password in response
      const { password: _, ...clientResponse } = client;
      res.json({ client: clientResponse, token });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Don't return password in response
      const { password, ...clientResponse } = client;
      res.json(clientResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow password updates through this endpoint
      delete updates.password;
      
      const client = await storage.updateClient(id, updates);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Don't return password in response
      const { password, ...clientResponse } = client;
      res.json(clientResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.get("/api/clients/:id/stats", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const orders = await storage.getOrdersByClient(clientId);
      
      const totalOrders = orders.length;
      const totalSpent = orders
        .filter(order => !["cancelled", "refunded"].includes(order.status))
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const completedOrders = orders.filter(order => order.status === "delivered").length;
      
      // Calculate favorite merchant
      const merchantCounts = orders.reduce((acc, order) => {
        if (order.status === "delivered") {
          acc[order.merchantId] = (acc[order.merchantId] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      const favoriteMerchantId = Object.keys(merchantCounts).reduce((a, b) => 
        merchantCounts[parseInt(a)] > merchantCounts[parseInt(b)] ? a : b, "0"
      );
      
      let favoriteMerchantName = "Aucun";
      if (favoriteMerchantId !== "0") {
        const merchant = await storage.getMerchant(parseInt(favoriteMerchantId));
        favoriteMerchantName = merchant?.name || "Inconnu";
      }

      res.json({
        totalOrders,
        totalSpent: totalSpent.toFixed(2),
        completedOrders,
        favoriteMerchant: favoriteMerchantName,
        loyaltyPoints: Math.floor(totalSpent * 0.5), // 0.5 points per euro spent
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client stats" });
    }
  });

  // New customer-specific endpoints (legacy support)
  app.get("/api/orders/customer/:customerName/:customerRoom", async (req, res) => {
    try {
      const { customerName, customerRoom } = req.params;
      const orders = await storage.getOrdersByCustomer(customerName, customerRoom);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  app.get("/api/orders/customer/:customerName/:customerRoom/active", async (req, res) => {
    try {
      const { customerName, customerRoom } = req.params;
      const orders = await storage.getActiveOrdersByCustomer(customerName, customerRoom);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active customer orders" });
    }
  });

  // Customer profile endpoints (legacy support)
  app.get("/api/customers/:customerName/:customerRoom/stats", async (req, res) => {
    try {
      const { customerName, customerRoom } = req.params;
      const orders = await storage.getOrdersByCustomer(customerName, customerRoom);
      
      const totalOrders = orders.length;
      const totalSpent = orders
        .filter(order => !["cancelled", "refunded"].includes(order.status))
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const completedOrders = orders.filter(order => order.status === "delivered").length;
      
      // Calculate favorite merchant
      const merchantCounts = orders.reduce((acc, order) => {
        if (order.status === "delivered") {
          acc[order.merchantId] = (acc[order.merchantId] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>);
      
      const favoriteMerchantId = Object.keys(merchantCounts).reduce((a, b) => 
        merchantCounts[parseInt(a)] > merchantCounts[parseInt(b)] ? a : b, "0"
      );
      
      let favoriteMerchantName = "Aucun";
      if (favoriteMerchantId !== "0") {
        const merchant = await storage.getMerchant(parseInt(favoriteMerchantId));
        favoriteMerchantName = merchant?.name || "Inconnu";
      }

      res.json({
        totalOrders,
        totalSpent: totalSpent.toFixed(2),
        completedOrders,
        favoriteMerchant: favoriteMerchantName,
        loyaltyPoints: Math.floor(totalSpent * 0.5), // 0.5 points per euro spent
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer stats" });
    }
  });

  // Statistics endpoints
  app.get("/api/stats/hotel/:hotelId", requireAuth, requireEntityAccess, async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const orders = await storage.getOrdersByHotel(hotelId);
      const todayOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const totalRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const commission = totalRevenue * 0.05; // 5% for hotel

      res.json({
        todayOrders: todayOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        commission: commission.toFixed(2),
        activeClients: new Set(todayOrders.map(order => order.customerRoom)).size,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel stats" });
    }
  });

  app.get("/api/stats/merchant/:merchantId", requireAuth, requireEntityAccess, async (req, res) => {
    try {
      const merchantId = parseInt(req.params.merchantId);
      const orders = await storage.getOrdersByMerchant(merchantId);
      const products = await storage.getProductsByMerchant(merchantId);
      
      const todayOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const dailyRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) * 0.75; // 75% for merchant

      res.json({
        todayOrders: todayOrders.length,
        activeProducts: products.filter(p => p.isAvailable).length,
        dailyRevenue: dailyRevenue.toFixed(2),
        totalOrders: orders.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant stats" });
    }
  });

  app.get("/api/stats/admin", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const hotels = await storage.getAllHotels();
      const merchants = await storage.getAllMerchants();
      const orders = await storage.getAllOrders();
      
      const todayOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const commission = totalRevenue * 0.20; // 20% for Zishop

      res.json({
        totalHotels: hotels.filter(h => h.isActive).length,
        totalMerchants: merchants.filter(m => m.isOpen).length,
        todayOrders: todayOrders.length,
        activeUsers: todayOrders.length, // Simplified
        totalRevenue: totalRevenue.toFixed(2),
        commission: commission.toFixed(2),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // User Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, role, entityId } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password and role are required" });
      }
      
      if (!["admin", "hotel", "merchant"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // For hotel and merchant roles, entityId is required
      if ((role === "hotel" || role === "merchant") && !entityId) {
        return res.status(400).json({ message: `Entity ID is required for ${role} role` });
      }

      // Verify entity exists
      if (role === "hotel") {
        const hotel = await storage.getHotel(entityId);
        if (!hotel) {
          return res.status(400).json({ message: "Hotel not found" });
        }
      } else if (role === "merchant") {
        const merchant = await storage.getMerchant(entityId);
        if (!merchant) {
          return res.status(400).json({ message: "Merchant not found" });
        }
      }
      
      // Create user
      const newUser = await storage.createUser({
        username,
        password,
        role,
        entityId: entityId || null
      });
      
      // Don't return password
      const { password: _, ...userResponse } = newUser;
      res.status(201).json({ user: userResponse });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  // User Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // BYPASS AUTHENTICATION FOR TESTING - Accept any username/password
      console.log(`[TEST MODE] Login attempt for user: ${username}`);
      
      // Use the corrected authenticateUser function
      const user = await authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = generateToken(user);
      
      // Get associated entity data based on user role
      let entity = null;
      if (user.role === 'hotel' && user.entity_id) {
        entity = await storage.getHotel(user.entity_id);
      } else if (user.role === 'merchant' && user.entity_id) {
        entity = await storage.getMerchant(user.entity_id);
      }
      
      console.log(`[TEST MODE] Login successful for user: ${username} with role: ${user.role}`);
      res.json({ user, token, entity });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // With JWT, logout is handled client-side by removing the token
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Hotel-Merchant Associations
  app.get("/api/hotels/:hotelId/merchants", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const associations = await storage.getHotelMerchants(hotelId);
      
      // Get merchant details for each association
      const merchantsWithDetails = await Promise.all(
        associations.map(async (assoc) => {
          const merchant = await storage.getMerchant(assoc.merchantId);
          return {
            ...assoc,
            merchant,
          };
        })
      );
      
      res.json(merchantsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel merchants" });
    }
  });

  app.get("/api/merchants/:merchantId/hotels", async (req, res) => {
    try {
      const merchantId = parseInt(req.params.merchantId);
      const associations = await storage.getMerchantHotels(merchantId);
      
      // Get hotel details for each association
      const hotelsWithDetails = await Promise.all(
        associations.map(async (assoc) => {
          const hotel = await storage.getHotel(assoc.hotelId);
          return {
            ...assoc,
            hotel,
          };
        })
      );
      
      res.json(hotelsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch merchant hotels" });
    }
  });

  app.post("/api/hotel-merchants", async (req, res) => {
    try {
      const { hotelId, merchantId } = req.body;
      
      if (!hotelId || !merchantId) {
        return res.status(400).json({ message: "hotelId and merchantId required" });
      }
      
      const association = await storage.addHotelMerchant({
        hotelId: parseInt(hotelId),
        merchantId: parseInt(merchantId),
        isActive: true,
      });
      
      res.status(201).json(association);
    } catch (error) {
      res.status(500).json({ message: "Failed to create association" });
    }
  });

  app.put("/api/hotel-merchants/:hotelId/:merchantId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const merchantId = parseInt(req.params.merchantId);
      const { isActive } = req.body;
      
      const association = await storage.updateHotelMerchant(hotelId, merchantId, isActive);
      if (!association) {
        return res.status(404).json({ message: "Association not found" });
      }
      
      res.json(association);
    } catch (error) {
      res.status(500).json({ message: "Failed to update association" });
    }
  });

  app.delete("/api/hotel-merchants/:hotelId/:merchantId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const merchantId = parseInt(req.params.merchantId);
      
      const deleted = await storage.removeHotelMerchant(hotelId, merchantId);
      if (!deleted) {
        return res.status(404).json({ message: "Association not found" });
      }
      
      res.json({ message: "Association removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove association" });
    }
  });

  // Admin endpoints for validation
  app.get("/api/admin/products/pending", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const pendingProducts = products.filter(product => 
        !product.validationStatus || product.validationStatus === 'pending'
      );
      res.json(pendingProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending products" });
    }
  });

  app.get("/api/admin/merchants/pending", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const merchants = await storage.getAllMerchants();
      const pendingMerchants = merchants.filter(merchant => 
        !merchant.validationStatus || merchant.validationStatus === 'pending'
      );
      res.json(pendingMerchants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending merchants" });
    }
  });

  app.get("/api/admin/hotels/pending", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const hotels = await storage.getAllHotels();
      const pendingHotels = hotels.filter(hotel => 
        !hotel.validationStatus || hotel.validationStatus === 'pending'
      );
      res.json(pendingHotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending hotels" });
    }
  });

  // Add test endpoint for notifications and order simulation
  app.post("/api/test/notification", async (req, res) => {
    try {
      console.log('[TEST] Sending test notification');
      notificationService.sendTestNotification();
      res.json({ message: "Test notification sent" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  app.post("/api/test/order", async (req, res) => {
    try {
      console.log('[TEST] Creating test order');
      
      // Create a test order with mock data
      const testOrderData = {
        hotelId: 1,
        merchantId: 1,
        clientId: 1,
        customerName: "Test Client",
        customerRoom: "101",
        items: [
          { productId: 1, quantity: 2, name: "Test Product", price: 15.50 }
        ],
        totalAmount: "31.00",
        deliveryNotes: "Test order for notifications"
      };

      const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const merchantCommission = (31.00 * 0.75).toFixed(2);
      const zishopCommission = (31.00 * 0.20).toFixed(2);
      const hotelCommission = (31.00 * 0.05).toFixed(2);

      const enhancedOrderData = {
        ...testOrderData,
        orderNumber,
        merchantCommission,
        zishopCommission,
        hotelCommission,
        status: "pending",
      };

      const order = await storage.createOrder(enhancedOrderData);
      
      // Send notification about new order
      notificationService.notifyNewOrder(order);
      
      res.status(201).json({ 
        message: "Test order created and notification sent", 
        order: order
      });
    } catch (error) {
      console.error("Test order creation error:", error);
      res.status(500).json({ message: "Failed to create test order" });
    }
  });

  app.put("/api/test/order/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      console.log(`[TEST] Updating order ${orderId} status to ${status}`);
      
      const updates: any = { status };
      
      // Add timestamps based on status
      if (status === "confirmed") {
        updates.confirmedAt = new Date().toISOString();
      } else if (status === "delivered") {
        updates.deliveredAt = new Date().toISOString();
      }
      
      const order = await storage.updateOrder(orderId, updates);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send notification about status change
      const statusMessages: Record<string, string> = {
        "confirmed": "Votre commande a été confirmée par le commerçant",
        "preparing": "Votre commande est en cours de préparation",
        "ready": "Votre commande est prête",
        "delivering": "Votre commande est en cours de livraison",
        "delivered": "Votre commande a été livrée à la réception",
        "cancelled": "Votre commande a été annulée"
      };
      
      notificationService.notifyOrderUpdate({
        type: 'order_update',
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: status,
        hotelId: order.hotelId,
        merchantId: order.merchantId,
        clientId: order.clientId || undefined,
        message: statusMessages[status] || `Statut de commande mis à jour: ${status}`
      });
      
      res.json({ 
        message: "Test order status updated and notification sent", 
        order: order
      });
    } catch (error) {
      console.error("Test order status update error:", error);
      res.status(500).json({ message: "Failed to update test order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
