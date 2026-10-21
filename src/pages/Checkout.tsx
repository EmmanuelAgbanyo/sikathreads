import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreService } from '../services/storeService';
import { EmailService } from '../services/emailService';
import { OrderCustomerInfo } from '../types';
import {
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Store,
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const siteContent = StoreService.getSiteContent();

  const [formData, setFormData] = useState<OrderCustomerInfo>({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    deliveryPreference: 'delivery',
    address: {
      street: '',
      city: 'Accra',
      region: 'Greater Accra',
      landmarkNotes: '',
    },
    orderNotes: '',
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your Bag is Empty</h2>
        <p className="text-sm text-charcoal-500">Add fabrics to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-gold-600 text-white rounded text-sm font-semibold">
          Browse Fabrics
        </Link>
      </div>
    );
  }

  // Calculate proposed delivery fee based on selected region & preference
  const selectedRegion = siteContent.deliverySettings.regions.find((r) =>
    r.name.toLowerCase().includes(formData.address?.region?.toLowerCase() || '')
  );

  const deliveryFee =
    formData.deliveryPreference === 'pickup'
      ? 0
      : selectedRegion
      ? selectedRegion.fee
      : siteContent.deliverySettings.defaultFee;

  const proposedTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Please provide your name, email address, and active telephone / WhatsApp number.');
      return;
    }

    if (formData.deliveryPreference === 'delivery' && !formData.address?.street.trim()) {
      setErrorMessage('Please specify your delivery address and nearest landmark in Ghana.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please check the confirmation box below so our team can prepare your order.');
      return;
    }

    setSubmitting(true);

    try {
      // Format items for backend validation
      const rawItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Server-side / StoreService validation
      const result = StoreService.submitOrderRequest(formData, rawItems, user?.uid);

      if (!result.success || !result.order) {
        setErrorMessage(result.error || 'Failed to submit order request. Please review your cart.');
        setSubmitting(false);
        return;
      }

      // Trigger transactional acknowledgement email
      EmailService.sendOrderAcknowledgement(result.order);

      // Clear cart
      clearCart();

      // Navigate to confirmation page
      navigate(`/order-confirmation/${result.order.orderReference}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving your request.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="border-b border-ivory-300 pb-6 mb-8">
        <Link to="/cart" className="text-xs text-charcoal-500 hover:text-gold flex items-center mb-2">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Bag
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
          Finalise Order Request
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Checkout &amp; Delivery Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Customer & Delivery Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8 bg-white p-6 sm:p-8 rounded-lg border border-ivory-300 shadow-subtle">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-md flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Contact Information */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kwame@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Active Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +233 55 771 8472 or 0557718472"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-1 focus:ring-gold focus:border-gold"
                />
                <span className="text-[11px] text-charcoal-400 mt-1 block">
                  Our concierge will contact you via this number to confirm fabric cuts and fulfillment details.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Fulfilment Preference */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200">
              2. Fulfilment Preference
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-lg border-2 cursor-pointer flex items-start space-x-3 transition-all ${
                  formData.deliveryPreference === 'delivery'
                    ? 'border-gold bg-gold-50/50'
                    : 'border-ivory-300 hover:border-ivory-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryPreference"
                  checked={formData.deliveryPreference === 'delivery'}
                  onChange={() => setFormData({ ...formData, deliveryPreference: 'delivery' })}
                  className="accent-gold-600 mt-1"
                />
                <div>
                  <span className="font-bold text-sm text-charcoal block flex items-center">
                    <Truck className="w-4 h-4 mr-1 text-gold" /> Nationwide Delivery
                  </span>
                  <span className="text-xs text-charcoal-500 mt-0.5 block">
                    Dispatched to your home or office across Ghana.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-lg border-2 cursor-pointer flex items-start space-x-3 transition-all ${
                  formData.deliveryPreference === 'pickup'
                    ? 'border-gold bg-gold-50/50'
                    : 'border-ivory-300 hover:border-ivory-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryPreference"
                  checked={formData.deliveryPreference === 'pickup'}
                  onChange={() => setFormData({ ...formData, deliveryPreference: 'pickup' })}
                  className="accent-gold-600 mt-1"
                />
                <div>
                  <span className="font-bold text-sm text-charcoal block flex items-center">
                    <Store className="w-4 h-4 mr-1 text-gold" /> Direct Pickup / Collection (Free)
                  </span>
                  <span className="text-xs text-charcoal-500 mt-0.5 block">
                    Accra collection point confirmed personally with your order.
                  </span>
                </div>
              </label>
            </div>

            {formData.deliveryPreference === 'delivery' && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Region in Ghana *
                    </label>
                    <select
                      value={formData.address?.region || 'Greater Accra'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address!,
                            region: e.target.value,
                          },
                        })
                      }
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                    >
                      {siteContent.deliverySettings.regions
                        .filter((r) => r.fee > 0)
                        .map((reg) => (
                          <option key={reg.name} value={reg.name}>
                            {reg.name} — GHS {reg.fee} ({reg.estimatedDays})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      City / Suburb *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. East Legon, Tema, Kumasi"
                      value={formData.address?.city || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address!,
                            city: e.target.value,
                          },
                        })
                      }
                      className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                    Street Address &amp; Nearest Landmark *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. House No. 24, Near Shell Filling Station, Mensah Wood Street"
                    value={formData.address?.street || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address!,
                          street: e.target.value,
                        },
                      })
                    }
                    className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Order Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
              Bespoke Cutting Notes or Special Requests (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Please do not cut the 6-yard piece into separate cuts; or mention required event date."
              value={formData.orderNotes || ''}
              onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
              className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
            />
          </div>

          {/* 4. Confirmation Acknowledgment */}
          <div className="pt-2 border-t border-ivory-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="accent-gold-600 mt-1"
              />
              <span className="text-xs text-charcoal-700 leading-relaxed">
                Please prepare my fabric order. I understand that Sika Threads will contact me directly to confirm fabric cuts, delivery, and payment arrangements before dispatch.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <span>Submitting Order Request...</span>
            ) : (
              <span>Submit Order Request (GHS {proposedTotal.toLocaleString()})</span>
            )}
          </button>
        </form>

        {/* Right: Order Request Summary */}
        <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-ivory-300 shadow-subtle space-y-6 sticky top-28">
          <h2 className="font-serif text-lg font-bold text-charcoal pb-3 border-b border-ivory-200">
            Items in Request ({cart.length})
          </h2>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover border border-ivory-200"
                  />
                  <div>
                    <p className="font-bold text-charcoal line-clamp-1">{item.product.name}</p>
                    <p className="text-charcoal-500">
                      {item.quantity} {item.unit} &times; GHS {item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="font-serif font-bold text-charcoal">
                  GHS {item.lineTotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-ivory-200 pt-4 space-y-2 text-xs text-charcoal-600">
            <div className="flex justify-between">
              <span>Proposed Subtotal</span>
              <span className="font-bold text-charcoal">GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Delivery Fee ({formData.deliveryPreference === 'pickup' ? 'Direct Pickup' : 'Estimated'})
              </span>
              <span className="font-bold text-charcoal">
                {deliveryFee === 0 ? 'Free' : `GHS ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t border-ivory-200 pt-3 flex justify-between items-baseline text-sm">
              <span className="font-bold text-charcoal">Proposed Order Total</span>
              <div className="text-right">
                <span className="font-serif text-2xl font-bold text-gold-700">
                  GHS {proposedTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-charcoal-400 block">Subject to stock confirmation</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-ivory-50 border border-gold/30 text-xs text-charcoal-600 space-y-2">
            <div className="flex items-center font-bold text-charcoal">
              <ShieldCheck className="w-4 h-4 text-gold-600 mr-1.5" />
              What to Expect Next
            </div>
            <p className="leading-relaxed">
              1. We personally inspect your chosen fabric bolt for flawless quality.<br/>
              2. We contact you via WhatsApp or phone to confirm cutting measurements.<br/>
              3. Courier delivery or collection is arranged directly with you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
