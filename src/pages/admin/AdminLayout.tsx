import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Compass,
  MessageSquare,
  Settings,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  FileText,
  Clock,
} from 'lucide-react';
import { StoreService } from '../../services/storeService';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout, setAdminRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Pending items counts
  const orders = StoreService.getOrders();
  const pendingOrders = orders.filter((o) => o.status === 'request_submitted').length;

  const styleMatch = StoreService.getStyleMatchRequests();
  const pendingStyleMatch = styleMatch.filter((s) => s.approvalStatus === 'pending').length;

  const sourcing = StoreService.getSourcingRequests();
  const pendingSourcing = sourcing.filter((s) => s.status === 'submitted').length;

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Order Requests', path: '/admin/orders', icon: ShoppingBag, badge: pendingOrders },
    {
      label: 'StyleMatch Approval',
      path: '/admin/stylematch',
      icon: Sparkles,
      badge: pendingStyleMatch,
      alert: pendingStyleMatch > 0,
    },
    { label: 'Product Catalogue', path: '/admin/products', icon: Package },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Layers },
    { label: 'Fabric Sourcing', path: '/admin/sourcing', icon: Compass, badge: pendingSourcing },
    { label: 'Customer Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Website Content', path: '/admin/content', icon: Settings },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-charcoal text-ivory px-4 sm:px-8 py-3 flex items-center justify-between border-b-2 border-gold sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2 text-ivory hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold hidden sm:inline">Storefront</span>
          </Link>
          <span className="text-charcoal-500">|</span>
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Sika" className="w-7 h-7 rounded-full object-cover border border-gold" />
            <span className="font-serif font-bold text-sm sm:text-base tracking-wide text-ivory">
              SIKA THREADS <span className="text-gold font-sans font-normal text-xs ml-1">Operations Centre</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <span className="hidden md:inline-block bg-charcoal-700 px-2.5 py-1 rounded text-gold-300 font-mono">
            {user?.email || 'admin@sikathreads.com.gh'}
          </span>
          <button
            onClick={() => {
              setAdminRole(false);
              navigate('/');
            }}
            className="text-ivory-300 hover:text-white underline text-xs"
          >
            Exit to Customer Mode
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-charcoal-900 text-ivory-200 p-4 border-r border-charcoal-700 flex-shrink-0 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-gold-400">
            Store Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gold-700 text-white shadow-sm'
                    : 'text-ivory-300 hover:bg-charcoal-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gold-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.alert
                        ? 'bg-burgundy text-white animate-pulse'
                        : 'bg-gold-500 text-charcoal-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3">
            <div className="p-3 rounded bg-charcoal-800 border border-charcoal-700 text-[11px] text-ivory-400 space-y-1">
              <span className="font-bold text-gold-300 block">3–5 Min SLA Target</span>
              <p>StyleMatch requests automatically monitor turnaround time for stylist review.</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
