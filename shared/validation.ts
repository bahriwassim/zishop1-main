import { z } from 'zod';

// Schémas de validation de base
export const baseValidation = {
  id: z.number().positive().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
};

// Validation des coordonnées géographiques
export const coordinatesSchema = z.object({
  latitude: z.string().regex(/^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/, {
    message: 'Latitude invalide (doit être entre -90 et 90)'
  }),
  longitude: z.string().regex(/^-?((1[0-7][0-9]|[1-9]?[0-9])(\.[0-9]+)?|180(\.0+)?)$/, {
    message: 'Longitude invalide (doit être entre -180 et 180)'
  }),
});

// Validation des emails
export const emailSchema = z.string()
  .email('Format d\'email invalide')
  .min(5, 'Email trop court')
  .max(255, 'Email trop long')
  .transform(email => email.toLowerCase().trim());

// Validation des mots de passe
export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe est trop long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  });

// Validation des noms
export const nameSchema = z.string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom est trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  })
  .transform(name => name.trim());

// Validation des numéros de téléphone
export const phoneSchema = z.string()
  .regex(/^[\+]?[0-9\s\-\(\)]{8,20}$/, {
    message: 'Format de numéro de téléphone invalide'
  })
  .transform(phone => phone.replace(/[\s\-\(\)]/g, ''));

// Validation des prix
export const priceSchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Format de prix invalide (ex: 10.99)'
  })
  .transform(price => {
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) {
      throw new Error('Le prix doit être un nombre positif');
    }
    return price;
  });

// Validation des codes d'hôtel
export const hotelCodeSchema = z.string()
  .min(3, 'Le code d\'hôtel doit contenir au moins 3 caractères')
  .max(20, 'Le code d\'hôtel est trop long')
  .regex(/^[A-Z0-9]+$/, {
    message: 'Le code d\'hôtel ne peut contenir que des lettres majuscules et des chiffres'
  })
  .transform(code => code.toUpperCase());

// Validation des URLs
export const urlSchema = z.string()
  .url('Format d\'URL invalide')
  .max(500, 'L\'URL est trop longue')
  .optional()
  .nullable();

// Validation des catégories
export const categorySchema = z.string()
  .min(2, 'La catégorie doit contenir au moins 2 caractères')
  .max(50, 'La catégorie est trop longue')
  .transform(cat => cat.trim());

// Validation des descriptions
export const descriptionSchema = z.string()
  .max(1000, 'La description est trop longue')
  .optional()
  .nullable()
  .transform(desc => desc?.trim() || null);

// Validation des quantités
export const quantitySchema = z.number()
  .int('La quantité doit être un nombre entier')
  .min(1, 'La quantité doit être au moins 1')
  .max(999, 'La quantité est trop importante');

// Validation des statuts de commande
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
  'cancelled'
], {
  errorMap: () => ({ message: 'Statut de commande invalide' })
});

// Validation des rôles utilisateur
export const userRoleSchema = z.enum([
  'admin',
  'hotel',
  'merchant'
], {
  errorMap: () => ({ message: 'Rôle utilisateur invalide' })
});

// Validation des statuts de validation
export const validationStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected'
], {
  errorMap: () => ({ message: 'Statut de validation invalide' })
});

// Schémas de validation complets
export const hotelValidationSchema = z.object({
  name: nameSchema,
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères').max(500),
  code: hotelCodeSchema,
  ...coordinatesSchema.shape,
  qr_code: urlSchema,
  is_active: z.boolean().default(true),
});

export const merchantValidationSchema = z.object({
  name: nameSchema,
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères').max(500),
  category: categorySchema,
  ...coordinatesSchema.shape,
  rating: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Note invalide').default('0.0'),
  review_count: z.number().int().min(0).default(0),
  is_open: z.boolean().default(true),
  image_url: urlSchema,
});

export const productValidationSchema = z.object({
  merchant_id: z.number().positive('ID de commerçant invalide'),
  name: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  image_url: urlSchema,
  is_available: z.boolean().default(true),
  category: categorySchema,
  is_souvenir: z.boolean().default(false),
  origin: z.string().max(100).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  stock: z.number().int().min(0).default(100),
  validation_status: validationStatusSchema.default('pending'),
  rejection_reason: z.string().max(500).optional().nullable(),
});

export const clientValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: nameSchema,
  last_name: nameSchema,
  phone: phoneSchema,
  is_active: z.boolean().default(true),
  has_completed_tutorial: z.boolean().default(false),
});

export const orderValidationSchema = z.object({
  hotel_id: z.number().positive('ID d\'hôtel invalide'),
  merchant_id: z.number().positive('ID de commerçant invalide'),
  client_id: z.number().positive('ID de client invalide').optional(),
  order_number: z.string().min(5, 'Numéro de commande trop court').max(50),
  customer_name: nameSchema,
  customer_room: z.string().min(1, 'Numéro de chambre requis').max(20),
  items: z.array(z.object({
    product_id: z.number().positive('ID de produit invalide'),
    quantity: quantitySchema,
    name: nameSchema,
    price: priceSchema,
  })).min(1, 'Au moins un article est requis'),
  total_amount: priceSchema,
  status: orderStatusSchema.default('pending'),
  delivery_notes: z.string().max(500).optional().nullable(),
  estimated_delivery: z.string().datetime().optional().nullable(),
});

export const userValidationSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur est trop long')
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
    }),
  password: passwordSchema,
  role: userRoleSchema,
  entity_id: z.number().positive().optional().nullable(),
});

// Fonctions de validation utilitaires
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      throw new Error(`Validation échouée: ${JSON.stringify(formattedErrors)}`);
    }
    throw error;
  }
};

export const validatePartial = <T>(schema: z.ZodSchema<T>, data: unknown): Partial<T> => {
  try {
    return schema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      throw new Error(`Validation partielle échouée: ${JSON.stringify(formattedErrors)}`);
    }
    throw error;
  }
};

// Validation des paramètres de requête
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Terme de recherche requis').max(100),
  category: categorySchema.optional(),
  min_price: priceSchema.optional(),
  max_price: priceSchema.optional(),
  ...paginationSchema.shape,
});

// Export des types
export type HotelValidation = z.infer<typeof hotelValidationSchema>;
export type MerchantValidation = z.infer<typeof merchantValidationSchema>;
export type ProductValidation = z.infer<typeof productValidationSchema>;
export type ClientValidation = z.infer<typeof clientValidationSchema>;
export type OrderValidation = z.infer<typeof orderValidationSchema>;
export type UserValidation = z.infer<typeof userValidationSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchSchema>;
