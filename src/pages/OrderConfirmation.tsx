import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  Package,
  PhoneCall,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { orderRef } = useParams<{ orderRef: string }>();
  const order = StoreService.getOrderById(orderRef || '');
  const siteContent = StoreService.getSiteContent();
  const whatsappNum = siteContent.contactInfo.whatsapp.replace(/\D/g, '') || '233557718472';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-10">
      {/* Required Confirmation Banner */}
      <div className="bg-white rounded-xl border-2 border-gold/40 p-8 sm:p-10 shadow-premium text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-gold-700 font-bold block mb-1">
            Order Request Logged
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Reference: {orderRef}
          </h1>
        </div>

        {/* Official Required Confirmation Message */}
        <div className="bg-ivory-100 border-l-4 border-gold p-5 text-left rounded-r-md max-w-2xl mx-auto shadow-sm">
          <p className="text-sm sm:text-base text-charcoal-800 font-medium leading-relaxed">
            &ldquo;Thank you for choosing Sika Threads. Your order request has been received. Our team will confirm product availability, final pricing, and delivery arrangements with you.&rdquo;
          </p>
        </div>

        <div className="text-xs text-charcoal-500 max-w-lg mx-auto">
          Your request is safely logged. Our team in Accra will contact you shortly to confirm cutting, delivery, and payment arrangements.
        </div>
      </div>

      {order && (
        <div className="bg-white rounded-lg border border-ivory-300 p-6 sm:p-8 shadow-subtle space-y-8">
          {/* Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-ivory-200 text-xs">
            <div>
              <span className="text-charcoal-400 font-bold uppercase block mb-1">Customer</span>
              <p className="font-bold text-charcoal text-sm">{order.customer.name}</p>
              <p className="text-charcoal-600">{order.customer.email}</p>
              <p className="text-charcoal-600">{order.customer.phone}</p>
            </div>

            <div>
              <span className="text-charcoal-400 font-bold uppercase block mb-1">Fulfilment</span>
              <p className="font-bold text-charcoal text-sm capitalize">
                {order.customer.deliveryPreference === 'pickup' ? 'Direct Pickup / Collection' : 'Regional Delivery'}
              </p>
              {order.customer.deliveryPreference === 'delivery' && order.customer.address ? (
                <p className="text-charcoal-600">
                  {order.customer.address.street}, {order.customer.address.city} ({order.customer.address.region})
                </p>
              ) : (
                <p className="text-charcoal-600">Accra collection point confirmed personally with your order</p>
              )}
            </div>

            <div>
              <span className="text-charcoal-400 font-bold uppercase block mb-1">Request Status</span>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-900 border border-gold-300">
                Request Submitted
              </span>
              <p className="text-[11px] text-charcoal-400 mt-1">
                Submitted on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Requested Items */}
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
              Requested Fabrics
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-3.5 bg-ivory-50 rounded border border-ivory-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-ivory-200"
                      />
                    )}
                    <div>
                      <p className="font-bold text-charcoal">{item.name}</p>
                      <span className="text-xs text-charcoal-500">
                        {item.fabricType} &bull; {item.quantity} {item.sellingUnit} &times; GHS {item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-charcoal">
                    GHS {item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-ivory-200 flex flex-col items-end space-y-1 text-xs">
              <div className="flex justify-between w-64 text-charcoal-600">
                <span>Proposed Subtotal:</span>
                <span className="font-semibold">GHS {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-64 text-charcoal-600">
                <span>Estimated Delivery:</span>
                <span className="font-semibold">
                  {order.proposedDeliveryFee === 0 ? 'Free' : `GHS ${order.proposedDeliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between w-64 text-sm font-bold text-charcoal pt-2 border-t border-ivory-200">
                <span>Proposed Total:</span>
                <span className="font-serif text-gold-700 text-lg">GHS {order.proposedTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* What Happens Next Steps */}
          <div className="p-6 bg-ivory-100 rounded-lg border border-ivory-300 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gold-700" />
              What Happens Next
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-charcoal-700">
              <div className="p-3 bg-white rounded border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal block">1. Inventory Audit</span>
                <p>Our concierge confirms the roll condition, dye lot, and yards in our Accra warehouse.</p>
              </div>
              <div className="p-3 bg-white rounded border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal block">2. Contact &amp; Confirmation</span>
                <p>We contact you via WhatsApp / phone with final delivery details and payment options.</p>
              </div>
              <div className="p-3 bg-white rounded border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal block">3. Dispatch &amp; Delivery</span>
                <p>Once you accept, your fabric is cut, packaged in dust wrappers, and dispatched.</p>
              </div>
            </div>
          </div>

          {/* Contact Support Direct Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ivory-200">
            <a
              href={`https://wa.me/${whatsappNum}?text=Hello%20Sika%20Threads,%20I'm%20following%20up%20on%20my%20Order%20Request%20${orderRef}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-xs font-semibold px-4 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat on WhatsApp regarding #{orderRef}
            </a>

            <Link
              to="/shop"
              className="inline-flex items-center text-xs font-semibold text-charcoal hover:text-gold"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
