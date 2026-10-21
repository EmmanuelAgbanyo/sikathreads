import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { StoreService } from '../services/storeService';
import {
  Sparkles,
  ArrowRight,
  Search,
  Truck,
  ShieldCheck,
  CheckCircle,
  Scissors,
  HelpCircle,
} from 'lucide-react';

export const Home: React.FC = () => {
  const categories = StoreService.getCategories().filter((c) => c.active);
  const products = StoreService.getPublishedProducts();
  const collections = StoreService.getCollections().filter((c) => c.published);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
              Curated Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Explore by Fabric Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-charcoal hover:text-gold transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group relative rounded-xl overflow-hidden bg-white border border-ivory-300 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col text-center"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ivory-100 relative">
                <img
                  src={cat.image || '/kente-weave.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/kente-weave.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-3.5 bg-white flex-1 flex flex-col justify-center">
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal group-hover:text-gold-700 transition-colors line-clamp-2">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Catalogue Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
              Curated Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Featured Fabrics
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-charcoal hover:text-gold transition-colors"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Curated Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-2">
            Editorial Curation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Signature Collections
          </h2>
          <p className="mt-2 text-sm text-charcoal-500">
            Hand-selected textile narratives designed for Ghana's most memorable celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/collections/${col.slug}`}
              className="group relative rounded-xl overflow-hidden bg-white border border-ivory-300 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-ivory-100 relative">
                <img
                  src={col.image || '/textile-stack.jpg'}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/textile-stack.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-xl font-bold">{col.name}</h3>
                  <span className="text-xs text-gold-300 mt-1 inline-block">
                    {col.productIds.length} Curated Fabrics
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-charcoal-600 line-clamp-2">{col.description}</p>
                <div className="mt-3 text-xs font-semibold text-gold-700 group-hover:text-gold-800 flex items-center">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Sika StyleMatch AI Feature Banner (Art-directed luxury, no oversized logo) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E1D1A] via-[#2A2421] to-[#38161D] text-ivory p-8 sm:p-12 lg:p-16 border-2 border-gold/30 shadow-premium">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>Personalised Styling Concierge</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sika StyleMatch AI
            </h2>

            <p className="text-base sm:text-lg text-ivory-200 leading-relaxed font-light">
              Describe your occasion, event theme, color palette, and budget. Our intelligent matching system pairs your vision exclusively with authentic fabrics verified in our Ghanaian stock.
            </p>

            <div className="p-4 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm text-xs sm:text-sm text-ivory-300 space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Every recommendation is an authentic, in-stock fabric in our Ghanaian inventory</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Personally reviewed and verified by our stylists within 3–5 minutes</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Link
                to="/stylematch"
                className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Find Your Fabric Match</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-4 rounded-md bg-white/10 hover:bg-white/20 text-ivory border border-white/20 font-semibold text-sm transition-all"
              >
                <span>How StyleMatch Works</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Fabric Sourcing Concierge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ivory-200/70 rounded-2xl p-8 sm:p-12 border border-ivory-300 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy block">
              Bespoke Procurement
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Can't Find Your Exact Fabric in the Store?
            </h2>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              If a specific Kente pattern, rare GTP vintage design, or bespoke bridal lace is not currently in stock, our sourcing specialists collaborate directly with master weavers in Kumasi, Tamale, and Accra to procure it for you.
            </p>
            <div className="flex items-center space-x-6 text-xs text-charcoal-500 pt-2">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-gold mr-1" /> Transparent Estimates
              </span>
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-gold mr-1" /> Weaver Direct Sourcing
              </span>
            </div>
          </div>
          <Link
            to="/sourcing"
            className="px-8 py-4 rounded-md bg-charcoal hover:bg-gold text-white font-semibold text-sm tracking-wide shadow-md transition-colors whitespace-nowrap"
          >
            Request a Fabric
          </Link>
        </div>
      </section>

      {/* 7. Customer Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-ivory-300 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            The Sika Threads Promise
          </h2>
          <p className="text-sm text-charcoal-500 mt-2">
            Every fabric in our store represents authentic craftsmanship, verified stock, and personal customer care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="p-6 bg-white rounded-lg border border-ivory-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto sm:mx-0">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Genuine Craftsmanship</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Direct provenance from Bonwire weavers and certified Ghanaian textile manufacturers. No synthetic imitations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-ivory-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto sm:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Personal Verification</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We inspect the physical fabric bolt, check measurements, and coordinate delivery with you directly before completing your order.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-ivory-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto sm:mx-0">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Nationwide Delivery</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Coordinated dispatch across Greater Accra, Ashanti, Western, Eastern, and Northern regions or direct arranged collection.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-ivory-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 mx-auto sm:mx-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Dedicated Concierge</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Prompt assistance with fabric measurements, matching headties, and bespoke yardage calculations via WhatsApp or phone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
