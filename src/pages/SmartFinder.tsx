import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useCompare } from '../context/CompareContext';
import { FabricCalculatorModal } from '../components/FabricCalculatorModal';
import {
  Sparkles,
  Filter,
  RefreshCw,
  Search,
  Layers,
  Send,
  Scissors,
  CheckCircle,
} from 'lucide-react';

export const SmartFinder: React.FC = () => {
  const allProducts = useMemo(() => StoreService.getPublishedProducts(), []);

  // Multi-criteria filter state
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedFabricType, setSelectedFabricType] = useState<string>('all');
  const [selectedColourFamily, setSelectedColourFamily] = useState<string>('all');
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  const [activeCalculatorProduct, setActiveCalculatorProduct] = useState<Product | undefined>(undefined);

  // Extract unique options from real catalogue
  const occasions = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => p.suitableOccasions.forEach((o) => set.add(o)));
    return Array.from(set);
  }, [allProducts]);

  const fabricTypes = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => set.add(p.fabricType));
    return Array.from(set);
  }, [allProducts]);

  const colourFamilies = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.colourFamily) set.add(p.colourFamily);
    });
    return Array.from(set);
  }, [allProducts]);

  const patterns = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.pattern) set.add(p.pattern);
    });
    return Array.from(set);
  }, [allProducts]);

  // Filter products strictly based on selected criteria
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (selectedOccasion !== 'all' && !product.suitableOccasions.includes(selectedOccasion)) {
        return false;
      }
      if (selectedFabricType !== 'all' && product.fabricType !== selectedFabricType) {
        return false;
      }
      if (selectedColourFamily !== 'all' && product.colourFamily !== selectedColourFamily) {
        return false;
      }
      if (selectedPattern !== 'all' && product.pattern !== selectedPattern) {
        return false;
      }
      if (selectedBudget !== 'all') {
        if (selectedBudget === 'under100' && product.price >= 100) return false;
        if (selectedBudget === '100to300' && (product.price < 100 || product.price > 300)) return false;
        if (selectedBudget === 'above300' && product.price <= 300) return false;
      }
      if (selectedAvailability !== 'all') {
        if (selectedAvailability === 'instock' && product.stockQty <= product.lowStockThreshold) return false;
        if (selectedAvailability === 'limited' && (product.stockQty === 0 || product.stockQty > product.lowStockThreshold)) return false;
        if (selectedAvailability === 'sourcing' && !product.sourcingEnabled) return false;
      }
      return true;
    });
  }, [
    allProducts,
    selectedOccasion,
    selectedFabricType,
    selectedColourFamily,
    selectedPattern,
    selectedBudget,
    selectedAvailability,
  ]);

  const handleResetFilters = () => {
    setSelectedOccasion('all');
    setSelectedFabricType('all');
    setSelectedColourFamily('all');
    setSelectedPattern('all');
    setSelectedBudget('all');
    setSelectedAvailability('all');
  };

  const hasActiveFilters =
    selectedOccasion !== 'all' ||
    selectedFabricType !== 'all' ||
    selectedColourFamily !== 'all' ||
    selectedPattern !== 'all' ||
    selectedBudget !== 'all' ||
    selectedAvailability !== 'all';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Discovery Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
          Smart Fabric Finder
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-2">
          Filter authentic Ghanaian textiles by event occasion, material weave, royal color family, and price to find the exact cloth for your bespoke celebration.
        </p>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal/10">
          <div className="flex items-center gap-2 font-semibold text-charcoal text-sm">
            <Filter className="w-4 h-4 text-gold" />
            <span>Refine by Textile Criteria</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-burgundy transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* 1. Occasion */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              1. Occasion
            </label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Occasions</option>
              {occasions.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Fabric Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              2. Fabric Weave
            </label>
            <select
              value={selectedFabricType}
              onChange={(e) => setSelectedFabricType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Fabric Weaves</option>
              {fabricTypes.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Colour Family */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              3. Colour Family
            </label>
            <select
              value={selectedColourFamily}
              onChange={(e) => setSelectedColourFamily(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Colour Families</option>
              {colourFamilies.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Pattern */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              4. Pattern Motif
            </label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Pattern Motifs</option>
              {patterns.map((pat) => (
                <option key={pat} value={pat}>
                  {pat}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Budget */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              5. Price Range
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Price Ranges</option>
              <option value="under100">Under GHS 100 / unit</option>
              <option value="100to300">GHS 100 – GHS 300 / unit</option>
              <option value="above300">Above GHS 300 / unit</option>
            </select>
          </div>

          {/* 6. Availability */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-1.5">
              6. Availability Status
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-charcoal/20 rounded-xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold bg-ivory/30"
            >
              <option value="all">All Availability</option>
              <option value="instock">In Stock Now</option>
              <option value="limited">Limited Reserve</option>
              <option value="sourcing">Sourcing Eligible</option>
            </select>
          </div>
        </div>

        {/* Results summary pill */}
        <div className="mt-4 pt-4 border-t border-charcoal/10 flex items-center justify-between text-xs text-charcoal-muted">
          <span>
            Found <strong className="text-charcoal">{filteredProducts.length}</strong> matching textile{filteredProducts.length === 1 ? '' : 's'} in catalogue.
          </span>
          <span className="text-[11px] text-charcoal-light">
            All prices in Ghana Cedis (GHS). Hand-verified inventory.
          </span>
        </div>
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group flex flex-col">
              <ProductCard product={product} />
              {/* Quick Calculator Action Overlay on Card */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCalculatorProduct(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-ivory hover:bg-gold/15 text-charcoal hover:text-gold border border-charcoal/10 rounded-lg text-xs font-medium transition-colors"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Estimate Yards</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-charcoal">
            No Exact Catalogue Match Found
          </h3>
          <p className="text-xs text-charcoal-muted">
            We don't currently have a fabric matching all of your exact filters simultaneously, but our procurement team can source it for you through our bespoke service.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="w-full sm:w-auto px-5 py-2.5 border border-charcoal/20 text-charcoal text-xs font-semibold rounded-xl hover:bg-ivory transition-colors"
            >
              Reset Filters
            </button>
            <Link
              to="/sourcing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold rounded-xl shadow transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Request Bespoke Fabric Sourcing</span>
            </Link>
          </div>
        </div>
      )}

      {/* StyleMatch AI Callout */}
      <div className="mt-12 bg-gradient-to-r from-charcoal to-charcoal-light rounded-2xl p-6 sm:p-8 text-ivory flex flex-col md:flex-row items-center justify-between gap-6 border border-gold/30">
        <div>
          <span className="text-gold text-xs font-bold uppercase tracking-wider">Need Personal Styling?</span>
          <h3 className="text-xl font-serif font-bold text-white mt-1">
            Let Sika StyleMatch AI Match Your Outfit
          </h3>
          <p className="text-xs text-ivory-muted mt-1 max-w-xl">
            Answer a few quick questions regarding your upcoming event date, theme, and preferred drape. You will receive 3 tailored recommendations approved by our Ghanaian textile curators within 3–5 minutes.
          </p>
        </div>
        <Link
          to="/stylematch"
          className="px-6 py-3 bg-gold hover:bg-gold-light text-charcoal text-xs font-bold rounded-xl shadow-lg transition-all flex-shrink-0"
        >
          Launch StyleMatch AI
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
