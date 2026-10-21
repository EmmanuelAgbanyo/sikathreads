import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { StoreService } from '../services/storeService';
import { ProductCard } from '../components/ProductCard';
import {
  User,
  Package,
  Heart,
  Sparkles,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  LogOut,
  Settings,
  Layers,
  Compass,
  Truck,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Bell,
  FileText,
  ExternalLink,
  MessageCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { OrderStatus, StyleBoard } from '../types';

export const Account: React.FC = () => {
  const { user, logout, updateProfile, changePassword, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: overview | orders | wishlist | stylematch | sourcing | boards | settings
  const activeTab = searchParams.get('tab') || 'overview';

  // Sign out confirmation modal state
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Guest order lookup state
  const [guestLookupRef, setGuestLookupRef] = useState('');
  const [lookedUpOrder, setLookedUpOrder] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Settings form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [deliveryStreet, setDeliveryStreet] = useState(user?.savedAddresses?.[0]?.street || '');
  const [deliveryCity, setDeliveryCity] = useState(user?.savedAddresses?.[0]?.city || 'Accra');
  const [deliveryRegion, setDeliveryRegion] = useState(user?.savedAddresses?.[0]?.region || 'Greater Accra Region');
  const [tailorNotes, setTailorNotes] = useState(user?.preferredTailorNotes || '');
  const [emailUpdates, setEmailUpdates] = useState(user?.notificationPreferences?.emailOrderUpdates ?? true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(user?.notificationPreferences?.whatsappOrderUpdates ?? true);
  const [restockAlerts, setRestockAlerts] = useState(user?.notificationPreferences?.restockAlerts ?? true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Password reset simulation state
  const [passwordSent, setPasswordSent] = useState(false);

  // Style board creation modal state
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // Real data retrieval based on authenticated user's email
  const allOrders = StoreService.getOrders();
  const userOrders = user
    ? allOrders.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase())
    : [];

  const pendingVerificationOrders = userOrders.filter(
    (o) =>
      o.status === 'request_submitted' ||
      o.status === 'awaiting_stock_verification' ||
      o.status === 'awaiting_customer_confirmation'
  );

  const confirmedOrFulfilledOrders = userOrders.filter(
    (o) =>
      o.status === 'confirmed' ||
      o.status === 'preparing_order' ||
      o.status === 'ready_for_pickup' ||
      o.status === 'dispatched' ||
      o.status === 'delivered'
  );

  const allStyleMatch = StoreService.getStyleMatchRequests();
  const userStyleMatch = user
    ? allStyleMatch.filter((s) => s.customerEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const allSourcing = StoreService.getSourcingRequests();
  const userSourcing = user
    ? allSourcing.filter((s) => s.customerEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const allProducts = StoreService.getPublishedProducts();
  const wishlistProducts = allProducts.filter((p) => wishlist.includes(p.id));

  const [styleBoards, setStyleBoards] = useState<StyleBoard[]>(() => StoreService.getStyleBoards());

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const order = StoreService.getOrderById(guestLookupRef.trim());
    if (order) {
      setLookedUpOrder(order);
    } else {
      setLookupError(`No order request found matching reference "${guestLookupRef.trim()}".`);
      setLookedUpOrder(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateProfile({
        displayName: displayName.trim() || user?.displayName,
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        preferredTailorNotes: tailorNotes.trim(),
        savedAddresses: deliveryStreet
          ? [
              {
                id: 'addr-primary',
                street: deliveryStreet.trim(),
                city: deliveryCity.trim(),
                region: deliveryRegion.trim(),
                isDefault: true,
              },
            ]
          : [],
        notificationPreferences: {
          emailOrderUpdates: emailUpdates,
          whatsappOrderUpdates: whatsappUpdates,
          restockAlerts,
          curatorStylePicks: true,
        },
      });

      if (res.success) {
        showToast('Your account details have been successfully saved', 'success');
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('An unexpected error occurred while saving', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const newBoard: StyleBoard = {
      id: 'board-' + Date.now(),
      name: newBoardName.trim(),
      description: newBoardDesc.trim(),
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StoreService.saveStyleBoard(newBoard);
    setStyleBoards(StoreService.getStyleBoards());
    setNewBoardName('');
    setNewBoardDesc('');
    setIsCreatingBoard(false);
    showToast(`Created style board "${newBoard.name}"`, 'success');
  };

  const handleDeleteBoard = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" style board?`)) {
      StoreService.deleteStyleBoard(id);
      setStyleBoards(StoreService.getStyleBoards());
      showToast('Style board removed', 'info');
    }
  };

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (!currentPassword) {
      setPasswordChangeError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters in length.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match. Please verify both fields.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordChangeSuccess('Your password has been successfully updated with 256-bit encryption.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        showToast('Password updated successfully', 'success');
      } else {
        setPasswordChangeError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordChangeError(err.message || 'An error occurred while updating your password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordReset = () => {
    setPasswordSent(true);
    showToast(`Password reset instructions sent to ${user?.email}`, 'success');
  };

  // Helper for human-readable order status badge
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'request_submitted':
        return {
          label: 'Request Submitted',
          bg: 'bg-gold-50 text-gold-900 border-gold-200',
          desc: 'Awaiting bolt verification by our team',
        };
      case 'awaiting_stock_verification':
        return {
          label: 'Verifying Weave & Stock',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          desc: 'Curator inspecting roll density and yardage',
        };
      case 'awaiting_customer_confirmation':
        return {
          label: 'Awaiting Your Confirmation',
          bg: 'bg-purple-50 text-purple-900 border-purple-200',
          desc: 'Details prepared, pending your approval',
        };
      case 'confirmed':
        return {
          label: 'Order Confirmed',
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
          desc: 'Fabric allocated; moving to cutting',
        };
      case 'preparing_order':
        return {
          label: 'Cutting & Packaging',
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          desc: 'Precision cutting in progress',
        };
      case 'ready_for_pickup':
        return {
          label: 'Ready for Collection',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          desc: 'Packaged and ready for direct pickup',
        };
      case 'dispatched':
        return {
          label: 'Dispatched for Delivery',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          desc: 'With courier partner in transit',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'Completed and fulfilled',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          desc: 'Request cancelled',
        };
      case 'sourcing_required':
        return {
          label: 'Sourcing in Progress',
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          desc: 'Connecting with master weavers',
        };
      default:
        return {
          label: (status as string).replace(/_/g, ' '),
          bg: 'bg-ivory-200 text-charcoal border-ivory-300',
          desc: '',
        };
    }
  };

  // User initials avatar
  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 space-y-8 animate-fade-in">
      {/* Breadcrumb & Section Label */}
      <div className="flex items-center space-x-2 text-xs text-charcoal-400">
        <Link to="/" className="hover:text-gold transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-charcoal-700 font-medium">Customer Portal</span>
        {user && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gold-800 font-semibold capitalize">{activeTab}</span>
          </>
        )}
      </div>

      {/* 1. Refined Account Welcome Header */}
      <div className="bg-white rounded-2xl border border-charcoal/10 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative gold line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold to-gold-400" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Tasteful Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-charcoal text-gold border border-gold/40 flex items-center justify-center font-serif font-bold text-xl sm:text-2xl shadow-sm flex-shrink-0">
              {user ? getInitials(user.displayName) : <User className="w-8 h-8 text-gold" />}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                  {user ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Customer Portal & Order Tracking'}
                </h1>
                {user && (
                  user.isEmailVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Verified Customer
                    </span>
                  ) : (
                    <Link
                      to="/verify-email"
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                      title="Click to complete email verification"
                    >
                      <Clock className="w-3 h-3 mr-1 text-amber-600" /> Verify Email
                    </Link>
                  )
                )}
                {isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gold-100 text-gold-900 border border-gold-300">
                    Staff Administrator
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-charcoal-500 flex items-center gap-2">
                {user ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{user.email}</span>
                  </>
                ) : (
                  <span>Access your order requests, saved fabrics, and personal fabric consultations.</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'settings' })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'settings'
                      ? 'bg-charcoal text-white'
                      : 'bg-ivory hover:bg-ivory-200 text-charcoal border border-charcoal/10'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </button>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-xl bg-gold-700 hover:bg-gold-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Centre</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setShowSignOutModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-burgundy hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Sign In to Your Account
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2.5 bg-white hover:bg-ivory text-charcoal border border-charcoal/20 rounded-xl text-xs font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Compact Account Overview Dashboard (Real Metrics) */}
      {user && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div
            onClick={() => setSearchParams({ tab: 'orders' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-4 h-4 text-gold-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-charcoal">{userOrders.length}</div>
            <p className="text-[10px] text-charcoal-500">All submissions</p>
          </div>

          <div
            onClick={() => setSearchParams({ tab: 'orders' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-700">
              {pendingVerificationOrders.length}
            </div>
            <p className="text-[10px] text-charcoal-500">Bolt inspection</p>
          </div>

          <div
            onClick={() => setSearchParams({ tab: 'orders' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Fulfilment</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-700">
              {confirmedOrFulfilledOrders.length}
            </div>
            <p className="text-[10px] text-charcoal-500">Cutting &amp; transit</p>
          </div>

          <div
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-charcoal">{wishlistProducts.length}</div>
            <p className="text-[10px] text-charcoal-500">Saved weaves</p>
          </div>

          <div
            onClick={() => setSearchParams({ tab: 'stylematch' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">StyleMatch</span>
              <Sparkles className="w-4 h-4 text-gold-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-charcoal">{userStyleMatch.length}</div>
            <p className="text-[10px] text-charcoal-500">AI consultations</p>
          </div>

          <div
            onClick={() => setSearchParams({ tab: 'sourcing' })}
            className="cursor-pointer bg-white p-4 rounded-xl border border-charcoal/10 hover:border-gold/60 hover:shadow-xs transition-all space-y-1"
          >
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sourcing</span>
              <Compass className="w-4 h-4 text-charcoal-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-charcoal">{userSourcing.length}</div>
            <p className="text-[10px] text-charcoal-500">Custom requests</p>
          </div>
        </div>
      )}

      {/* 3. Responsive Account Navigation Tabs */}
      <div className="border-b border-charcoal/10 overflow-x-auto scrollbar-none">
        <div className="flex space-x-2 sm:space-x-3 pb-2 min-w-max">
          {user && (
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'overview' })}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'overview'
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-charcoal-600 hover:bg-ivory-200'
              }`}
            >
              <User className="w-4 h-4 text-gold" />
              <span>Overview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-ivory-200'
            }`}
          >
            <Package className="w-4 h-4 text-gold" />
            <span>My Orders</span>
            {user && userOrders.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-gold text-charcoal' : 'bg-ivory-300 text-charcoal'
                }`}
              >
                {userOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'wishlist'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-ivory-200'
            }`}
          >
            <Heart className="w-4 h-4 text-gold" />
            <span>My Wishlist</span>
            {wishlistProducts.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'wishlist' ? 'bg-gold text-charcoal' : 'bg-ivory-300 text-charcoal'
                }`}
              >
                {wishlistProducts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'stylematch' })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'stylematch'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-ivory-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>StyleMatch AI</span>
            {user && userStyleMatch.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'stylematch' ? 'bg-gold text-charcoal' : 'bg-ivory-300 text-charcoal'
                }`}
              >
                {userStyleMatch.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'sourcing' })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'sourcing'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-ivory-200'
            }`}
          >
            <Compass className="w-4 h-4 text-gold" />
            <span>Bespoke Sourcing</span>
            {user && userSourcing.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'sourcing' ? 'bg-gold text-charcoal' : 'bg-ivory-300 text-charcoal'
                }`}
              >
                {userSourcing.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'boards' })}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'boards'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-charcoal-600 hover:bg-ivory-200'
            }`}
          >
            <Layers className="w-4 h-4 text-gold" />
            <span>Style Boards</span>
            {styleBoards.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'boards' ? 'bg-gold text-charcoal' : 'bg-ivory-300 text-charcoal'
                }`}
              >
                {styleBoards.length}
              </span>
            )}
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'settings' })}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-charcoal-600 hover:bg-ivory-200'
              }`}
            >
              <Settings className="w-4 h-4 text-gold" />
              <span>Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Tab Content Panel */}
      <div className="space-y-6">
        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && user && (
          <div className="space-y-8">
            {/* Recent Orders Preview */}
            <div className="bg-white rounded-2xl border border-charcoal/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-charcoal/5">
                <div>
                  <h3 className="font-serif font-bold text-base text-charcoal">Recent Fabric Orders</h3>
                  <p className="text-xs text-charcoal-500">Your latest submissions and active deliveries</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: 'orders' })}
                  className="text-xs font-bold text-gold-800 hover:underline flex items-center gap-1"
                >
                  <span>View All ({userOrders.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {userOrders.length > 0 ? (
                <div className="divide-y divide-charcoal/5">
                  {userOrders.slice(0, 3).map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-sm text-charcoal">
                              #{order.orderReference}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            &bull; {order.items.length} {order.items.length === 1 ? 'fabric' : 'fabrics'} (
                            {order.items.map((i) => i.name).join(', ')})
                          </p>
                          <p className="text-xs text-charcoal-700">
                            {order.finalAgreedPriceSnapshot ? (
                              <span>
                                Final Agreed Total: <strong>GHS {order.finalAgreedPriceSnapshot.toLocaleString()}</strong>
                              </span>
                            ) : (
                              <span>
                                Proposed Total: <strong>GHS {order.proposedTotal.toLocaleString()}</strong>{' '}
                                <span className="text-[11px] text-charcoal-400">(Awaiting confirmation)</span>
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Link
                            to={`/track-order?ref=${order.orderReference}`}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-ivory hover:bg-gold-50 text-charcoal border border-charcoal/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-gold-700" />
                            <span>Track</span>
                          </Link>
                          <Link
                            to={`/order-confirmation/${order.orderReference}`}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-charcoal hover:bg-charcoal-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Package className="w-8 h-8 text-charcoal-300 mx-auto" />
                  <p className="text-xs text-charcoal-600">No order requests placed yet.</p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 text-xs font-bold text-gold-800 hover:underline"
                  >
                    <span>Explore Ghanaian Fabrics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Concierge Assistance Card */}
            <div className="bg-gradient-to-r from-ivory to-white rounded-2xl border border-charcoal/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-600" /> Personal Stylist Concierge
                </span>
                <h4 className="font-serif font-bold text-base text-charcoal">
                  Need Help Confirming Yardage or Event Palette?
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Our textile curators are ready to help with tailor yardage calculations, headtie pairings, and custom roll cuts on WhatsApp or phone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/233557718472?text=Hello%20Sika%20Threads,%20I'm%20a%20registered%20customer%20and%20need%20styling%20assistance."
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge (055 771 8472)</span>
                </a>
                <Link
                  to="/stylematch"
                  className="px-4 py-2.5 rounded-xl bg-charcoal hover:bg-gold text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Use StyleMatch AI</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Guest Lookup for non-authenticated users */}
            {!user && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-charcoal/10 shadow-sm max-w-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                    <Search className="w-4 h-4 text-gold-600" />
                    <span>Track an Order Request</span>
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Enter your unique order reference code (e.g. <code>ST-2026-1042</code>) to check stock verification and fulfillment status.
                  </p>
                </div>

                <form onSubmit={handleLookup} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ST-2026-1042"
                    value={guestLookupRef}
                    onChange={(e) => setGuestLookupRef(e.target.value)}
                    className="flex-1 text-xs bg-ivory-50 border border-charcoal/20 rounded-xl px-3.5 py-2.5 focus:border-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Track
                  </button>
                </form>

                {lookupError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}

                {lookedUpOrder && (
                  <div className="p-4 bg-ivory rounded-xl border border-gold/40 text-xs space-y-3 mt-4 animate-scale-up">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-sm text-charcoal">
                        #{lookedUpOrder.orderReference}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 font-semibold uppercase text-[10px]">
                        {lookedUpOrder.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-charcoal-600">
                      Items: {lookedUpOrder.items.length} fabrics &bull; Proposed Total: <strong>GHS {lookedUpOrder.proposedTotal.toLocaleString()}</strong>
                    </p>
                    <Link
                      to={`/order-confirmation/${lookedUpOrder.orderReference}`}
                      className="inline-flex items-center gap-1 text-gold-800 font-bold underline"
                    >
                      <span>View Full Order Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated Customer Orders List */}
            {user && (
              <div className="space-y-4">
                {userOrders.length > 0 ? (
                  userOrders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-charcoal/10 p-6 shadow-sm hover:border-gold/40 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal/5">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-base text-charcoal">
                                #{order.orderReference}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-400 mt-0.5">
                              Submitted on{' '}
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            {order.finalAgreedPriceSnapshot ? (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                                  Confirmed Total
                                </span>
                                <span className="font-serif text-lg font-bold text-gold-800">
                                  GHS {order.finalAgreedPriceSnapshot.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                                  Proposed Total
                                </span>
                                <span className="font-serif text-lg font-bold text-charcoal">
                                  GHS {order.proposedTotal.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-charcoal-400 block">
                                  (Subject to bolt verification)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-ivory-50 rounded-xl border border-charcoal/5 flex items-center gap-3 text-xs"
                            >
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-charcoal/10 flex-shrink-0"
                                />
                              )}
                              <div className="truncate">
                                <p className="font-bold text-charcoal truncate">{item.name}</p>
                                <p className="text-[11px] text-charcoal-500">
                                  {item.quantity} {item.sellingUnit} &times; GHS {item.price.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-semibold text-gold-800">
                                  Line Total: GHS {item.lineTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                          <p className="text-charcoal-500 text-[11px]">
                            {badge.desc || 'Contact concierge for updates'}
                          </p>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/track-order?ref=${order.orderReference}`}
                              className="px-3.5 py-1.5 rounded-lg bg-ivory hover:bg-gold-50 text-charcoal border border-charcoal/15 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5 text-gold-700" />
                              <span>Track Request</span>
                            </Link>
                            <Link
                              to={`/order-confirmation/${order.orderReference}`}
                              className="px-4 py-1.5 rounded-lg bg-charcoal hover:bg-gold text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Empty state for Orders */
                  <div className="bg-white p-12 rounded-2xl border border-charcoal/10 text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-full bg-ivory text-gold flex items-center justify-center mx-auto border border-gold/30">
                      <Package className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-lg text-charcoal">
                        Your Next Favourite Fabric Awaits
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        You have not placed any fabric order requests yet. Browse our curated Ghanaian collection to submit your custom yardage.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Browse Fabrics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: WISHLIST --- */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              /* Empty state for Wishlist */
              <div className="bg-white p-12 rounded-2xl border border-charcoal/10 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-charcoal">
                    Keep Your Favourite Fabrics Close
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Save handwoven Kente, GTP prints, and bridal lace fabrics to your personal wishlist while planning upcoming events.
                  </p>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: STYLEMATCH REQUESTS --- */}
        {activeTab === 'stylematch' && (
          <div className="space-y-4">
            {userStyleMatch.length > 0 ? (
              userStyleMatch.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-charcoal/10 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-charcoal/5">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold-700">
                        Ref #{req.id}
                      </span>
                      <h4 className="font-serif font-bold text-base text-charcoal">
                        {req.occasion} Styling Consultation
                      </h4>
                      <p className="text-[11px] text-charcoal-400">
                        Submitted on{' '}
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                        req.approvalStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {req.approvalStatus === 'approved'
                        ? 'Verified & Approved by Stylist'
                        : 'Stylist Review in Progress'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-ivory-50 p-3.5 rounded-xl border border-charcoal/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Preferred Palette
                      </span>
                      <span className="font-semibold text-charcoal">
                        {req.preferredColours.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Budget Range
                      </span>
                      <span className="font-semibold text-charcoal">
                        GHS {req.budgetRange.min} – {req.budgetRange.max}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Intended Outfit
                      </span>
                      <span className="font-semibold text-charcoal">{req.intendedOutfit}</span>
                    </div>
                  </div>

                  {req.aiAnalysisSummary && (
                    <div className="text-xs text-charcoal-600 bg-white p-3 rounded-xl border border-charcoal/10 italic">
                      "{req.aiAnalysisSummary}"
                    </div>
                  )}

                  {req.candidateRecommendations.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-charcoal block mb-2">
                        Approved In-Stock Recommendations:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {req.candidateRecommendations.map((cand) => {
                          const prod = StoreService.getProductById(cand.productId);
                          if (!prod) return null;
                          return (
                            <Link
                              key={cand.productId}
                              to={`/product/${prod.slug}`}
                              className="p-3 rounded-xl bg-ivory-50 hover:bg-gold-50 border border-charcoal/10 flex items-center space-x-3 text-xs transition-colors"
                            >
                              <img
                                src={prod.images[0] || '/kente-weave.jpg'}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-charcoal/10"
                              />
                              <div className="truncate">
                                <p className="font-bold text-charcoal truncate">{prod.name}</p>
                                <p className="text-gold-800 font-semibold text-[11px]">
                                  GHS {prod.price.toLocaleString()} / {prod.sellingUnit}
                                </p>
                                <span className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> In Stock
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Empty state for StyleMatch */
              <div className="bg-white p-12 rounded-2xl border border-charcoal/10 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-gold-50 text-gold-700 flex items-center justify-center mx-auto border border-gold-300">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-charcoal">
                    Let's Find the Fabric for Your Next Occasion
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Describe your wedding, church festival, or gala event. Sika StyleMatch AI matches currently in-stock Ghanaian textiles with personal stylist approval.
                  </p>
                </div>
                <Link
                  to="/stylematch"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find My Fabric</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: SOURCING REQUESTS --- */}
        {activeTab === 'sourcing' && (
          <div className="space-y-4">
            {userSourcing.length > 0 ? (
              userSourcing.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-charcoal/10 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-charcoal/5">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal-400">
                        Reference #{req.reference}
                      </span>
                      <h4 className="font-serif font-bold text-base text-charcoal">
                        {req.desiredFabricType} Procurement
                      </h4>
                      <p className="text-[11px] text-charcoal-400">Occasion: {req.occasion}</p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 capitalize">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-ivory-50 p-3.5 rounded-xl border border-charcoal/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Desired Quantity
                      </span>
                      <span className="font-semibold text-charcoal">
                        {req.desiredQuantity} {req.desiredUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Target Budget
                      </span>
                      <span className="font-semibold text-charcoal">
                        GHS {req.budget.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                        Color / Pattern
                      </span>
                      <span className="font-semibold text-charcoal">{req.colourPattern}</span>
                    </div>
                  </div>

                  {req.proposal && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sourcing Proposal from
                        Curators
                      </span>
                      <p className="leading-relaxed">{req.proposal.notes}</p>
                      <p className="font-bold text-emerald-900 pt-1">
                        Estimated Price: GHS {req.proposal.estimatedPrice.toLocaleString()} &bull; Lead Time:{' '}
                        {req.proposal.estimatedLeadTime}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Empty state for Sourcing */
              <div className="bg-white p-12 rounded-2xl border border-charcoal/10 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-ivory text-charcoal flex items-center justify-center mx-auto border border-charcoal/20">
                  <Compass className="w-8 h-8 text-gold-700" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-charcoal">
                    Looking for Something Special?
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    If an exclusive Kente strip pattern or rare bridal lace isn't currently in stock, our curators can commission or source it directly with master weavers.
                  </p>
                </div>
                <Link
                  to="/sourcing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Request a Fabric</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: STYLE BOARDS --- */}
        {activeTab === 'boards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal/5">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal">Your Style Moodboards</h3>
                <p className="text-xs text-charcoal-500">Curate and group fabrics for different events</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingBoard(true)}
                className="px-4 py-2 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Style Board</span>
              </button>
            </div>

            {/* Create Board Modal / Inline Form */}
            {isCreatingBoard && (
              <form
                onSubmit={handleCreateBoard}
                className="p-5 bg-white rounded-2xl border border-gold/40 shadow-sm space-y-3 animate-scale-up"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-charcoal">Create New Style Board</h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingBoard(false)}
                    className="text-charcoal-400 hover:text-charcoal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Board Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grandma's 80th Birthday Fabrics"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl px-3 py-2 focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Event Description / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal gold and purple Kente theme"
                      value={newBoardDesc}
                      onChange={(e) => setNewBoardDesc(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl px-3 py-2 focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingBoard(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-charcoal hover:bg-ivory"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-gold-600 hover:bg-gold-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Board
                  </button>
                </div>
              </form>
            )}

            {styleBoards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {styleBoards.map((board) => (
                  <div
                    key={board.id}
                    className="bg-white rounded-2xl border border-charcoal/10 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-base text-charcoal truncate">
                          {board.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteBoard(board.id, board.name)}
                          title="Delete board"
                          className="text-charcoal-300 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-charcoal-500 line-clamp-2">
                        {board.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-charcoal/5 flex items-center justify-between text-xs text-charcoal-400">
                      <span>{board.items.length} saved fabrics</span>
                      <Link
                        to="/shop"
                        className="text-gold-800 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Add Fabrics</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-charcoal/10 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-ivory text-charcoal flex items-center justify-center mx-auto border border-charcoal/20">
                  <Layers className="w-8 h-8 text-gold-700" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-charcoal">
                    Organise Your Fabric Inspiration
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Create moodboards for family weddings, holiday church services, or bridal parties to compare swatches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingBoard(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Moodboard</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: ACCOUNT SETTINGS --- */}
        {activeTab === 'settings' && user && (
          <div className="bg-white rounded-2xl border border-charcoal/10 p-6 sm:p-8 shadow-sm max-w-3xl space-y-8">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal">Account &amp; Contact Settings</h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Manage your personal details, delivery preferences, and order notification channels.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Details */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-charcoal pb-2 border-b border-charcoal/5 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold-600" />
                  <span>Personal Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full text-xs bg-ivory-200/60 border border-charcoal/10 rounded-xl p-2.5 text-charcoal-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-charcoal-400 block mt-1">
                      Email is permanently linked to your order history.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Primary Telephone
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 055 771 8472"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +233 55 771 8472"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    />
                    <span className="text-[10px] text-charcoal-400 block mt-1">
                      Used by stylists to send high-res weave videos before cutting.
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-charcoal pb-2 border-b border-charcoal/5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-600" />
                  <span>Default Delivery Location in Ghana</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Street / Landmark / House Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring Road Central, Near Danquah Circle"
                      value={deliveryStreet}
                      onChange={(e) => setDeliveryStreet(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Accra"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Region
                    </label>
                    <select
                      value={deliveryRegion}
                      onChange={(e) => setDeliveryRegion(e.target.value)}
                      className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 focus:border-gold focus:outline-none"
                    >
                      <option value="Greater Accra Region">Greater Accra Region</option>
                      <option value="Ashanti Region">Ashanti Region (Kumasi)</option>
                      <option value="Western Region">Western Region (Takoradi)</option>
                      <option value="Central Region">Central Region (Cape Coast)</option>
                      <option value="Eastern Region">Eastern Region (Koforidua)</option>
                      <option value="Northern Region">Northern Region (Tamale)</option>
                      <option value="Volta Region">Volta Region (Ho)</option>
                      <option value="Upper East Region">Upper East Region (Bolgatanga)</option>
                      <option value="Upper West Region">Upper West Region (Wa)</option>
                      <option value="Bono Region">Bono Region (Sunyani)</option>
                      <option value="Bono East Region">Bono East Region (Techiman)</option>
                      <option value="Ahafo Region">Ahafo Region (Goaso)</option>
                      <option value="Oti Region">Oti Region (Dambai)</option>
                      <option value="Savannah Region">Savannah Region (Damongo)</option>
                      <option value="North East Region">North East Region (Nalerigu)</option>
                      <option value="Western North Region">Western North Region (Sefwi Wiawso)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-charcoal pb-2 border-b border-charcoal/5 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold-600" />
                  <span>Notification Preferences</span>
                </h4>

                <div className="space-y-3 text-xs text-charcoal-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      className="w-4 h-4 text-gold rounded border-charcoal/20 focus:ring-gold"
                    />
                    <span>Receive email updates when fabric stock is verified or dispatched</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="w-4 h-4 text-gold rounded border-charcoal/20 focus:ring-gold"
                    />
                    <span>Receive direct WhatsApp confirmation for cutting measurements</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restockAlerts}
                      onChange={(e) => setRestockAlerts(e.target.checked)}
                      className="w-4 h-4 text-gold rounded border-charcoal/20 focus:ring-gold"
                    />
                    <span>Priority alerts when rare or sold-out Kente bolts arrive in stock</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between border-t border-charcoal/10">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-charcoal hover:bg-gold text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingSettings ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <Link
                  to="/forgot-password"
                  className="text-xs text-charcoal-500 hover:text-charcoal underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>

            {/* Account Security & Password Management */}
            <div className="pt-6 border-t border-charcoal/10 space-y-6">
              <div>
                <h4 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-600" />
                  <span>Account Security &amp; Password</span>
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Ensure your account is protected with 256-bit encryption and verified credentials.
                </p>
              </div>

              {/* Email Verification Card */}
              <div className="p-4 rounded-xl border border-charcoal/10 bg-ivory-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal">Email Address Status:</span>
                    {user.isEmailVerified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal-500">
                    {user.isEmailVerified
                      ? 'Your account email is verified and protected against unauthorized recovery.'
                      : 'Verification enables instant order status SMS/email and protected account recovery.'}
                  </p>
                </div>

                {!user.isEmailVerified && (
                  <Link
                    to="/verify-email"
                    className="px-4 py-2 bg-charcoal hover:bg-gold-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
                  >
                    Verify Email Now
                  </Link>
                )}
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="space-y-4 p-5 rounded-xl border border-charcoal/10 bg-white shadow-xs">
                <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gold-700" />
                  <span>Update Account Password</span>
                </h5>

                {passwordChangeError && (
                  <div className="p-3 rounded-lg bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{passwordChangeSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 pr-8 focus:border-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-charcoal-400 hover:text-charcoal"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 pr-8 focus:border-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-charcoal-400 hover:text-charcoal"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full text-xs bg-ivory-50 border border-charcoal/20 rounded-xl p-2.5 pr-8 focus:border-gold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-charcoal-400 hover:text-charcoal"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {newPassword && <PasswordStrengthMeter password={newPassword} />}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2.5 bg-charcoal hover:bg-gold-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>

                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-gold-800 hover:underline"
                  >
                    Forgot current password?
                  </Link>
                </div>
              </form>

              {/* Active Security Session Details */}
              <div className="p-4 rounded-xl bg-ivory-100 border border-charcoal/10 text-xs text-charcoal-600 space-y-2">
                <span className="font-bold text-charcoal block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
                  <span>Session Security &amp; Activity</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-charcoal-400 block">Encryption:</span>
                    <span className="font-semibold text-charcoal">TLS 1.3 / 256-Bit SSL</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block">Location Access:</span>
                    <span className="font-semibold text-charcoal">Ghana (Accra Node)</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block">Current Session:</span>
                    <span className="font-semibold text-charcoal">Web Browser (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-charcoal/10 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif font-bold text-base text-charcoal">
                Confirm Sign Out
              </h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Are you sure you want to sign out of your Sika Threads customer portal?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="py-2.5 px-4 rounded-xl border border-charcoal/20 text-xs font-semibold text-charcoal hover:bg-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                  showToast('You have been signed out', 'info');
                }}
                className="py-2.5 px-4 rounded-xl bg-burgundy hover:bg-rose-900 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
