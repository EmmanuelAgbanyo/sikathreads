import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { StoreService } from '../services/storeService';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const Collections: React.FC = () => {
  const collections = StoreService.getCollections().filter((c) => c.published);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Editorial Curations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Curated Fabric Collections
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600">
          Thematic textile collections woven for weddings, chieftaincy celebrations, and contemporary Ghanaian style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.map((col) => (
          <Link
            key={col.id}
            to={`/collections/${col.slug}`}
            className="group relative rounded-xl overflow-hidden bg-white border border-ivory-300 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col"
          >
            <div className="aspect-[16/11] overflow-hidden bg-ivory-100 relative">
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
                <h2 className="font-serif text-xl font-bold">{col.name}</h2>
                <span className="text-xs text-gold-300 mt-1 inline-block">
                  {col.productIds.length} Selected Fabrics
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-charcoal-600 leading-relaxed">{col.description}</p>
              <div className="text-xs font-semibold text-gold-700 group-hover:text-gold-800 flex items-center pt-2 border-t border-ivory-200">
                <span>View All In This Collection</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const CollectionDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const collection = StoreService.getCollections().find((c) => c.slug === slug);

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Collection Not Found</h2>
        <Link to="/collections" className="mt-4 inline-block px-6 py-2.5 bg-charcoal text-white rounded text-sm font-semibold">
          Return to Collections
        </Link>
      </div>
    );
  }

  const allProducts = StoreService.getPublishedProducts();
  const products = allProducts.filter((p) => collection.productIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-12">
      <Link to="/collections" className="text-xs text-charcoal-500 hover:text-gold flex items-center">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Collections
      </Link>

      <div className="relative rounded-2xl overflow-hidden bg-charcoal text-white p-8 sm:p-12 border border-gold/30">
        <div className="absolute inset-0 z-0">
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Sika Editorial Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">{collection.name}</h1>
          <p className="text-sm text-ivory-200 leading-relaxed font-light">{collection.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
