import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle, Compass } from 'lucide-react';
import { StoreService } from '../services/storeService';

export const Hero: React.FC = () => {
  const content = StoreService.getSiteContent();

  return (
    <section className="relative overflow-hidden bg-[#1E1D1A] text-ivory">
      {/* Subtle Warm Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-burgundy/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ========================================================
              LEFT COLUMN: Editorial Copy & Refined CTAs
              ======================================================== */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Tagline / Heritage Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold-300 text-xs tracking-wider uppercase font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>Weaving Heritage, Stitching Modernity</span>
            </div>

            {/* Clear Editorial Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              Authentic African Textiles <br className="hidden sm:inline" />
              <span className="text-gold-300 italic font-normal">Crafted for Your</span> Most Memorable Moments.
            </h1>

            {/* Concise Supporting Copy */}
            <p className="text-sm sm:text-base lg:text-lg text-ivory-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Discover authentic Bonwire handwoven Kente, certified Ghanaian wax prints, and couture bridal lace. Personally verified and delivered across Ghana.
            </p>


            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow transition-all active:scale-95"
              >
                <span>Explore Fabric Catalogue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                to="/stylematch"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-md bg-white/10 hover:bg-white/20 text-ivory border border-gold/40 font-semibold text-sm tracking-wide backdrop-blur-sm transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2 text-gold-300" />
                <span>Sika StyleMatch AI</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-charcoal-700/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs text-ivory-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>100% Genuine Provenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Certified Bolt Inspection</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1" />
                <span>Delivered Across All 16 Regions</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: High-Fashion Authentic Textile Visuals
              (No oversized logo — pure authentic textile photography)
              ======================================================== */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Main Authentic Kente Feature Frame */}
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl bg-charcoal-800 relative group">
                <img
                  src="/kente-weave.jpg"
                  alt="Authentic Ghanaian Handwoven Kente Weave"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = '/kente-rolls.jpg';
                  }}
                />
                
                {/* Subtle vignette for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-300 block mb-1">
                    Master Weaver Provenance
                  </span>
                  <p className="font-serif text-lg font-bold">
                    Super Royal Ashanti Kente Cloth
                  </p>
                  <p className="text-xs text-ivory-200 mt-0.5">
                    Double-weave geometric gold &amp; emerald heritage
                  </p>
                </div>
              </div>

              {/* Floating Overlapping Micro-Card: Wax Print & Sourcing Preview */}
              <div className="absolute -bottom-6 -left-6 sm:-left-8 bg-white text-charcoal p-3.5 sm:p-4 rounded-xl shadow-premium border border-ivory-300 flex items-center space-x-3 max-w-[260px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-500">
                <img
                  src="/ankara-wax.jpg"
                  alt="African Wax Print Sample"
                  className="w-12 h-12 rounded-lg object-cover border border-gold/30 flex-shrink-0"
                />
                <div className="text-left">
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-gold-800 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>In Stock in Accra</span>
                  </div>
                  <p className="font-serif font-bold text-xs text-charcoal line-clamp-1">
                    Authentic Cotton Wax Prints
                  </p>
                  <p className="text-[10px] text-charcoal-500">
                    6-yard bolts &bull; GTP Heritage
                  </p>
                </div>
              </div>

              {/* Floating Quality Pill */}
              <div className="absolute -top-4 -right-4 bg-charcoal/90 backdrop-blur-md text-gold-300 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gold/40 shadow-lg flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Bonwire &bull; Kumasi &bull; Accra</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
