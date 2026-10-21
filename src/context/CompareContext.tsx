import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';

interface CompareContextType {
  comparedProducts: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = 'sika_compare_products';
const MAX_COMPARE_ITEMS = 3;

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
    } catch (e) {
      console.error('Failed to save comparison products', e);
    }
  }, [comparedProducts]);

  const isInCompare = (productId: string): boolean => {
    return comparedProducts.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product): boolean => {
    if (isInCompare(product.id)) {
      addToast(`"${product.name}" is already in your comparison tray.`, 'info');
      return true;
    }

    if (comparedProducts.length >= MAX_COMPARE_ITEMS) {
      addToast(
        `Comparison limit reached (max ${MAX_COMPARE_ITEMS} fabrics). Remove an item before adding another.`,
        'warning'
      );
      return false;
    }

    setComparedProducts((prev) => [...prev, product]);
    addToast(`Added "${product.name}" to comparison.`, 'success');
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
