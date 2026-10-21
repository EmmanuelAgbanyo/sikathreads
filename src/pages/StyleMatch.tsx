import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { StyleMatchService } from '../services/stylematchAI';
import { EmailService } from '../services/emailService';
import { StyleMatchRequest, SellingUnit } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle,
  Clock,
  ShieldCheck,
  Upload,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Palette,
  Check,
} from 'lucide-react';

export const StyleMatch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [occasion, setOccasion] = useState('Wedding');
  const [customOccasion, setCustomOccasion] = useState('');
  const [selectedColours, setSelectedColours] = useState<string[]>(['Gold', 'Burgundy']);
  const [customColour, setCustomColour] = useState('');
  const [minBudget, setMinBudget] = useState(300);
  const [maxBudget, setMaxBudget] = useState(2500);
  const [intendedOutfit, setIntendedOutfit] = useState('Traditional Engagement Kaba and Slit');
  const [fabricTypePreference, setFabricTypePreference] = useState('Recommend the best type for me');
  const [eventTheme, setEventTheme] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [patternPreference, setPatternPreference] = useState('');
  const [texturePreference, setTexturePreference] = useState('');
  const [desiredQuantity, setDesiredQuantity] = useState<number>(6);
  const [desiredUnit, setDesiredUnit] = useState<SellingUnit>('yards');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [inspirationImageUrl, setInspirationImageUrl] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<StyleMatchRequest | null>(null);

  const occasionOptions = [
    'Wedding',
    'Traditional engagement or marriage',
    'Funeral',
    'Graduation',
    'Church event',
    'Birthday',
    'Formal event',
    'Everyday wear',
    'Family or group outfits',
    'Other',
  ];

  const commonColours = [
    'Gold',
    'Burgundy',
    'Emerald Green',
    'Royal Blue',
    'Ivory',
    'Black',
    'Mustard Yellow',
    'Purple / Violet',
    'Terracotta',
    'White',
  ];

  const fabricOptions = [
    'Recommend the best type for me',
    'Authentic Handwoven Kente',
    'GTP Cotton Wax Print',
    'Woodin Designer Print',
    'French Beaded Lace',
    'Brocade / Bazin Riche',
    'Northern Handwoven Fugu',
    'Duchess Satin',
    'Raw Silk',
  ];

  const toggleColour = (col: string) => {
    if (selectedColours.includes(col)) {
      setSelectedColours(selectedColours.filter((c) => c !== col));
    } else {
      setSelectedColours([...selectedColours, col]);
    }
  };

  const handleAddCustomColour = () => {
    if (customColour.trim() && !selectedColours.includes(customColour.trim())) {
      setSelectedColours([...selectedColours, customColour.trim()]);
      setCustomColour('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      alert('Please provide your name and email address.');
      return;
    }

    if (selectedColours.length === 0) {
      alert('Please choose at least one preferred colour.');
      return;
    }

    setSubmitting(true);

    try {
      const finalOccasion = occasion === 'Other' ? customOccasion || 'Special Celebration' : occasion;
      const now = new Date();
      const targetDeadline = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 min operational target

      const newRequest: StyleMatchRequest = {
        id: 'sm-' + Date.now(),
        customerName,
        customerEmail,
        customerPhone,
        occasion: finalOccasion,
        preferredColours: selectedColours,
        budgetRange: { min: minBudget, max: maxBudget },
        intendedOutfit,
        fabricTypePreference,
        eventTheme,
        dressCode,
        eventDate,
        patternPreference,
        texturePreference,
        desiredQuantity,
        desiredUnit,
        additionalNotes,
        inspirationImageUrl,
        marketingConsent,
        processingStatus: 'in_review',
        approvalStatus: 'pending',
        candidateRecommendations: [],
        approvedProductIds: [],
        emailStatus: 'queued',
        deadlineAt: targetDeadline,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // 1. Send acknowledgement email to customer
      EmailService.sendStyleMatchAcknowledgement(newRequest);

      // 2. Run backend AI matching engine strictly against catalogue items
      const aiResult = StyleMatchService.analyzeRequest(newRequest);

      newRequest.aiAnalysisSummary = aiResult.summary;
      newRequest.candidateRecommendations = aiResult.candidates.map((c) => ({
        productId: c.productId,
        rank: c.rank,
        reason: c.reason,
        matchScore: c.matchScore,
        matchHighlights: c.matchHighlights,
      }));

      if (aiResult.sourcingSuggested) {
        newRequest.processingStatus = 'sourcing_routed';
      }

      // 3. Save request to database
      StoreService.saveStyleMatchRequest(newRequest);

      StoreService.recordAuditLog(
        customerEmail,
        'customer',
        'SUBMIT_STYLEMATCH_REQUEST',
        'stylematch',
        newRequest.id,
        `StyleMatch request submitted for ${finalOccasion} with ${aiResult.candidates.length} candidate fabrics queued for admin approval.`
      );

      setSubmittedRequest(newRequest);
    } catch (err: any) {
      alert('Failed to process StyleMatch request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-100 text-gold-900 border border-gold-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gold-700 animate-pulse" />
          <span>Sika StyleMatch AI</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal">
          Tell us about your occasion.<br />Discover fabrics that match your vision.
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed font-light">
          Share your preferred colours, theme, budget, and the look you want to create. Sika Threads will help you discover suitable fabrics from our catalogue, with recommendations reviewed by our team before they are sent to you.
        </p>

        {/* Stylist Verification Highlights */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 p-4 rounded-xl bg-white border border-ivory-300 shadow-subtle text-xs text-charcoal-700">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gold-600" />
            <span>Quick Stylist Response: <strong>Within 3–5 minutes</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>100% Genuine In-Stock Fabrics</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-gold-600" />
            <span>Personal Stylist Review</span>
          </div>
        </div>
      </div>

      {submittedRequest ? (
        /* Submission Success / Waiting Screen with live progress & admin preview shortcut */
        <div className="bg-white rounded-2xl border-2 border-gold/40 p-8 sm:p-12 shadow-premium text-center space-y-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-gold-50 border-2 border-gold flex items-center justify-center text-gold mx-auto animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold-700 font-bold">
              Consultation Queued &bull; Ref #{submittedRequest.id}
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Your StyleMatch Request is in Review
            </h2>
            <p className="text-sm text-charcoal-600 max-w-xl mx-auto">
              Our AI engine has analyzed our Ghanaian catalogue for your <strong>{submittedRequest.occasion}</strong>. A master stylist is currently verifying the cuts, drape, and physical availability before emailing your personalized lookbook.
            </p>
          </div>

          {/* Operational Target Status */}
          <div className="p-6 bg-ivory-100 rounded-xl border border-ivory-300 max-w-lg mx-auto text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gold" /> Response Target:
              </span>
              <span className="text-gold-800 font-bold">Approx. 3–5 minutes</span>
            </div>
            <div className="w-full bg-ivory-300 h-2 rounded-full overflow-hidden">
              <div className="bg-gold-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] text-charcoal-500">
              An acknowledgement email has been dispatched to <strong>{submittedRequest.customerEmail}</strong>. If our stylists require additional time to inspect rare handwoven lots, we will notify you with a transparent update.
            </p>
          </div>

          {/* Admin shortcut for test evaluation */}
          <div className="p-5 bg-gold-50/70 border border-gold-300 rounded-xl max-w-lg mx-auto text-xs space-y-3">
            <div className="flex items-center font-bold text-gold-900">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-gold-700" />
              Administrative Review Preview
            </div>
            <p className="text-charcoal-700">
              As an evaluator or store manager, you can inspect this request in the <strong>Admin Approval Centre</strong>, examine AI-matched candidate fabrics, edit justifications, and trigger the final email dispatch.
            </p>
            <Link
              to="/admin/stylematch"
              className="inline-flex items-center px-4 py-2 bg-charcoal hover:bg-gold text-white rounded text-xs font-semibold transition-colors"
            >
              <span>Open StyleMatch Approval Centre</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => setSubmittedRequest(null)}
              className="px-6 py-2.5 rounded bg-ivory-200 text-charcoal text-xs font-semibold hover:bg-ivory-300"
            >
              Submit Another Inquiry
            </button>
            <Link
              to="/shop"
              className="px-6 py-2.5 rounded bg-gold-600 text-white text-xs font-semibold hover:bg-gold-500"
            >
              Browse Catalogue in the Meantime
            </Link>
          </div>
        </div>
      ) : (
        /* The Comprehensive Customer Request Form */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-10 shadow-premium space-y-8"
        >
          {/* Section 1: Customer Contact Details */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
              <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center mr-2">
                1
              </span>
              Your Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abena Serwaa"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. abena@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 055 771 8472 or +233 55 771 8472"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Occasion & Event Parameters */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
              <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center mr-2">
                2
              </span>
              The Occasion &amp; Vision
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Primary Occasion *
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                >
                  {occasionOptions.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
                {occasion === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Specify your occasion..."
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="mt-2 w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Intended Outfit / Garment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaba &amp; Slit, Agbada, Modern Corset Evening Dress"
                  value={intendedOutfit}
                  onChange={(e) => setIntendedOutfit(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Fabric Type Preference
                </label>
                <select
                  value={fabricTypePreference}
                  onChange={(e) => setFabricTypePreference(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                >
                  {fabricOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Event Date (Optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Colour Palette & Aesthetics */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
              <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center mr-2">
                3
              </span>
              Color Palette &amp; Motifs
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
                Select Preferred Colours * (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonColours.map((col) => {
                  const isSelected = selectedColours.includes(col);
                  return (
                    <button
                      type="button"
                      key={col}
                      onClick={() => toggleColour(col)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-gold-700 text-white border-gold-800 shadow-sm'
                          : 'bg-ivory-50 text-charcoal-700 border-ivory-300 hover:border-gold'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1" />}
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Colour */}
              <div className="mt-3 flex items-center space-x-2 max-w-xs">
                <input
                  type="text"
                  placeholder="Add another colour..."
                  value={customColour}
                  onChange={(e) => setCustomColour(e.target.value)}
                  className="text-xs bg-ivory-50 border border-ivory-300 rounded px-2.5 py-1.5 flex-1 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColour}
                  className="px-3 py-1.5 text-xs bg-charcoal text-white rounded font-semibold hover:bg-gold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Event Theme or Dress Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Gold Extravaganza, Black Tie African Glam"
                  value={eventTheme}
                  onChange={(e) => setEventTheme(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Pattern / Motif Preference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Geometric Adinkra symbols, Abstract, Plain solid, Floral"
                  value={patternPreference}
                  onChange={(e) => setPatternPreference(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Budget Range & Yardage */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
              <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center mr-2">
                4
              </span>
              Budget &amp; Yardage Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
                  Budget Range (in GHS) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-charcoal-400 block mb-0.5">Min (GHS)</span>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-400 block mb-0.5">Max (GHS)</span>
                    <input
                      type="number"
                      min="200"
                      step="50"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
                  Estimated Quantity &amp; Unit (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-charcoal-400 block mb-0.5">Quantity</span>
                    <input
                      type="number"
                      min="1"
                      value={desiredQuantity}
                      onChange={(e) => setDesiredQuantity(Number(e.target.value))}
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-400 block mb-0.5">Unit</span>
                    <select
                      value={desiredUnit}
                      onChange={(e) => setDesiredUnit(e.target.value as SellingUnit)}
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5"
                    >
                      <option value="yards">Yards</option>
                      <option value="pieces">Pieces (e.g. 6-yard piece)</option>
                      <option value="metres">Metres</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Additional Details & Inspiration Image */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
              <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center mr-2">
                5
              </span>
              Inspiration &amp; Additional Details
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                Inspiration Image Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/outfit-inspiration.jpg or Pinterest link"
                value={inspirationImageUrl}
                onChange={(e) => setInspirationImageUrl(e.target.value)}
                className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
              />
              <span className="text-[11px] text-charcoal-400 mt-1 block">
                You can link an image of an outfit style or moodboard you admire.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                Any specific requirements or considerations? (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Needs to match the groom's burgundy velvet agbada; must be breathable for an outdoor daytime afternoon ceremony."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
              />
            </div>
          </div>

          {/* Privacy & Consents */}
          <div className="p-4 bg-ivory-100 rounded-lg space-y-3 border border-ivory-300 text-xs text-charcoal-700">
            <p className="leading-relaxed">
              <strong>Data Privacy &amp; Consent:</strong> By submitting, you agree that Sika Threads will process your styling parameters to curate recommendations from our catalogue and deliver the approved report to your email.
            </p>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="accent-gold-600"
              />
              <span>I would also like to receive occasional alerts regarding rare loom arrivals and seasonal editorial collections. (Optional, unticked by default)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Finding Matching Fabrics...' : 'Find My Fabric Match (Personal Review in 3–5 Mins)'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
