import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sika_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart:', err);
    }
  }, [cart]);

  const addToCart = (product: Product, requestedQuantity?: number) => {
    const qty = requestedQuantity || product.minOrderQty || 1;

    if (product.stockQty <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + qty;

      if (newQty > product.stockQty) {
        return {
          success: false,
          message: `Cannot add more. Only ${product.stockQty} ${product.sellingUnit} available in stock.`,
        };
      }

      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        lineTotal: newQty * product.price,
      };
      setCart(updated);
      return { success: true, message: `Updated quantity for "${product.name}" in your bag.` };
    } else {
      if (qty > product.stockQty) {
        return {
          success: false,
          message: `Only ${product.stockQty} ${product.sellingUnit} available in stock.`,
        };
      }

      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity: qty,
        unit: product.sellingUnit,
        unitPrice: product.price,
        lineTotal: qty * product.price,
      };
      setCart((prev) => [...prev, newItem]);
      return { success: true, message: `Added ${qty} ${product.sellingUnit} of "${product.name}" to your bag.` };
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true, message: 'Item removed from bag.' };
    }

    const item = cart.find((i) => i.productId === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (newQuantity < item.product.minOrderQty) {
      return {
        success: false,
        message: `Minimum order for "${item.product.name}" is ${item.product.minOrderQty} ${item.product.sellingUnit}.`,
      };
    }

    if (newQuantity > item.product.stockQty) {
      return {
        success: false,
        message: `Only ${item.product.stockQty} ${item.product.sellingUnit} available in stock.`,
      };
    }

    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: newQuantity,
              lineTotal: newQuantity * i.unitPrice,
            }
          : i
      )
    );
    return { success: true, message: 'Bag updated.' };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
