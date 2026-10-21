import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { EmailService } from '../../services/emailService';
import { OrderRequest, OrderStatus, CustomerConfirmationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RestockNotificationRequest } from '../../types';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Truck,
  Store,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  FileText,
  Bell,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'restocks'>('orders');
  const [orders, setOrders] = useState<OrderRequest[]>(() => StoreService.getOrders());
  const [restocks, setRestocks] = useState<RestockNotificationRequest[]>(() =>
    StoreService.getRestockRequests()
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(orders[0] || null);

  // Status update modal / form states
  const [newStatus, setNewStatus] = useState<OrderStatus>('awaiting_stock_verification');
  const [statusNote, setStatusNote] = useState('');
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [finalDeliveryTerms, setFinalDeliveryTerms] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleMarkRestockNotified = (id: string) => {
    StoreService.updateRestockRequestStatus(id, 'notified');
    setRestocks(StoreService.getRestockRequests());
    setFeedback('Restock request marked as notified.');
    setTimeout(() => setFeedback(null), 4000);
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'request_submitted', label: 'Request Submitted' },
    { value: 'awaiting_stock_verification', label: 'Awaiting Stock Verification' },
    { value: 'awaiting_customer_confirmation', label: 'Awaiting Customer Confirmation' },
    { value: 'confirmed', label: 'Confirmed (Reduces Stock Safely)' },
    { value: 'preparing_order', label: 'Preparing / Cutting Fabric' },
    { value: 'ready_for_pickup', label: 'Ready for Pickup / Collection' },
    { value: 'dispatched', label: 'Dispatched for Delivery' },
    { value: 'delivered', label: 'Delivered to Customer' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'sourcing_required', label: 'Sourcing Required' },
  ];

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const priceNum = finalPrice ? Number(finalPrice) : undefined;
    const res = StoreService.updateOrderStatus(
      selectedOrder.id,
      newStatus,
      user?.email || 'admin@sikathreads.com.gh',
      statusNote,
      priceNum,
      finalDeliveryTerms || undefined
    );

    if (res.success && res.order) {
      // Send transactional email update to customer
      EmailService.sendOrderStatusUpdate(res.order, statusNote);

      setOrders(StoreService.getOrders());
      setSelectedOrder(res.order);
      setFeedback(`Order status updated to ${newStatus} and customer notified via email.`);
      setStatusNote('');
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Fulfilment Operations
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Order Request Management</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Verify warehouse stock, confirm pricing and delivery arrangements, and manage restock alerts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-ivory-300 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-charcoal text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-ivory-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-gold" />
          <span>Order Requests ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('restocks')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'restocks'
              ? 'bg-charcoal text-white shadow-sm'
              : 'text-charcoal-600 hover:bg-ivory-200'
          }`}
        >
          <Bell className="w-4 h-4 text-gold" />
          <span>Restock Notifications ({restocks.filter((r) => r.status === 'pending').length} pending)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* View: Restock Notification Registry */}
      {activeTab === 'restocks' ? (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-charcoal">Customer Restock Notification Queue</h2>
            <span className="text-xs text-charcoal-500">
              Total registered requests: {restocks.length}
            </span>
          </div>

          {restocks.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400">
              <Bell className="w-10 h-10 mx-auto text-charcoal-300 mb-2" />
              <p className="text-sm font-semibold">No pending restock notifications</p>
              <p className="text-xs text-charcoal-400">Customer restock alerts will appear here when registered.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory-100 uppercase tracking-wider text-charcoal-500 font-semibold border-b border-ivory-200">
                  <tr>
                    <th className="py-3 px-4">Fabric Name</th>
                    <th className="py-3 px-4">Customer Email</th>
                    <th className="py-3 px-4">WhatsApp / Phone</th>
                    <th className="py-3 px-4">Desired Qty</th>
                    <th className="py-3 px-4">Requested Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {restocks.map((req) => (
                    <tr key={req.id} className="hover:bg-ivory-50">
                      <td className="py-3 px-4 font-bold text-charcoal">{req.productName}</td>
                      <td className="py-3 px-4 text-charcoal-600">{req.customerEmail}</td>
                      <td className="py-3 px-4 text-charcoal-600">
                        {req.customerPhone ? (
                          <a
                            href={`https://wa.me/${req.customerPhone.replace(/\D/g, '')}?text=Hello,%20this%20is%20Sika%20Threads%20letting%20you%20know%20that%20${encodeURIComponent(
                              req.productName
                            )}%20is%20now%20in%20stock%20and%20ready%20for%20order.`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{req.customerPhone}</span>
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-charcoal">{req.desiredQuantity || 6} yds</td>
                      <td className="py-3 px-4 text-charcoal-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'notified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleMarkRestockNotified(req.id)}
                            className="px-3 py-1 bg-charcoal hover:bg-gold-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Mark Notified
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : orders.length === 0 ? (

        <div className="bg-white p-12 rounded-xl border border-ivory-300 text-center space-y-3 shadow-subtle">
          <ShoppingBag className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-charcoal">No Order Requests Received Yet</h2>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            When a customer or guest submits an order request from the shopping bag, it will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order List Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-ivory-300 shadow-subtle p-4 space-y-3 max-h-[750px] overflow-y-auto">
            <h2 className="font-serif text-sm font-bold text-charcoal px-2 pb-2 border-b border-ivory-200">
              Orders Queue ({orders.length})
            </h2>

            {orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setNewStatus(ord.status);
                    setFinalPrice(ord.finalAgreedPriceSnapshot ? String(ord.finalAgreedPriceSnapshot) : '');
                    setFinalDeliveryTerms(ord.finalAgreedDeliveryTerms || '');
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gold bg-gold-50/50 shadow-sm'
                      : 'border-ivory-200 hover:border-ivory-300 hover:bg-ivory-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal text-xs">{ord.orderReference}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-ivory-200 text-charcoal-700">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1 truncate">
                    {ord.customer.name} ({ord.customer.phone})
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-charcoal-500 mt-1 pt-1 border-t border-ivory-200">
                    <span>{ord.items.length} items</span>
                    <span className="font-bold text-gold-800">GHS {ord.proposedTotal.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Order Detailed Workspace */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                    Order Reference
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-charcoal">
                    {selectedOrder.orderReference}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal-400 block">Current Status</span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-900 border border-gold-300 capitalize">
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-ivory-50 p-4 rounded-lg border border-ivory-200">
                <div className="space-y-1">
                  <span className="font-bold text-charcoal uppercase text-[10px] block">Customer Details</span>
                  <p className="font-semibold text-charcoal">{selectedOrder.customer.name}</p>
                  <p className="text-charcoal-600 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-gold" /> {selectedOrder.customer.email}
                  </p>
                  <p className="text-charcoal-600 flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-gold" /> {selectedOrder.customer.phone}
                  </p>
                  <a
                    href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                      selectedOrder.customer.name
                    )},%20this%20is%20Sika%20Threads%20following%20up%20on%20your%20Order%20Request%20${selectedOrder.orderReference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-emerald-800 font-bold hover:underline pt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1" /> Open WhatsApp Chat
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-charcoal uppercase text-[10px] block">Fulfilment Destination</span>
                  <p className="font-semibold text-charcoal capitalize flex items-center">
                    {selectedOrder.customer.deliveryPreference === 'pickup' ? (
                      <>
                        <Store className="w-3.5 h-3.5 mr-1 text-gold" /> Direct Pickup / Collection (Accra)
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 mr-1 text-gold" /> Regional Courier Delivery
                      </>
                    )}
                  </p>
                  {selectedOrder.customer.deliveryPreference === 'delivery' && selectedOrder.customer.address && (
                    <p className="text-charcoal-600">
                      {selectedOrder.customer.address.street}, {selectedOrder.customer.address.city} ({selectedOrder.customer.address.region})
                    </p>
                  )}
                  {selectedOrder.customer.orderNotes && (
                    <p className="text-charcoal-500 italic mt-1">
                      Customer Note: "{selectedOrder.customer.orderNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-serif font-bold text-sm text-charcoal mb-3">Requested Fabrics</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-white border border-ivory-200 rounded flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-bold text-charcoal">{item.name}</p>
                          <p className="text-charcoal-400">
                            {item.quantity} {item.sellingUnit} &times; GHS {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-charcoal">
                        GHS {item.lineTotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-right text-xs space-y-1">
                  <p className="text-charcoal-500">
                    Subtotal: <strong>GHS {selectedOrder.subtotal.toLocaleString()}</strong>
                  </p>
                  <p className="text-charcoal-500">
                    Proposed Delivery: <strong>GHS {selectedOrder.proposedDeliveryFee.toLocaleString()}</strong>
                  </p>
                  <p className="text-sm font-bold text-gold-800">
                    Proposed Total: GHS {selectedOrder.proposedTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Update / Fulfillment Action Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 bg-ivory-100 rounded-lg border border-ivory-300 space-y-4 text-xs">
                <h3 className="font-serif font-bold text-sm text-charcoal">
                  Update Order Status &amp; Confirm Arrangements
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">New Order Status *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">
                      Final Agreed Price (GHS)
                    </label>
                    <input
                      type="number"
                      placeholder={`Default: ${selectedOrder.proposedTotal}`}
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">
                    Confirmed Delivery / Pickup Terms
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via VIP Parcel to Kumasi Station / Collection arranged for Thursday"
                    value={finalDeliveryTerms}
                    onChange={(e) => setFinalDeliveryTerms(e.target.value)}
                    className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">
                    Notification Note to Customer (included in email update)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Your fabric cuts have been inspected and confirmed in our Accra facility."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-charcoal hover:bg-gold-700 text-white rounded font-semibold transition-colors shadow-sm"
                >
                  Save Status &amp; Dispatch Customer Email Update
                </button>
              </form>

              {/* Status Audit Trail */}
              <div>
                <h4 className="font-serif font-bold text-xs text-charcoal mb-2">Order Status History</h4>
                <div className="space-y-1.5 text-[11px] text-charcoal-500">
                  {selectedOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="p-2 bg-ivory-50 rounded border border-ivory-200 flex justify-between items-start">
                      <div>
                        <span className="font-bold text-charcoal capitalize">{hist.status.replace(/_/g, ' ')}</span>
                        {hist.note && <p className="text-charcoal-600 mt-0.5">{hist.note}</p>}
                      </div>
                      <span className="text-[10px] text-charcoal-400 whitespace-nowrap ml-2">
                        {new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
