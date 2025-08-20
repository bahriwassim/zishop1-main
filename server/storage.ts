import 'dotenv/config';
import { Hotel, InsertHotel, Merchant, InsertMerchant, Product, InsertProduct, Order, InsertOrder, User, InsertUser, AppUser, InsertAppUser, Client, InsertClient, HotelMerchant, InsertHotelMerchant } from "@shared/schema";
import { hotels, merchants, products, orders, clients, users, app_users, hotel_merchants } from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { supabaseAdmin } from './supabase-admin';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Connexion PostgreSQL: exiger DATABASE_URL en production, sinon fallback pour dev
const isProdEnv = (process.env.NODE_ENV || 'development') === 'production';

// Configuration du client PostgreSQL seulement si une URL valide est fournie
let client: any = null;
let db: any = null;

// Fonction d'initialisation de la base de données
async function initializeDatabase() {
  // Essayer d'abord avec le client Supabase si disponible
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE) {
    console.log('🔧 Tentative de connexion via Supabase...');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
      
      // Test de connexion via Supabase
      const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
      if (error) throw error;
      
      console.log('✅ Connexion Supabase établie avec succès');
      // Utiliser le client Supabase pour les requêtes
      client = supabase;
      db = supabase;
      return;
    } catch (supabaseError: any) {
      console.error('❌ Erreur de connexion Supabase:', supabaseError);
      if (isProdEnv) {
        throw new Error(`Impossible de se connecter à Supabase: ${supabaseError.message}`);
      }
      console.log('🔧 Fallback vers le stockage en mémoire pour le développement');
    }
  }

  // Si Supabase n'est pas disponible ou échoue, essayer PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      // Valider que l'URL est une URL PostgreSQL valide
      const url = new URL(process.env.DATABASE_URL);
      if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
        throw new Error('URL de base de données invalide: doit commencer par postgres:// ou postgresql://');
      }
      
      // Validation supplémentaire des composants
      if (!url.hostname || !url.pathname) {
        throw new Error('URL de base de données incomplète: hostname et nom de base de données requis');
      }
      
      console.log('🗄️ Configuration PostgreSQL détectée:', {
        host: url.hostname,
        port: url.port || '5432 (défaut)',
        database: url.pathname.slice(1),
        ssl: 'activé'
      });

      // Fallback vers PostgreSQL direct
      client = postgres(process.env.DATABASE_URL, {
        ssl: 'require',
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        connection: {
          application_name: 'zishop-app'
        },
        onnotice: (notice: any) => {
          // Ignorer les notices PostgreSQL non critiques
          if (notice.code && notice.code.startsWith('42')) {
            console.log('📝 Notice PostgreSQL:', notice.message);
          }
        }
      });

      // Test de connexion
      await client`SELECT 1 as test`;
      console.log('✅ Connexion PostgreSQL établie avec succès');
      
      db = drizzle(client);
    } catch (error: any) {
      console.error('❌ Erreur de connexion PostgreSQL:', error.message);
      if (isProdEnv) {
        // En production, on peut soit échouer gracieusement soit utiliser un fallback
        console.error('💡 Mode production: échec de la connexion à la base de données');
        console.error('💡 Vérifiez votre configuration DATABASE_URL');
        throw new Error(`Impossible de se connecter à PostgreSQL: ${error.message}`);
      }
      console.log('🔧 Fallback vers le stockage en mémoire pour le développement');
    }
  } else {
    if (isProdEnv) {
      throw new Error('DATABASE_URL manquante en production. Configurez votre connexion PostgreSQL/Supabase.');
    }
    console.log('🔧 Mode développement: utilisation du stockage en mémoire');
  }
}

// Initialiser la base de données
initializeDatabase().catch(console.error);

export { db };

