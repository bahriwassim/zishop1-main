export interface Product {
  id: number;
  merchantId: number;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isAvailable: boolean;
  category: string;
  isSouvenir: boolean;
  origin?: string;
  material?: string;
}

export interface Merchant {
  id: number;
  name: string;
  address: string;
  category: string;
  latitude: string;
  longitude: string;
  rating: string;
  reviewCount: number;
  isOpen: boolean;
  imageUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  products?: Product[];
}

export interface Hotel {
  id: number;
  name: string;
  address: string;
  code: string;
  latitude: string;
  longitude: string;
  qrCode: string;
  isActive: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  merchants?: Merchant[];
}

export interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  hasCompletedTutorial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  hotelId: number;
  merchantId: number;
  clientId?: number;
  orderNumber: string;
  customerName: string;
  customerRoom: string;
  items: OrderItem[];
  totalAmount: string;
  status: string;
  merchantCommission?: string;
  zishopCommission?: string;
  hotelCommission?: string;
  deliveryNotes?: string;
  confirmedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  pickedUp?: boolean;
  pickedUpAt?: string;
}

export interface AdminProductValidation {
  productId: number;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  validatedAt: Date;
  validatedBy: string;
}

export interface AdminMerchantValidation {
  merchantId: number;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  validatedAt: Date;
  validatedBy: string;
}

export interface AdminHotelValidation {
  hotelId: number;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  validatedAt: Date;
  validatedBy: string;
} 