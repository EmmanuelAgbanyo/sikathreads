export type SellingUnit = 'yards' | 'pieces' | 'metres';
export type PublicationStatus = 'published' | 'draft' | 'archived';
export type StockStatus = 'available' | 'limited' | 'unavailable' | 'sourcing_only';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  fabricType: string; // e.g., "Authentic Kente", "GTP Wax Print", "French Beaded Lace", "Brocade / Bazin", "Hand-woven Fugu", "Duchess Satin"
  colours: string[]; // e.g. ["Gold", "Burgundy", "Emerald Green", "Royal Blue", "Ivory"]
  colourFamily: string; // "Gold/Yellow", "Red/Burgundy", "Blue", "Green", "White/Ivory", "Multicolour", "Black"
  pattern: string; // "Geometric", "Floral", "Adinkra Symbols", "Abstract", "Solid", "Embroidered"
  texture?: string; // "Rich Structured", "Crisp Cotton", "Silky Smooth", "Intricately Beaded"
  intendedUse: string[]; // ["Bridal / Wedding", "Traditional Engagement", "Formal Evening", "Church & Festivals", "Casual Modern"]
  suitableOccasions: string[]; // ["Wedding", "Traditional engagement or marriage", "Funeral", "Graduation", "Church event", "Birthday", "Formal event", "Everyday wear"]
  tags: string[];
  images: string[];
  price: number; // in GHS
  currency: 'GHS';
  sellingUnit: SellingUnit; // 'yards' or 'pieces'
  minOrderQty: number; // e.g. 2, 4, 6
  qtyIncrement: number; // e.g. 1 or 2
  stockQty: number;
  reservedQty: number;
  lowStockThreshold: number;
  publicationStatus: PublicationStatus;
  sourcingEnabled: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  displayOrder: number;
  active: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productIds: string[];
  published: boolean;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unit: SellingUnit;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'request_submitted'
  | 'awaiting_stock_verification'
  | 'awaiting_customer_confirmation'
  | 'confirmed'
  | 'preparing_order'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'sourcing_required';

export type CustomerConfirmationStatus = 'pending' | 'accepted' | 'declined';

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  deliveryPreference: 'delivery' | 'pickup';
  address?: {
    street: string;
    city: string;
    region: string; // Greater Accra, Ashanti, Western, etc.
    landmarkNotes?: string;
  };
  orderNotes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  fabricType: string;
  price: number;
  sellingUnit: SellingUnit;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface OrderRequest {
  id: string;
  orderReference: string; // e.g., "ST-2026-1042"
  customerId?: string;
  isGuest: boolean;
  customer: OrderCustomerInfo;
  items: OrderItem[];
  subtotal: number;
  proposedDeliveryFee: number;
  proposedTotal: number;
  currency: 'GHS';
  status: OrderStatus;
  customerConfirmationStatus: CustomerConfirmationStatus;
  finalAgreedPriceSnapshot?: number;
  finalAgreedDeliveryTerms?: string;
  adminNotes?: string;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StyleMatchRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  occasion: string;
  preferredColours: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  intendedOutfit: string;
  fabricTypePreference: string;
  eventTheme?: string;
  dressCode?: string;
  eventDate?: string;
  patternPreference?: string;
  texturePreference?: string;
  desiredQuantity?: number;
  desiredUnit?: SellingUnit;
  additionalNotes?: string;
  inspirationImageUrl?: string;
  marketingConsent: boolean;
  processingStatus: 'pending' | 'ai_analyzed' | 'in_review' | 'approved' | 'dispatched' | 'sourcing_routed';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'modified';
  aiAnalysisSummary?: string;
  candidateRecommendations: Array<{
    productId: string;
    rank: number;
    reason: string;
    matchScore: number;
    matchHighlights: string[];
  }>;
  approvedProductIds: string[];
  approvedMessage?: string;
  approvingAdmin?: string;
  approvedAt?: string;
  emailStatus: 'queued' | 'sent' | 'failed' | 'delayed';
  emailJobId?: string;
  deadlineAt: string; // 3-5 min target
  createdAt: string;
  updatedAt: string;
}

export interface SourcingRequest {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  occasion: string;
  desiredFabricType: string;
  colourPattern: string;
  budget: number;
  desiredQuantity: number;
  desiredUnit: SellingUnit;
  eventDate?: string;
  additionalRequirements: string;
  inspirationImageUrl?: string;
  status:
    | 'submitted'
    | 'in_research'
    | 'supplier_contacted'
    | 'swatches_reviewed'
    | 'proposal_sent'
    | 'proposal_accepted'
    | 'order_converted'
    | 'declined';
  supplierNotes?: string;
  proposal?: {
    estimatedPrice: number;
    estimatedLeadTime: string;
    notes: string;
    proposedProductId?: string;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'manual_adjustment' | 'restock' | 'order_fulfilled' | 'order_cancelled' | 'damaged';
  delta: number;
  newStock: number;
  reason: string;
  orderReference?: string;
  adminEmail: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SiteContent {
  announcementBar: {
    active: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  hero: {
    headline: string;
    supportingCopy: string;
    primaryCta: string;
    secondaryCta: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    openingHours: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  deliverySettings: {
    defaultFee: number;
    regions: Array<{
      name: string;
      fee: number;
      estimatedDays: string;
    }>;
  };
}

export interface RegisteredAccount {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  isEmailVerified?: boolean;
  avatarUrl?: string;
  savedAddresses?: Array<{
    id: string;
    street: string;
    city: string;
    region: string;
    isDefault: boolean;
  }>;
  whatsappNumber?: string;
  preferredTailorNotes?: string;
  notificationPreferences?: {
    emailOrderUpdates: boolean;
    whatsappOrderUpdates: boolean;
    restockAlerts: boolean;
    curatorStylePicks: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface RestockNotificationRequest {
  id: string;
  productId: string;
  productName: string;
  fabricType: string;
  customerEmail: string;
  customerPhone?: string;
  desiredQuantity?: number;
  status: 'pending' | 'notified';
  createdAt: string;
}

export interface GarmentPreset {
  id: string;
  name: string;
  category: 'womens' | 'mens' | 'traditional' | 'formal' | 'family';
  recommendedYards: number;
  description: string;
  typicalFabric: string;
  options?: Array<{
    id: string;
    label: string;
    yardModifier: number;
  }>;
}

export interface GarmentCalculationResult {
  preset: GarmentPreset;
  selectedOptions: string[];
  totalYards: number;
  recommendedPieces?: number;
  notes: string;
}

export interface StyleBoardItem {
  id: string;
  productId: string;
  productName: string;
  image: string;
  price: number;
  fabricType: string;
  notes?: string;
  addedAt: string;
}

export interface StyleBoard {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  items: StyleBoardItem[];
  createdAt: string;
  updatedAt: string;
}
