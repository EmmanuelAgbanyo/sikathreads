import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { FabricCalculatorModal } from '../components/FabricCalculatorModal';
import { Product } from '../types';
import {
  Layers,
  Trash2,
  ShoppingBag,
  Scissors,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { comparedProducts, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [activeCalculatorProduct, setActiveCalculatorProduct] = useState<Product | undefined>(undefined);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product, product.minOrderQty);
    if (success) {
      addToast(`Added ${product.minOrderQty} ${product.sellingUnit} of "${product.name}" to cart.`, 'success');
    }
  };

  if (comparedProducts.length === 0) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mx-auto mb-6">
          <Layers className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-charcoal mb-3">Compare Fabrics Side-by-Side</h1>
        <p className="text-charcoal-muted max-w-md mx-auto mb-8 text-sm">
          Select up to 3 luxury textiles from our catalogue to inspect weave textures, pattern motifs, yardage pricing, and occasion suitability side by side.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal hover:bg-charcoal-light text-white text-sm font-semibold rounded-xl shadow transition-all duration-200"
        >
          <span>Explore Fabric Catalogue</span>
          <ArrowRight className="w-4 h-4 text-gold" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-charcoal/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">Fabric Analysis</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mt-1">
            Side-by-Side Textile Comparison ({comparedProducts.length}/3)
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Compare weave density, pattern types, drape texture, and pricing to find the perfect fabric for your occasion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCompare}
            className="flex items-center gap-1.5 px-4 py-2 border border-charcoal/20 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-burgundy hover:border-burgundy/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white rounded-xl text-xs font-semibold hover:bg-charcoal-light transition-colors"
          >
            <span>+ Add More Fabrics</span>
          </Link>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[700px] grid grid-cols-4 gap-4 bg-white rounded-2xl border border-charcoal/10 shadow-sm p-4 sm:p-6">
          {/* Column 1: Feature Labels */}
          <div className="space-y-6 pt-[220px]">
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Fabric Weave & Type
            </div>
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Price (GHS)
            </div>
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Selling Unit & MOQ
            </div>
            <div className="h-16 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Color Family & Tones
            </div>
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Pattern & Motif
            </div>
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Texture & Feel
            </div>
            <div className="h-20 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Suitable Occasions
            </div>
            <div className="h-12 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted border-b border-charcoal/5">
              Stock Availability
            </div>
            <div className="h-14 flex items-center font-bold text-xs uppercase tracking-wider text-charcoal-muted">
              Quick Actions
            </div>
          </div>

          {/* Columns 2-4: Compared Products */}
          {comparedProducts.map((product) => (
            <div key={product.id} className="space-y-6">
              {/* Product Top Card */}
              <div className="h-[220px] flex flex-col justify-between p-3 bg-ivory/50 rounded-xl border border-charcoal/10 relative group">
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-charcoal-muted hover:text-burgundy transition-colors shadow-sm"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link to={`/product/${product.slug}`} className="block overflow-hidden rounded-lg">
                  <img
                    src={product.images[0] || '/kente-weave.jpg'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/kente-weave.jpg';
                    }}
                  />
                </Link>
                <div className="mt-2">
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-bold text-xs sm:text-sm text-charcoal hover:text-gold line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] text-charcoal-muted line-clamp-1">{product.fabricType}</p>
                </div>
              </div>

              {/* Rows matching labels */}
              <div className="h-12 flex items-center text-xs font-semibold text-charcoal border-b border-charcoal/5">
                {product.fabricType}
              </div>

              <div className="h-12 flex items-center text-sm font-serif font-bold text-gold border-b border-charcoal/5">
                GHS {product.price.toLocaleString()} <span className="text-[11px] font-sans font-normal text-charcoal-muted ml-1">/ {product.sellingUnit.slice(0, -1)}</span>
              </div>

              <div className="h-12 flex items-center text-xs text-charcoal border-b border-charcoal/5">
                Min. {product.minOrderQty} {product.sellingUnit} (increments of {product.qtyIncrement})
              </div>

              <div className="h-16 flex flex-col justify-center text-xs text-charcoal border-b border-charcoal/5">
                <span className="font-medium text-charcoal">{product.colourFamily}</span>
                <span className="text-[11px] text-charcoal-muted truncate">
                  {product.colours.join(', ')}
                </span>
              </div>

              <div className="h-12 flex items-center text-xs text-charcoal border-b border-charcoal/5">
                {product.pattern}
              </div>

              <div className="h-12 flex items-center text-xs text-charcoal border-b border-charcoal/5">
                {product.texture || 'Crisp & Rich'}
              </div>

              <div className="h-20 flex flex-wrap content-center gap-1 text-[11px] text-charcoal border-b border-charcoal/5 overflow-hidden">
                {product.suitableOccasions.slice(0, 3).map((occ, i) => (
                  <span key={i} className="px-2 py-0.5 bg-ivory rounded border border-charcoal/10 text-[10px]">
                    {occ}
                  </span>
                ))}
              </div>

              <div className="h-12 flex items-center text-xs border-b border-charcoal/5">
                {product.stockQty > product.lowStockThreshold ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Stock ({product.stockQty} {product.sellingUnit})
                  </span>
                ) : product.stockQty > 0 ? (
                  <span className="text-amber-700 font-medium">
                    Limited Reserve ({product.stockQty} {product.sellingUnit} left)
                  </span>
                ) : (
                  <span className="text-burgundy font-medium">Sourcing on Request</span>
                )}
              </div>

              <div className="h-14 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gold hover:bg-gold-light text-charcoal font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add {product.minOrderQty} yds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCalculatorProduct(product)}
                  className="p-2 border border-charcoal/20 hover:border-gold hover:bg-gold/5 rounded-lg text-charcoal-muted hover:text-gold transition-colors"
                  title="Estimate Yardage for this Fabric"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Placeholders if fewer than 3 */}
          {Array.from({ length: 3 - comparedProducts.length }).map((_, idx) => (
            <div
              key={idx}
              className="hidden lg:flex flex-col items-center justify-center border-2 border-dashed border-charcoal/10 rounded-xl p-6 text-center text-charcoal-muted"
            >
              <div className="w-12 h-12 rounded-xl bg-ivory flex items-center justify-center mb-3">
                <Layers className="w-6 h-6 text-charcoal-light" />
              </div>
              <p className="text-xs font-semibold text-charcoal mb-1">Add Another Fabric</p>
              <p className="text-[11px] text-charcoal-muted mb-4">
                Compare up to 3 fabrics side-by-side to make confident styling decisions.
              </p>
              <Link
                to="/shop"
                className="px-4 py-2 border border-charcoal/20 hover:border-charcoal text-charcoal text-xs font-semibold rounded-lg transition-colors"
              >
                Browse Catalogue
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* StyleMatch Recommendation Cross-promotion */}
      <div className="mt-8 bg-gradient-to-r from-charcoal via-charcoal-light to-charcoal p-6 sm:p-8 rounded-2xl text-ivory flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Need Personal Fashion Advice?</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-white">Let Sika StyleMatch AI Help You Choose</h3>
          <p className="text-xs text-ivory-muted max-w-xl">
            Tell us your occasion, budget, and colour preferences. Our AI analyses authentic Ghanaian textiles and curates 3 tailored selections, inspected personally by our textile curators.
          </p>
        </div>
        <Link
          to="/stylematch"
          className="px-6 py-3 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold rounded-xl shadow-lg transition-all flex-shrink-0"
        >
          Try Sika StyleMatch Free
        </Link>
      </div>

      {/* Active Yardage Calculator Modal */}
      {activeCalculatorProduct && (
        <FabricCalculatorModal
          isOpen={!!activeCalculatorProduct}
          onClose={() => setActiveCalculatorProduct(undefined)}
          product={activeCalculatorProduct}
        />
      )}
    </div>
  );
};
