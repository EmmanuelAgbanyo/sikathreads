import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Scissors, Compass, HeartHandshake, ArrowRight } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Editorial Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-charcoal text-ivory p-8 sm:p-14 border border-gold/40 shadow-premium">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Weaving Heritage, Stitching Modernity.</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              The Sika Threads Narrative
            </h1>
            <p className="text-base sm:text-lg text-ivory-200 leading-relaxed font-light">
              Rooted in the ancient weaving traditions of Ghana and attuned to the refined silhouettes of modern couture, Sika Threads exists to connect you with fabrics that carry prestige, authenticity, and enduring beauty.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-xl border border-ivory-300 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
              <Scissors className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal">Weaving Heritage</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Ghana’s textile traditions — from the royal strip-weaving of Bonwire and Adanwomase to indigenous Northern cotton smocks — are more than cloth. Each warp and weft encodes proverbs, social standing, and sacred history. We honor this legacy by sourcing directly from vetted artisans.
            </p>
          </div>

          <div className="p-8 bg-white rounded-xl border border-ivory-300 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal">Stitching Modernity</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              African fashion is evolving dynamically across Accra, London, New York, and beyond. We supply the contemporary fabrics — structured Duchess satins, French bridal laces, and modern Woodin prints — that bring bespoke evening wear, bridal gowns, and sharp suits to life.
            </p>
          </div>

          <div className="p-8 bg-white rounded-xl border border-ivory-300 shadow-subtle space-y-4">
            <div className="w-12 h-12 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-charcoal">Intelligent Guidance</h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              With Sika StyleMatch AI, we merge technology with human textile expertise. We never leave fabric recommendations to chance or generic algorithms — every match is grounded in genuine warehouse stock and confirmed by our stylists.
            </p>
          </div>
        </div>
      </section>

      {/* Sourcing and Customer Care */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ivory-100 rounded-2xl p-8 sm:p-12 border border-ivory-300 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-burgundy">
              Personalized Concierge
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              A Personal Approach to Fabric Shopping
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Every piece of cloth we supply is handled with care. Because authentic textiles are cut to precision yardage and dye lots vary across handwoven pieces, our concierge team verifies the physical roll condition and delivery details directly with you before completing your purchase.
            </p>
            <div className="pt-2 flex items-center space-x-4 text-xs font-semibold">
              <Link to="/stylematch" className="text-gold-800 hover:text-gold-900 flex items-center">
                <span>Try Sika StyleMatch</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link to="/contact" className="text-charcoal hover:text-gold flex items-center">
                <span>Contact Concierge</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 p-6 bg-white rounded-xl border border-ivory-200 text-xs text-charcoal-700">
            <div className="flex items-center space-x-2 font-bold text-charcoal">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>Authenticity Standards</span>
            </div>
            <ul className="space-y-2 list-disc pl-4 text-charcoal-600">
              <li>100% genuine Ghanaian Textile Printing (GTP) and certified Woodin fabrics.</li>
              <li>Bonwire double-weave Kente personally inspected for thread density.</li>
              <li>Transparent price disclosures in Ghana Cedis (GHS).</li>
              <li>Ethical sourcing directly supporting Ghanaian weavers and small textile mills.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
