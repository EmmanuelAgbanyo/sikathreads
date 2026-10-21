import { Product, StyleMatchRequest } from '../types';
import { StoreService } from './storeService';

export interface StyleMatchCandidate {
  productId: string;
  product: Product;
  rank: number;
  reason: string;
  matchScore: number;
  matchHighlights: string[];
}

export class StyleMatchService {
  /**
   * Evaluates a customer's StyleMatch request strictly against published, in-stock catalogue items.
   * Never invents products, prices, or stock.
   */
  static analyzeRequest(request: StyleMatchRequest): {
    summary: string;
    candidates: StyleMatchCandidate[];
    sourcingSuggested: boolean;
  } {
    // 1. Fetch only published products with stock > 0
    const publishedProducts = StoreService.getPublishedProducts().filter((p) => p.stockQty > 0);

    if (publishedProducts.length === 0) {
      return {
        summary: 'Currently, all catalogue items are sold out or awaiting restock. Directing to fabric sourcing.',
        candidates: [],
        sourcingSuggested: true,
      };
    }

    // 2. Score each candidate deterministically and semantically
    const scoredList: Array<{
      product: Product;
      score: number;
      reasons: string[];
      highlights: string[];
    }> = [];

    const reqOccasion = (request.occasion || '').toLowerCase();
    const reqColors = (request.preferredColours || []).map((c) => c.toLowerCase());
    const reqFabric = (request.fabricTypePreference || '').toLowerCase();
    const reqOutfit = (request.intendedOutfit || '').toLowerCase();
    const minBudget = request.budgetRange?.min || 0;
    const maxBudget = request.budgetRange?.max || 100000;

    for (const prod of publishedProducts) {
      let score = 50; // base score
      const reasons: string[] = [];
      const highlights: string[] = [];

      // Check Occasion match
      const occasionMatch = prod.suitableOccasions.some((occ) =>
        reqOccasion.includes(occ.toLowerCase()) || occ.toLowerCase().includes(reqOccasion)
      );
      if (occasionMatch) {
        score += 35;
        highlights.push(`Suitable for ${request.occasion}`);
        reasons.push(`Perfect cultural and aesthetic alignment with ${request.occasion}.`);
      }

      // Check Intended Outfit / Use match
      const useMatch = prod.intendedUse.some((u) =>
        reqOutfit.includes(u.toLowerCase()) || u.toLowerCase().includes(reqOutfit)
      );
      if (useMatch) {
        score += 25;
        highlights.push(`Tailored for ${prod.intendedUse.join(', ')}`);
        reasons.push(`The drape and structural weight suit ${request.intendedOutfit || 'the requested outfit'}.`);
      }

      // Check Fabric Type preference
      if (reqFabric && reqFabric !== 'recommend the best type for me' && reqFabric !== 'any') {
        if (
          prod.fabricType.toLowerCase().includes(reqFabric) ||
          prod.categoryName?.toLowerCase().includes(reqFabric)
        ) {
          score += 30;
          highlights.push(`Matches preferred fabric: ${prod.fabricType}`);
          reasons.push(`Directly satisfies your preference for ${prod.fabricType}.`);
        }
      }

      // Check Colour compatibility
      const colorMatches = prod.colours.filter((c) =>
        reqColors.some((rc) => c.toLowerCase().includes(rc) || rc.includes(c.toLowerCase()))
      );
      if (colorMatches.length > 0) {
        score += 25;
        highlights.push(`Harmonious with ${colorMatches.join(', ')}`);
        reasons.push(`Features your preferred palette accents (${colorMatches.join(', ')}).`);
      } else if (reqColors.length > 0) {
        // partial penalty or neutral
        score -= 5;
      }

      // Check Budget compatibility
      // Product price in GHS
      if (prod.price >= minBudget && prod.price <= maxBudget) {
        score += 20;
        highlights.push(`Within budget (GHS ${prod.price} / ${prod.sellingUnit})`);
        reasons.push(`Well positioned within your budget range of GHS ${minBudget} – ${maxBudget}.`);
      } else if (prod.price > maxBudget * 1.3) {
        score -= 30; // exceeds budget significantly
      }

      // Texture & Pattern bonus
      if (request.patternPreference && prod.pattern.toLowerCase().includes(request.patternPreference.toLowerCase())) {
        score += 15;
        highlights.push(`${prod.pattern} pattern match`);
      }

      // Availability confidence
      if (prod.stockQty > prod.lowStockThreshold) {
        score += 5;
      }

      // Compose final match reason text
      const finalReason =
        reasons.length > 0
          ? `${prod.name} is recommended because it ${reasons.join(' ')}`
          : `${prod.name} offers premium Ghanaian craftsmanship with distinctive ${prod.fabricType} elegance.`;

      scoredList.push({
        product: prod,
        score,
        reasons,
        highlights,
      });
    }

    // Sort by score descending
    scoredList.sort((a, b) => b.score - a.score);

    // Pick top 3-4 candidates
    const topCandidates = scoredList.slice(0, 4);

    if (topCandidates.length === 0 || topCandidates[0].score < 40) {
      return {
        summary: `We analyzed our real-time catalogue for "${request.occasion}" in ${request.preferredColours.join(', ')}, but found no immediate in-stock fabric that meets all required parameters. Our sourcing team can procure this directly for you.`,
        candidates: [],
        sourcingSuggested: true,
      };
    }

    const candidateResults: StyleMatchCandidate[] = topCandidates.map((c, index) => ({
      productId: c.product.id,
      product: c.product,
      rank: index + 1,
      reason:
        c.reasons.length > 0
          ? `${c.product.name} is recommended for your ${request.occasion}. It ${c.reasons.join(' ')}`
          : `Selected from our verified stock for its exquisite ${c.product.fabricType} texture and versatile drape.`,
      matchScore: Math.min(99, Math.max(70, c.score)),
      matchHighlights: c.highlights.length > 0 ? c.highlights : ['Authentic Sika Threads Curation', 'In Stock in Ghana'],
    }));

    const summary = `Sika StyleMatch AI identified ${candidateResults.length} verified catalogue matches for your ${request.occasion} (${request.preferredColours.join(', ')}). All suggestions are stocked in Ghana and pending bespoke verification by our styling team.`;

    return {
      summary,
      candidates: candidateResults,
      sourcingSuggested: false,
    };
  }
}
