import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Sika Threads Trusted Backend API',
    tagline: 'Weaving Heritage, Stitching Modernity.',
  });
});

// Sika StyleMatch AI Evaluation Endpoint (Server-Side Gemini Integration)
app.post('/api/stylematch/analyze', async (req, res) => {
  try {
    const { request, catalogue } = req.body;

    if (!request || !catalogue) {
      return res.status(400).json({ error: 'Missing request parameters or catalogue records' });
    }

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Deterministic trusted matching fallback when API key is not yet set
      const eligible = catalogue.filter((p) => p.publicationStatus === 'published' && p.stockQty > 0);
      return res.json({
        source: 'trusted_catalogue_matcher',
        summary: `Analyzed ${eligible.length} verified in-stock fabrics for ${request.occasion}.`,
        geminiConfigured: false,
      });
    }

    // Call Gemini Generative Language API via fetch
    const systemPrompt = `You are the master textile curator for Sika Threads (Tagline: "Weaving Heritage, Stitching Modernity.").
Primary market: Ghana.
Your task is to rank candidate fabrics retrieved STRICTLY from the store's verified catalogue for a customer.
STRICT RULES:
1. NEVER invent product IDs, prices, or stock quantities.
2. Only suggest products provided in the catalogue array.
3. Provide a warm, culturally grounded Ghanaian styling rationale for each candidate fabric.
Return JSON with format:
{
  "summary": "overview sentence",
  "rankedProductIds": ["id1", "id2"],
  "rationales": { "id1": "reason...", "id2": "reason..." }
}`;

    const prompt = `Customer Request:
Occasion: ${request.occasion}
Colours: ${request.preferredColours?.join(', ')}
Intended Outfit: ${request.intendedOutfit}
Budget Range: GHS ${request.budgetRange?.min} - ${request.budgetRange?.max}
Preferred Fabric: ${request.fabricTypePreference}

Available Catalogue Items:
${JSON.stringify(catalogue.map((p) => ({ id: p.id, name: p.name, fabricType: p.fabricType, price: p.price, colours: p.colours, occasions: p.suitableOccasions })))}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API call warning:', errText);
      return res.json({ source: 'fallback_matcher', geminiConfigured: true, error: errText });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = candidateText ? JSON.parse(candidateText) : null;

    res.json({
      source: 'gemini_1.5_flash',
      geminiConfigured: true,
      analysis: parsed,
    });
  } catch (error) {
    console.error('StyleMatch server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order Revalidation Endpoint
app.post('/api/orders/validate', (req, res) => {
  const { items, catalogue } = req.body;
  if (!items || !catalogue) {
    return res.status(400).json({ valid: false, error: 'Missing items or catalogue payload' });
  }

  let subtotal = 0;
  for (const item of items) {
    const prod = catalogue.find((p) => p.id === item.productId);
    if (!prod || prod.publicationStatus !== 'published') {
      return res.json({ valid: false, error: `Product ${item.productId} is not available.` });
    }
    if (prod.stockQty < item.quantity) {
      return res.json({
        valid: false,
        error: `Insufficient stock for ${prod.name}. Requested ${item.quantity}, available: ${prod.stockQty}.`,
      });
    }
    subtotal += prod.price * item.quantity;
  }

  res.json({ valid: true, subtotal, currency: 'GHS' });
});

app.listen(PORT, () => {
  console.log(`Sika Threads Trusted Backend API running on port ${PORT}`);
});