export interface IStorage {
  // Hotels
  getHotel(id: number): Promise<Hotel | undefined>;
  getHotelByCode(code: string): Promise<Hotel | undefined>;
  getAllHotels(): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<Hotel>): Promise<Hotel | undefined>;

  // Merchants
  getMerchant(id: number): Promise<Merchant | undefined>;
  getAllMerchants(): Promise<Merchant[]>;
  getMerchantsNearHotel(hotel_id: number, radiusKm: number): Promise<Merchant[]>;
  createMerchant(merchant: InsertMerchant): Promise<Merchant>;
  updateMerchant(id: number, merchant: Partial<Merchant>): Promise<Merchant | undefined>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByMerchant(merchant_id: number): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByHotel(hotel_id: number): Promise<Order[]>;
  getOrdersByMerchant(merchant_id: number): Promise<Order[]>;
  getOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]>;
  getActiveOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]>;
  getOrdersByClient(clientId: number): Promise<Order[]>;
  getActiveOrdersByClient(clientId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  authenticateClient(email: string, password: string): Promise<Client | undefined>;

  // App Users (not Supabase auth users)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySupabaseId(supabaseUserId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;

  // Hotel-Merchant associations
  getHotelMerchants(hotel_id: number): Promise<HotelMerchant[]>;
  getMerchantHotels(merchant_id: number): Promise<HotelMerchant[]>;
  addHotelMerchant(association: InsertHotelMerchant): Promise<HotelMerchant>;
  updateHotelMerchant(hotel_id: number, merchant_id: number, isActive: boolean): Promise<HotelMerchant | undefined>;
  removeHotelMerchant(hotel_id: number, merchant_id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private hotels: Map<number, Hotel> = new Map();
  private merchants: Map<number, Merchant> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order> = new Map();
  private users: Map<number, User> = new Map();
  private clients: Map<number, Client> = new Map();
  private hotel_merchants: Map<number, HotelMerchant> = new Map();
  private currentId = 1;
  private dataFilePath: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dataFilePath = path.resolve(dataDir, 'storage.json');
    // Load from disk if exists, otherwise seed and persist
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const data = JSON.parse(raw);
        this.loadFromObject(data);
      } catch (e) {
        console.warn('Failed to load storage.json, seeding fresh data:', e);
        this.seedData();
        this.persist();
      }
    } else {
      this.seedData();
      this.persist();
    }
  }

  private loadFromObject(obj: any): void {
    try {
      const {
        hotels = [],
        merchants = [],
        products = [],
        orders = [],
        users = [],
        clients = [],
        hotel_merchants = [],
        currentId = 1,
      } = obj || {};

      this.hotels = new Map((hotels as any[]).map((h: any) => [h.id, h]));
      this.merchants = new Map((merchants as any[]).map((m: any) => [m.id, m]));
      this.products = new Map((products as any[]).map((p: any) => [p.id, p]));
      this.orders = new Map((orders as any[]).map((o: any) => [o.id, o]));
      this.users = new Map((users as any[]).map((u: any) => [u.id, u]));
      this.clients = new Map((clients as any[]).map((c: any) => [c.id, c]));
      this.hotel_merchants = new Map((hotel_merchants as any[]).map((hm: any, idx: number) => [hm.id ?? (idx + 1), hm]));
      this.currentId = Number.isFinite(currentId) ? currentId : this.computeNextId();
    } catch (e) {
      console.error('Error loading storage object:', e);
      this.seedData();
    }
  }

  private computeNextId(): number {
    const allIds: number[] = [
      ...Array.from(this.hotels.values()).map((x: any) => x.id),
      ...Array.from(this.merchants.values()).map((x: any) => x.id),
      ...Array.from(this.products.values()).map((x: any) => x.id),
      ...Array.from(this.orders.values()).map((x: any) => x.id),
      ...Array.from(this.users.values()).map((x: any) => x.id),
      ...Array.from(this.clients.values()).map((x: any) => x.id),
      ...Array.from(this.hotel_merchants.values()).map((x: any) => x.id),
    ].filter((v) => typeof v === 'number');
    const maxId = allIds.length ? Math.max(...allIds) : 0;
    return maxId + 1;
  }

  private persist(): void {
    try {
      const data = {
        currentId: this.currentId,
        hotels: Array.from(this.hotels.values()),
        merchants: Array.from(this.merchants.values()),
        products: Array.from(this.products.values()),
        orders: Array.from(this.orders.values()),
        users: Array.from(this.users.values()),
        clients: Array.from(this.clients.values()),
        hotel_merchants: Array.from(this.hotel_merchants.values()),
        savedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist storage:', e);
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `ZI${timestamp}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private seedData(): void {
    // Seed Hotels
    const hotel1: Hotel = {
      id: this.currentId++,
      name: "Hôtel des Champs-Élysées",
      address: "123 Avenue des Champs-Élysées, 75008 Paris",
      code: "ZI75015",
      latitude: "48.8698679",
      longitude: "2.3072976",
      qr_code: "QR_ZI75015",
      is_active: true,
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.hotels.set(hotel1.id, hotel1);

    const hotel2: Hotel = {
      id: this.currentId++,
      name: "Le Grand Hôtel",
      address: "2 Rue Scribe, 75009 Paris",
      code: "ZI75001",
      latitude: "48.8708679",
      longitude: "2.3312976",
      qr_code: "QR_ZI75001",
      is_active: true,
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.hotels.set(hotel2.id, hotel2);

    const hotel3: Hotel = {
      id: this.currentId++,
      name: "Hôtel Marais",
      address: "12 Rue de Rivoli, 75004 Paris",
      code: "ZI75003",
      latitude: "48.8558679",
      longitude: "2.3552976",
      qr_code: "QR_ZI75003",
      is_active: true,
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.hotels.set(hotel3.id, hotel3);

    // Seed Merchants
    const merchant1: Merchant = {
      id: this.currentId++,
      name: "Souvenirs de Paris",
      address: "45 Rue de Rivoli, 75001 Paris",
      category: "Souvenirs",
      latitude: "48.8718679",
      longitude: "2.3082976",
      rating: "4.8",
      review_count: 127,
      is_open: true,
      image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.merchants.set(merchant1.id, merchant1);

    const merchant2: Merchant = {
      id: this.currentId++,
      name: "Art & Craft Paris",
      address: "78 Boulevard Saint-Germain, 75005 Paris",
      category: "Artisanat",
      latitude: "48.8688679",
      longitude: "2.3102976",
      rating: "4.2",
      review_count: 89,
      is_open: true,
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.merchants.set(merchant2.id, merchant2);

    const merchant3: Merchant = {
      id: this.currentId++,
      name: "Galerie Française",
      address: "25 Rue du Louvre, 75001 Paris",
      category: "Galerie",
      latitude: "48.8638679",
      longitude: "2.3122976",
      rating: "4.9",
      review_count: 203,
      is_open: true,
      image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      validation_status: "approved",
      rejection_reason: null,
      validated_at: new Date(),
      validated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.merchants.set(merchant3.id, merchant3);

    // Seed Products (Souvenirs)
    const products = [
      { merchant_id: merchant1.id, name: "Tour Eiffel Miniature", description: "Réplique authentique de la Tour Eiffel en métal", price: "12.50", category: "Monuments", image_url: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Métal", stock: 10, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant1.id, name: "Magnet Paris", description: "Magnet collector avec vues de Paris", price: "4.90", category: "Magnets", image_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Céramique", stock: 5, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant1.id, name: "Porte-clés Louvre", description: "Porte-clés avec la pyramide du Louvre", price: "6.80", category: "Porte-clés", image_url: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Métal", stock: 2, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant2.id, name: "Artisanat Local", description: "Poterie artisanale française", price: "24.90", category: "Artisanat", image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Céramique", stock: 15, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant2.id, name: "Bijoux Artisanaux", description: "Boucles d'oreilles faites main", price: "18.50", category: "Bijoux", image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Argent", stock: 8, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant3.id, name: "Cartes Postales Vintage", description: "Collection de cartes postales parisiennes", price: "8.80", category: "Papeterie", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Papier", stock: 30, createdAt: new Date(), updatedAt: new Date() },
      { merchant_id: merchant3.id, name: "Livre d'Art Paris", description: "Livre photographique sur Paris", price: "29.20", category: "Livres", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120", isSouvenir: true, origin: "France", material: "Papier", stock: 12, createdAt: new Date(), updatedAt: new Date() },
    ];

    products.forEach(productData => {
      const product: Product = {
        id: this.currentId++,
        merchant_id: productData.merchant_id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image_url: productData.image_url,
        is_available: true,
        is_souvenir: productData.isSouvenir,
        origin: productData.origin,
        material: productData.material,
        stock: productData.stock,
        validation_status: "approved", // Default to approved for test data
        rejection_reason: null,
        validated_at: new Date(),
        validated_by: 1, // Default admin user
        created_at: productData.createdAt,
        updated_at: productData.updatedAt,
      };
      this.products.set(product.id, product);
    });

    // Seed Clients
    const client1: Client = {
      id: this.currentId++,
      email: "jean.dupont@example.com",
      password: "password123",
      first_name: "Jean",
      last_name: "Dupont",
      phone: "06 12 34 56 78",
      is_active: true,
      has_completed_tutorial: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.clients.set(client1.id, client1);

    const client2: Client = {
      id: this.currentId++,
      email: "marie.martin@example.com",
      password: "password456",
      first_name: "Marie",
      last_name: "Martin",
      phone: "06 98 76 54 32",
      is_active: true,
      has_completed_tutorial: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.clients.set(client2.id, client2);

    // Seed Orders
    const order1: Order = {
      id: this.currentId++,
      hotel_id: hotel1.id,
      merchant_id: merchant1.id,
      client_id: client1.id,
      order_number: this.generateOrderNumber(),
      customer_name: "Jean Dupont",
      customer_room: "205",
      items: [
        { productId: 4, productName: "Tour Eiffel Miniature", quantity: 2, price: "12.50" },
        { productId: 5, productName: "Magnet Paris", quantity: 1, price: "4.90" }
      ],
      total_amount: "29.90",
      status: "delivered",
      merchant_commission: "22.43", // 75%
      zishop_commission: "5.98", // 20%
      hotel_commission: "1.50", // 5%
      delivery_notes: null,
      confirmed_at: new Date(),
      delivered_at: new Date(),
      estimated_delivery: null,
      created_at: new Date(),
      updated_at: new Date(),
      picked_up: false,
      picked_up_at: null,
    };
    this.orders.set(order1.id, order1);

    const order2: Order = {
      id: this.currentId++,
      hotel_id: hotel1.id,
      merchant_id: merchant2.id,
      client_id: client2.id,
      order_number: this.generateOrderNumber(),
      customer_name: "Marie Martin",
      customer_room: "312",
      items: [
        { productId: 7, productName: "Artisanat Local", quantity: 1, price: "24.90" }
      ],
      total_amount: "24.90",
      status: "preparing",
      merchant_commission: "18.68", // 75%
      zishop_commission: "4.98", // 20%
      hotel_commission: "1.25", // 5%
      delivery_notes: null,
      confirmed_at: new Date(),
      delivered_at: null,
      estimated_delivery: null,
      created_at: new Date(),
      updated_at: new Date(),
      picked_up: false,
      picked_up_at: null,
    };
    this.orders.set(order2.id, order2);

    // Seed Users (Supabase Auth gère les mots de passe)
    const admin: User = {
      id: this.currentId++,
      username: "admin",
      role: "admin",
      entity_id: null,
      supabase_user_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(admin.id, admin);

    const hotelUser: User = {
      id: this.currentId++,
      username: "hotel1",
      role: "hotel",
      entity_id: hotel1.id,
      supabase_user_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(hotelUser.id, hotelUser);

    const merchantUser: User = {
      id: this.currentId++,
      username: "merchant1",
      role: "merchant",
      entity_id: merchant1.id,
      supabase_user_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(merchantUser.id, merchantUser);

    // Seed Hotel-Merchant associations
    const associations = [
      { hotel_id: hotel1.id, merchant_id: merchant1.id },
      { hotel_id: hotel1.id, merchant_id: merchant2.id },
      { hotel_id: hotel1.id, merchant_id: merchant3.id },
      { hotel_id: hotel2.id, merchant_id: merchant1.id },
      { hotel_id: hotel2.id, merchant_id: merchant3.id },
      { hotel_id: hotel3.id, merchant_id: merchant2.id },
      { hotel_id: hotel3.id, merchant_id: merchant3.id },
    ];

    associations.forEach(({ hotel_id, merchant_id }) => {
      const association: HotelMerchant = {
        id: this.currentId++,
        hotel_id,
        merchant_id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.hotel_merchants.set(association.id, association);
    });
  }

  // Hotel methods
  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async getHotelByCode(code: string): Promise<Hotel | undefined> {
    return Array.from(this.hotels.values()).find(hotel => hotel.code === code);
  }

  async getAllHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    try {
      // BYPASS DATABASE FOR TESTING - Create fake hotel
      console.log(`[TEST MODE] Creating fake hotel: ${insertHotel.name}`);
      
      // Generate unique hotel code if not provided
      const hotelCode = insertHotel.code || `ZI${Date.now().toString().slice(-6)}`;
      
      // Generate QR code
      const qrCode = `https://zishop.co/hotel/${hotelCode}`;
      
      const fakeHotel: Hotel = {
        id: this.currentId++,
        name: insertHotel.name,
        address: insertHotel.address,
        code: hotelCode,
        latitude: insertHotel.latitude?.toString() || "48.8566",
        longitude: insertHotel.longitude?.toString() || "2.3522",
        qr_code: qrCode,
        is_active: insertHotel.is_active !== undefined ? insertHotel.is_active : true,
        validation_status: "pending",
        rejection_reason: null,
        validated_at: null,
        validated_by: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      this.hotels.set(fakeHotel.id, fakeHotel);
      this.persist();
      console.log(`[TEST MODE] Fake hotel created with ID: ${fakeHotel.id}, Code: ${hotelCode}`);
      return fakeHotel;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }

  async updateHotel(id: number, updates: Partial<Hotel>): Promise<Hotel | undefined> {
    const hotel = this.hotels.get(id);
    if (!hotel) return undefined;
    const updatedHotel = { ...hotel, ...updates };
    this.hotels.set(id, updatedHotel);
    this.persist();
    return updatedHotel;
  }

  // Merchant methods
  async getMerchant(id: number): Promise<Merchant | undefined> {
    return this.merchants.get(id);
  }

  async getAllMerchants(): Promise<Merchant[]> {
    return Array.from(this.merchants.values());
  }

  async getMerchantsNearHotel(hotel_id: number, radiusKm: number = 3): Promise<Merchant[]> {
    const hotel = await this.getHotel(hotel_id);
    if (!hotel) return [];

    const hotelLat = parseFloat(hotel.latitude);
    const hotelLon = parseFloat(hotel.longitude);

    return Array.from(this.merchants.values()).filter(merchant => {
      const merchantLat = parseFloat(merchant.latitude);
      const merchantLon = parseFloat(merchant.longitude);
      const distance = this.calculateDistance(hotelLat, hotelLon, merchantLat, merchantLon);
      return distance <= radiusKm;
    });
  }

  async createMerchant(insertMerchant: InsertMerchant): Promise<Merchant> {
    try {
      // BYPASS DATABASE FOR TESTING - Create fake merchant
      console.log(`[TEST MODE] Creating fake merchant: ${insertMerchant.name}`);
      
      const fakeMerchant: Merchant = {
        id: this.currentId++,
        name: insertMerchant.name,
        address: insertMerchant.address,
        category: insertMerchant.category,
        latitude: insertMerchant.latitude?.toString() || "48.8566",
        longitude: insertMerchant.longitude?.toString() || "2.3522",
        rating: insertMerchant.rating?.toString() || "0.0",
        review_count: insertMerchant.review_count || 0,
        is_open: insertMerchant.is_open !== undefined ? insertMerchant.is_open : true,
        image_url: insertMerchant.image_url || null,
        validation_status: "pending",
        rejection_reason: null,
        validated_at: null,
        validated_by: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      this.merchants.set(fakeMerchant.id, fakeMerchant);
      this.persist();
      console.log(`[TEST MODE] Fake merchant created with ID: ${fakeMerchant.id}`);
      return fakeMerchant;
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  }

  async updateMerchant(id: number, updates: Partial<Merchant>): Promise<Merchant | undefined> {
    const merchant = this.merchants.get(id);
    if (!merchant) return undefined;
    const updatedMerchant = { ...merchant, ...updates };
    this.merchants.set(id, updatedMerchant);
    this.persist();
    return updatedMerchant;
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByMerchant(merchant_id: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.merchant_id === merchant_id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      description: insertProduct.description || null,
      image_url: insertProduct.image_url || null,
      is_available: insertProduct.is_available !== undefined ? insertProduct.is_available : true,
      is_souvenir: insertProduct.is_souvenir !== undefined ? insertProduct.is_souvenir : false,
      validation_status: "pending", // Default status for new products
      rejection_reason: null,
      validated_at: null,
      validated_by: null,
      origin: insertProduct.origin || null,
      material: insertProduct.material || null,
      stock: insertProduct.stock || 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.products.set(id, product);
    this.persist();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    this.persist();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const ok = this.products.delete(id);
    if (ok) this.persist();
    return ok;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.order_number === orderNumber);
  }

  async getOrdersByHotel(hotel_id: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.hotel_id === hotel_id);
  }

  async getOrdersByMerchant(merchant_id: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.merchant_id === merchant_id);
  }

  async getOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customer_name === customerName && order.customer_room === customerRoom);
  }

  async getActiveOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => 
      order.customer_name === customerName && 
      order.customer_room === customerRoom && 
      !["delivered", "cancelled", "refunded"].includes(order.status)
    );
  }

  async getOrdersByClient(clientId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.client_id === clientId);
  }

  async getActiveOrdersByClient(clientId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => 
      order.client_id === clientId && 
      !["delivered", "cancelled", "refunded"].includes(order.status)
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const orderNumber = this.generateOrderNumber();
    const totalAmount = parseFloat(insertOrder.totalAmount);
    const order: Order = {
      id,
      hotel_id: insertOrder.hotelId,
      merchant_id: insertOrder.merchantId,
      client_id: insertOrder.clientId || null,
      order_number: orderNumber,
      customer_name: insertOrder.customerName,
      customer_room: insertOrder.customerRoom,
      items: insertOrder.items,
      total_amount: insertOrder.totalAmount,
      status: insertOrder.status || "pending",
      merchant_commission: (totalAmount * 0.75).toFixed(2),
      zishop_commission: (totalAmount * 0.20).toFixed(2),
      hotel_commission: (totalAmount * 0.05).toFixed(2),
      delivery_notes: insertOrder.deliveryNotes || null,
      confirmed_at: null,
      delivered_at: null,
      estimated_delivery: insertOrder.estimatedDelivery ? new Date(insertOrder.estimatedDelivery) : null,
      created_at: new Date(),
      updated_at: new Date(),
      picked_up: false,
      picked_up_at: null,
    };
    this.orders.set(id, order);
    this.persist();
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    this.persist();
    return updatedOrder;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.email === email);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    try {
      // BYPASS DATABASE FOR TESTING - Create fake client
      console.log(`[TEST MODE] Creating fake client for: ${insertClient.email}`);
      
      const fakeClient: Client = {
        id: this.currentId++,
        email: insertClient.email,
        password: insertClient.password,
        first_name: insertClient.firstName,
        last_name: insertClient.lastName,
        phone: insertClient.phone,
        is_active: true,
        has_completed_tutorial: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      this.clients.set(fakeClient.id, fakeClient);
      this.persist();
      console.log(`[TEST MODE] Fake client created with ID: ${fakeClient.id}`);
      return fakeClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updatedClient = { ...client, ...updates, updatedAt: new Date() };
    this.clients.set(id, updatedClient);
    this.persist();
    return updatedClient;
  }

  async authenticateClient(email: string, password: string): Promise<Client | undefined> {
    const client = await this.getClientByEmail(email);
    if (client && client.password === password) {
      return client;
    }
    return undefined;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserBySupabaseId(supabaseUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.supabase_user_id === supabaseUserId);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      entity_id: insertUser.entity_id || null,
      supabase_user_id: insertUser.supabase_user_id || null,
      is_active: insertUser.is_active !== undefined ? insertUser.is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(id, user);
    this.persist();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updated_at: new Date() };
    this.users.set(id, updatedUser);
    this.persist();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const ok = this.users.delete(id);
    if (ok) this.persist();
    return ok;
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    // Note: Pour Supabase, l'authentification doit passer par Supabase Auth
    // Cette méthode est conservée pour compatibilité mais devrait utiliser Supabase Auth
    const user = await this.getUserByUsername(username);
    if (user && user.is_active) {
      return user;
    }
    return undefined;
  }

  // Hotel-Merchant associations
  async getHotelMerchants(hotel_id: number): Promise<HotelMerchant[]> {
    return Array.from(this.hotel_merchants.values()).filter((hm: any) => (hm.hotel_id ?? hm.hotelId) === hotel_id && (hm.is_active ?? hm.isActive));
  }

  async getMerchantHotels(merchant_id: number): Promise<HotelMerchant[]> {
    return Array.from(this.hotel_merchants.values()).filter((hm: any) => (hm.merchant_id ?? hm.merchantId) === merchant_id && (hm.is_active ?? hm.isActive));
  }

  async addHotelMerchant(association: InsertHotelMerchant): Promise<HotelMerchant> {
    const id = this.currentId++;
    const hotelMerchant: HotelMerchant = {
      id,
      hotel_id: association.hotel_id,
      merchant_id: association.merchant_id,
      is_active: association.is_active !== undefined ? association.is_active : true,
      created_at: new Date(),
      updated_at: new Date(),
    };
          this.hotel_merchants.set(id, hotelMerchant);
    this.persist();
    return hotelMerchant;
  }

  async updateHotelMerchant(hotel_id: number, merchant_id: number, isActive: boolean): Promise<HotelMerchant | undefined> {
    const association = Array.from(this.hotel_merchants.values()).find((hm: any) => (hm.hotel_id ?? hm.hotelId) === hotel_id && (hm.merchant_id ?? hm.merchantId) === merchant_id);
    if (!association) return undefined;
    (association as any).is_active = isActive;
    (association as any).updated_at = new Date();
    this.persist();
    return association as any;
  }

  async removeHotelMerchant(hotel_id: number, merchant_id: number): Promise<boolean> {
    const association = Array.from(this.hotel_merchants.entries()).find(([_, hm]: any) => ((hm.hotel_id ?? hm.hotelId) === hotel_id) && ((hm.merchant_id ?? hm.merchantId) === merchant_id));
    if (!association) return false;
    const ok = this.hotel_merchants.delete(association[0]);
    if (ok) this.persist();
    return ok;
  }
}

