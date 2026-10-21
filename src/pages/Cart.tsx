import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Trash2, ArrowRight, ShieldCheck, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleClearCart = () => {
    clearCart();
    showToast('Your shopping bag has been cleared', 'info');
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    showToast(`Removed "${productName}" from your bag`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="border-b border-ivory-300 pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
            Review Selection
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Your Shopping Bag</h1>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs text-burgundy hover:underline flex items-center"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Bag
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg border border-ivory-300 p-16 text-center space-y-4 max-w-xl mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-ivory-100 flex items-center justify-center text-charcoal-400 mx-auto">
            <ShoppingBag className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Your Bag is Empty</h2>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            Discover our authentic Ghanaian Kente, African wax prints, and couture bridal fabrics.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm transition-colors shadow-md"
            >
              <span>Explore Fabrics</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const isLowStock = item.product.stockQty <= item.product.lowStockThreshold;
              const isExceedingStock = item.quantity > item.product.stockQty;

              return (
                <div
                  key={item.productId}
                  className="bg-white rounded-lg border border-ivory-300 p-4 sm:p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=200&q=80'}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-md object-cover border border-ivory-200 flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                        {item.product.fabricType}
                      </span>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-base font-bold text-charcoal hover:text-gold block"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs text-charcoal-500 block mt-0.5">
                        GHS {item.unitPrice.toLocaleString()} / {item.unit}
                      </span>

                      {/* Stock warnings */}
                      {isExceedingStock ? (
                        <span className="text-xs text-rose-600 font-semibold flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" /> Only {item.product.stockQty} {item.unit} available!
                        </span>
                      ) : isLowStock ? (
                        <span className="text-xs text-amber-700 font-medium flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 mr-1" /> Only {item.product.stockQty} {item.unit} remaining
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center border border-ivory-300 rounded bg-ivory-50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - (item.product.qtyIncrement || 1))}
                        disabled={item.quantity <= item.product.minOrderQty}
                        className="px-2.5 py-1 text-charcoal hover:bg-ivory-200 font-bold disabled:opacity-30 text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-charcoal min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + (item.product.qtyIncrement || 1))}
                        disabled={item.quantity >= item.product.stockQty}
                        className="px-2.5 py-1 text-charcoal hover:bg-ivory-200 font-bold disabled:opacity-30 text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[5.5rem]">
                      <span className="text-xs text-charcoal-400 block sm:hidden">Total</span>
                      <span className="font-serif font-bold text-base text-charcoal">
                        GHS {item.lineTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId, item.product.name)}
                      className="text-charcoal-400 hover:text-burgundy p-1.5 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center text-xs font-semibold text-charcoal hover:text-gold"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Continue Browsing Catalogue
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-ivory-300 p-6 shadow-subtle space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-charcoal pb-3 border-b border-ivory-200">
              Order Request Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal-600">
                <span>Total Items</span>
                <span className="font-semibold">{itemCount} items</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Proposed Subtotal</span>
                <span className="font-serif font-bold text-charcoal">GHS {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Estimated Delivery</span>
                <span className="text-xs text-charcoal-500 italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-ivory-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-charcoal">Proposed Total</span>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-gold-700">
                    GHS {subtotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-charcoal-400 block">Excl. regional delivery</span>
                </div>
              </div>
            </div>

            {/* Confirmation notice */}
            <div className="p-3.5 rounded bg-ivory-100 border border-ivory-300 text-xs text-charcoal-600 space-y-1.5">
              <div className="flex items-center font-bold text-charcoal">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-600 mr-1.5" />
                Personal Confirmation &amp; Inspection
              </div>
              <p className="leading-relaxed text-[11px]">
                No payment is taken today. Once submitted, our Accra team inspects your fabric and contacts you directly to confirm cutting, delivery, and payment arrangements.
              </p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
