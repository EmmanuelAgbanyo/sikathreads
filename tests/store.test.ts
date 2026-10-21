import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { StoreService } from '../src/services/storeService';
import { StyleMatchService } from '../src/services/stylematchAI';
import { AIChatService } from '../src/services/aiChatService';
import { EmailService } from '../src/services/emailService';
import { Product, StyleMatchRequest } from '../src/types';

// Mock localStorage for Node test runner
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Sika Threads Core Business Logic Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Retrieves seed catalogue of published Ghanaian fabrics with prices in GHS', () => {
    const products = StoreService.getPublishedProducts();
    expect(products.length).toBeGreaterThanOrEqual(10);

    const kente = products.find((p) => p.fabricType.includes('Kente'));
    expect(kente).toBeDefined();
    expect(kente?.currency).toBe('GHS');
    expect(kente?.price).toBeGreaterThan(0);
  });

  it('2. Enforces minimum order quantity (MOQ) and stock checks on order submission', () => {
    const products = StoreService.getPublishedProducts();
    const testProd = products[0];

    const excessiveOrder = StoreService.submitOrderRequest(
      {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+233241234567',
        deliveryPreference: 'pickup',
      },
      [{ productId: testProd.id, quantity: testProd.stockQty + 50 }]
    );

    expect(excessiveOrder.success).toBe(false);
    expect(excessiveOrder.error).toContain('Insufficient stock');
  });

  it('3. Successfully creates Order Request with unique ST-2026 reference without online payment', () => {
    const products = StoreService.getPublishedProducts();
    const testProd = products[0];

    const result = StoreService.submitOrderRequest(
      {
        name: 'Kwame Boateng',
        email: 'kwame@example.com',
        phone: '+233241112233',
        deliveryPreference: 'pickup',
      },
      [{ productId: testProd.id, quantity: testProd.minOrderQty }]
    );

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order?.orderReference).toMatch(/^ST-\d{4}-\d{4}$/);
    expect(result.order?.status).toBe('request_submitted');
    expect(result.order?.customerConfirmationStatus).toBe('pending');
    expect(result.order?.currency).toBe('GHS');
  });

  it('4. Sika StyleMatch AI strictly matches against catalogue and never invents products', () => {
    const request: StyleMatchRequest = {
      id: 'sm-test-1',
      customerName: 'Ama Serwaa',
      customerEmail: 'ama@example.com',
      occasion: 'Wedding',
      preferredColours: ['Gold', 'Burgundy'],
      budgetRange: { min: 200, max: 3500 },
      intendedOutfit: 'Traditional Engagement Kaba and Slit',
      fabricTypePreference: 'Recommend the best type for me',
      marketingConsent: false,
      processingStatus: 'in_review',
      approvalStatus: 'pending',
      candidateRecommendations: [],
      approvedProductIds: [],
      emailStatus: 'queued',
      deadlineAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const analysis = StyleMatchService.analyzeRequest(request);

    expect(analysis.candidates.length).toBeGreaterThan(0);
    const allProducts = StoreService.getPublishedProducts();
    for (const cand of analysis.candidates) {
      const match = allProducts.find((p) => p.id === cand.productId);
      expect(match).toBeDefined();
      expect(cand.product.price).toBe(match?.price);
      expect(cand.reason).toBeTruthy();
    }
  });

  it('5. Safe inventory adjustment updates stock and records immutable audit movement log', () => {
    const products = StoreService.getPublishedProducts();
    const prod = products[0];
    const initialStock = prod.stockQty;

    const adjustResult = StoreService.adjustStock(
      prod.id,
      5,
      'Received new bolt from Kumasi',
      'admin@sikathreads.com.gh',
      'restock'
    );

    expect(adjustResult.success).toBe(true);
    expect(adjustResult.newStock).toBe(initialStock + 5);

    const movements = StoreService.getStockMovements();
    expect(movements[0].productId).toBe(prod.id);
    expect(movements[0].delta).toBe(5);
    expect(movements[0].adminEmail).toBe('admin@sikathreads.com.gh');
  });

  it('6. Transactional email generation contains official brand tagline and idempotency key', () => {
    const products = StoreService.getPublishedProducts();
    const orderResult = StoreService.submitOrderRequest(
      {
        name: 'Kofi Mensah',
        email: 'kofi@example.com',
        phone: '+233240000000',
        deliveryPreference: 'pickup',
      },
      [{ productId: products[0].id, quantity: products[0].minOrderQty }]
    );

    expect(orderResult.order).toBeDefined();
    const emailJob = EmailService.sendOrderAcknowledgement(orderResult.order!);

    expect(emailJob.htmlBody).toContain('Weaving Heritage, Stitching Modernity.');
    expect(emailJob.idempotencyKey).toBe(`ack_${orderResult.order?.orderReference}`);
    expect(emailJob.recipientEmail).toBe('kofi@example.com');
  });

  it('7. Calculates accurate yardage and piece estimates for Ghanaian garments with tailoring variations', () => {
    // Kaba & Slit: base 6 yards
    const baseCalc = StoreService.calculateGarmentYardage('kaba-slit', []);
    expect(baseCalc).not.toBeNull();
    expect(baseCalc?.totalYards).toBe(6);
    expect(baseCalc?.recommendedPieces).toBe(1);

    // Kaba & Slit with statement sleeves (+1) and train (+1.5) = 8.5 yards -> 2 pieces
    const modifiedCalc = StoreService.calculateGarmentYardage('kaba-slit', ['corset-sleeves', 'floor-train']);
    expect(modifiedCalc?.totalYards).toBe(8.5);
    expect(modifiedCalc?.recommendedPieces).toBe(2);

    // Men's Grand Agbada: base 10 yards
    const agbadaCalc = StoreService.calculateGarmentYardage('mens-agbada', ['extra-wide-wings']);
    expect(agbadaCalc?.totalYards).toBe(12);
    expect(agbadaCalc?.recommendedPieces).toBe(2);
  });

  it('8. Supports secure public order lookup by order reference and customer email or phone', () => {
    const products = StoreService.getPublishedProducts();
    const orderResult = StoreService.submitOrderRequest(
      {
        name: 'Abena Osei',
        email: 'abena@example.com',
        phone: '+233 24 555 6677',
        deliveryPreference: 'delivery',
        address: {
          street: '14 Ring Road East',
          city: 'Accra',
          region: 'Greater Accra',
        },
      },
      [{ productId: products[0].id, quantity: products[0].minOrderQty }]
    );

    expect(orderResult.order).toBeDefined();
    const ref = orderResult.order!.orderReference;

    // Lookup by exact email
    const matchByEmail = StoreService.lookupOrder(ref, 'abena@example.com');
    expect(matchByEmail).toBeDefined();
    expect(matchByEmail?.orderReference).toBe(ref);

    // Lookup by phone digits
    const matchByPhone = StoreService.lookupOrder(ref, '0245556677');
    expect(matchByPhone).toBeDefined();
    expect(matchByPhone?.orderReference).toBe(ref);

    // Mismatched credentials return undefined
    const matchWrong = StoreService.lookupOrder(ref, 'stranger@example.com');
    expect(matchWrong).toBeUndefined();
  });

  it('9. Registers and deduplicates customer restock notification requests for showroom inventory', () => {
    const products = StoreService.getPublishedProducts();
    const prod = products[0];

    const req1 = StoreService.createRestockRequest(
      prod.id,
      'buyer@example.com',
      '+233249998888',
      12
    );
    expect(req1.success).toBe(true);
    expect(req1.request?.status).toBe('pending');
    expect(req1.request?.desiredQuantity).toBe(12);

    // Deduplication check
    const req2 = StoreService.createRestockRequest(
      prod.id,
      'buyer@example.com',
      '+233249998888',
      12
    );
    expect(req2.success).toBe(true);
    expect(req2.request?.id).toBe(req1.request?.id);

    // Update status to notified
    StoreService.updateRestockRequestStatus(req1.request!.id, 'notified');
    const allRestocks = StoreService.getRestockRequests();
    const updated = allRestocks.find((r) => r.id === req1.request!.id);
    expect(updated?.status).toBe('notified');
  });

  it('10. AIChatService provides smart yardage advice and WhatsApp connection', async () => {
    const res = await AIChatService.respondToUser('How many yards do I need for a kaba and slit?', []);
    expect(res.text).toContain('Kaba & Slit Yardage');
    expect(res.text).toContain('6 yards');
    expect(res.whatsappPrompt).toBeDefined();
    expect(res.whatsappPrompt).toContain('yardage');

    const whatsappUrl = AIChatService.buildWhatsAppUrl(res.whatsappPrompt);
    expect(whatsappUrl).toContain('233557718472');
  });

  it('11. AIChatService recommends in-stock Ghanaian fabrics for traditional occasions', async () => {
    const res = await AIChatService.respondToUser('I am looking for traditional wedding fabrics', []);
    expect(res.text).toContain('Traditional Wedding');
    expect(res.suggestedProducts).toBeDefined();
    expect(res.suggestedProducts!.length).toBeGreaterThan(0);
    expect(res.suggestedProducts![0].price).toBeGreaterThan(0);

    const whatsappUrl = AIChatService.buildWhatsAppUrl();
    expect(whatsappUrl).toContain('233557718472');
  });

  it('12. Stores and retrieves StyleBoards and customer profile settings correctly', () => {
    const initialBoards = StoreService.getStyleBoards();
    expect(initialBoards.length).toBeGreaterThanOrEqual(1);

    const newBoard = StoreService.saveStyleBoard({
      id: 'board-test-1',
      name: 'Bridal Kente Inspo',
      description: 'Golden yellow kente for traditional wedding',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(newBoard.name).toBe('Bridal Kente Inspo');
    const allBoards = StoreService.getStyleBoards();
    expect(allBoards.some((b) => b.id === 'board-test-1')).toBe(true);

    // Clean up
    StoreService.deleteStyleBoard('board-test-1');
    const afterDelete = StoreService.getStyleBoards();
    expect(afterDelete.some((b) => b.id === 'board-test-1')).toBe(false);
  });

  it('13. AIChatService produces clean plain-text responses without markdown asterisks', async () => {
    const questions = [
      'What are the meanings of Kente colors?',
      'How does delivery and ordering work?',
      'Show me luxury brocade and lace fabrics',
      'How many yards for kaba and slit?',
      'What is your telephone number?',
    ];

    for (const q of questions) {
      const res = await AIChatService.respondToUser(q, []);
      expect(res.text).not.toContain('*');
      expect(res.text).not.toContain('**');
      expect(res.text.length).toBeGreaterThan(15);
    }
  });
});