export class PostgresStorage implements IStorage {
  private sb = supabaseAdmin;
  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    try {
      console.log(`Creating hotel: ${hotel.name}`);
      
      // Generate QR code automatically
      const generateQRCode = (hotelCode: string): string => {
        return `https://zishop.co/hotel/${hotelCode}`;
      };

      const hotelDataWithQR = {
        ...hotel,
        qrCode: generateQRCode(hotel.code),
      };

      console.log("Hotel data with QR:", hotelDataWithQR);
      
      const [created] = await db.insert(hotels).values(hotelDataWithQR).returning();
      if (!created) throw new Error('Erreur lors de la création de l\'hôtel');
      return created;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }

  async createMerchant(merchant: InsertMerchant): Promise<Merchant> {
    try {
      console.log(`Creating merchant: ${merchant.name}`);
      
      const [created] = await db.insert(merchants).values(merchant).returning();
      if (!created) throw new Error('Erreur lors de la création du commerçant');
      return created;
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  }
  // À implémenter : méthodes CRUD utilisant Drizzle ORM
  async getAllHotels(): Promise<Hotel[]> {
    if (this.sb) {
      const { data, error } = await this.sb.from('hotels').select('*');
      if (error) throw error;
      return data as any;
    }
    return await db.select().from(hotels);
  }
  async getHotel(id: number): Promise<Hotel | undefined> {
    try {
      const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
      return hotel;
    } catch (error) {
      console.error('Error getting hotel:', error);
      return undefined;
    }
  }
  async getHotelByCode(code: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.code, code));
    return hotel;
  }
  async getAllMerchants(): Promise<Merchant[]> {
    if (this.sb) {
      const { data, error } = await this.sb.from('merchants').select('*');
      if (error) throw error;
      return data as any;
    }
    return await db.select().from(merchants);
  }
  async getMerchant(id: number): Promise<Merchant | undefined> {
    try {
      const [merchant] = await db.select().from(merchants).where(eq(merchants.id, id));
      return merchant;
    } catch (error) {
      console.error('Error getting merchant:', error);
      return undefined;
    }
  }
  async getMerchantsNearHotel(hotel_id: number, radiusKm: number): Promise<Merchant[]> {
    const hotel = await this.getHotel(hotel_id);
    if (!hotel) return [];

    const hotelLat = parseFloat(hotel.latitude);
    const hotelLon = parseFloat(hotel.longitude);

    return await db.select().from(merchants).where(
      sql`ST_Distance(
        ST_MakePoint(${hotelLon}, ${hotelLat}),
        ST_MakePoint(longitude, latitude)
      ) * 0.001 <= ${radiusKm}`
    );
  }
  async updateHotel(id: number, hotel: Partial<Hotel>): Promise<Hotel | undefined> {
    const [updated] = await db.update(hotels).set(hotel).where(eq(hotels.id, id)).returning();
    return updated;
  }
  async updateMerchant(id: number, merchant: Partial<Merchant>): Promise<Merchant | undefined> {
    const [updated] = await db.update(merchants).set(merchant).where(eq(merchants.id, id)).returning();
    return updated;
  }
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getProductsByMerchant(merchant_id: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.merchant_id, merchant_id));
  }
  async getAllProducts(): Promise<Product[]> {
    if (this.sb) {
      const { data, error } = await this.sb.from('products').select('*');
      if (error) throw error;
      return data as any;
    }
    return await db.select().from(products);
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    if (!created) throw new Error('Erreur lors de la création du produit');
    return created;
  }
  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated;
  }
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.order_number, orderNumber));
    return order;
  }
  async getOrdersByHotel(hotel_id: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.hotel_id, hotel_id));
  }
  async getOrdersByMerchant(merchant_id: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.merchant_id, merchant_id));
  }
  async getOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]> {
    return await db.select().from(orders).where(
      sql`customerName = ${customerName} AND customerRoom = ${customerRoom}`
    );
  }
  async getActiveOrdersByCustomer(customerName: string, customerRoom: string): Promise<Order[]> {
    return await db.select().from(orders).where(
      sql`customerName = ${customerName} AND customerRoom = ${customerRoom} AND status NOT IN ('delivered', 'cancelled', 'refunded')`
    );
  }
  async getOrdersByClient(clientId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.client_id, clientId));
  }
  async getActiveOrdersByClient(clientId: number): Promise<Order[]> {
    return await db.select().from(orders).where(
      sql`clientId = ${clientId} AND status NOT IN ('delivered', 'cancelled', 'refunded')`
    );
  }
  async getAllOrders(): Promise<Order[]> {
    if (this.sb) {
      const { data, error } = await this.sb.from('orders').select('*');
      if (error) throw error;
      return data as any;
    }
    return await db.select().from(orders);
  }
  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ZI${Date.now().toString().slice(-6)}`;
    const [created] = await db.insert(orders).values({
      ...order,
      orderNumber,
    }).returning();
    if (!created) throw new Error('Erreur lors de la création de la commande');
    return created;
  }
  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return updated;
  }
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client;
  }
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  async createClient(client: InsertClient): Promise<Client> {
    const hashedPassword = await bcrypt.hash((client as any).password, 10);
    const [created] = await db.insert(clients).values({
      ...client,
      password: hashedPassword,
      isActive: true,
      hasCompletedTutorial: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    if (!created) throw new Error('Erreur lors de la création du client');
    return created;
  }
  async updateClient(id: number, client: Partial<Client>): Promise<Client | undefined> {
    const [updated] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updated;
  }
  async authenticateClient(email: string, password: string): Promise<Client | undefined> {
    try {
      const client = await this.getClientByEmail(email);
      if (!client) return undefined;
      const ok = await bcrypt.compare(password, (client as any).password);
      return ok ? client : undefined;
    } catch (error) {
      console.error('Client authentication error:', error);
      return undefined;
    }
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(app_users).where(eq(app_users.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(app_users).where(eq(app_users.username, username));
    return user;
  }
  async getUserBySupabaseId(supabaseUserId: string): Promise<User | undefined> {
    const [user] = await db.select().from(app_users).where(eq(app_users.supabase_user_id, supabaseUserId));
    return user;
  }
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(app_users);
  }
  async createUser(user: InsertUser): Promise<User> {
    // Note: Pour Supabase, l'authentification est gérée séparément
    // Ici nous créons juste l'entrée métier dans app_users
    const [created] = await db.insert(app_users).values({
      ...user,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();
    if (!created) throw new Error('Erreur lors de la création de l\'utilisateur');
    return created;
  }
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(app_users).set({
      ...user,
      updated_at: new Date(),
    }).where(eq(app_users.id, id)).returning();
    return updated;
  }
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(app_users).where(eq(app_users.id, id)).returning();
    return result.length > 0;
  }
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    // Note: Pour Supabase, l'authentification doit passer par Supabase Auth
    // Cette méthode est conservée pour compatibilité mais devrait utiliser Supabase Auth
    const user = await this.getUserByUsername(username);
    if (!user || !user.is_active) return undefined;
    return user;
  }
  async getHotelMerchants(hotel_id: number): Promise<HotelMerchant[]> {
    return await db.select().from(hotel_merchants).where(
      sql`hotel_id = ${hotel_id} AND is_active = true`
    );
  }
  async getMerchantHotels(merchant_id: number): Promise<HotelMerchant[]> {
    return await db.select().from(hotel_merchants).where(
      sql`merchant_id = ${merchant_id} AND is_active = true`
    );
  }
  async addHotelMerchant(association: InsertHotelMerchant): Promise<HotelMerchant> {
    const [created] = await db.insert(hotel_merchants).values({
      ...association,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();
    if (!created) throw new Error('Erreur lors de l\'ajout de l\'association Hotel-Merchant');
    return created;
  }
  async updateHotelMerchant(hotel_id: number, merchant_id: number, isActive: boolean): Promise<HotelMerchant | undefined> {
    const [updated] = await db.update(hotel_merchants).set({ is_active: isActive, updated_at: new Date() }).where(
      sql`hotel_id = ${hotel_id} AND merchant_id = ${merchant_id}`
    ).returning();
    return updated;
  }
  async removeHotelMerchant(hotel_id: number, merchant_id: number): Promise<boolean> {
    const result = await db.delete(hotel_merchants).where(
      sql`hotel_id = ${hotel_id} AND merchant_id = ${merchant_id}`
    ).returning();
    return result.length > 0;
  }
}

// Choisir le storage selon l'environnement
export const storage = isProdEnv && process.env.DATABASE_URL
  ? new PostgresStorage()
  : new MemStorage();
console.log(storage instanceof PostgresStorage ? '🗄️ Using PostgresStorage (Supabase)' : '🔧 Using MemStorage for development/testing');
