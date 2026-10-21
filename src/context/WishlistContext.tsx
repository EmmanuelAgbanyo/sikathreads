import React, { createContext, useContext, useEffect, useState } from 'react';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'sika_wishlist_items';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error('Error saving wishlist:', err);
    }
  }, [wishlist]);

  const toggleWishlist = (productId: string): boolean => {
    const exists = wishlist.includes(productId);
    if (exists) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      return false;
    } else {
      setWishlist((prev) => [...prev, productId]);
      return true;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
