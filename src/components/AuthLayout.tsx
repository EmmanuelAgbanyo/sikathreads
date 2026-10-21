import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, CheckCircle2, Phone, MessageSquare } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  footerPrompt?: {
    text: string;
    actionText: string;
    actionLink: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  badgeText,
  footerPrompt,
}) => {
  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center">
      <div className="w-full max-w-6xl mx-auto my-auto lg:my-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-premium border border-charcoal/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          {/* =========================================================
              LEFT PANEL: Editorial Heritage & Artisanship (Desktop)
              ========================================================= */}
          <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 text-white overflow-hidden bg-charcoal">
            {/* Background Image with Authentic Ghanaian Kente Weave */}
            <img
              src="/kente-weave.jpg"
              alt="Authentic Ghanaian Kente Weaving"
              className="absolute inset-0 w-full h-full object-cover opacity-35 transform scale-105 hover:scale-110 transition-transform duration-1000"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-charcoal/40" />

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-4">
              <Link to="/" className="inline-flex items-center space-x-3 group">
                <img
                  src="/logo.png"
                  alt="Sika Threads Logo"
                  className="w-12 h-12 rounded-full border-2 border-gold/60 shadow-md object-cover group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold tracking-wider text-white group-hover:text-gold transition-colors">
                    SIKA THREADS
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-gold-300 font-medium">
                    Weaving Heritage, Stitching Modernity.
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Editorial Highlight */}
            <div className="relative z-10 my-auto py-8 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-900/60 border border-gold-400/40 text-gold-200 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="tracking-wide">Ghanaian Luxury Textile House</span>
              </div>

              <blockquote className="space-y-3">
                <p className="font-serif text-xl xl:text-2xl font-normal leading-relaxed text-ivory-100 italic">
                  “Every warp and weft preserves generations of Ghanaian royalty, translated with modern refinement for discerning celebrations.”
                </p>
                <footer className="text-xs uppercase tracking-widest text-gold-400 font-medium">
                  — The Sika Master Weavers Atelier
                </footer>
              </blockquote>

              <div className="pt-2 space-y-2.5 text-xs text-ivory-200/90 border-t border-white/10">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Direct weaver provenance from Bonwire, Daboya & Volta</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Transparent order verification without forced online payment</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Doorstep delivery across Greater Accra, Kumasi & all 16 regions</span>
                </div>
              </div>
            </div>

            {/* Bottom Support & Security Note */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-ivory-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>256-Bit SSL Encrypted Access</span>
              </span>
              <a
                href="https://wa.me/233557718472"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold transition-colors flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3 text-gold" />
                <span>Support: 055 771 8472</span>
              </a>
            </div>
          </div>

          {/* =========================================================
              RIGHT PANEL: Form Container (Desktop & Mobile)
              ========================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 xl:p-12 bg-white">
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex items-center justify-between pb-6 border-b border-charcoal/10 mb-6">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/logo.png"
                  alt="Sika Threads"
                  className="w-10 h-10 rounded-full border border-gold/40 object-cover"
                />
                <div>
                  <span className="font-serif text-base font-bold text-charcoal block">SIKA THREADS</span>
                  <span className="text-[9px] uppercase tracking-wider text-gold-700">
                    Weaving Heritage, Stitching Modernity.
                  </span>
                </div>
              </Link>
              <Link
                to="/"
                className="text-xs font-semibold text-charcoal-500 hover:text-charcoal px-3 py-1.5 rounded-lg bg-ivory border border-charcoal/10"
              >
                Storefront
              </Link>
            </div>

            {/* Content Area */}
            <div className="max-w-md w-full mx-auto space-y-6 my-auto">
              <div className="space-y-2">
                {badgeText && (
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-50 text-gold-800 border border-gold-200">
                    {badgeText}
                  </span>
                )}
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Form injection */}
              {children}

              {/* Footer Switch Prompt */}
              {footerPrompt && (
                <div className="pt-4 border-t border-charcoal/10 text-center text-xs text-charcoal-600">
                  <span>{footerPrompt.text} </span>
                  <Link
                    to={footerPrompt.actionLink}
                    className="font-bold text-gold-800 hover:text-gold-900 hover:underline transition-colors"
                  >
                    {footerPrompt.actionText}
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Accessibility / Helpline */}
            <div className="pt-6 mt-6 border-t border-charcoal/5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-charcoal-400">
              <div className="flex items-center gap-3">
                <Link to="/terms" className="hover:text-charcoal hover:underline transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy-policy" className="hover:text-charcoal hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-charcoal-500">
                <Phone className="w-3 h-3 text-gold-700" />
                <span>Concierge Desk: </span>
                <a href="tel:+233557718472" className="font-semibold text-charcoal hover:underline">
                  055 771 8472
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
