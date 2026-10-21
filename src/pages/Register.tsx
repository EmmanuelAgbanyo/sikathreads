import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Sika Threads Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(cleanEmail, cleanName, password, phoneNumber.trim(), marketingConsent);
      if (result.success) {
        setSuccessMessage('Account registered successfully! Welcome to Sika Threads.');
        setTimeout(() => {
          navigate('/account?welcome=true', { replace: true });
        }, 600);
      } else {
        setErrorMessage(result.error || 'Registration could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Sika Threads to curate bespoke Ghanaian fabrics, track order requests, and receive master stylist guidance."
      badgeText="Bespoke Membership"
      footerPrompt={{
        text: "Already have an account?",
        actionText: "Sign In",
        actionLink: "/login",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Ama Serwaa Darko"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
            />
          </div>
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="ama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Phone / WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                placeholder="055 771 8472"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
            Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create a secure password"
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
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Confirm your password"
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
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-burgundy-600 mt-1">Passwords do not match.</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2 text-xs text-charcoal-700">
          <label className="flex items-start space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-gold rounded border-charcoal/20 focus:ring-gold"
            />
            <span className="leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="font-bold text-gold-800 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" target="_blank" className="font-bold text-gold-800 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-gold rounded border-charcoal/20 focus:ring-gold"
            />
            <span className="leading-relaxed text-charcoal-500">
              Receive curated lookbooks, rare bolt alerts, and bespoke styling advice.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-charcoal hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest shadow-gold-glow hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer pt-3"
        >
          {loading ? (
            <span>Creating Your Profile...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
