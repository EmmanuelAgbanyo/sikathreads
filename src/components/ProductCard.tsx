import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Sparkles, Layers } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Determine availability status
  let availabilityBadge = {
    label: 'In Stock',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  if (product.stockQty <= 0) {
    if (product.sourcingEnabled) {
      availabilityBadge = {
        label: 'Available via Sourcing',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    } else {
      availabilityBadge = {
        label: 'Out of Stock',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    }
  } else if (product.stockQty <= product.lowStockThreshold) {
    availabilityBadge = {
      label: `Limited (${product.stockQty} ${product.sellingUnit} left)`,
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
    };
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = addToCart(product, product.minOrderQty);
    if (res.success) {
      showToast(`Added ${product.minOrderQty} ${product.sellingUnit} of "${product.name}" to your bag`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(
      isFavorited
        ? `Removed "${product.name}" from your saved fabrics`
        : `Saved "${product.name}" to your wishlist`,
      'info'
    );
  };

  const primaryImage = product.images[0] || '/kente-weave.jpg';

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-ivory-300 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col">
      {/* Product Image Frame */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/kente-weave.jpg';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${availabilityBadge.bg}`}
          >
            {availabilityBadge.label}
          </span>
          {product.featured && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold text-white flex items-center shadow-sm">
              <Sparkles className="w-2.5 h-2.5 mr-1" /> Featured
            </span>
          )}
        </div>

        {/* Action Buttons Stack (Wishlist + Compare) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleToggleWishlist}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-charcoal hover:text-burgundy shadow-sm transition-transform active:scale-90"
            title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-burgundy text-burgundy' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isCompared) {
                removeFromCompare(product.id);
                showToast(`Removed "${product.name}" from comparison`, 'info');
              } else {
                addToCompare(product);
              }
            }}
            aria-label={isCompared ? 'Remove from comparison' : 'Compare fabric'}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-transform active:scale-90 ${
              isCompared
                ? 'bg-gold text-charcoal ring-2 ring-gold/40'
                : 'bg-white/90 text-charcoal hover:text-gold'
            }`}
            title={isCompared ? 'In comparison tray' : 'Add to compare'}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Quick View Link on hover */}
        <div className="absolute bottom-3 left-3 right-3 hidden group-hover:flex items-center justify-center space-x-2 z-10">
          <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-white/95 text-charcoal shadow-md">
            <Eye className="w-3.5 h-3.5 mr-1 text-gold-600" /> View Fabric Details
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
            {product.fabricType}
          </div>
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-semibold text-charcoal group-hover:text-gold-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Color & Occasion snippets */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-charcoal-500">
              {product.colours.slice(0, 2).join(', ')}
            </span>
            {product.suitableOccasions.length > 0 && (
              <span className="text-[10px] bg-ivory-200 text-charcoal-600 px-1.5 py-0.5 rounded">
                {product.suitableOccasions[0]}
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Bag */}
        <div className="mt-4 pt-3 border-t border-ivory-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal-400 block">Price</span>
            <div className="font-serif text-base font-bold text-charcoal">
              GHS {product.price.toLocaleString()}
              <span className="text-xs font-sans text-charcoal-500 font-normal ml-1">
                / {product.sellingUnit === 'pieces' ? 'piece' : 'yard'}
              </span>
            </div>
          </div>

          {product.stockQty > 0 ? (
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-full bg-charcoal text-ivory hover:bg-gold hover:text-white transition-colors shadow-sm active:scale-95"
              title={`Add ${product.minOrderQty} ${product.sellingUnit} to Bag`}
              aria-label="Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : product.sourcingEnabled ? (
            <Link
              to={`/sourcing?fabric=${encodeURIComponent(product.name)}`}
              className="text-[11px] font-semibold text-gold-700 hover:text-gold-800 underline underline-offset-2"
            >
              Request Sourcing
            </Link>
          ) : (
            <span className="text-[11px] text-charcoal-400 italic">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
};
