import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { StoreService } from '../services/storeService';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      const validation = StoreService.validateResetToken(tokenParam);
      if (validation.valid && validation.email) {
        setTokenValid(true);
        setTokenEmail(validation.email);
        setErrorMessage(null);
      } else {
        setTokenValid(false);
        setErrorMessage(validation.error || 'The reset token is invalid or has expired.');
      }
    }
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeToken = token.trim();
    if (!activeToken) {
      setErrorMessage('Please provide a valid password recovery token.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(activeToken, newPassword);
      if (result.success) {
        setSuccess(true);
      } else {
        setErrorMessage(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle={
        tokenEmail
          ? `Create a secure new password for ${tokenEmail}.`
          : 'Create a new, highly secure password for your Sika Threads account.'
      }
      badgeText="Secure Verification"
      footerPrompt={{
        text: "Need assistance with your account?",
        actionText: "Contact Concierge",
        actionLink: "/contact",
      }}
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Token input if not provided via query param */}
          {!tokenParam && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
                Security Recovery Token *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Paste your reset token (e.g. rst_...)"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400 font-mono"
                />
              </div>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Confirm New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 hover:text-charcoal focus:outline-none"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-burgundy-600 mt-1">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-charcoal hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest shadow-gold-glow hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Updating Credentials...</span>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 text-center animate-fadeIn py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Password Reset Complete
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-sm mx-auto">
              Your password has been successfully updated with 256-bit security encryption. You may now sign in using your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl bg-gold-700 hover:bg-gold-800 text-white font-semibold text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-colors"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
