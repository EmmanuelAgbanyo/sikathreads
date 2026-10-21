import {
  AuditLog,
  Category,
  Collection,
  ContactEnquiry,
  GarmentCalculationResult,
  GarmentPreset,
  OrderCustomerInfo,
  OrderItem,
  OrderRequest,
  Product,
  RegisteredAccount,
  RestockNotificationRequest,
  SiteContent,
  SourcingRequest,
  StockMovement,
  StyleBoard,
  StyleMatchRequest,
  UserProfile,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COLLECTIONS,
  INITIAL_PRODUCTS,
  INITIAL_SITE_CONTENT,
} from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'sika_products',
  CATEGORIES: 'sika_categories',
  COLLECTIONS: 'sika_collections',
  ORDERS: 'sika_orders',
  STYLEMATCH: 'sika_stylematch_requests',
  SOURCING: 'sika_sourcing_requests',
  ENQUIRIES: 'sika_contact_enquiries',
  MOVEMENTS: 'sika_stock_movements',
  AUDIT: 'sika_audit_logs',
  CONTENT: 'sika_site_content',
  CURRENT_USER: 'sika_current_user',
  ACCOUNTS: 'sika_registered_accounts',
  RESTOCK_REQUESTS: 'sika_restock_requests',
  STYLE_BOARDS: 'sika_style_boards',
};

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const prefix = password.slice(0, 3) || 'sik';
  return 'pw_' + Math.abs(hash).toString(36) + '_' + btoa(prefix + 'sika');
}

