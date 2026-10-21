import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  LogOut,
  Sliders,
  ChevronDown,
  ChevronRight,
  Compass,
  MessageCircle,
  Home,
  HelpCircle,
  Truck,
  Phone,
  RotateCcw,
  Layers,
  ArrowRight,
  Info,
  FileText,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { StoreService } from '../services/storeService';

export const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin, logout, setAdminRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = StoreService.getCategories().filter((c) => c.active);

  // Close all menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setShopDropdownOpen(false);
    setMoreDropdownOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close all overlays & dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setShopDropdownOpen(false);
        setMoreDropdownOpen(false);
        setUserDropdownOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setDrawerOpen(false);
      setSearchQuery('');
    }
  };

  // Active route helpers
  const isHomeActive = location.pathname === '/';
  const isShopActive = location.pathname === '/shop' || location.pathname.startsWith('/product/');
  const isStyleMatchActive = location.pathname === '/stylematch';
  const isCollectionsActive = location.pathname.startsWith('/collections');
  const isAboutActive = location.pathname === '/about';
  const isMoreActive = [
    '/sourcing',
    '/contact',
    '/faqs',
    '/delivery-policy',
    '/returns-policy',
    '/privacy-policy',
    '/terms',
  ].includes(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ivory-300 shadow-subtle transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* ========================================================
                1. LEFT: Brand Logo & Wordmark
                ======================================================== */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Sika Threads Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-gold/40 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-charcoal group-hover:text-gold transition-colors leading-tight">
                    SIKA THREADS
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-gold-700 font-medium hidden sm:block">
                    Weaving Heritage, Stitching Modernity.
                  </span>
                </div>
              </Link>
            </div>

            {/* ========================================================
                2. CENTER: Clean, World-Class Primary Navigation
                ======================================================== */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-sm font-medium">
              {/* Home Link */}
              <Link
                to="/"
                className={`px-3 py-2 rounded-md transition-all flex items-center space-x-1.5 ${
                  isHomeActive
                    ? 'text-gold-800 font-bold bg-gold-50/70 border border-gold-200'
                    : 'text-charcoal-700 hover:text-gold-700 hover:bg-ivory-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {/* Shop Fabrics (with dropdown) */}
              <div
                ref={shopDropdownRef}
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                  className={`px-3 py-2 rounded-md transition-all flex items-center space-x-1 ${
                    isShopActive
                      ? 'text-gold-800 font-bold bg-gold-50/70 border border-gold-200'
                      : 'text-charcoal-700 hover:text-gold-700 hover:bg-ivory-100'
                  }`}
                  aria-expanded={shopDropdownOpen}
                >
                  <span>Shop Fabrics</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      shopDropdownOpen ? 'rotate-180 text-gold' : 'text-charcoal-400'
                    }`}
                  />
                </button>

                {/* Shop Dropdown Menu */}
                {shopDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-premium border border-ivory-300 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 pb-2 mb-2 border-b border-ivory-200 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700">
                        Fabric Catalogue
                      </span>
                      <Link
                        to="/shop"
                        className="inline-flex items-center text-[11px] font-bold text-gold-700 hover:underline gap-0.5"
                        onClick={() => setShopDropdownOpen(false)}
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-0.5 px-2">
                      <Link
                        to="/shop"
                        onClick={() => setShopDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-charcoal hover:bg-ivory-100 rounded-lg transition-colors"
                      >
                        <span className="flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-2 text-gold-600" />
                          All Fabrics &amp; Prints
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                      </Link>

                      <Link
                        to="/finder"
                        onClick={() => setShopDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-charcoal hover:bg-ivory-100 rounded-lg transition-colors"
                      >
                        <span className="flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-2 text-gold-600" />
                          Smart Fabric Finder
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gold/15 text-gold rounded">New</span>
                      </Link>

                      <Link
                        to="/compare"
                        onClick={() => setShopDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-charcoal hover:bg-ivory-100 rounded-lg transition-colors"
                      >
                        <span className="flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-2 text-charcoal-400" />
                          Compare Fabrics Side-by-Side
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                      </Link>

                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${cat.id}`}
                          onClick={() => setShopDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-xs text-charcoal-700 hover:text-gold hover:bg-ivory-50 rounded-lg transition-colors"
                        >
                          <span>{cat.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* StyleMatch Link */}
              <Link
                to="/stylematch"
                className={`px-3 py-2 rounded-md transition-all flex items-center space-x-1.5 ${
                  isStyleMatchActive
                    ? 'text-gold-800 font-bold bg-gold-50/70 border border-gold-200'
                    : 'text-charcoal-700 hover:text-gold-700 hover:bg-ivory-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>StyleMatch</span>
              </Link>

              {/* About Us Link */}
              <Link
                to="/about"
                className={`px-3 py-2 rounded-md transition-all ${
                  isAboutActive
                    ? 'text-gold-800 font-bold bg-gold-50/70 border border-gold-200'
                    : 'text-charcoal-700 hover:text-gold-700 hover:bg-ivory-100'
                }`}
              >
                About
              </Link>

              {/* More ▼ Dropdown for Secondary Pages & Support */}
              <div
                ref={moreDropdownRef}
                className="relative"
                onMouseEnter={() => setMoreDropdownOpen(true)}
                onMouseLeave={() => setMoreDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-2 rounded-md transition-all flex items-center space-x-1 ${
                    isMoreActive || isCollectionsActive
                      ? 'text-gold-800 font-bold bg-gold-50/70 border border-gold-200'
                      : 'text-charcoal-700 hover:text-gold-700 hover:bg-ivory-100'
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreDropdownOpen ? 'rotate-180 text-gold' : 'text-charcoal-400'
                    }`}
                  />
                </button>

                {/* More Dropdown Menu (Organised into 2 logical sections) */}
                {moreDropdownOpen && (
                  <div className="absolute right-0 lg:left-0 mt-1 w-80 bg-white rounded-xl shadow-premium border border-ivory-300 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Section 1: Concierge & Curated Stories */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block mb-2 px-2">
                          Curations &amp; Concierge
                        </span>
                        <div className="space-y-1">
                          <Link
                            to="/collections"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-start p-2 rounded-lg hover:bg-ivory-100 transition-colors group"
                          >
                            <Layers className="w-4 h-4 text-gold-600 mt-0.5 mr-2.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-charcoal group-hover:text-gold-700 block">
                                Curated Collections
                              </span>
                              <span className="text-[11px] text-charcoal-500 block leading-tight">
                                Bridal, Golden Heritage &amp; Pan-African print narratives.
                              </span>
                            </div>
                          </Link>

                          <Link
                            to="/sourcing"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-start p-2 rounded-lg hover:bg-ivory-100 transition-colors group"
                          >
                            <Compass className="w-4 h-4 text-gold-600 mt-0.5 mr-2.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-charcoal group-hover:text-gold-700 block">
                                Fabric Sourcing Concierge
                              </span>
                              <span className="text-[11px] text-charcoal-500 block leading-tight">
                                Can&apos;t find a fabric? Our weavers procure it directly.
                              </span>
                            </div>
                          </Link>

                          <Link
                            to="/contact"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-start p-2 rounded-lg hover:bg-ivory-100 transition-colors group"
                          >
                            <Phone className="w-4 h-4 text-gold-600 mt-0.5 mr-2.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-charcoal group-hover:text-gold-700 block">
                                Contact Concierge
                              </span>
                              <span className="text-[11px] text-charcoal-500 block leading-tight">
                                WhatsApp stylist consultations &amp; customer care.
                              </span>
                            </div>
                          </Link>

                          <Link
                            to="/track-order"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-start p-2 rounded-lg hover:bg-ivory-100 transition-colors group"
                          >
                            <Truck className="w-4 h-4 text-gold-600 mt-0.5 mr-2.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-charcoal group-hover:text-gold-700 block">
                                Track Order Request
                              </span>
                              <span className="text-[11px] text-charcoal-500 block leading-tight">
                                Real-time verification &amp; delivery progress lookup.
                              </span>
                            </div>
                          </Link>

                          <Link
                            to="/faqs"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-start p-2 rounded-lg hover:bg-ivory-100 transition-colors group"
                          >
                            <HelpCircle className="w-4 h-4 text-gold-600 mt-0.5 mr-2.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-charcoal group-hover:text-gold-700 block">
                                Frequently Asked Questions
                              </span>
                              <span className="text-[11px] text-charcoal-500 block leading-tight">
                                Order requests, fabric care &amp; bespoke cuts.
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Section 2: Policies & Assurances */}
                      <div className="pt-3 border-t border-ivory-200">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block mb-2 px-2">
                          Delivery &amp; Policies
                        </span>
                        <div className="space-y-1">
                          <Link
                            to="/delivery-policy"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-ivory-100 text-xs text-charcoal-700 hover:text-gold-700 transition-colors"
                          >
                            <span className="flex items-center">
                              <Truck className="w-3.5 h-3.5 mr-2 text-charcoal-400" />
                              Delivery &amp; Pickup Policy
                            </span>
                            <ChevronRight className="w-3 h-3 text-charcoal-300" />
                          </Link>

                          <Link
                            to="/returns-policy"
                            onClick={() => setMoreDropdownOpen(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-ivory-100 text-xs text-charcoal-700 hover:text-gold-700 transition-colors"
                          >
                            <span className="flex items-center">
                              <RotateCcw className="w-3.5 h-3.5 mr-2 text-charcoal-400" />
                              Returns &amp; Quality Guarantee
                            </span>
                            <ChevronRight className="w-3 h-3 text-charcoal-300" />
                          </Link>

                          <div className="pt-1 flex items-center space-x-3 px-2 text-[11px] text-charcoal-400">
                            <Link to="/terms" onClick={() => setMoreDropdownOpen(false)} className="hover:underline">
                              Terms
                            </Link>
                            <span>&bull;</span>
                            <Link to="/privacy-policy" onClick={() => setMoreDropdownOpen(false)} className="hover:underline">
                              Privacy
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ========================================================
                3. RIGHT: Actions (Search, Wishlist, Cart, Account, Hamburger)
                ======================================================== */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  searchOpen
                    ? 'bg-gold-100 text-gold-900'
                    : 'text-charcoal hover:text-gold-700 hover:bg-ivory-100'
                }`}
                title="Search Catalogue"
                aria-label="Search Catalogue"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/account?tab=wishlist"
                className="relative p-2 rounded-full text-charcoal hover:text-burgundy hover:bg-ivory-100 transition-colors"
                title="Saved Fabrics (Wishlist)"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in scale-in-50">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Link */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full text-charcoal hover:text-gold-700 hover:bg-ivory-100 transition-colors"
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gold text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm animate-in scale-in-50">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div ref={userDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`p-2 rounded-full border transition-all flex items-center space-x-1 ${
                    isAdmin
                      ? 'border-gold bg-gold-50 text-gold-900'
                      : user
                      ? 'border-ivory-300 bg-ivory text-charcoal hover:border-gold'
                      : 'border-transparent text-charcoal hover:text-gold-700 hover:bg-ivory-100'
                  }`}
                  title={user ? user.displayName : 'Account / Sign In'}
                  aria-label="Account menu"
                  aria-expanded={userDropdownOpen}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-5 h-5 text-gold-700" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-premium border border-ivory-300 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-ivory-200 bg-ivory-50">
                          <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-semibold text-charcoal truncate">{user.displayName}</p>
                          <p className="text-xs text-charcoal-500 truncate">{user.email}</p>
                          <span
                            className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                              isAdmin ? 'bg-gold-100 text-gold-900' : 'bg-charcoal-100 text-charcoal-700'
                            }`}
                          >
                            {isAdmin ? 'Staff Administrator' : 'Customer Account'}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="py-1 border-b border-ivory-200 bg-gold-50/50">
                            <Link
                              to="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gold-900 font-semibold hover:bg-gold-100 transition-colors"
                            >
                              <Sliders className="w-4 h-4 mr-2 text-gold-700" />
                              Admin Dashboard
                            </Link>
                          </div>
                        )}

                        <div className="py-1">
                          <Link
                            to="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-charcoal hover:bg-ivory-100 transition-colors"
                          >
                            <User className="w-4 h-4 mr-2 text-charcoal-500" />
                            My Orders &amp; Account
                          </Link>
                          <Link
                            to="/account?tab=stylematch"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-charcoal hover:bg-ivory-100 transition-colors"
                          >
                            <Sparkles className="w-4 h-4 mr-2 text-gold-600" />
                            My StyleMatch Requests
                          </Link>
                        </div>

                        <div className="border-t border-ivory-200 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminRole(!isAdmin);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center px-4 py-2 text-xs text-charcoal-600 hover:bg-ivory-100"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-2 text-gold-600" />
                            {isAdmin ? 'Switch to Customer View' : 'Switch to Staff View'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-burgundy hover:bg-burgundy-50"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-ivory-200">
                          <p className="text-sm font-serif font-bold text-charcoal">Welcome to Sika Threads</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">Sign in to view your orders and saved fabrics.</p>
                        </div>
                        <Link
                          to="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-charcoal font-semibold hover:bg-ivory-100 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-gold-800 hover:bg-gold-50/60 transition-colors"
                        >
                          Create an Account
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminRole(true);
                            setUserDropdownOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-xs text-gold-800 hover:bg-gold-50 border-t border-ivory-100"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-gold-700" />
                          Staff / Admin Access
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Button (visible on mobile & tablet) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 rounded-md text-charcoal hover:text-gold hover:bg-ivory-100 transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* ========================================================
              INLINE SEARCH BAR (Sleek full-width drawer drop)
              ======================================================== */}
          {searchOpen && (
            <div className="py-4 border-t border-ivory-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Kente, African wax prints, French lace, silk, brocade, colors, or occasions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-24 py-3 bg-ivory-100 border border-gold-300 rounded-full text-sm text-charcoal placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white transition-all shadow-inner"
                />
                <Search className="w-5 h-5 text-gold-600 absolute left-4 top-3.5" />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  <button
                    type="submit"
                    className="bg-charcoal text-ivory px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gold transition-colors"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 text-charcoal-400 hover:text-charcoal rounded-full"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          MOBILE / TABLET NAVIGATION DRAWER (Slide-in off-canvas)
          ======================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-ivory-300 flex items-center justify-between bg-ivory-50">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center space-x-3"
              >
                <img
                  src="/logo.png"
                  alt="Sika Threads"
                  className="w-10 h-10 rounded-full border border-gold/40 object-cover"
                />
                <div>
                  <span className="font-serif font-bold text-lg text-charcoal tracking-wider block">
                    SIKA THREADS
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-gold-700 block">
                    Weaving Heritage, Stitching Modernity.
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full text-charcoal hover:bg-ivory-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1">
              {/* Quick Search inside Drawer */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search fabric, color, or occasion..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-ivory-100 border border-ivory-300 rounded-lg text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-gold focus:bg-white"
                />
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </form>

              {/* Main Navigation Links */}
              <div className="space-y-1">
                {/* 1. Home Link */}
                <Link
                  to="/"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold transition-colors ${
                    isHomeActive
                      ? 'bg-gold-50 text-gold-900 border border-gold-200'
                      : 'text-charcoal hover:bg-ivory-100'
                  }`}
                >
                  <span className="flex items-center">
                    <Home className="w-4 h-4 mr-2.5 text-gold-700" />
                    Home
                  </span>
                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                </Link>

                {/* 2. Shop Fabrics */}
                <Link
                  to="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-bold transition-colors ${
                    isShopActive
                      ? 'bg-gold-50 text-gold-900 border border-gold-200'
                      : 'text-charcoal hover:bg-ivory-100'
                  }`}
                >
                  <span className="flex items-center">
                    <Layers className="w-4 h-4 mr-2.5 text-gold-700" />
                    Shop All Fabrics
                  </span>
                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                </Link>

                {/* Categories Sublist */}
                <div className="pl-6 space-y-1 pt-1 pb-2">
                  {categories.slice(0, 5).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between py-1.5 px-3 rounded text-xs text-charcoal-600 hover:text-gold hover:bg-ivory-50"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3 h-3 text-charcoal-300" />
                    </Link>
                  ))}
                </div>

                {/* Smart Fabric Finder (Mobile) */}
                <Link
                  to="/finder"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-charcoal hover:bg-ivory-100 transition-colors"
                >
                  <span className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2.5 text-gold-700" />
                    Smart Fabric Finder
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gold/15 text-gold rounded">New</span>
                </Link>

                {/* Compare Fabrics (Mobile) */}
                <Link
                  to="/compare"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-charcoal hover:bg-ivory-100 transition-colors"
                >
                  <span className="flex items-center">
                    <Layers className="w-4 h-4 mr-2.5 text-charcoal-400" />
                    Compare Fabrics
                  </span>
                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                </Link>

                {/* 3. Sika StyleMatch AI Featured Card */}
                <Link
                  to="/stylematch"
                  onClick={() => setDrawerOpen(false)}
                  className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-between text-gold-900 group hover:bg-gold-100 transition-colors my-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gold-600 text-white flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Sika StyleMatch AI</span>
                      <span className="text-[10px] text-charcoal-600 block">
                        Stylist recommendations for your occasion
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </Link>

                {/* 4. Curated Collections */}
                <Link
                  to="/collections"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    isCollectionsActive
                      ? 'bg-gold-50 text-gold-900 border border-gold-200'
                      : 'text-charcoal hover:bg-ivory-100'
                  }`}
                >
                  <span>Curated Collections</span>
                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                </Link>

                {/* 5. About Us */}
                <Link
                  to="/about"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    isAboutActive
                      ? 'bg-gold-50 text-gold-900 border border-gold-200'
                      : 'text-charcoal hover:bg-ivory-100'
                  }`}
                >
                  <span>About Sika Threads</span>
                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                </Link>
              </div>

              {/* Secondary Concierge & Customer Care Section */}
              <div className="space-y-2 pt-3 border-t border-ivory-200">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block mb-1 px-3">
                  Concierge &amp; Customer Care
                </span>
                <Link
                  to="/sourcing"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <Compass className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Fabric Sourcing Concierge
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Contact Concierge
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Track Order Request
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
                <Link
                  to="/faqs"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <HelpCircle className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Frequently Asked Questions
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
                <Link
                  to="/delivery-policy"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Delivery &amp; Collection Policy
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
                <Link
                  to="/returns-policy"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-ivory-100"
                >
                  <span className="flex items-center">
                    <RotateCcw className="w-3.5 h-3.5 mr-2 text-gold-600" />
                    Returns &amp; Quality Guarantee
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-ivory-300 bg-ivory-50 space-y-3">
              <a
                href="https://wa.me/233557718472?text=Hello%20Sika%20Threads,%20I'd%20like%20to%20inquire%20about%20your%20fabrics."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Stylists on WhatsApp</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
                <span>Ghana &bull; Currency: <strong>GHS</strong></span>
                {user ? (
                  <Link
                    to="/account"
                    onClick={() => setDrawerOpen(false)}
                    className="font-semibold text-charcoal hover:underline"
                  >
                    My Account
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="font-semibold text-charcoal hover:underline"
                    >
                      Sign In
                    </Link>
                    <span>&bull;</span>
                    <Link
                      to="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="font-semibold text-gold-800 hover:underline"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
