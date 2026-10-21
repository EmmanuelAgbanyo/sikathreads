import { Product } from '../types';
import { StoreService } from './storeService';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  whatsappPrompt?: string;
  quickReplies?: string[];
}

/**
 * Strips all markdown asterisks, hashes, backticks, and formatting artifacts
 * to ensure clean, human-readable conversational text.
 */
export function cleanAIText(text: string): string {
  if (!text) return '';
  return text
    // Replace markdown bold/italic patterns: **text** or *text*
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove any remaining stray asterisks
    .replace(/\*/g, '')
    // Remove markdown headers: ### Heading -> Heading
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown inline code ticks: `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    .replace(/`/g, '')
    // Remove markdown links: [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Clean excessive blank lines (more than 2 consecutive newlines)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export class AIChatService {
  private static readonly PHONE_DIGITS = '233557718472';
  private static readonly DISPLAY_PHONE = '055 771 8472';

  /**
   * Generates a direct WhatsApp link with prefilled text
   */
  static buildWhatsAppUrl(customText?: string): string {
    const text = customText || `Hello Sika Threads, I was chatting with your online AI Stylist and would like assistance with fabrics.`;
    return `https://wa.me/${this.PHONE_DIGITS}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Main responder: uses Gemini if API key is provided, or rich cultural & catalogue rules engine
   */
  static async respondToUser(
    userPrompt: string,
    history: AIMessage[]
  ): Promise<AIMessage> {
    const trimmed = userPrompt.trim();
    const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

    // Check if Gemini API is available
    if (apiKey) {
      try {
        const geminiResponse = await this.queryGemini(trimmed, history, apiKey);
        if (geminiResponse) {
          return {
            ...geminiResponse,
            text: cleanAIText(geminiResponse.text),
          };
        }
      } catch (err) {
        console.warn('Gemini request failed, falling back to local textile intelligence:', err);
      }
    }

    // Default fast & rich Ghanaian textile expert intelligence
    const rawResponse = this.generateExpertResponse(trimmed);
    return {
      ...rawResponse,
      text: cleanAIText(rawResponse.text),
    };
  }

  /**
   * High-intelligence cultural, yardage, and catalogue matcher
   */
  private static generateExpertResponse(input: string): AIMessage {
    const lower = input.toLowerCase();
    const products = StoreService.getPublishedProducts().filter((p) => p.stockQty > 0);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = 'ai-' + Date.now();

    // 1. Yardage Calculation Questions
    if (
      lower.includes('how many yard') ||
      lower.includes('how much yard') ||
      lower.includes('yardage') ||
      lower.includes('how many meter') ||
      lower.includes('kaba') ||
      lower.includes('slit') ||
      lower.includes('agbada') ||
      lower.includes('kaftan') ||
      lower.includes('gown')
    ) {
      let advice = '';
      if (lower.includes('kaba') || lower.includes('slit')) {
        advice = `👗 Kaba & Slit Yardage Guide:
• Standard Kaba & Slit (Traditional): 6 yards of GTP wax print, Woodin, or lace (with 2–3 yards of matching satin lining for lace).
• Kaba & Slit with Extended Peplum or Train: 7 to 8 yards.
• Slit (Skirt only): 2 to 3 yards depending on height and fullness.`;
      } else if (lower.includes('agbada') || lower.includes('boubou') || lower.includes('grand')) {
        advice = `👔 Men's Agbada & 3-Piece Boubou:
• Grand 3-Piece Agbada (Outer Robe + Kaftan + Trousers): 7 to 8 yards of Polish Cotton, Brocade, or Jacquard.
• 2-Piece Kaftan & Trousers: 4 yards.`;
      } else if (lower.includes('kaftan') || lower.includes('jumper') || lower.includes('men')) {
        advice = `👔 Men's Kaftan & Trousers:
• Standard long-sleeve Kaftan with trousers: 4 yards (Brocade, Polish Cotton, or Linen).
• Short-sleeve shirt & shorts: 2.5 to 3 yards.`;
      } else if (lower.includes('gown') || lower.includes('dress') || lower.includes('maxi')) {
        advice = `✨ Dresses & Gowns:
• Floor-length Evening or Bridesmaid Gown: 4 to 5 yards (French lace, Duchess Satin, or Velvet).
• Simple Midi Dress or Pencil Skirt: 2 to 3 yards.`;
      } else {
        advice = `📏 Standard Ghanaian Yardage Estimates:
• Kaba & Slit: 6 yards (standard full piece).
• Men's 2-Piece Kaftan & Trousers: 4 yards.
• 3-Piece Agbada: 7–8 yards.
• Floor-Length Gown: 4–5 yards.
• Simple Midi or Pencil Dress: 2.5–3 yards.`;
      }

      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `${advice}\n\nWould you like me to recommend in-stock fabrics suited for your tailor? You can also message our stylist directly on WhatsApp at ${this.DISPLAY_PHONE} to double-check yardage based on your exact body measurements.`,
        whatsappPrompt: `Hello Sika Threads, I need help confirming yardage for my style: "${input}".`,
        quickReplies: ['Show me lace fabrics', 'Show me GTP wax prints', 'Show me Brocades', 'Chat on WhatsApp'],
      };
    }

    // 2. Kente Meanings & Cultural Significance
    if (
      lower.includes('meaning') ||
      lower.includes('color') ||
      lower.includes('colour') ||
      lower.includes('symbol') ||
      lower.includes('oyokoman') ||
      lower.includes('adwinasa') ||
      lower.includes('fatia') ||
      lower.includes('kente')
    ) {
      if (lower.includes('color') || lower.includes('colour') || lower.includes('meaning')) {
        return {
          id,
          sender: 'assistant',
          timestamp: now,
          text: `👑 Sacred Meanings of Traditional Ghanaian Fabric Colors:

• 🟡 Gold / Yellow (Sika): Royalty, wealth, high status, fertility, and spiritual purity.
• 🟢 Green (Ahaban): Growth, renewal, harvest, vitality, and good health.
• 🔴 Red / Kobene: Strong spiritual energy, solemnity, passion, or sacred ancestral rites.
• ⚪ White (Fitaa): Purity, victory, joy, cleansing, and thanksgiving (ideal for baby dedications and church).
• 🔵 Blue (Bru): Peace, love, harmony, and humility.
• ⚫ Black (Tuntum): Spiritual maturity, ancestral connection, and solemn remembrance.

Are you looking for fabrics for a traditional wedding, child naming, church thanksgiving, or funeral?`,
          whatsappPrompt: `Hello Sika Threads, I'm asking about Kente colors and traditional meaning for my occasion: "${input}".`,
          quickReplies: ['Traditional Wedding fabrics', 'Outdooring / Naming fabrics', 'Church Thanksgiving fabrics', 'Browse all Kente'],
        };
      }
    }

    // 3. Occasion-based Recommendations (Traditional Wedding, Bridal, Funeral, Church, Outdooring)
    let matchedProducts: Product[] = [];
    let occasionHeader = '';

    if (
      lower.includes('wedding') ||
      lower.includes('engagement') ||
      lower.includes('bride') ||
      lower.includes('bridal') ||
      lower.includes('groom')
    ) {
      occasionHeader = `💍 Traditional Wedding & Bridal Selection:\nFor Ghanaian weddings and engagement ceremonies, authentic Bonwire Kente cloths and beaded bridal laces are the gold standard. Here are curated options currently in stock:`;
      matchedProducts = products.filter(
        (p) =>
          p.categoryId === 'kente' ||
          p.categoryId === 'bridal-lace' ||
          p.suitableOccasions.some((o) => o.toLowerCase().includes('wedding'))
      );
    } else if (
      lower.includes('church') ||
      lower.includes('thanksgiving') ||
      lower.includes('easter') ||
      lower.includes('sunday')
    ) {
      occasionHeader = `⛪ Church & Thanksgiving Ensembles:\nCrisp white laces, vibrant GTP NuStyle wax prints, and shimmering brocades are beloved choices for church services and milestones:`;
      matchedProducts = products.filter(
        (p) =>
          p.categoryId === 'gtp-wax' ||
          p.categoryId === 'brocade' ||
          p.suitableOccasions.some((o) => o.toLowerCase().includes('church'))
      );
    } else if (
      lower.includes('outdooring') ||
      lower.includes('naming') ||
      lower.includes('christening') ||
      lower.includes('baby')
    ) {
      occasionHeader = `👶 Outdooring & Baby Dedication Fabrics:\nIn Ghanaian tradition, white symbolizes celebration, purity, and victory. White Swiss voile laces, white GTP prints, and gold-trimmed brocades are the traditional choice:`;
      matchedProducts = products.filter(
        (p) =>
          p.colours.some((c: string) => c.toLowerCase().includes('white') || c.toLowerCase().includes('cream')) ||
          p.categoryId === 'bridal-lace' ||
          p.categoryId === 'brocade'
      );
    } else if (
      lower.includes('funeral') ||
      lower.includes('memorial') ||
      lower.includes('kobene') ||
      lower.includes('kuntunkuni') ||
      lower.includes('birisi')
    ) {
      occasionHeader = `🕊️ Funeral & Memorial Observance:\nTraditional Ghanaian funeral textiles convey respect and kinship:\n• Kobene (Red): Worn by closest family members during the burial.\n• Kuntunkuni / Birisi (Black/Dark Brown): General funeral service and burial.\n• White & Black: Thanksgiving Sunday service celebrating a life lived beyond 70 years.`;
      matchedProducts = products.filter(
        (p) =>
          p.colours.some((c: string) => c.toLowerCase().includes('black') || c.toLowerCase().includes('red') || c.toLowerCase().includes('brown')) ||
          p.suitableOccasions.some((o) => o.toLowerCase().includes('funeral'))
      );
    }

    // 4. Specific Fabric Category Queries (Lace, Kente, GTP, Woodin, Brocade, Satin, Velvet)
    if (matchedProducts.length === 0) {
      if (lower.includes('kente')) {
        occasionHeader = `👑 Authentic Handwoven Kente:\nWoven on traditional wooden looms in Bonwire and Adanwomase with certified thread counts:`;
        matchedProducts = products.filter((p) => p.categoryId === 'kente' || p.fabricType.toLowerCase().includes('kente'));
      } else if (lower.includes('lace') || lower.includes('bridal')) {
        occasionHeader = `✨ Premium Bridal & Luxury Laces:\nHeavy corded, French guipure, and beaded laces:`;
        matchedProducts = products.filter((p) => p.categoryId === 'bridal-lace' || p.fabricType.toLowerCase().includes('lace'));
      } else if (lower.includes('gtp') || lower.includes('wax') || lower.includes('print')) {
        occasionHeader = `🇬🇭 Certified GTP Wax Prints & Woodin:\n100% genuine Ghanaian manufactured prints:`;
        matchedProducts = products.filter((p) => p.categoryId === 'gtp-wax' || p.categoryId === 'woodin' || p.fabricType.toLowerCase().includes('wax'));
      } else if (lower.includes('brocade') || lower.includes('cotton') || lower.includes('boubou')) {
        occasionHeader = `🌟 Brocade & Polished Cotton:\nCrisp, breathable, lustrous weaves for kaftans and agbadas:`;
        matchedProducts = products.filter((p) => p.categoryId === 'brocade' || p.fabricType.toLowerCase().includes('brocade'));
      } else if (lower.includes('satin') || lower.includes('velvet') || lower.includes('silk')) {
        occasionHeader = `💎 Duchess Satin & Velvet Weaves:\nRich drape and lustrous finishes:`;
        matchedProducts = products.filter((p) => p.categoryId === 'velvet-satin' || p.fabricType.toLowerCase().includes('satin') || p.fabricType.toLowerCase().includes('velvet'));
      }
    }

    // 5. Price / Budget Inquiries
    if (lower.includes('cheap') || lower.includes('budget') || lower.includes('price') || lower.includes('ghs') || lower.includes('cedi')) {
      if (matchedProducts.length === 0) {
        matchedProducts = [...products].sort((a, b) => a.price - b.price);
        occasionHeader = `💰 Affordable & Premium Value Textiles:\nAll prices are quoted transparently in Ghana Cedis (GHS). Here are our most popular current pieces:`;
      }
    }

    // 6. Delivery, Payment, or Ordering Inquiries
    if (
      lower.includes('delivery') ||
      lower.includes('deliver') ||
      lower.includes('shipping') ||
      lower.includes('kumasi') ||
      lower.includes('accra') ||
      lower.includes('pay') ||
      lower.includes('payment') ||
      lower.includes('order')
    ) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `📦 Ordering & Delivery Process across Ghana:

1. Browse & Select: Add your favorite fabrics to your Order Request.
2. Personal Quality Verification: Because genuine fabrics are hand-inspected for thread density and dye-lot consistency, no automated payment is charged upfront.
3. Concierge Call / WhatsApp: Our stylist calls or messages you to confirm yardage, cutting specifications, and delivery address.
4. Doorstep & Regional Delivery: We coordinate delivery across all 16 regions of Ghana (Accra, Kumasi, Takoradi, Tamale, Sunyani, Ho, etc.) or free arranged collection in Accra.

Need immediate order assistance? Chat directly with us on WhatsApp at ${this.DISPLAY_PHONE}.`,
        whatsappPrompt: `Hello Sika Threads, I have a question about delivery / placing an order.`,
        quickReplies: ['Browse all fabrics', 'Check order status', 'Chat on WhatsApp (055 771 8472)'],
      };
    }

    // If matches found, return up to 3 best suggestions
    if (matchedProducts.length > 0) {
      const top3 = matchedProducts.slice(0, 3);
      const productNames = top3.map((p) => p.name).join(', ');
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `${occasionHeader}\n\nTake a look at these recommendations below. You can view full fabric details or instantly send your preference to our stylist on WhatsApp to verify roll cuts!`,
        suggestedProducts: top3,
        whatsappPrompt: `Hello Sika Threads, I'm interested in these fabrics suggested by your AI: ${productNames}. Can you verify availability for me?`,
        quickReplies: ['How many yards do I need?', 'Kente color meanings', 'Do you deliver to my region?', 'Chat on WhatsApp'],
      };
    }

    // Default friendly assistant fallback
    const featured = products.slice(0, 3);
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Akwaaba! I am your Sika AI Fabric Stylist. I can help you with:

