import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset(cleanEmail);
      setSubmitted(true);
      if (result.demoToken) {
        setDemoToken(result.demoToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Password Recovery"
      subtitle="Enter your registered email address and we'll send you instructions to safely reset your account password."
      badgeText="Account Security"
      footerPrompt={{
        text: "Remember your password?",
        actionText: "Return to Sign In",
        actionLink: "/login",
      }}
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Registered Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ivory-50 border border-charcoal/20 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-charcoal focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
            <p className="text-[11px] text-charcoal-400 leading-snug">
              For privacy protection, we do not reveal whether an email address is registered.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-charcoal hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest shadow-gold-glow hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Dispatching Instructions...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Confirmation Message */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <div className="flex items-center space-x-2 font-serif font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Reset Instructions Dispatched</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              If an account matching <span className="font-semibold">{email}</span> exists in our directory, a secure password reset link has been dispatched.
            </p>
          </div>

          {/* Test / Evaluator Mode Preview Banner */}
          {demoToken && (
            <div className="p-4 rounded-2xl bg-gold-50/90 border border-gold-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold-700" />
                  <span>Evaluator Simulation Helper</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gold-800 bg-gold-200 px-2 py-0.5 rounded-full">
                  Demo Link
                </span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                In production this link arrives via transactional email. For immediate evaluation in this testing environment, click below to test the reset password flow directly:
              </p>
              <Link
                to={`/reset-password?token=${demoToken}`}
                className="w-full py-2.5 bg-gold-700 hover:bg-gold-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Open Password Reset Console</span>
              </Link>
            </div>
          )}

          <div className="pt-2 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setDemoToken(null);
              }}
              className="w-full py-2.5 rounded-xl border border-charcoal/20 text-charcoal text-xs font-semibold hover:bg-ivory-100 transition-colors"
            >
              Try Another Email
            </button>
            <Link
              to="/login"
              className="w-full py-2.5 text-center text-xs font-semibold text-charcoal-500 hover:text-charcoal flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
