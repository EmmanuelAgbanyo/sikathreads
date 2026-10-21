import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { StoreService } from '../services/storeService';

export const Footer: React.FC = () => {
  const content = StoreService.getSiteContent();

  return (
    <footer className="bg-charcoal text-ivory-200 pt-16 pb-12 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-700">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Sika Threads Emblem"
                className="w-12 h-12 rounded-full border border-gold/40 object-cover"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-ivory block">
                  SIKA THREADS
                </span>
                <span className="text-xs uppercase tracking-widest text-gold font-medium block">
                  Weaving Heritage, Stitching Modernity.
                </span>
              </div>
            </div>
            <p className="text-sm text-ivory-300 leading-relaxed max-w-sm">
              Sika Threads brings Ghanaian textile heritage into dialogue with contemporary elegance. We curate genuine handwoven Bonwire Kente, certified GTP &amp; Woodin prints, couture bridal laces, and opulent brocades.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 text-xs text-gold-400 bg-charcoal-800 px-3 py-1.5 rounded-full border border-gold/20">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <span>Authentic Textiles &bull; Personal Stylist Service &bull; Delivery Across Ghana</span>
              </span>
            </div>
          </div>

          {/* Catalogue Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide">
              The Collection
            </h3>
            <ul className="space-y-2 text-sm text-ivory-300">
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors">
                  All Fabrics
                </Link>
              </li>
              <li>
                <Link to="/finder" className="text-gold hover:text-gold-300 font-medium transition-colors">
                  Smart Fabric Finder
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-gold transition-colors">
                  Compare Fabrics
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cat-kente" className="hover:text-gold transition-colors">
                  Authentic Kente Cloth
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cat-wax" className="hover:text-gold transition-colors">
                  African Wax Prints (GTP/Woodin)
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cat-lace" className="hover:text-gold transition-colors">
                  Luxury Beaded Bridal Lace
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-gold transition-colors">
                  Curated Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Services & Sika StyleMatch */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide">
              Bespoke Styling
            </h3>
            <ul className="space-y-2 text-sm text-ivory-300">
              <li>
                <Link to="/stylematch" className="text-gold hover:text-gold-300 font-medium transition-colors">
                  Sika StyleMatch AI
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-gold transition-colors">
                  Track Order Request
                </Link>
              </li>
              <li>
                <Link to="/sourcing" className="hover:text-gold transition-colors">
                  Fabric Sourcing Concierge
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors">
                  About Our Heritage
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-gold transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/delivery-policy" className="hover:text-gold transition-colors">
                  Delivery &amp; Collection Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-gold transition-colors">
                  Returns &amp; Cancellations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Concierge */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-ivory tracking-wide">
              Contact &amp; Concierge
            </h3>
            <div className="space-y-2.5 text-xs text-ivory-300">
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span>{content.contactInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <MessageCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={`https://wa.me/${content.contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold underline"
                >
                  WhatsApp Concierge
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`mailto:${content.contactInfo.email}`} className="hover:text-gold">
                  {content.contactInfo.email}
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                <span>{content.contactInfo.openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-400 space-y-4 sm:space-y-0">
          <div>
            <p>&copy; {new Date().getFullYear()} SIKA THREADS. All rights reserved. Prices in Ghana Cedis (GHS).</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gold transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/contact" className="hover:text-gold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
