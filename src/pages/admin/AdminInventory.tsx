import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { Product, StockMovement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  History,
  CheckCircle,
  Search,
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [movements, setMovements] = useState<StockMovement[]>(() => StoreService.getStockMovements());

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [delta, setDelta] = useState<number>(5);
  const [reason, setReason] = useState<string>('Warehouse Restock Arrival');
  const [movementType, setMovementType] = useState<StockMovement['type']>('restock');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || delta === 0) return;

    const res = StoreService.adjustStock(
      selectedProductId,
      delta,
      reason,
      user?.email || 'admin@sikathreads.com.gh',
      movementType
    );

    setFeedback(res);
    if (res.success) {
      showToast(res.message, 'success');
      setProducts(StoreService.getProducts());
      setMovements(StoreService.getStockMovements());
      setTimeout(() => setFeedback(null), 4000);
    } else {
      showToast(res.message, 'error');
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Warehouse Inventory
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Stock &amp; Inventory Management</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Execute controlled stock adjustments, monitor low inventory, and track the full audit trail.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs sm:text-sm flex items-center space-x-2 ${
            feedback.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Two Column Grid: Stock Adjustment Form & Quick Low Stock Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Adjustment Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-5">
          <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
            <PlusCircle className="w-4 h-4 mr-2 text-gold-600" /> Stock Adjustment Form
          </h2>

          <form onSubmit={handleAdjust} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Select Fabric Item *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stockQty} {p.sellingUnit} in stock)
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-ivory-100 rounded border border-ivory-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-charcoal-500 block">Current Available Stock:</span>
                  <span className="font-bold text-charcoal text-base">
                    {selectedProduct.stockQty} {selectedProduct.sellingUnit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-charcoal-500 block">Low Threshold:</span>
                  <span className="font-semibold text-charcoal">
                    {selectedProduct.lowStockThreshold} {selectedProduct.sellingUnit}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-charcoal-600 block mb-1">Adjustment Type *</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as StockMovement['type'])}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                >
                  <option value="restock">Restock (+)</option>
                  <option value="manual_adjustment">Manual Adjustment</option>
                  <option value="damaged">Damaged / Flawed (-)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal-600 block mb-1">
                  Delta Quantity (use minus for reduction) *
                </label>
                <input
                  type="number"
                  required
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value))}
                  className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Operational Reason *</label>
              <input
                type="text"
                required
                placeholder="e.g. Received new bolt delivery from Bonwire master weaver"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2 focus:ring-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold text-xs transition-colors shadow-sm"
            >
              Confirm Inventory Adjustment
            </button>
          </form>
        </div>

        {/* Low Stock Alerts Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
              Low Stock &amp; Out of Stock Monitoring
            </span>
          </h2>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {products
              .filter((p) => p.stockQty <= p.lowStockThreshold)
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-ivory-50 rounded border border-ivory-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <span className="font-bold text-charcoal block line-clamp-1">{p.name}</span>
                      <span className="text-[11px] text-charcoal-400">
                        {p.fabricType} &bull; Threshold: {p.lowStockThreshold} {p.sellingUnit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold block ${
                        p.stockQty === 0 ? 'text-rose-700' : 'text-amber-700'
                      }`}
                    >
                      {p.stockQty === 0 ? 'OUT OF STOCK' : `${p.stockQty} ${p.sellingUnit} left`}
                    </span>
                    <button
                      onClick={() => setSelectedProductId(p.id)}
                      className="text-[10px] text-gold-800 font-semibold underline mt-0.5"
                    >
                      Restock this item
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Movement History / Audit Log */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-charcoal pb-2 border-b border-ivory-200 flex items-center">
          <History className="w-4 h-4 mr-2 text-gold-600" />
          Recent Stock Movements Log
        </h2>

        {movements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Fabric Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Change</th>
                  <th className="p-3">New Stock</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-ivory-50">
                    <td className="p-3 text-charcoal-500 whitespace-nowrap">
                      {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-semibold text-charcoal">{mov.productName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory-200 text-charcoal-700 uppercase">
                        {mov.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono">
                      <span className={mov.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {mov.delta >= 0 ? `+${mov.delta}` : mov.delta}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-charcoal">{mov.newStock}</td>
                    <td className="p-3 text-charcoal-600">{mov.reason}</td>
                    <td className="p-3 text-charcoal-400 font-mono text-[11px]">{mov.adminEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-charcoal-500 italic py-4">No stock movements recorded yet.</p>
        )}
      </div>
    </div>
  );
};