• Occasion Matching: Traditional wedding, church, outdooring, or gala gowns.
• Yardage Advice: How much fabric your tailor needs for Kaba & Slit, Agbada, Kaftan, or gowns.
• Kente Knowledge: Patterns, symbols, and color significance.
• Live In-Stock Recommendations: Browse our authentic Ghanaian inventory in GHS.

What event or style are you creating today?`,
      suggestedProducts: featured,
      whatsappPrompt: `Hello Sika Threads, I'd like to consult with your stylist regarding: "${input}".`,
      quickReplies: ['Traditional Wedding Kente', 'Yardage for Kaba & Slit', 'Bridal Lace under GHS 500', 'Chat on WhatsApp (055 771 8472)'],
    };
  }

  /**
   * Optional Gemini API integration for advanced generative answers
   */
  private static async queryGemini(
    prompt: string,
    _history: AIMessage[],
    apiKey: string
  ): Promise<AIMessage | null> {
    const products = StoreService.getPublishedProducts().slice(0, 15);
    const catalogueSummary = products
      .map((p) => `- ${p.name} (GHS ${p.price} per ${p.sellingUnit}, ${p.categoryId}, colors: ${p.colours.join(', ')}, occasions: ${p.suitableOccasions.join(', ')})`)
      .join('\n');

    const systemInstruction = `You are the official AI Fabric Concierge and Textile Stylist for Sika Threads, a luxury Ghanaian fabric house. Tagline: "Weaving Heritage, Stitching Modernity."
Telephone/WhatsApp: 055 771 8472 (+233 55 771 8472).
You are culturally knowledgeable about Ghanaian textiles (Bonwire Kente, GTP wax prints, Woodin, brocades, bridal lace, Duchess satin).
Key Rules:
1. DO NOT use asterisks (*) or markdown asterisks (**) anywhere in your response. Write clean, natural plain text with regular punctuation.
2. All prices are in Ghana Cedis (GHS).
3. Online payments are not automated; all order requests undergo human quality verification before fulfillment.
4. Nationwide delivery across all 16 regions of Ghana + direct arranged collection in Accra.
5. Keep responses warm, helpful, culturally authentic, and concise (under 120 words).
6. Available in-stock products in catalogue:
${catalogueSummary}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nCustomer question: ${prompt}` }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    // Check if any products match
    const lowerText = candidateText.toLowerCase();
    const matchedProducts = products
      .filter((p) => lowerText.includes(p.name.toLowerCase()) || lowerText.includes(p.categoryId.toLowerCase()))
      .slice(0, 3);

    return {
      id: 'ai-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: cleanAIText(candidateText),
      suggestedProducts: matchedProducts.length > 0 ? matchedProducts : undefined,
      whatsappPrompt: `Hello Sika Threads, I'm following up on my AI conversation regarding: "${prompt}".`,
      quickReplies: ['Confirm yardage', 'Check delivery terms', 'Connect to WhatsApp stylist'],
    };
  }
}
