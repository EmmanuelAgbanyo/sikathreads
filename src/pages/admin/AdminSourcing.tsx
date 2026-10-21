import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { SourcingRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Send,
  MessageCircle,
} from 'lucide-react';

export const AdminSourcing: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SourcingRequest[]>(() => StoreService.getSourcingRequests());
  const [selectedReq, setSelectedReq] = useState<SourcingRequest | null>(requests[0] || null);

  const [sourcingStatus, setSourcingStatus] = useState<SourcingRequest['status']>(
    requests[0]?.status || 'submitted'
  );
  const [proposalPrice, setProposalPrice] = useState<string>('');
  const [proposalLeadTime, setProposalLeadTime] = useState('2-3 weeks');
  const [proposalNotes, setProposalNotes] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const sourcingStatusOptions: { value: SourcingRequest['status']; label: string }[] = [
    { value: 'submitted', label: '1. Inquiry Submitted' },
    { value: 'in_research', label: '2. In Weaver / Market Research' },
    { value: 'supplier_contacted', label: '3. Master Weavers Contacted' },
    { value: 'swatches_reviewed', label: '4. Swatches Reviewed & Verified' },
    { value: 'proposal_sent', label: '5. Proposal & Quote Sent to Customer' },
    { value: 'proposal_accepted', label: '6. Proposal Accepted by Customer' },
    { value: 'order_converted', label: '7. Converted to Production Order' },
    { value: 'declined', label: '8. Declined / Unavailable' },
  ];

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    selectedReq.proposal = {
      estimatedPrice: Number(proposalPrice) || selectedReq.budget,
      estimatedLeadTime: proposalLeadTime,
      notes: proposalNotes,
    };
    selectedReq.adminNotes = adminNotes;
    selectedReq.supplierNotes = supplierNotes;
    selectedReq.status = sourcingStatus;
    selectedReq.updatedAt = new Date().toISOString();

    StoreService.saveSourcingRequest(selectedReq);
    StoreService.recordAuditLog(
      user?.email || 'admin@sikathreads.com.gh',
      'admin',
      'UPDATE_SOURCING_STATUS',
      'sourcing',
      selectedReq.id,
      `Updated sourcing status to "${sourcingStatus}" for ${selectedReq.reference}`
    );

    setRequests(StoreService.getSourcingRequests());
    setFeedback(`Proposal formulated and recorded for ${selectedReq.customerName}.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Bespoke Procurement
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Fabric Sourcing Inquiries</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Research artisan weaver queues, formulate price &amp; lead-time estimates, and send proposals.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-ivory-300 text-center space-y-3 shadow-subtle">
          <Compass className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-charcoal">No Sourcing Inquiries Yet</h2>
          <p className="text-xs text-charcoal-500">
            When a customer submits a "Request a Fabric" inquiry, it will appear here for procurement review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white rounded-xl border border-ivory-300 shadow-subtle p-4 space-y-3 max-h-[750px] overflow-y-auto">
            <h2 className="font-serif text-sm font-bold text-charcoal px-2 pb-2 border-b border-ivory-200">
              Sourcing Requests ({requests.length})
            </h2>

            {requests.map((req) => {
              const isSelected = selectedReq?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedReq(req);
                    setSourcingStatus(req.status);
                    setProposalPrice(req.proposal ? String(req.proposal.estimatedPrice) : String(req.budget));
                    setProposalLeadTime(req.proposal ? req.proposal.estimatedLeadTime : '2-3 weeks');
                    setProposalNotes(req.proposal ? req.proposal.notes : '');
                    setSupplierNotes(req.supplierNotes || '');
                    setAdminNotes(req.adminNotes || '');
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'border-gold bg-gold-50/50 shadow-sm' : 'border-ivory-200 hover:bg-ivory-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal text-xs">{req.reference}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-ivory-200 text-charcoal-700">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-700 font-medium mt-1 truncate">
                    {req.desiredFabricType} ({req.colourPattern})
                  </p>
                  <p className="text-[11px] text-charcoal-500">
                    Customer: {req.customerName} &bull; Budget: GHS {req.budget.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          {selectedReq && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-ivory-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                    Ref #{selectedReq.reference}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-charcoal">
                    {selectedReq.desiredFabricType}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-900 border border-gold-300 uppercase">
                  {selectedReq.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-ivory-50 p-4 rounded-lg border border-ivory-200">
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Customer</span>
                  <span className="font-semibold text-charcoal">{selectedReq.customerName}</span>
                  <span className="text-charcoal-500 block">{selectedReq.customerEmail}</span>
                  {selectedReq.customerPhone && (
                    <span className="text-charcoal-500 block">{selectedReq.customerPhone}</span>
                  )}
                </div>

                <div>
                  <span className="text-charcoal-400 block text-[10px]">Specifications</span>
                  <span className="text-charcoal block"><strong>Occasion:</strong> {selectedReq.occasion}</span>
                  <span className="text-charcoal block"><strong>Quantity:</strong> {selectedReq.desiredQuantity} {selectedReq.desiredUnit}</span>
                  <span className="text-charcoal block"><strong>Target Budget:</strong> GHS {selectedReq.budget.toLocaleString()}</span>
                </div>
              </div>

              {selectedReq.additionalRequirements && (
                <div className="p-3 bg-ivory-50 rounded border border-ivory-200 text-xs text-charcoal-600">
                  <strong>Requirements:</strong> "{selectedReq.additionalRequirements}"
                </div>
              )}

              {/* Formulate Proposal Form */}
              <form onSubmit={handleSaveProposal} className="p-4 bg-ivory-100 rounded-lg border border-ivory-300 space-y-4 text-xs">
                <h3 className="font-serif font-bold text-sm text-charcoal">
                  Formulate Sourcing Proposal
                </h3>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">
                    Workflow Procurement Stage *
                  </label>
                  <select
                    value={sourcingStatus}
                    onChange={(e) => setSourcingStatus(e.target.value as SourcingRequest['status'])}
                    className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold font-medium"
                  >
                    {sourcingStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">Estimated Price (GHS) *</label>
                    <input
                      type="number"
                      required
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(e.target.value)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">Estimated Lead Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2-3 weeks hand-weaving turnaround"
                      value={proposalLeadTime}
                      onChange={(e) => setProposalLeadTime(e.target.value)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-charcoal-600 block mb-1">
                    Proposal Notes to Customer (included in proposal email/quote)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Bonwire master weaver confirmed availability to weave this custom warp..."
                    value={proposalNotes}
                    onChange={(e) => setProposalNotes(e.target.value)}
                    className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">
                      Supplier / Weaver Tracking Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Weaver name, town (e.g. Bonwire / Kpetoe), loom ID, swatch status..."
                      value={supplierNotes}
                      onChange={(e) => setSupplierNotes(e.target.value)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal-600 block mb-1">
                      Internal Admin Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Pricing margins, customer deposit notes, internal timeline..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-white border border-ivory-300 rounded p-2 focus:ring-gold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-light text-charcoal font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Sourcing Stage &amp; Update Proposal</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