const SEED_ACCOUNTS: RegisteredAccount[] = [
  {
    uid: 'adm_001',
    email: 'admin@sikathreads.com.gh',
    passwordHash: hashPassword('admin123'),
    displayName: 'Sika Store Manager',
    phoneNumber: '+233 55 771 8472',
    role: 'admin',
    isEmailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-18T00:00:00.000Z',
  },
  {
    uid: 'usr_001',
    email: 'customer@example.com',
    passwordHash: hashPassword('password123'),
    displayName: 'Ama Darko',
    phoneNumber: '+233 55 771 8472',
    role: 'customer',
    isEmailVerified: true,
    createdAt: '2026-02-15T00:00:00.000Z',
    lastLoginAt: '2026-10-18T00:00:00.000Z',
  },
];

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export class StoreService {
  // --- Products ---
  static getProducts(): Product[] {
    const products = getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    // Auto-migrate if stored products still have placeholder unsplash URLs
    if (products.some((p) => p.images?.[0]?.includes('unsplash.com'))) {
      setStoredItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return products;
  }

  static getPublishedProducts(): Product[] {
    return this.getProducts().filter((p) => p.publicationStatus === 'published');
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find((p) => p.slug === slug);
  }

  static saveProduct(product: Product, adminEmail: string = 'admin@sikathreads.com.gh'): Product {
    const products = this.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const prev = products[existingIndex];
      product.updatedAt = now;
      products[existingIndex] = product;

      // If stock changed, record stock movement
      if (prev.stockQty !== product.stockQty) {
        const delta = product.stockQty - prev.stockQty;
        this.recordStockMovement({
          id: 'sm-' + Date.now(),
          productId: product.id,
          productName: product.name,
          type: 'manual_adjustment',
          delta,
          newStock: product.stockQty,
          reason: 'Admin updated product stock in catalogue',
          adminEmail,
          timestamp: now,
        });
      }

      this.recordAuditLog(
        adminEmail,
        'admin',
        'UPDATE_PRODUCT',
        'product',
        product.id,
        `Updated product "${product.name}" details and pricing.`
      );
    } else {
      product.createdAt = now;
      product.updatedAt = now;
      products.unshift(product);

      this.recordStockMovement({
        id: 'sm-' + Date.now(),
        productId: product.id,
        productName: product.name,
        type: 'restock',
        delta: product.stockQty,
        newStock: product.stockQty,
        reason: 'Initial inventory on product creation',
        adminEmail,
        timestamp: now,
      });

      this.recordAuditLog(
        adminEmail,
        'admin',
        'CREATE_PRODUCT',
        'product',
        product.id,
        `Created new product "${product.name}".`
      );
    }

    setStoredItem(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  static deleteProduct(id: string, adminEmail: string = 'admin@sikathreads.com.gh'): boolean {
    const products = this.getProducts();
    const target = products.find((p) => p.id === id);
    if (!target) return false;

    const filtered = products.filter((p) => p.id !== id);
    setStoredItem(STORAGE_KEYS.PRODUCTS, filtered);

    this.recordAuditLog(
      adminEmail,
      'admin',
      'DELETE_PRODUCT',
      'product',
      id,
      `Removed product "${target.name}".`
    );
    return true;
  }

  // --- Inventory Adjustments ---
  static adjustStock(
    productId: string,
    delta: number,
    reason: string,
    adminEmail: string = 'admin@sikathreads.com.gh',
    type: StockMovement['type'] = 'manual_adjustment'
  ): { success: boolean; message: string; newStock?: number } {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };

    const newStock = product.stockQty + delta;
    if (newStock < 0) {
      return { success: false, message: `Cannot reduce stock below zero. Current stock is ${product.stockQty}.` };
    }

    product.stockQty = newStock;
    product.updatedAt = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.PRODUCTS, products);

    this.recordStockMovement({
      id: 'sm-' + Date.now(),
      productId: product.id,
      productName: product.name,
      type,
      delta,
      newStock,
      reason,
      adminEmail,
      timestamp: new Date().toISOString(),
    });

    this.recordAuditLog(
      adminEmail,
      'admin',
      'STOCK_ADJUSTMENT',
      'product',
      productId,
      `Adjusted stock by ${delta > 0 ? '+' : ''}${delta}. New stock: ${newStock}. Reason: ${reason}`
    );

    return { success: true, message: 'Stock adjusted successfully', newStock };
  }

  static getStockMovements(): StockMovement[] {
    return getStoredItem<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, []);
  }

  static recordStockMovement(movement: StockMovement): void {
    const movements = this.getStockMovements();
    movements.unshift(movement);
    setStoredItem(STORAGE_KEYS.MOVEMENTS, movements);
  }

  // --- Categories & Collections ---
  static getCategories(): Category[] {
    const categories = getStoredItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    if (categories.some((c) => c.image?.includes('unsplash.com'))) {
      setStoredItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return categories;
  }

  static saveCategory(category: Category, adminEmail: string = 'admin@sikathreads.com.gh'): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      categories[idx] = category;
    } else {
      categories.push(category);
    }
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
    this.recordAuditLog(adminEmail, 'admin', 'SAVE_CATEGORY', 'category', category.id, `Saved category ${category.name}`);
    return category;
  }

  static getCollections(): Collection[] {
    const collections = getStoredItem<Collection[]>(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    if (collections.some((c) => c.image?.includes('unsplash.com'))) {
      setStoredItem(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
      return INITIAL_COLLECTIONS;
    }
    return collections;
  }

  static saveCollection(collection: Collection, adminEmail: string = 'admin@sikathreads.com.gh'): Collection {
    const collections = this.getCollections();
    const idx = collections.findIndex((c) => c.id === collection.id);
    if (idx >= 0) {
      collections[idx] = collection;
    } else {
      collections.push(collection);
    }
    setStoredItem(STORAGE_KEYS.COLLECTIONS, collections);
    this.recordAuditLog(adminEmail, 'admin', 'SAVE_COLLECTION', 'collection', collection.id, `Saved collection ${collection.name}`);
    return collection;
  }

  // --- Orders ---
  static getOrders(): OrderRequest[] {
    return getStoredItem<OrderRequest[]>(STORAGE_KEYS.ORDERS, []);
  }

  static getOrderById(id: string): OrderRequest | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderReference === id);
  }

  static submitOrderRequest(
    customer: OrderCustomerInfo,
    rawItems: Array<{ productId: string; quantity: number }>,
    customerId?: string
  ): { success: boolean; order?: OrderRequest; error?: string } {
    const allProducts = this.getProducts();
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const prod = allProducts.find((p) => p.id === item.productId && p.publicationStatus === 'published');
      if (!prod) {
        return { success: false, error: `Product ${item.productId} is no longer available in the catalogue.` };
      }

      if (prod.stockQty < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Requested ${item.quantity} ${prod.sellingUnit}, but only ${prod.stockQty} are available.`,
        };
      }

      if (item.quantity < prod.minOrderQty) {
        return {
          success: false,
          error: `Minimum order for "${prod.name}" is ${prod.minOrderQty} ${prod.sellingUnit}.`,
        };
      }

      const lineTotal = prod.price * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        fabricType: prod.fabricType,
        price: prod.price,
        sellingUnit: prod.sellingUnit,
        quantity: item.quantity,
        lineTotal,
        imageUrl: prod.images[0] || '',
      });
    }

    if (validatedItems.length === 0) {
      return { success: false, error: 'Your cart contains no valid items.' };
    }

    // Determine proposed delivery fee based on region preference
    const siteContent = this.getSiteContent();
    let proposedDeliveryFee = 0;
    if (customer.deliveryPreference === 'delivery') {
      const matchedRegion = siteContent.deliverySettings.regions.find(
        (r) => customer.address?.region && r.name.toLowerCase().includes(customer.address.region.toLowerCase())
      );
      proposedDeliveryFee = matchedRegion ? matchedRegion.fee : siteContent.deliverySettings.defaultFee;
    }

    const proposedTotal = subtotal + proposedDeliveryFee;
    const now = new Date();
    const year = now.getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderReference = `ST-${year}-${randomSuffix}`;

    const newOrder: OrderRequest = {
      id: 'ord-' + Date.now(),
      orderReference,
      customerId,
      isGuest: !customerId,
      customer,
      items: validatedItems,
      subtotal,
      proposedDeliveryFee,
      proposedTotal,
      currency: 'GHS',
      status: 'request_submitted',
      customerConfirmationStatus: 'pending',
      statusHistory: [
        {
          status: 'request_submitted',
          timestamp: now.toISOString(),
          note: 'Customer submitted order request. Awaiting store verification of stock and delivery details.',
          updatedBy: customer.email,
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    this.recordAuditLog(
      customer.email,
      customerId ? 'customer' : 'guest',
      'SUBMIT_ORDER_REQUEST',
      'order',
      newOrder.id,
      `Submitted order request ${orderReference} with ${validatedItems.length} items (Proposed total: GHS ${proposedTotal})`
    );

    return { success: true, order: newOrder };
  }

  static updateOrderStatus(
    orderId: string,
    newStatus: OrderRequest['status'],
    adminEmail: string,
    note?: string,
    finalAgreedPrice?: number,
    finalDeliveryTerms?: string
  ): { success: boolean; order?: OrderRequest; error?: string } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (finalAgreedPrice !== undefined) {
      order.finalAgreedPriceSnapshot = finalAgreedPrice;
    }
    if (finalDeliveryTerms !== undefined) {
      order.finalAgreedDeliveryTerms = finalDeliveryTerms;
    }

    order.statusHistory.unshift({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated from ${oldStatus} to ${newStatus}`,
      updatedBy: adminEmail,
    });

    // If order reaches confirmed, optionally deduct stock safely
    if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
      for (const item of order.items) {
        this.adjustStock(
          item.productId,
          -item.quantity,
          `Fulfilment for confirmed order ${order.orderReference}`,
          adminEmail,
          'order_fulfilled'
        );
      }
    }

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    this.recordAuditLog(
      adminEmail,
      'admin',
      'UPDATE_ORDER_STATUS',
      'order',
      orderId,
      `Updated order ${order.orderReference} to status ${newStatus}. Note: ${note || 'None'}`
    );

    return { success: true, order };
  }

  // --- Sika StyleMatch AI Requests ---
  static getStyleMatchRequests(): StyleMatchRequest[] {
    return getStoredItem<StyleMatchRequest[]>(STORAGE_KEYS.STYLEMATCH, []);
  }

  static getStyleMatchRequestById(id: string): StyleMatchRequest | undefined {
    return this.getStyleMatchRequests().find((r) => r.id === id);
  }

  static saveStyleMatchRequest(req: StyleMatchRequest): StyleMatchRequest {
    const requests = this.getStyleMatchRequests();
    const idx = requests.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      requests[idx] = req;
    } else {
      requests.unshift(req);
    }
    setStoredItem(STORAGE_KEYS.STYLEMATCH, requests);
    return req;
  }

  // --- Sourcing Requests ---
  static getSourcingRequests(): SourcingRequest[] {
    return getStoredItem<SourcingRequest[]>(STORAGE_KEYS.SOURCING, []);
  }

  static saveSourcingRequest(req: SourcingRequest): SourcingRequest {
    const requests = this.getSourcingRequests();
    const idx = requests.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      requests[idx] = req;
    } else {
      requests.unshift(req);
    }
    setStoredItem(STORAGE_KEYS.SOURCING, requests);
    return req;
  }

  // --- Contact Enquiries ---
  static getEnquiries(): ContactEnquiry[] {
    return getStoredItem<ContactEnquiry[]>(STORAGE_KEYS.ENQUIRIES, []);
  }

  static saveEnquiry(enquiry: ContactEnquiry): ContactEnquiry {
    const enquiries = this.getEnquiries();
    const idx = enquiries.findIndex((e) => e.id === enquiry.id);
    if (idx >= 0) {
      enquiries[idx] = enquiry;
    } else {
      enquiries.unshift(enquiry);
    }
    setStoredItem(STORAGE_KEYS.ENQUIRIES, enquiries);
    return enquiry;
  }

  // --- Site Content & Settings ---
  static getSiteContent(): SiteContent {
    const content = getStoredItem<SiteContent>(STORAGE_KEYS.CONTENT, INITIAL_SITE_CONTENT);
    let updated = false;
    if (content.contactInfo?.address) {
      content.contactInfo.address = '';
      updated = true;
    }
    if (!content.contactInfo?.phone || content.contactInfo.phone.includes('24 123') || content.contactInfo.phone.includes('241234567')) {
      content.contactInfo.phone = '+233 (0) 55 771 8472';
      updated = true;
    }
    if (!content.contactInfo?.whatsapp || content.contactInfo.whatsapp.includes('241234567')) {
      content.contactInfo.whatsapp = '+233557718472';
      updated = true;
    }
    if (updated) {
      setStoredItem(STORAGE_KEYS.CONTENT, content);
    }
    return content;
  }

  static saveSiteContent(content: SiteContent, adminEmail: string = 'admin@sikathreads.com.gh'): SiteContent {
    setStoredItem(STORAGE_KEYS.CONTENT, content);
    this.recordAuditLog(adminEmail, 'admin', 'UPDATE_SITE_CONTENT', 'settings', 'global', 'Updated site settings & content');
    return content;
  }

  // --- Audit Logs ---
  static getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT, [
      {
        id: 'aud-001',
        actorEmail: 'system@sikathreads.com.gh',
        actorRole: 'system',
        action: 'CATALOGUE_INITIALIZATION',
        targetType: 'system',
        targetId: 'catalogue',
        details: 'Initial catalogue with 12 authentic Ghanaian fabrics and 6 categories seeded.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }

  static recordAuditLog(
    actorEmail: string,
    actorRole: string,
    action: string,
    targetType: string,
    targetId: string,
    details: string
  ): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: 'aud-' + Date.now(),
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
    setStoredItem(STORAGE_KEYS.AUDIT, logs.slice(0, 300));
  }

  // --- User / Admin Auth State ---
  static getCurrentUser(): UserProfile | null {
    return getStoredItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static setCurrentUser(user: UserProfile | null): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- Registered Accounts Management ---
  static getAccounts(): RegisteredAccount[] {
    return getStoredItem<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, SEED_ACCOUNTS);
  }

  static findAccountByEmail(email: string): RegisteredAccount | undefined {
    const cleanEmail = email.trim().toLowerCase();
    return this.getAccounts().find((a) => a.email.toLowerCase() === cleanEmail);
  }

  static createAccount(params: {
    email: string;
    displayName: string;
    password?: string;
    phoneNumber?: string;
    role?: 'customer' | 'admin';
  }): { success: boolean; account?: RegisteredAccount; error?: string } {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const existing = this.findAccountByEmail(cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
    }

    const accounts = this.getAccounts();
    const isAdminEmail = cleanEmail.includes('admin') || cleanEmail === 'contact@sikathreads.com.gh';
    const role = params.role || (isAdminEmail ? 'admin' : 'customer');
    const pwd = params.password || 'password123';

    const newAccount: RegisteredAccount = {
      uid: 'usr_' + Date.now(),
      email: cleanEmail,
      displayName: params.displayName.trim() || cleanEmail.split('@')[0],
      passwordHash: hashPassword(pwd),
      phoneNumber: params.phoneNumber?.trim() || '',
      role,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    accounts.unshift(newAccount);
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.recordAuditLog(
      cleanEmail,
      role,
      'USER_REGISTRATION',
      'auth',
      newAccount.uid,
      `Registered new ${role} account for ${newAccount.displayName}`
    );

    return { success: true, account: newAccount };
  }

  static authenticateAccount(
    email: string,
    password?: string
  ): { success: boolean; account?: RegisteredAccount; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    let account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      // Auto-provision demo session if account does not exist yet
      const isAdminEmail = cleanEmail.includes('admin') || cleanEmail === 'contact@sikathreads.com.gh';
      account = {
        uid: 'usr_' + Date.now(),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0].toUpperCase(),
        passwordHash: hashPassword(password || 'password123'),
        role: isAdminEmail ? 'admin' : 'customer',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      accounts.unshift(account);
      setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);
    } else {
      if (password) {
        const expectedHash = hashPassword(password);
        if (account.passwordHash && account.passwordHash !== expectedHash) {
          return { success: false, error: 'Incorrect email or password. Please verify your credentials and try again.' };
        }
      }
      account.lastLoginAt = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    this.recordAuditLog(
      account.email,
      account.role,
      'USER_SIGN_IN',
      'auth',
      account.uid,
      `User signed in with role: ${account.role}`
    );

    return { success: true, account };
  }

  static requestPasswordReset(email: string): { success: boolean; message: string; token?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    // Generic safe response to prevent user enumeration
    const genericSuccess = 'If an account exists for this email address, password reset instructions have been dispatched.';

    if (!account) {
      return { success: true, message: genericSuccess };
    }

    const token = 'rst_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    account.resetPasswordToken = token;
    account.resetPasswordExpiresAt = expiresAt;
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.recordAuditLog(
      account.email,
      account.role,
      'PASSWORD_RESET_REQUESTED',
      'auth',
      account.uid,
      `Password recovery link generated. Token expires in 1 hour.`
    );

    return { success: true, message: genericSuccess, token };
  }

  static validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
    if (!token) return { valid: false, error: 'Reset token is missing.' };
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.resetPasswordToken === token);

    if (!account) {
      return { valid: false, error: 'This password reset link is invalid or has expired.' };
    }

    if (account.resetPasswordExpiresAt && new Date(account.resetPasswordExpiresAt).getTime() < Date.now()) {
      return { valid: false, error: 'This password reset link has expired. Please request a new one.' };
    }

    return { valid: true, email: account.email };
  }

  static resetPasswordWithToken(token: string, newPassword: string): { success: boolean; error?: string } {
    const validation = this.validateResetToken(token);
    if (!validation.valid || !validation.email) {
      return { success: false, error: validation.error || 'Invalid reset token' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters in length.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.email === validation.email);
    if (!account) return { success: false, error: 'Account not found' };

    account.passwordHash = hashPassword(newPassword);
    delete account.resetPasswordToken;
    delete account.resetPasswordExpiresAt;
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.recordAuditLog(
      account.email,
      account.role,
      'PASSWORD_RESET_COMPLETED',
      'auth',
      account.uid,
      `User password was successfully reset via security token.`
    );

    return { success: true };
  }

  static changeAccountPassword(email: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) return { success: false, error: 'Account not found' };

    const expectedCurrentHash = hashPassword(currentPassword);
    if (account.passwordHash && account.passwordHash !== expectedCurrentHash) {
      return { success: false, error: 'Current password does not match our records.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters in length.' };
    }

    account.passwordHash = hashPassword(newPassword);
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.recordAuditLog(
      account.email,
      account.role,
      'PASSWORD_CHANGED',
      'auth',
      account.uid,
      `Password successfully changed from user settings.`
    );

    return { success: true };
  }

  static createEmailVerificationToken(email: string): { success: boolean; token?: string; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!account) return { success: false, error: 'Account not found' };

    const token = 'vrf_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    account.emailVerificationToken = token;
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    this.recordAuditLog(
      account.email,
      account.role,
      'EMAIL_VERIFICATION_REQUESTED',
      'auth',
      account.uid,
      `Email verification link generated.`
    );

    return { success: true, token };
  }

  static verifyEmailWithToken(token: string): { success: boolean; email?: string; error?: string } {
    if (!token) return { success: false, error: 'Verification token is required.' };
    const accounts = this.getAccounts();
    const account = accounts.find((a) => a.emailVerificationToken === token);

    if (!account) {
      return { success: false, error: 'Invalid or expired email verification link.' };
    }

    account.isEmailVerified = true;
    delete account.emailVerificationToken;
    setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);

    // Also update current user if matches
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === account.email.toLowerCase()) {
      currentUser.isEmailVerified = true;
      this.setCurrentUser(currentUser);
    }

    this.recordAuditLog(
      account.email,
      account.role,
      'EMAIL_VERIFIED',
      'auth',
      account.uid,
      `Email address verified successfully.`
    );

    return { success: true, email: account.email };
  }

  static updateAccountProfile(email: string, updates: Partial<RegisteredAccount>): { success: boolean; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

    if (accountIndex >= 0) {
      accounts[accountIndex] = {
        ...accounts[accountIndex],
        ...updates,
      };
      setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    return { success: true };
  }

  // --- Order Lookup for Public Order Tracking (/track-order) ---
  static lookupOrder(orderReference: string, contact: string): OrderRequest | undefined {
    const cleanRef = orderReference.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();
    const contactDigits = cleanContact.replace(/\D/g, '');
    const contactLast9 = contactDigits.length >= 9 ? contactDigits.slice(-9) : contactDigits;
    const orders = this.getOrders();

    return orders.find((o) => {
      const matchRef = o.orderReference.toUpperCase() === cleanRef || o.id === cleanRef;
      if (!matchRef) return false;
      const matchEmail = o.customer.email.toLowerCase() === cleanContact;
      const orderDigits = o.customer.phone.replace(/\D/g, '');
      const orderLast9 = orderDigits.length >= 9 ? orderDigits.slice(-9) : orderDigits;
      const matchPhone =
        Boolean(contactDigits.length >= 7 && (orderDigits.includes(contactDigits) || contactDigits.includes(orderDigits))) ||
        Boolean(contactLast9 && orderLast9 && contactLast9 === orderLast9);
      return matchEmail || matchPhone;
    });
  }

  // --- Restock Notification Requests ---
  static getRestockRequests(): RestockNotificationRequest[] {
    return getStoredItem<RestockNotificationRequest[]>(STORAGE_KEYS.RESTOCK_REQUESTS, []);
  }

  static createRestockRequest(
    productId: string,
    customerEmail: string,
    customerPhone?: string,
    desiredQuantity?: number
  ): { success: boolean; request?: RestockNotificationRequest; error?: string } {
    const product = this.getProductById(productId);
    if (!product) return { success: false, error: 'Product not found' };

    const requests = this.getRestockRequests();
    // Check if already registered
    const existing = requests.find(
      (r) => r.productId === productId && r.customerEmail.toLowerCase() === customerEmail.trim().toLowerCase()
    );
    if (existing) {
      return { success: true, request: existing };
    }

    const newReq: RestockNotificationRequest = {
      id: 'rst-' + Date.now(),
      productId,
      productName: product.name,
      fabricType: product.fabricType,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim(),
      desiredQuantity: desiredQuantity || product.minOrderQty,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newReq);
    setStoredItem(STORAGE_KEYS.RESTOCK_REQUESTS, requests);

    this.recordAuditLog(
      customerEmail,
      'customer',
      'RESTOCK_REQUEST',
      'product',
      productId,
      `Requested restock notification for "${product.name}"`
    );

    return { success: true, request: newReq };
  }

  static updateRestockRequestStatus(id: string, status: 'pending' | 'notified'): void {
    const requests = this.getRestockRequests();
    const target = requests.find((r) => r.id === id);
    if (target) {
      target.status = status;
      setStoredItem(STORAGE_KEYS.RESTOCK_REQUESTS, requests);
    }
  }

  // --- Style Boards ---
  static getStyleBoards(): StyleBoard[] {
    return getStoredItem<StyleBoard[]>(STORAGE_KEYS.STYLE_BOARDS, [
      {
        id: 'board-default',
        name: 'Wedding & Ceremonial Inspo',
        description: 'Curated royal kente cloths and beaded laces for upcoming Ghanaian wedding events.',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }

  static saveStyleBoard(board: StyleBoard): StyleBoard {
    const boards = this.getStyleBoards();
    const idx = boards.findIndex((b) => b.id === board.id);
    board.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      boards[idx] = board;
    } else {
      board.createdAt = new Date().toISOString();
      boards.unshift(board);
    }
    setStoredItem(STORAGE_KEYS.STYLE_BOARDS, boards);
    return board;
  }

  static deleteStyleBoard(id: string): void {
    const boards = this.getStyleBoards().filter((b) => b.id !== id);
    setStoredItem(STORAGE_KEYS.STYLE_BOARDS, boards);
  }

  // --- Garment Yardage Estimator ---
  static calculateGarmentYardage(
    presetId: string,
    selectedOptionIds: string[] = []
  ): GarmentCalculationResult | null {
    const preset = GARMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return null;

    let totalYards = preset.recommendedYards;
    if (preset.options) {
      for (const optId of selectedOptionIds) {
        const option = preset.options.find((o) => o.id === optId);
        if (option) {
          totalYards += option.yardModifier;
        }
      }
    }

    // Traditional Ghanaian wax print pieces are typically 6 yards or 12 yards (full piece)
    const recommendedPieces = Math.ceil(totalYards / 6);

    return {
      preset,
      selectedOptions: selectedOptionIds,
      totalYards,
      recommendedPieces,
      notes: `Standard recommendation for ${preset.name}: ${totalYards} yards (approx. ${recommendedPieces} piece${recommendedPieces > 1 ? 's' : ''} of 6 yards). We recommend consulting your tailor before cutting.`,
    };
  }
}

// Ghanaian Garment Presets
export const GARMENT_PRESETS: GarmentPreset[] = [
  {
    id: 'kaba-slit',
    name: 'Ghanaian Kaba & Slit',
    category: 'traditional',
    recommendedYards: 6,
    description: 'Traditional two-piece ensemble consisting of an intricate fitted blouse (kaba) and long wrap skirt (slit).',
    typicalFabric: 'Wax Print, Lace, or Kente',
    options: [
      { id: 'corset-sleeves', label: 'Elaborate statement sleeves / Corset bodice (+1 yd)', yardModifier: 1 },
      { id: 'floor-train', label: 'Extended floor-length skirt with train (+1.5 yds)', yardModifier: 1.5 },
      { id: 'headwrap-duku', label: 'Matching Headwrap / Duku (+1 yd)', yardModifier: 1 },
    ],
  },
  {
    id: 'mens-agbada',
    name: "Men's Grand Agbada (3-Piece)",
    category: 'traditional',
    recommendedYards: 10,
    description: 'Regal three-piece ceremonial attire including inner top (buba), trousers (sokoto), and flowing embroidered outer robe (agbada).',
    typicalFabric: 'Brocade / Bazin, Heavy Cotton, or Guinea Fowl',
    options: [
      { id: 'extra-wide-wings', label: 'Extra-wide ceremonial wingspan (+2 yds)', yardModifier: 2 },
      { id: 'matching-fila', label: 'Coordinating Cap / Fila (+0.5 yd)', yardModifier: 0.5 },
    ],
  },
  {
    id: 'kaftan-senegalaise',
    name: "Men's Kaftan / 2-Piece Set",
    category: 'mens',
    recommendedYards: 4,
    description: 'Sleek tailored long-line tunic shirt and straight trousers for formal and church occasions.',
    typicalFabric: 'Polished Cotton, Linen, or Bazin',
    options: [
      { id: 'longline-tunic', label: 'Knee-length long tunic cut (+1 yd)', yardModifier: 1 },
    ],
  },
  {
    id: 'fugu-smock',
    name: "Handwoven Fugu / Batakari Smock",
    category: 'traditional',
    recommendedYards: 5,
    description: 'Authentic northern Ghanaian smock woven with thick handloom cotton strips with flared pleated base.',
    typicalFabric: 'Hand-woven Northern Smock Strips',
    options: [
      { id: 'full-gored-flair', label: 'Extra-full gored flare hemline (+1.5 yds)', yardModifier: 1.5 },
    ],
  },
  {
    id: 'evening-gown',
    name: 'Luxury Floor-Length Evening Gown',
    category: 'formal',
    recommendedYards: 5,
    description: 'Sophisticated red-carpet or gala dress with tailored silhouette, mermaid flare, or A-line draping.',
    typicalFabric: 'French Beaded Lace, Duchess Satin, or Brocade',
    options: [
      { id: 'mermaid-flare', label: 'Dramatic mermaid trumpet bottom (+2 yds)', yardModifier: 2 },
      { id: 'cape-sleeves', label: 'Attached flowing shoulder cape (+2 yds)', yardModifier: 2 },
    ],
  },
  {
    id: 'couple-set',
    name: "Couple's Matching Engagement Set",
    category: 'family',
    recommendedYards: 14,
    description: 'Harmonious celebration styling: Kaba & Slit for the lady, 3-piece Kaftan/Agbada for the gentleman.',
    typicalFabric: 'Authentic Kente, Lace, or GTP NuStyle',
    options: [
      { id: 'bridesmaid-accents', label: 'Includes matching stoles for 2 attendants (+3 yds)', yardModifier: 3 },
    ],
  },
  {
    id: 'casual-shirt-dress',
    name: 'Modern Shirt Dress / Shift Dress',
    category: 'womens',
    recommendedYards: 3,
    description: 'Contemporary daytime, office, or weekend wear designed with vibrant African wax prints.',
    typicalFabric: 'African Cotton Wax Print',
    options: [
      { id: 'tiered-ruffles', label: 'Tiered ruffle hem and puff sleeves (+1 yd)', yardModifier: 1 },
    ],
  },
];

