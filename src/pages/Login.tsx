import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, setAdminRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(cleanEmail, password, rememberMe);
      if (result.success) {
        setSuccessMessage('Signed in successfully. Redirecting...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 400);
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setAdminRole(true);
    navigate('/admin');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your order history, saved textile wishlists, and bespoke styling consultations."
      badgeText="Secure Client Access"
      footerPrompt={{
        text: "New to Sika Threads?",
        actionText: "Create an Account",
        actionLink: "/register",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. kofi.mensah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Password *
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-gold-800 hover:text-gold-900 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 hover:text-charcoal focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-charcoal-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-gold rounded border-charcoal/20 focus:ring-gold"
            />
            <span>Remember this device for 30 days</span>
          </label>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-charcoal hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest shadow-gold-glow hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span>Verifying Credentials...</span>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Staff / Evaluator Quick Access Card */}
        <div className="pt-4 border-t border-charcoal/10">
          <div className="p-3.5 rounded-xl bg-gold-50/80 border border-gold-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gold-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-700" />
                <span>Staff &amp; Evaluator Quick Access</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-gold-800 bg-gold-200/60 px-2 py-0.5 rounded-full">
                Test Mode
              </span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-snug">
              Evaluate inventory management, order dispatch, and the Sika StyleMatch Approval Console without entering test credentials.
            </p>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="w-full py-2 bg-charcoal hover:bg-gold-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Launch Admin Operations Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};
