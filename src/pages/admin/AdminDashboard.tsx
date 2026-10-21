import React from 'react';
import { Link } from 'react-router-dom';
import { StoreService } from '../../services/storeService';
import { EmailService } from '../../services/emailService';
import {
  Package,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Mail,
  Compass,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const products = StoreService.getProducts();
  const publishedProducts = products.filter((p) => p.publicationStatus === 'published');
  const lowStockItems = products.filter((p) => p.stockQty > 0 && p.stockQty <= p.lowStockThreshold);
  const outOfStockItems = products.filter((p) => p.stockQty === 0);

  const orders = StoreService.getOrders();
  const newOrderRequests = orders.filter((o) => o.status === 'request_submitted');
  const awaitingVerification = orders.filter((o) => o.status === 'awaiting_stock_verification');
  const awaitingConfirmation = orders.filter((o) => o.status === 'awaiting_customer_confirmation');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');

  const styleMatchRequests = StoreService.getStyleMatchRequests();
  const pendingStyleMatch = styleMatchRequests.filter((s) => s.approvalStatus === 'pending');
  const awaitingApproval = styleMatchRequests.filter((s) => s.processingStatus === 'in_review');

  // Check requests approaching 3-5 min target
  const now = Date.now();
  const approachingDeadline = pendingStyleMatch.filter((s) => {
    const elapsedMinutes = (now - new Date(s.createdAt).getTime()) / (1000 * 60);
    return elapsedMinutes >= 3;
  });

  const emailJobs = EmailService.getEmailJobs();
  const failedEmails = emailJobs.filter((e) => e.status === 'failed');

  const sourcing = StoreService.getSourcingRequests();
  const pendingSourcing = sourcing.filter((s) => s.status === 'submitted');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-300">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Operations Overview</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real-time warehouse metrics, incoming order requests, and Sika StyleMatch AI approval queue.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/admin/products?action=new"
            className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold shadow-sm transition-colors"
          >
            + Add New Fabric
          </Link>
          <Link
            to="/admin/stylematch"
            className="px-4 py-2 bg-charcoal hover:bg-gold text-white rounded font-semibold transition-colors flex items-center"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold-400" /> StyleMatch Queue
          </Link>
        </div>
      </div>

      {/* Critical Operational Alerts */}
      {(approachingDeadline.length > 0 || lowStockItems.length > 0 || failedEmails.length > 0) && (
        <div className="space-y-3">
          {approachingDeadline.length > 0 && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <strong>Urgent Attention:</strong> {approachingDeadline.length} StyleMatch request(s) approaching or exceeding the 3–5 minute response target!
                </div>
              </div>
              <Link
                to="/admin/stylematch"
                className="inline-flex items-center gap-1 text-xs font-bold underline text-amber-950 whitespace-nowrap ml-4"
              >
                <span>Review Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {failedEmails.length > 0 && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-900 rounded-r-lg flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <strong>Email Dispatch Warning:</strong> {failedEmails.length} transactional email job(s) failed delivery and require review.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Published Products */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500 font-bold uppercase tracking-wider">
            <span>Catalogue Items</span>
            <Package className="w-4 h-4 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal">
            {publishedProducts.length}
            <span className="text-xs font-sans text-charcoal-400 font-normal ml-2">
              / {products.length} total
            </span>
          </div>
          <div className="text-[11px] text-charcoal-500 pt-1 border-t border-ivory-200 flex justify-between">
            <span>Out of Stock: <strong className="text-rose-700">{outOfStockItems.length}</strong></span>
            <span>Low Stock: <strong className="text-amber-700">{lowStockItems.length}</strong></span>
          </div>
        </div>

        {/* Card 2: New Order Requests */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500 font-bold uppercase tracking-wider">
            <span>New Order Requests</span>
            <ShoppingBag className="w-4 h-4 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal">
            {newOrderRequests.length}
          </div>
          <div className="text-[11px] text-charcoal-500 pt-1 border-t border-ivory-200 flex justify-between">
            <span>Awaiting Verification: <strong>{awaitingVerification.length}</strong></span>
            <span>Confirmed: <strong>{confirmedOrders.length}</strong></span>
          </div>
        </div>

        {/* Card 3: StyleMatch AI Queue */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500 font-bold uppercase tracking-wider">
            <span>StyleMatch In Review</span>
            <Sparkles className="w-4 h-4 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-gold-700">
            {pendingStyleMatch.length}
          </div>
          <div className="text-[11px] text-charcoal-500 pt-1 border-t border-ivory-200 flex justify-between">
            <span>Pending Stylist Approval</span>
            <span>Approaching SLA: <strong>{approachingDeadline.length}</strong></span>
          </div>
        </div>

        {/* Card 4: Sourcing Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-charcoal-500 font-bold uppercase tracking-wider">
            <span>Sourcing Inquiries</span>
            <Compass className="w-4 h-4 text-gold-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal">
            {pendingSourcing.length}
          </div>
          <div className="text-[11px] text-charcoal-500 pt-1 border-t border-ivory-200">
            <span>Custom loom procurement requests</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & StyleMatch Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent Order Requests */}
        <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-gold-600" />
              Recent Order Requests
            </h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 bg-ivory-50 rounded-lg border border-ivory-200 flex items-center justify-between text-xs hover:border-gold transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-charcoal">{order.orderReference}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-charcoal-700 capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-charcoal-500">
                      {order.customer.name} &bull; {order.items.length} items &bull; <strong>GHS {order.proposedTotal.toLocaleString()}</strong>
                    </p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="px-3 py-1.5 rounded bg-white border border-ivory-300 hover:bg-ivory-100 font-semibold text-charcoal text-[11px]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-charcoal-500 italic py-6 text-center">
              No order requests submitted yet.
            </p>
          )}
        </div>

        {/* Right: StyleMatch Queue */}
        <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-gold-600" />
              StyleMatch Approvals (3–5 Min Target)
            </h2>
            <Link to="/admin/stylematch" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">
              <span>Review Queue ({pendingStyleMatch.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingStyleMatch.length > 0 ? (
            <div className="space-y-3">
              {pendingStyleMatch.slice(0, 4).map((req) => {
                const elapsedMin = Math.floor((now - new Date(req.createdAt).getTime()) / (1000 * 60));
                const isOverdue = elapsedMin >= 5;
                const isWarning = elapsedMin >= 3 && elapsedMin < 5;

                return (
                  <div
                    key={req.id}
                    className="p-3.5 bg-ivory-50 rounded-lg border border-ivory-200 flex items-center justify-between text-xs hover:border-gold transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-charcoal">{req.customerName}</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">#{req.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {elapsedMin}m elapsed
                        </span>
                      </div>
                      <p className="text-charcoal-600">
                        {req.occasion} &bull; {req.preferredColours.join(', ')} &bull; {req.candidateRecommendations.length} catalogue matches
                      </p>
                    </div>

                    <Link
                      to="/admin/stylematch"
                      className="px-3 py-1.5 rounded bg-gold-600 hover:bg-gold-500 text-white font-semibold text-[11px]"
                    >
                      Approve
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-charcoal-500 italic py-6 text-center">
              All StyleMatch recommendations have been approved or dispatched.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
