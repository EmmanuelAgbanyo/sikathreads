import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { StoreService } from '../services/storeService';
import { Product } from '../types';
import {
  Filter,
  X,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allProducts = StoreService.getPublishedProducts();
  const categories = StoreService.getCategories().filter((c) => c.active);

  // Read URL query params
  const categoryParam = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'featured';

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedColorFamily, setSelectedColorFamily] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedFabricType, setSelectedFabricType] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(4000);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Extract unique facets
  const colorFamilies = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.colourFamily) set.add(p.colourFamily);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  const occasions = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      p.suitableOccasions.forEach((occ) => set.add(occ));
    });
    return Array.from(set).sort();
  }, [allProducts]);

  const fabricTypes = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.fabricType) set.add(p.fabricType);
    });
    return Array.from(set).sort();
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesFabric = p.fabricType.toLowerCase().includes(q);
          const matchesColours = p.colours.some((c) => c.toLowerCase().includes(q));
          const matchesOccasions = p.suitableOccasions.some((occ) => occ.toLowerCase().includes(q));
          const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchesDesc = p.description.toLowerCase().includes(q);
          if (!matchesName && !matchesFabric && !matchesColours && !matchesOccasions && !matchesTags && !matchesDesc) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
          return false;
        }

        // Color Family
        if (selectedColorFamily !== 'all' && p.colourFamily !== selectedColorFamily) {
          return false;
        }

        // Occasion
        if (selectedOccasion !== 'all' && !p.suitableOccasions.includes(selectedOccasion)) {
          return false;
        }

        // Fabric Type
        if (selectedFabricType !== 'all' && p.fabricType !== selectedFabricType) {
          return false;
        }

        // Price
        if (p.price > priceRange) {
          return false;
        }

        // Availability
        if (selectedAvailability === 'in_stock' && p.stockQty <= 0) {
          return false;
        }
        if (selectedAvailability === 'limited' && (p.stockQty <= 0 || p.stockQty > p.lowStockThreshold)) {
          return false;
        }
        if (selectedAvailability === 'sourcing' && (!p.sourcingEnabled || p.stockQty > 0)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedColorFamily,
    selectedOccasion,
    selectedFabricType,
    priceRange,
    selectedAvailability,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedColorFamily('all');
    setSelectedOccasion('all');
    setSelectedFabricType('all');
    setSelectedAvailability('all');
    setPriceRange(4000);
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedColorFamily !== 'all' ||
    selectedOccasion !== 'all' ||
    selectedFabricType !== 'all' ||
    selectedAvailability !== 'all' ||
    priceRange < 4000 ||
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Page Header */}
      <div className="border-b border-ivory-300 pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-700 font-bold block mb-1">
              Curated Ghanaian Textiles
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Fabric Gallery &amp; Catalogue
            </h1>
            <p className="text-sm text-charcoal-500 mt-1 max-w-xl">
              Authentic Kente, GTP wax prints, French bridal lace, luxury brocade, and northern smock cloth.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search fabric or occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-ivory-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold w-48 sm:w-64"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden p-2 rounded-md bg-white border border-ivory-300 text-charcoal text-sm flex items-center space-x-1"
            >
              <Filter className="w-4 h-4 text-gold-600" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-ivory'
                : 'bg-white text-charcoal-600 hover:bg-ivory-200 border border-ivory-300'
            }`}
          >
            All Fabrics ({allProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-gold-700 text-white'
                  : 'bg-white text-charcoal-600 hover:bg-ivory-200 border border-ivory-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-lg border border-ivory-300 shadow-subtle h-fit sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
            <h2 className="font-serif text-lg font-bold text-charcoal flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-gold-600" />
              Refine Search
            </h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-burgundy hover:underline flex items-center"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </button>
            )}
          </div>

          {/* Occasion Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
              Occasion / Event
            </label>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="w-full text-xs bg-ivory-50 border border-ivory-300 rounded p-2 text-charcoal focus:ring-gold"
            >
              <option value="all">All Occasions</option>
              {occasions.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Fabric Type Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
              Fabric Type
            </label>
            <select
              value={selectedFabricType}
              onChange={(e) => setSelectedFabricType(e.target.value)}
              className="w-full text-xs bg-ivory-50 border border-ivory-300 rounded p-2 text-charcoal focus:ring-gold"
            >
              <option value="all">All Types</option>
              {fabricTypes.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>

          {/* Color Family Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
              Color Palette
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedColorFamily('all')}
                className={`px-2.5 py-1 text-[11px] rounded ${
                  selectedColorFamily === 'all'
                    ? 'bg-charcoal text-white'
                    : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                }`}
              >
                All
              </button>
              {colorFamilies.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColorFamily(col)}
                  className={`px-2.5 py-1 text-[11px] rounded ${
                    selectedColorFamily === col
                      ? 'bg-gold-700 text-white font-medium'
                      : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1">
              <span>Max Price</span>
              <span className="text-gold-700 font-bold">GHS {priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="4000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-gold-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
              <span>GHS 100</span>
              <span>GHS 4,000+</span>
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
              Availability
            </label>
            <div className="space-y-1.5 text-xs text-charcoal-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === 'all'}
                  onChange={() => setSelectedAvailability('all')}
                  className="accent-gold-600"
                />
                <span>All Listings</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === 'in_stock'}
                  onChange={() => setSelectedAvailability('in_stock')}
                  className="accent-gold-600"
                />
                <span>In Stock Now</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={selectedAvailability === 'limited'}
                  onChange={() => setSelectedAvailability('limited')}
                  className="accent-gold-600"
                />
                <span>Limited Stock</span>
              </label>
            </div>
          </div>

          {/* Sika StyleMatch Banner callout */}
          <div className="p-4 rounded-lg bg-gold-50 border border-gold-200 text-xs space-y-2">
            <div className="flex items-center text-gold-800 font-bold">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold-600" />
              Need Personal Guidance?
            </div>
            <p className="text-charcoal-600 leading-relaxed">
              Use Sika StyleMatch AI to match fabrics directly to your occasion, body drape, and budget.
            </p>
            <Link
              to="/stylematch"
              className="inline-flex items-center text-gold-800 font-semibold underline underline-offset-2 gap-1"
            >
              <span>Start StyleMatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar / Sort & Result Count */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-ivory-300 text-xs sm:text-sm">
            <span className="text-charcoal-600">
              Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'fabric' : 'fabrics'}
              {hasActiveFilters && ' (filtered)'}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-charcoal-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-ivory-50 border border-ivory-300 rounded px-2.5 py-1.5 text-xs text-charcoal font-medium focus:ring-gold"
              >
                <option value="featured">Featured / Curated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid of Product Cards */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-ivory-300 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal">
                No Fabrics Match Your Filter Selection
              </h3>
              <p className="text-sm text-charcoal-500 max-w-md mx-auto">
                Try widening your price range, choosing "All Occasions", or clearing your search term.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded bg-charcoal text-ivory text-xs font-semibold hover:bg-gold"
                >
                  Clear All Filters
                </button>
                <a
                  href="/sourcing"
                  className="px-4 py-2 rounded bg-gold-600 text-white text-xs font-semibold hover:bg-gold-500"
                >
                  Request Sourcing for This Fabric
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Modal Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
                <h3 className="font-serif font-bold text-lg text-charcoal">Filter Fabrics</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 pt-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-500 uppercase block mb-1">Occasion</label>
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="w-full text-xs p-2 border rounded"
                  >
                    <option value="all">All Occasions</option>
                    {occasions.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal-500 uppercase block mb-1">Color Palette</label>
                  <select
                    value={selectedColorFamily}
                    onChange={(e) => setSelectedColorFamily(e.target.value)}
                    className="w-full text-xs p-2 border rounded"
                  >
                    <option value="all">All Palettes</option>
                    {colorFamilies.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal-500 uppercase block mb-1">Fabric Type</label>
                  <select
                    value={selectedFabricType}
                    onChange={(e) => setSelectedFabricType(e.target.value)}
                    className="w-full text-xs p-2 border rounded"
                  >
                    <option value="all">All Fabric Types</option>
                    {fabricTypes.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-ivory-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 text-xs font-semibold bg-ivory-200 text-charcoal rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 text-xs font-semibold bg-charcoal text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
