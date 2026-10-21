import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { EmailService } from '../services/emailService';
import { SourcingRequest, SellingUnit } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  CheckCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const SourcingRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefilledFabric = searchParams.get('fabric') || '';
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [occasion, setOccasion] = useState('Traditional engagement or marriage');
  const [desiredFabricType, setDesiredFabricType] = useState(prefilledFabric || 'Authentic Kente');
  const [colourPattern, setColourPattern] = useState('');
  const [budget, setBudget] = useState(1500);
  const [desiredQuantity, setDesiredQuantity] = useState(6);
  const [desiredUnit, setDesiredUnit] = useState<SellingUnit>('yards');
  const [eventDate, setEventDate] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [inspirationImageUrl, setInspirationImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !desiredFabricType.trim()) {
      alert('Please fill out required contact details and fabric description.');
      return;
    }

    setSubmitting(true);

    try {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const reference = `SRC-2026-${randomSuffix}`;

      const newRequest: SourcingRequest = {
        id: 'src-' + Date.now(),
        reference,
        customerName,
        customerEmail,
        customerPhone,
        occasion,
        desiredFabricType,
        colourPattern,
        budget,
        desiredQuantity,
        desiredUnit,
        eventDate,
        additionalRequirements,
        inspirationImageUrl,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StoreService.saveSourcingRequest(newRequest);
      EmailService.sendSourcingAcknowledgement(newRequest);

      StoreService.recordAuditLog(
        customerEmail,
        'customer',
        'SUBMIT_SOURCING_REQUEST',
        'sourcing',
        newRequest.id,
        `Sourcing inquiry submitted for "${desiredFabricType}" (${reference})`
      );

      setSubmittedReference(reference);
    } catch (err: any) {
      alert('Error submitting sourcing request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-burgundy block">
          Bespoke Procurement Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Request a Custom Fabric Sourcing
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
          Can't locate a specific weave or design in our current inventory? Sika Threads partners directly with master loom weavers in Bonwire, Tamale, and Accra to procure rare fabrics tailored to your occasion.
        </p>
      </div>

      {submittedReference ? (
        <div className="bg-white rounded-2xl border-2 border-gold/40 p-8 sm:p-12 shadow-premium text-center space-y-6 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold-700 font-bold">
              Inquiry Reference: {submittedReference}
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal">
              Sourcing Request Logged
            </h2>
            <p className="text-sm text-charcoal-600 max-w-lg mx-auto">
              Our procurement team has received your specifications. We will research loom availability and prepare a transparent proposal with estimated pricing and lead times.
            </p>
          </div>

          <div className="p-4 bg-ivory-100 rounded-lg border border-ivory-300 max-w-md mx-auto text-xs text-charcoal-700 text-left space-y-1.5">
            <div className="flex items-center font-bold text-charcoal">
              <Clock className="w-4 h-4 text-gold-700 mr-1.5" />
              Next Step:
            </div>
            <p>
              An acknowledgement has been emailed to <strong>{customerEmail}</strong>. You will receive an official Sika Threads Sourcing Proposal once verified.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 rounded-md bg-charcoal text-white hover:bg-gold text-xs font-semibold transition-colors"
            >
              <span>Back to Catalogue</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-ivory-300 p-6 sm:p-10 shadow-premium space-y-8"
        >
          {/* Contact Details */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yaw Osei"
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
                  placeholder="e.g. yaw@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Phone / WhatsApp
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

          {/* Fabric Specifications */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200">
              2. Fabric Specifications &amp; Occasion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Desired Fabric Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asasia Double-Weave Kente, Vintage GTP Print, Cord Lace"
                  value={desiredFabricType}
                  onChange={(e) => setDesiredFabricType(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Occasion / Event *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50th Birthday, Traditional Engagement, Wedding"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Color &amp; Pattern Preferences *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Navy &amp; Gold, Adinkra Gye Nyame motifs"
                  value={colourPattern}
                  onChange={(e) => setColourPattern(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Estimated Budget (GHS) *
                </label>
                <input
                  type="number"
                  required
                  min="200"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Desired Quantity &amp; Unit
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={desiredQuantity}
                    onChange={(e) => setDesiredQuantity(Number(e.target.value))}
                    className="w-1/2 text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                  />
                  <select
                    value={desiredUnit}
                    onChange={(e) => setDesiredUnit(e.target.value as SellingUnit)}
                    className="w-1/2 text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                  >
                    <option value="yards">Yards</option>
                    <option value="pieces">Pieces (6-yard piece)</option>
                    <option value="metres">Metres</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Required By Date (Optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                Inspiration Image Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/reference-fabric-photo.jpg"
                value={inspirationImageUrl}
                onChange={(e) => setInspirationImageUrl(e.target.value)}
                className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                Additional Requirements or Cutting Details
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please check if this design can be woven in 12 yards continuous strip."
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
              />
            </div>
          </div>

          <div className="p-4 bg-ivory-100 rounded-lg text-xs text-charcoal-600 border border-ivory-300 space-y-1">
            <span className="font-bold text-charcoal block">Honest Sourcing Disclaimer:</span>
            <p>
              Submitting a sourcing inquiry does not guarantee that the fabric can be produced or obtained within an exact timeframe until our procurement team verifies weaver loom queues and raw silk/cotton thread availability.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-md bg-charcoal hover:bg-gold text-white font-semibold text-sm tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Submitting Sourcing Inquiry...' : 'Submit Sourcing Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
};
