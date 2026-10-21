import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { OrderRequest } from '../types';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Store,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [orderReference, setOrderReference] = useState(initialRef);
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<OrderRequest | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialRef) {
      const found = StoreService.getOrders().find(
        (o) => o.orderReference.toUpperCase() === initialRef.toUpperCase() || o.id === initialRef
      );
      if (found) {
        setOrder(found);
        setSearched(true);
      }
    }
  }, [initialRef]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearched(true);

    if (!orderReference.trim()) {
      setErrorMsg('Please enter your order reference (e.g., ST-2026-1042).');
      setOrder(null);
      return;
    }

    if (!contact.trim()) {
      // If no contact provided, search by exact reference alone if available
      const found = StoreService.getOrders().find(
        (o) => o.orderReference.toUpperCase() === orderReference.trim().toUpperCase() || o.id === orderReference.trim()
      );
      if (found) {
        setOrder(found);
      } else {
        setErrorMsg('No order request found matching this reference. Please check your reference number.');
        setOrder(null);
      }
      return;
    }

    const found = StoreService.lookupOrder(orderReference, contact);
    if (found) {
      setOrder(found);
    } else {
      setErrorMsg('No order request found matching this reference and contact details. Please check and try again.');
      setOrder(null);
    }
  };

  const getStatusStepIndex = (status: OrderRequest['status']): number => {
    switch (status) {
      case 'request_submitted':
        return 0;
      case 'awaiting_stock_verification':
        return 1;
      case 'awaiting_customer_confirmation':
        return 2;
      case 'confirmed':
      case 'preparing_order':
        return 3;
      case 'ready_for_pickup':
      case 'dispatched':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return -1;
      case 'sourcing_required':
        return 1;
      default:
        return 0;
    }
  };

  const timelineSteps = [
    { label: 'Request Submitted', desc: 'Received in system' },
    { label: 'Quality Verification', desc: 'Bolt inspection & stock lock' },
    { label: 'Personal Confirmation', desc: 'Delivery terms confirmed' },
    { label: 'Preparing Order', desc: 'Precision yardage cut & packaged' },
    { label: 'Ready / Dispatched', desc: 'In transit or ready for collection' },
    { label: 'Fulfilled', desc: 'Handed over to customer' },
  ];

  const currentStep = order ? getStatusStepIndex(order.status) : 0;

  const siteContent = StoreService.getSiteContent();
  const whatsappNumber = siteContent.contactInfo.whatsapp.replace(/\D/g, '') || '233557718472';

  const whatsappInquiryUrl = order
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello Sika Threads, I would like an update on my order request ${order.orderReference}. Customer: ${order.customer.name}.`
      )}`
    : `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        'Hello Sika Threads, I have a question about my fabric order request.'
      )}`;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
      {/* Page Title */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">Real-Time Status</span>
        <h1 className="text-3xl font-serif font-bold text-charcoal mt-1">Track Order Request</h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-2 max-w-lg mx-auto">
          Enter your order reference code (found in your confirmation email or order summary) to check current verification, preparation, and delivery progress.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm p-6 sm:p-8 mb-8">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Order Reference <span className="text-burgundy">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ST-2026-1042"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Email or Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. kofi@example.com or 0557718472"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-charcoal hover:bg-charcoal-light text-white text-xs font-bold rounded-xl shadow transition-all duration-200"
            >
              <Search className="w-4 h-4 text-gold" />
              <span>Lookup Order Status</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Order Details View if Found */}
      {order && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-charcoal to-charcoal-light text-ivory p-6 sm:p-8 rounded-2xl shadow-lg border border-gold/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gold font-semibold">
                  Verified Order Request
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-0.5">
                  Ref: {order.orderReference}
                </h2>
                <p className="text-xs text-ivory-muted mt-1">
                  Submitted on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] uppercase tracking-wider text-ivory-muted">Current Stage</span>
                <span className="inline-block mt-1 px-3 py-1 bg-gold text-charcoal font-bold text-xs rounded-full uppercase tracking-wider">
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Verification Guarantee */}
            <div className="pt-4 flex items-center gap-2.5 text-xs text-ivory-muted">
              <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
              <span>
                Personal Verification Guarantee: All fabrics are hand-inspected for weave integrity before dispatch.
              </span>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-charcoal/10 shadow-sm">
            <h3 className="font-serif font-bold text-charcoal text-base mb-6">Fulfilment Timeline</h3>

            <div className="relative">
              {/* Line */}
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-charcoal/10 -translate-y-1/2 z-0" />

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStep > idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-gold text-charcoal ring-4 ring-gold/20'
                            : 'bg-ivory border border-charcoal/20 text-charcoal-muted'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </div>
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-charcoal font-bold' : isCompleted ? 'text-charcoal' : 'text-charcoal-muted'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-charcoal-muted mt-0.5 hidden sm:block">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Log */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t border-charcoal/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3">
                  Verification & Status Updates
                </h4>
                <div className="space-y-3">
                  {order.statusHistory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-ivory rounded-xl border border-charcoal/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-semibold text-charcoal uppercase tracking-wider text-[10px] mr-2 px-2 py-0.5 bg-white rounded border border-charcoal/10">
                          {item.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-charcoal-light">{item.note}</span>
                      </div>
                      <span className="text-[11px] text-charcoal-muted flex-shrink-0">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Items & Customer Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ordered Items */}
            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-charcoal text-base">Reserved Textiles</h3>
              <div className="divide-y divide-charcoal/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                    <img
                      src={item.imageUrl || '/kente-weave.jpg'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/kente-weave.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                      <p className="text-[11px] text-charcoal-muted">{item.fabricType}</p>
                      <p className="text-xs text-charcoal font-medium mt-0.5">
                        {item.quantity} {item.sellingUnit} × GHS {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-charcoal">
                        GHS {item.lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="pt-4 border-t border-charcoal/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal-muted">
                  <span>Subtotal:</span>
                  <span>GHS {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal-muted">
                  <span>Delivery ({order.customer.deliveryPreference}):</span>
                  <span>GHS {order.proposedDeliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-charcoal pt-2 border-t border-charcoal/10">
                  <span>Proposed Total:</span>
                  <span className="font-serif text-gold">GHS {order.proposedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Concierge Support */}
            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm space-y-5">
              <div>
                <h3 className="font-serif font-bold text-charcoal text-base mb-3">Delivery & Contact</h3>
                <div className="p-3 bg-ivory rounded-xl border border-charcoal/5 text-xs space-y-2">
                  <p className="font-semibold text-charcoal">{order.customer.name}</p>
                  <p className="text-charcoal-muted">{order.customer.email} • {order.customer.phone}</p>
                  <div className="pt-2 border-t border-charcoal/10">
                    <span className="font-semibold text-charcoal">Preference: </span>
                    <span className="capitalize">{order.customer.deliveryPreference}</span>
                    {order.customer.address && (
                      <p className="text-charcoal-muted mt-0.5">
                        {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Concierge Button */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-1">Direct Concierge Assistance</h4>
                <p className="text-[11px] text-emerald-700 mb-3">
                  Have a question regarding your order delivery schedule, need swatches, or wish to make an adjustment? Speak with our team instantly on WhatsApp.
                </p>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helper FAQ */}
      <div className="mt-12 p-6 bg-ivory rounded-2xl border border-charcoal/10 text-xs text-charcoal-muted space-y-2">
        <h4 className="font-serif font-bold text-charcoal text-sm">Need help with your order?</h4>
        <p>
          In our personal verification model, our staff physically review every bolt for flaws, color fidelity, and weave integrity. A team member contacts you to confirm delivery details prior to dispatch.
        </p>
      </div>
    </div>
  );
};
