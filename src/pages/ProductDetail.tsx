import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';
import { FabricCalculatorModal } from '../components/FabricCalculatorModal';
import { RestockModal } from '../components/RestockModal';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
  Scissors,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  MessageCircle,
  Layers,
  Bell,
  Clock,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = StoreService.getProductBySlug(slug || '');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  const { showToast } = useToast();
  const siteContent = StoreService.getSiteContent();
  const whatsappNum = siteContent.contactInfo.whatsapp.replace(/\D/g, '') || '233557718472';

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Fabric Not Found</h2>
        <p className="text-sm text-charcoal-500 mt-2">The fabric you requested does not exist or has been archived.</p>
        <Link to="/shop" className="mt-4 inline-block px-6 py-2.5 bg-charcoal text-white rounded text-sm font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [quantity, setQuantity] = useState<number>(product.minOrderQty || 1);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const isFavorited = isInWishlist(product.id);

  // Related products (same category or fabric type, excluding current)
  const relatedProducts = StoreService.getPublishedProducts()
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.fabricType === product.fabricType))
    .slice(0, 3);

  const handleIncrement = () => {
    const inc = product.qtyIncrement || 1;
    if (quantity + inc <= product.stockQty) {
      setQuantity(quantity + inc);
    }
  };

  const handleDecrement = () => {
    const inc = product.qtyIncrement || 1;
    if (quantity - inc >= product.minOrderQty) {
      setQuantity(quantity - inc);
    }
  };

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    if (res.success) {
      setAddedNotice(res.message);
      showToast(`Added ${quantity} ${product.sellingUnit} of "${product.name}" to your bag`, 'success');
      setTimeout(() => setAddedNotice(null), 4000);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    showToast(
      isFavorited
        ? `Removed "${product.name}" from your saved fabrics`
        : `Saved "${product.name}" to your wishlist`,
      'info'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-16">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-charcoal-500">
        <Link to="/shop" className="hover:text-gold flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Fabrics
        </Link>
        <span>/</span>
        <span className="text-charcoal-400">{product.categoryName || 'Catalogue'}</span>
        <span>/</span>
        <span className="text-charcoal-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Info & Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-white border border-ivory-300 shadow-premium relative">
            <img
              src={selectedImage || product.images[0] || '/kente-weave.jpg'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = '/kente-weave.jpg';
              }}
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md">
                <Sparkles className="w-3 h-3 mr-1" /> Curated Heritage
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-gold shadow-md' : 'border-ivory-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/kente-weave.jpg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Purchasing Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
                {product.fabricType}
              </span>
              {product.sku && (
                <span className="text-[11px] text-charcoal-400 font-mono">SKU: {product.sku}</span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
              {product.name}
            </h1>
          </div>

          {/* Price & Unit Display */}
          <div className="p-4 rounded-lg bg-ivory-100 border border-ivory-300 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-charcoal-500 block">Catalogue Price</span>
              <div className="font-serif text-3xl font-bold text-charcoal">
                GHS {product.price.toLocaleString()}
                <span className="text-sm font-sans font-normal text-charcoal-500 ml-1.5">
                  per {product.sellingUnit === 'pieces' ? 'piece (standard piece)' : 'yard'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-charcoal-500 block">Currency</span>
              <span className="text-sm font-bold text-charcoal">Ghana Cedi (GHS)</span>
            </div>
          </div>

          {/* Stock & Availability Indicator */}
          <div className="flex items-center space-x-3 text-xs">
            {product.stockQty > product.lowStockThreshold ? (
              <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                <Check className="w-3.5 h-3.5 mr-1" /> In Stock &bull; Available for Order Request
              </span>
            ) : product.stockQty > 0 ? (
              <span className="inline-flex items-center text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full font-medium border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Only {product.stockQty} {product.sellingUnit} remaining
              </span>
            ) : product.sourcingEnabled ? (
              <span className="inline-flex items-center text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full font-medium border border-amber-300">
                Available via Fabric Sourcing Concierge
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full font-medium border border-rose-200">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-charcoal-600 leading-relaxed border-t border-b border-ivory-200 py-4">
            <p>{product.description}</p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-ivory-200">
              <span className="text-charcoal-400 block font-medium">Palette / Colours</span>
              <span className="text-charcoal font-semibold mt-0.5 block">{product.colours.join(', ')}</span>
            </div>
            <div className="p-3 bg-white rounded border border-ivory-200">
              <span className="text-charcoal-400 block font-medium">Pattern Motif</span>
              <span className="text-charcoal font-semibold mt-0.5 block">{product.pattern}</span>
            </div>
            <div className="p-3 bg-white rounded border border-ivory-200">
              <span className="text-charcoal-400 block font-medium">Texture &amp; Drape</span>
              <span className="text-charcoal font-semibold mt-0.5 block">{product.texture || 'Medium Structured'}</span>
            </div>
            <div className="p-3 bg-white rounded border border-ivory-200">
              <span className="text-charcoal-400 block font-medium">Min. Order Quantity</span>
              <span className="text-charcoal font-semibold mt-0.5 block">
                {product.minOrderQty} {product.sellingUnit} (increments of {product.qtyIncrement})
              </span>
            </div>
          </div>

          {/* Purchasing Quantity & Actions */}
          {product.stockQty > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-charcoal-600 uppercase">Quantity:</span>
                <div className="flex items-center border border-ivory-300 rounded-md bg-white">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= product.minOrderQty}
                    className="px-3 py-2 text-charcoal hover:bg-ivory-100 disabled:opacity-30 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-charcoal min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stockQty}
                    className="px-3 py-2 text-charcoal hover:bg-ivory-100 disabled:opacity-30 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-charcoal-500">
                  Total: <strong>GHS {(product.price * quantity).toLocaleString()}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-xl bg-gold hover:bg-gold-light text-charcoal font-bold text-sm tracking-wide shadow transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag ({quantity} {product.sellingUnit})</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-4 rounded-xl border transition-colors ${
                    isFavorited
                      ? 'bg-burgundy text-white border-burgundy'
                      : 'bg-white text-charcoal border-ivory-300 hover:text-burgundy'
                  }`}
                  title={isFavorited ? 'Saved in Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Discovery Utilities Bar (Calculator + Compare + Restock Alert) */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-gold/10 border border-charcoal/15 text-charcoal rounded-xl text-xs font-semibold transition-colors"
                >
                  <Scissors className="w-3.5 h-3.5 text-gold" />
                  <span>Estimate Yardage</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isInCompare(product.id)) {
                      removeFromCompare(product.id);
                      showToast(`Removed "${product.name}" from comparison`, 'info');
                    } else {
                      addToCompare(product);
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-xs font-semibold transition-colors ${
                    isInCompare(product.id)
                      ? 'bg-gold text-charcoal border-gold font-bold'
                      : 'bg-white hover:bg-gold/10 border-charcoal/15 text-charcoal'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isInCompare(product.id) ? 'In Comparison' : 'Compare Fabric'}</span>
                </button>
              </div>

              {/* Low stock restock alert button */}
              {product.stockQty <= product.lowStockThreshold && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRestockOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-700" />
                    <span>Low Stock: Notify me when new bolts arrive</span>
                  </button>
                </div>
              )}

              {addedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
                  <span>{addedNotice}</span>
                  <Link to="/cart" className="inline-flex items-center font-bold underline ml-2 gap-1">
                    <span>View Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-ivory-100 rounded-2xl border border-ivory-300 space-y-3">
              <p className="text-xs text-charcoal-700 font-medium">
                This fabric is currently sold out. However, Sika Threads can source this fabric directly through our artisan weavers, or notify you when new stock arrives.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  to={`/sourcing?fabric=${encodeURIComponent(product.name)}`}
                  className="w-full py-2.5 rounded-xl bg-charcoal text-white hover:bg-gold hover:text-charcoal text-xs font-semibold text-center transition-colors shadow"
                >
                  Request Sourcing
                </Link>
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(true)}
                  className="w-full py-2.5 rounded-xl border border-charcoal/20 bg-white text-charcoal hover:bg-ivory text-xs font-semibold text-center transition-colors"
                >
                  Notify When Restocked
                </button>
              </div>
            </div>
          )}

          {/* Ordering Notice */}
          <div className="p-4 bg-white rounded-2xl border border-charcoal/10 shadow-sm text-xs text-charcoal-600 space-y-2">
            <div className="flex items-center font-bold text-charcoal">
              <ShieldCheck className="w-4 h-4 text-gold mr-1.5" />
              Verified Personal Fulfilment
            </div>
            <p className="leading-relaxed">
              Submit your request and our textile curators will inspect the fabric bolt, verify cutting specifications, and contact you directly to confirm delivery and collection arrangements.
            </p>
            <div className="pt-1 flex items-center space-x-4 text-emerald-800 font-semibold">
              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%20Sika%20Threads,%20I'm%20inquiring%20about%20${encodeURIComponent(
                  product.name
                )}%20(GHS%20${product.price}%20per%20${product.sellingUnit}).`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Inquire with Concierge via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Related Fabrics */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-charcoal/10 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Complementary &amp; Similar Fabrics
            </h2>
            <Link to="/shop" className="inline-flex items-center text-xs font-semibold text-gold hover:underline gap-1">
              <span>View All Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Fabrics */}
      {recentlyViewed.filter((p) => p.id !== product.id).length > 0 && (
        <section className="border-t border-charcoal/10 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                Recently Viewed by You
              </h2>
            </div>
            <span className="text-xs text-charcoal-muted">Auto-saved browsing session</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <FabricCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        product={product}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        product={product}
      />
    </div>
  );
};
