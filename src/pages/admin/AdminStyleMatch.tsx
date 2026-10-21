import React, { useState, useEffect } from 'react';
import { StoreService } from '../../services/storeService';
import { EmailService } from '../../services/emailService';
import { StyleMatchRequest, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Trash2,
  Plus,
  Edit,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminStyleMatch: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<StyleMatchRequest[]>(() => StoreService.getStyleMatchRequests());
  const [selectedReq, setSelectedReq] = useState<StyleMatchRequest | null>(requests[0] || null);

  // Editable candidate recommendations for the selected request
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [customReasons, setCustomReasons] = useState<Record<string, string>>({});
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  // Live timer tick to update elapsed time every 10 seconds
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // When a request is selected, populate approved IDs and custom reasons
  useEffect(() => {
    if (selectedReq) {
      const initialApproved =
        selectedReq.approvedProductIds.length > 0
          ? selectedReq.approvedProductIds
          : selectedReq.candidateRecommendations.map((c) => c.productId);
      setApprovedIds(initialApproved);

      const reasons: Record<string, string> = {};
      selectedReq.candidateRecommendations.forEach((c) => {
        reasons[c.productId] = c.reason;
      });
      setCustomReasons(reasons);
    }
  }, [selectedReq]);

  const allProducts = StoreService.getPublishedProducts();

  const handleToggleProduct = (productId: string) => {
    if (approvedIds.includes(productId)) {
      setApprovedIds(approvedIds.filter((id) => id !== productId));
    } else {
      setApprovedIds([...approvedIds, productId]);
    }
  };

  const handleReasonChange = (productId: string, newReason: string) => {
    setCustomReasons((prev) => ({ ...prev, [productId]: newReason }));
  };

  const handleAddCatalogProduct = (prod: Product) => {
    if (!selectedReq) return;
    if (selectedReq.candidateRecommendations.some((c) => c.productId === prod.id)) {
      alert('This product is already in the candidate list.');
      return;
    }

    const updatedCandidates = [
      ...selectedReq.candidateRecommendations,
      {
        productId: prod.id,
        rank: selectedReq.candidateRecommendations.length + 1,
        reason: `Personally selected by stylist for your ${selectedReq.occasion}.`,
        matchScore: 95,
        matchHighlights: ['Stylist Curated', 'In Stock in Accra'],
      },
    ];

    selectedReq.candidateRecommendations = updatedCandidates;
    StoreService.saveStyleMatchRequest(selectedReq);
    setApprovedIds((prev) => [...prev, prod.id]);
    setCustomReasons((prev) => ({
      ...prev,
      [prod.id]: `Personally selected by stylist for your ${selectedReq.occasion}.`,
    }));
    setCatalogModalOpen(false);
  };

  const handleRemoveCandidate = (productId: string) => {
    if (!selectedReq) return;
    selectedReq.candidateRecommendations = selectedReq.candidateRecommendations.filter(
      (c) => c.productId !== productId
    );
    setApprovedIds((prev) => prev.filter((id) => id !== productId));
    StoreService.saveStyleMatchRequest(selectedReq);
    setRequests(StoreService.getStyleMatchRequests());
  };

  // Revalidate stock and price and approve final email
  const handleApproveAndDispatch = async () => {
    if (!selectedReq) return;
    if (approvedIds.length === 0) {
      alert('Please approve at least one fabric recommendation before dispatching.');
      return;
    }

    setDispatching(true);

    try {
      // 1. Revalidate all approved products against catalogue
      const verifiedProducts: Array<{
        name: string;
        fabricType: string;
        price: number;
        sellingUnit: string;
        imageUrl: string;
        reason: string;
        slug: string;
      }> = [];

      for (const id of approvedIds) {
        const prod = StoreService.getProductById(id);
        if (!prod || prod.publicationStatus !== 'published' || prod.stockQty <= 0) {
          alert(`Warning: Product "${prod?.name || id}" is no longer in stock! Please review before dispatch.`);
          setDispatching(false);
          return;
        }

        verifiedProducts.push({
          name: prod.name,
          fabricType: prod.fabricType,
          price: prod.price,
          sellingUnit: prod.sellingUnit,
          imageUrl: prod.images[0] || '',
          reason: customReasons[id] || `Selected for your ${selectedReq.occasion}.`,
          slug: prod.slug,
        });
      }

      // 2. Dispatch transactional recommendation email
      const emailJob = EmailService.sendApprovedStyleMatchRecommendations(selectedReq, verifiedProducts);

      // 3. Update request status to approved and dispatched
      selectedReq.approvalStatus = 'approved';
      selectedReq.processingStatus = 'approved';
      selectedReq.approvedProductIds = approvedIds;
      selectedReq.approvingAdmin = user?.email || 'admin@sikathreads.com.gh';
      selectedReq.approvedAt = new Date().toISOString();
      selectedReq.emailStatus = 'sent';
      selectedReq.emailJobId = emailJob.id;
      selectedReq.updatedAt = new Date().toISOString();

      StoreService.saveStyleMatchRequest(selectedReq);

      StoreService.recordAuditLog(
        user?.email || 'admin@sikathreads.com.gh',
        'admin',
        'APPROVE_STYLEMATCH_RECOMMENDATION',
        'stylematch',
        selectedReq.id,
        `Approved ${verifiedProducts.length} fabrics for ${selectedReq.customerName} (${selectedReq.customerEmail}). Dispatched email job #${emailJob.id}.`
      );

      setRequests(StoreService.getStyleMatchRequests());
      showToast(`Lookbook dispatched to ${selectedReq.customerEmail}`, 'success');
      setActionNotice(
        `StyleMatch recommendations approved and dispatched to ${selectedReq.customerEmail} (Job ID: ${emailJob.id}).`
      );
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      showToast('Dispatch error: ' + err.message, 'error');
    } finally {
      setDispatching(false);
    }
  };

  // Send delay notification
  const handleSendDelayNotice = () => {
    if (!selectedReq) return;
    EmailService.sendStyleMatchDelayNotice(selectedReq);
    showToast(`Courtesy update sent to ${selectedReq.customerEmail}`, 'info');
    setActionNotice(`Delay courtesy notification dispatched to ${selectedReq.customerEmail}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-300">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
            Styling Concierge
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">StyleMatch Approval Centre</h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Human verification queue for Sika StyleMatch AI. Operational target: <strong>3–5 minutes</strong> turnaround.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-gold-100 text-gold-900 font-semibold border border-gold-300 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-gold-700" /> Target SLA: 3–5 Mins
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-ivory-300 text-center space-y-3 shadow-subtle">
          <Sparkles className="w-12 h-12 text-gold mx-auto" />
          <h2 className="font-serif font-bold text-xl text-charcoal">No StyleMatch Requests in Queue</h2>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            When a customer submits a StyleMatch form, it will appear here for stylist review and email approval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Requests Sidebar */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-ivory-300 shadow-subtle p-4 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-ivory-200 text-xs">
              <span className="font-bold text-charcoal">Pending Queue ({requests.length})</span>
              <span className="text-charcoal-400">Click to Inspect</span>
            </div>

            {requests.map((req) => {
              const elapsedMinutes = Math.floor((currentTime - new Date(req.createdAt).getTime()) / (1000 * 60));
              const isOverdue = elapsedMinutes >= 5 && req.approvalStatus === 'pending';
              const isWarning = elapsedMinutes >= 3 && elapsedMinutes < 5 && req.approvalStatus === 'pending';
              const isSelected = selectedReq?.id === req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gold bg-gold-50/50 shadow-sm'
                      : 'border-ivory-200 hover:border-ivory-300 hover:bg-ivory-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal text-xs">{req.customerName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-ivory-200 text-charcoal-700'
                      }`}
                    >
                      {req.approvalStatus === 'approved' ? 'Approved & Sent' : `${elapsedMinutes}m elapsed`}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 mt-1 truncate">
                    {req.occasion} &bull; {req.preferredColours.join(', ')}
                  </p>
                  <div className="flex justify-between items-center text-[11px] text-charcoal-500 mt-1 pt-1 border-t border-ivory-200">
                    <span>{req.candidateRecommendations.length} AI matches</span>
                    <span className="font-mono text-[10px]">#{req.id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Request Full Workspace */}
          {selectedReq && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-6">
              {/* Request Overview & SLA Banner */}
              <div className="pb-4 border-b border-ivory-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                      Request ID #{selectedReq.id}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-charcoal">
                      {selectedReq.customerName} &bull; {selectedReq.occasion}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedReq.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedReq.approvalStatus === 'approved' ? 'Verified by Stylist' : 'Approval Required'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
                  <div className="p-2 bg-ivory-50 rounded border border-ivory-200">
                    <span className="text-charcoal-400 block text-[10px]">Submitted:</span>
                    <span className="font-semibold text-charcoal">
                      {new Date(selectedReq.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="p-2 bg-ivory-50 rounded border border-ivory-200">
                    <span className="text-charcoal-400 block text-[10px]">Budget Range:</span>
                    <span className="font-semibold text-charcoal">
                      GHS {selectedReq.budgetRange.min} – {selectedReq.budgetRange.max}
                    </span>
                  </div>
                  <div className="p-2 bg-ivory-50 rounded border border-ivory-200">
                    <span className="text-charcoal-400 block text-[10px]">Colours:</span>
                    <span className="font-semibold text-charcoal truncate block">
                      {selectedReq.preferredColours.join(', ')}
                    </span>
                  </div>
                  <div className="p-2 bg-ivory-50 rounded border border-ivory-200">
                    <span className="text-charcoal-400 block text-[10px]">Email Status:</span>
                    <span className="font-semibold text-charcoal uppercase text-[10px]">
                      {selectedReq.emailStatus}
                    </span>
                  </div>
                </div>

                {selectedReq.intendedOutfit && (
                  <p className="text-xs text-charcoal-600 bg-ivory-50 p-2 rounded border border-ivory-200">
                    <strong>Intended Look:</strong> {selectedReq.intendedOutfit}
                    {selectedReq.additionalNotes && ` &bull; Notes: "${selectedReq.additionalNotes}"`}
                  </p>
                )}
              </div>

              {/* AI Semantic Summary */}
              {selectedReq.aiAnalysisSummary && (
                <div className="p-3 bg-gold-50/70 border border-gold-200 rounded-lg text-xs text-gold-950 space-y-1">
                  <div className="flex items-center font-bold">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold-700" />
                    AI Interpretation Summary (Strictly Grounded in Catalogue)
                  </div>
                  <p className="leading-relaxed">{selectedReq.aiAnalysisSummary}</p>
                </div>
              )}

              {/* Candidate Fabrics Review */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-charcoal">
                    Candidate Recommendations ({selectedReq.candidateRecommendations.length})
                  </h3>
                  <button
                    onClick={() => setCatalogModalOpen(true)}
                    className="px-3 py-1.5 bg-ivory-200 hover:bg-gold hover:text-white rounded text-xs font-semibold flex items-center transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Fabric from Catalogue
                  </button>
                </div>

                {selectedReq.candidateRecommendations.map((cand) => {
                  const prod = StoreService.getProductById(cand.productId);
                  if (!prod) return null;
                  const isChecked = approvedIds.includes(cand.productId);

                  return (
                    <div
                      key={cand.productId}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked ? 'border-gold bg-white shadow-sm' : 'border-ivory-300 bg-ivory-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProduct(cand.productId)}
                            className="accent-gold-600 mt-1 cursor-pointer w-4 h-4"
                          />
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-16 h-16 rounded object-cover border border-ivory-200 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-serif font-bold text-sm text-charcoal">{prod.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-100 text-gold-800">
                                Match Score: {cand.matchScore}%
                              </span>
                            </div>
                            <p className="text-xs text-charcoal-500">
                              {prod.fabricType} &bull; <strong>GHS {prod.price.toLocaleString()}</strong> / {prod.sellingUnit} &bull; Stock: {prod.stockQty} {prod.sellingUnit}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cand.matchHighlights.map((hl, i) => (
                                <span key={i} className="text-[10px] bg-ivory-200 text-charcoal-700 px-1.5 py-0.5 rounded">
                                  {hl}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveCandidate(cand.productId)}
                          className="text-charcoal-400 hover:text-burgundy p-1"
                          title="Remove from Recommendation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Editable Reason */}
                      <div className="mt-3 pt-3 border-t border-ivory-200">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 block mb-1">
                          Stylist Match Rationale (Sent in Email to Customer)
                        </label>
                        <textarea
                          rows={2}
                          value={customReasons[cand.productId] || ''}
                          onChange={(e) => handleReasonChange(cand.productId, e.target.value)}
                          className="w-full text-xs bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-ivory-100 rounded-xl border border-ivory-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleSendDelayNotice}
                  className="text-xs text-charcoal-600 hover:text-gold underline"
                >
                  Send Courtesy 3–5 Min Delay Notice
                </button>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={handleApproveAndDispatch}
                    disabled={dispatching || approvedIds.length === 0}
                    className="w-full sm:w-auto px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold text-xs tracking-wider uppercase shadow-gold-glow flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {dispatching
                        ? 'Revalidating & Dispatching...'
                        : `Approve & Dispatch Lookbook (${approvedIds.length} Fabrics)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Catalogue Picker Modal */}
      {catalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-ivory-200">
              <h3 className="font-serif font-bold text-lg text-charcoal">Select Fabric from Catalogue</h3>
              <button onClick={() => setCatalogModalOpen(false)} className="text-charcoal font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {allProducts
                .filter((p) => p.stockQty > 0)
                .map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded border border-ivory-200 flex items-center justify-between hover:bg-ivory-50 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-bold text-charcoal">{p.name}</p>
                        <p className="text-charcoal-400">
                          {p.fabricType} &bull; GHS {p.price.toLocaleString()} / {p.sellingUnit} &bull; Stock: {p.stockQty}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddCatalogProduct(p)}
                      className="px-3 py-1 bg-gold-600 text-white rounded font-semibold text-[11px] hover:bg-gold-500"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
