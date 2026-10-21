import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, setAdminRole } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-burgundy-200 shadow-premium text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-burgundy-50 border border-burgundy-200 text-burgundy-700 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-700 bg-burgundy-50 px-3 py-1 rounded-full border border-burgundy-200">
              Access Restricted
            </span>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Administrator Access Required
            </h2>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Your current session (<span className="font-semibold text-charcoal">{user.email}</span>) does not have staff administrator privileges for this operational console.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={() => setAdminRole(true)}
              className="w-full py-3 bg-gold-700 hover:bg-gold-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Admin Mode (Evaluator Access)</span>
            </button>

            <Link
              to="/account"
              className="w-full py-2.5 bg-ivory hover:bg-ivory-200 text-charcoal rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-charcoal/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
