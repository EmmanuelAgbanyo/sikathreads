import React, { useState } from 'react';
import { Product } from '../types';
import { StoreService } from '../services/storeService';
import { useToast } from '../context/ToastContext';
import { Bell, X, CheckCircle, Mail, Phone, ShoppingBag } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, product }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desiredQty, setDesiredQty] = useState(product.minOrderQty || 6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = StoreService.createRestockRequest(
        product.id,
        email,
        phone,
        Number(desiredQty)
      );

      if (res.success) {
        setIsSuccess(true);
        addToast('Restock notification alert registered successfully.', 'success');
      } else {
        addToast(res.error || 'Failed to register restock request.', 'error');
      }
    } catch (err) {
      addToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-charcoal/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10 bg-ivory/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-charcoal text-base">Restock Notification</h3>
              <p className="text-xs text-charcoal-muted">We'll alert you the moment bolts arrive</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-lg text-charcoal">You're On The Priority List</h4>
              <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                We have registered your interest for <span className="font-semibold text-charcoal">"{product.name}"</span>. As soon as this weave is restocked in our inventory, we will notify you at <span className="font-medium text-charcoal">{email}</span>.
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold rounded-xl transition-all"
              >
                Back to Browsing
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info Preview */}
              <div className="flex items-center gap-3 p-3 bg-ivory rounded-xl border border-charcoal/10">
                <img
                  src={product.images[0] || '/kente-weave.jpg'}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/kente-weave.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-charcoal truncate">{product.name}</p>
                  <p className="text-[11px] text-charcoal-muted">{product.fabricType}</p>
                  <p className="text-xs font-serif font-semibold text-gold mt-0.5">
                    GHS {product.price.toLocaleString()} / {product.sellingUnit.slice(0, -1)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Email Address <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kofi@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  WhatsApp / Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 055 771 8472 or +233 55 771 8472"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Estimated Quantity Needed ({product.sellingUnit})
                </label>
                <div className="relative">
                  <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                  <input
                    type="number"
                    min={product.minOrderQty || 1}
                    value={desiredQty}
                    onChange={(e) => setDesiredQty(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal hover:bg-charcoal-light text-white text-xs font-bold rounded-xl shadow transition-all duration-200"
                >
                  <Bell className="w-4 h-4 text-gold" />
                  <span>{isSubmitting ? 'Registering...' : 'Notify Me When Restocked'}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-charcoal-muted">
                Zero spam. You will only receive a single direct notification when this weave arrives.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
