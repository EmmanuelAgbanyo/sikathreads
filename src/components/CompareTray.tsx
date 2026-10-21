import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';

export const CompareTray: React.FC = () => {
  const { comparedProducts, removeFromCompare, clearCompare } = useCompare();

  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-charcoal/95 backdrop-blur-md text-ivory rounded-2xl shadow-2xl border border-gold/30 p-3 sm:p-4 transition-all duration-300 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Summary & Thumbnails */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gold/20 text-gold border border-gold/30 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            {comparedProducts.map((product) => (
              <div
                key={product.id}
                className="relative group flex items-center gap-2 bg-charcoal-light/80 border border-white/10 rounded-xl p-1.5 pr-2.5 flex-shrink-0"
              >
                <img
                  src={product.images[0] || '/kente-weave.jpg'}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/kente-weave.jpg';
                  }}
                />
                <div className="text-xs max-w-[110px] truncate">
                  <p className="font-medium text-white truncate">{product.name}</p>
                  <p className="text-gold font-serif">GHS {product.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="text-ivory-muted hover:text-white transition-colors p-0.5 ml-1"
                  title="Remove from comparison"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {comparedProducts.length < 3 && (
              <div className="hidden md:flex items-center justify-center w-28 h-10 border border-dashed border-white/20 rounded-xl text-xs text-ivory-muted">
                + {3 - comparedProducts.length} more
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ivory-muted hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Clear</span>
          </button>

          <Link
            to="/compare"
            className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light text-charcoal font-semibold text-xs sm:text-sm rounded-xl shadow transition-all duration-200"
          >
            <span>Compare ({comparedProducts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
