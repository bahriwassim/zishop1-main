import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  code: text("code").notNull().unique(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  qr_code: text("qr_code").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  validation_status: text("validation_status").default("pending").notNull(),
  rejection_reason: text("rejection_reason"),
  validated_at: timestamp("validated_at"),
  validated_by: integer("validated_by").references(() => app_users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    codeIdx: uniqueIndex("idx_hotels_code").on(table.code),
    activeIdx: index("idx_hotels_active").on(table.is_active),
    latitudeIdx: index("idx_hotels_latitude").on(table.latitude),
    longitudeIdx: index("idx_hotels_longitude").on(table.longitude),
    validationIdx: index("idx_hotels_validation_status").on(table.validation_status),
  };
});

export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  category: text("category").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  rating: text("rating").default("0.0").notNull(),
  review_count: integer("review_count").default(0).notNull(),
  is_open: boolean("is_open").default(true).notNull(),
  image_url: text("image_url"),
  validation_status: text("validation_status").default("pending").notNull(),
  rejection_reason: text("rejection_reason"),
  validated_at: timestamp("validated_at"),
  validated_by: integer("validated_by").references(() => app_users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    categoryIdx: index("idx_merchants_category").on(table.category),
    latitudeIdx: index("idx_merchants_latitude").on(table.latitude),
    longitudeIdx: index("idx_merchants_longitude").on(table.longitude),
    openIdx: index("idx_merchants_open").on(table.is_open),
    validationIdx: index("idx_merchants_validation_status").on(table.validation_status),
  };
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  merchant_id: integer("merchant_id").references(() => merchants.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  image_url: text("image_url"),
  is_available: boolean("is_available").default(true).notNull(),
  category: text("category").notNull(),
  is_souvenir: boolean("is_souvenir").default(false).notNull(),
  origin: text("origin"),
  material: text("material"),
  stock: integer("stock").default(100),
  validation_status: text("validation_status").default("pending").notNull(),
  rejection_reason: text("rejection_reason"),
  validated_at: timestamp("validated_at"),
  validated_by: integer("validated_by").references(() => app_users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    merchantIdx: index("idx_products_merchant_id").on(table.merchant_id),
    categoryIdx: index("idx_products_category").on(table.category),
    validationIdx: index("idx_products_validation_status").on(table.validation_status),
  };
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  phone: text("phone").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  has_completed_tutorial: boolean("has_completed_tutorial").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex("idx_clients_email").on(table.email),
  };
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  hotel_id: integer("hotel_id").references(() => hotels.id, { onDelete: "cascade" }).notNull(),
  merchant_id: integer("merchant_id").references(() => merchants.id, { onDelete: "cascade" }).notNull(),
  client_id: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  order_number: text("order_number").notNull().unique(),
  customer_name: text("customer_name").notNull(),
  customer_room: text("customer_room").notNull(),
  items: jsonb("items").notNull(),
  total_amount: text("total_amount").notNull(),
  status: text("status").default("pending").notNull(),
  merchant_commission: text("merchant_commission"),
  zishop_commission: text("zishop_commission"),
  hotel_commission: text("hotel_commission"),
  delivery_notes: text("delivery_notes"),
  confirmed_at: timestamp("confirmed_at"),
  delivered_at: timestamp("delivered_at"),
  estimated_delivery: timestamp("estimated_delivery"),
  picked_up: boolean("picked_up").default(false),
  picked_up_at: timestamp("picked_up_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    hotelIdx: index("idx_orders_hotel_id").on(table.hotel_id),
    merchantIdx: index("idx_orders_merchant_id").on(table.merchant_id),
    clientIdx: index("idx_orders_client_id").on(table.client_id),
    statusIdx: index("idx_orders_status").on(table.status),
    createdAtIdx: index("idx_orders_created_at").on(table.created_at),
  };
});

// Note: Table 'users' est gérée par Supabase Auth - nous utilisons 'app_users' pour nos données métier
export const app_users = pgTable("app_users", {
  id: serial("id").primaryKey(),
  supabase_user_id: text("supabase_user_id").unique(), // Référence vers auth.users
  username: text("username").notNull().unique(),
  role: text("role").notNull(),
  entity_id: integer("entity_id"),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    usernameIdx: uniqueIndex("idx_users_username").on(table.username),
    roleIdx: index("idx_users_role").on(table.role),
    entityIdx: index("idx_users_entity_id").on(table.entity_id),
  };
});

// Alias pour compatibilité avec le code existant
export const users = app_users;

export const hotel_merchants = pgTable("hotel_merchants", {
  id: serial("id").primaryKey(),
  hotel_id: integer("hotel_id").references(() => hotels.id, { onDelete: "cascade" }).notNull(),
  merchant_id: integer("merchant_id").references(() => merchants.id, { onDelete: "cascade" }).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    uniquePair: uniqueIndex("hotel_merchants_hotel_id_merchant_id_key").on(table.hotel_id, table.merchant_id),
  };
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  created_at: true,
  updated_at: true,
  validation_status: true,
  rejection_reason: true,
  validated_at: true,
  validated_by: true,
}).transform((data) => ({
  ...data,
  latitude: data.latitude?.toString() || "48.8566",
  longitude: data.longitude?.toString() || "2.3522",
  qr_code: data.qr_code || `https://zishop.co/hotel/${data.code || 'ZI' + Date.now()}`
}));

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
  created_at: true,
  updated_at: true,
  validation_status: true,
  rejection_reason: true,
  validated_at: true,
  validated_by: true,
}).transform((data) => ({
  ...data,
  latitude: data.latitude?.toString() || "48.8566",
  longitude: data.longitude?.toString() || "2.3522",
  rating: data.rating?.toString() || "0.0",
  review_count: data.review_count || 0,
  is_open: data.is_open !== undefined ? data.is_open : true
}));

export const insertProductSchema = z.object({
  merchantId: z.number(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional().default(""),
  price: z.string().min(1, "Le prix est requis"),
  imageUrl: z.string().optional().default(""),
  isAvailable: z.boolean().optional().default(true),
  category: z.string().min(1, "La catégorie est requise"),
  isSouvenir: z.boolean().optional().default(false),
  origin: z.string().optional().default(""),
  material: z.string().optional().default(""),
  stock: z.number().optional().default(0),
}).transform((data) => ({
  merchant_id: data.merchantId,
  name: data.name,
  description: data.description || "",
  price: data.price,
  image_url: data.imageUrl || "",
  is_available: data.isAvailable,
  category: data.category,
  is_souvenir: data.isSouvenir,
  origin: data.origin || "",
  material: data.material || "",
  stock: data.stock || 0,
  validation_status: "pending",
  rejection_reason: null,
  validated_at: null,
  validated_by: null,
}));

export const insertClientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string(),
});

export const insertOrderSchema = z.object({
  hotelId: z.number(),
  merchantId: z.number(),
  clientId: z.number().optional(),
  customerName: z.string().min(1, "Le nom du client est requis"),
  customerRoom: z.string().min(1, "Le numéro de chambre est requis"),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    name: z.string(),
    price: z.string()
  })),
  totalAmount: z.string().min(1, "Le montant total est requis"),
  status: z.string().optional().default("pending"),
  deliveryNotes: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

export const insertUserSchema = createInsertSchema(app_users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertHotelMerchantSchema = createInsertSchema(hotel_merchants).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.input<typeof insertClientSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type User = typeof app_users.$inferSelect;
export type AppUser = typeof app_users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAppUser = z.infer<typeof insertUserSchema>;

export type HotelMerchant = typeof hotel_merchants.$inferSelect;
export type InsertHotelMerchant = z.infer<typeof insertHotelMerchantSchema>;
