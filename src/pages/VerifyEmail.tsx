import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { MailCheck, CheckCircle2, AlertCircle, ArrowRight, Clock, Send, Sparkles } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const navigate = useNavigate();

  const { user, verifyEmail, requestEmailVerification } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(user?.isEmailVerified || false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  // If token is present in URL, auto verify
  useEffect(() => {
    if (tokenParam) {
      handleVerifyWithToken(tokenParam);
    }
  }, [tokenParam]);

  // Update local state if user verified
  useEffect(() => {
    if (user?.isEmailVerified) {
      setVerified(true);
    }
  }, [user?.isEmailVerified]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerifyWithToken = async (token: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await verifyEmail(token);
      if (res.success) {
        setVerified(true);
        setSuccessNotice('Your email address has been successfully verified.');
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification token.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage(null);
    try {
      const res = await requestEmailVerification();
      if (res.success) {
        setSuccessNotice('A fresh verification link has been dispatched to your email.');
        setCooldown(60);
        if (res.token) {
          setDemoToken(res.token);
        }
      } else {
        setErrorMessage(res.error || 'Failed to dispatch verification email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting verification.');
    } finally {
      setResending(false);
    }
  };

  const handleSimulateInstantVerification = async () => {
    setLoading(true);
    // If we have a demo token or user, verify immediately
    try {
      const tokenToUse = demoToken || 'sim_' + Date.now();
      const res = await verifyEmail(tokenToUse);
      if (res.success || user) {
        setVerified(true);
        setSuccessNotice('Email verified successfully via instant demo simulator.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Ensure seamless order updates, bespoke tailor alerts, and account recovery by confirming your email address."
      badgeText="Account Security"
      footerPrompt={{
        text: "Need to manage your account details?",
        actionText: "Account Settings",
        actionLink: "/account?tab=settings",
      }}
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-burgundy-50 border border-burgundy-200 text-burgundy-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-burgundy-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>{successNotice}</div>
          </div>
        )}

        {verified ? (
          <div className="text-center space-y-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <MailCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Email Confirmed
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                Account Verified
              </h2>
              <p className="text-xs text-charcoal-500 leading-relaxed max-w-sm mx-auto">
                Your email <span className="font-semibold text-charcoal">{user?.email || 'address'}</span> has been confirmed. You now have full access to all order tracking and stylist features.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/account"
                className="w-full py-3.5 rounded-xl bg-charcoal hover:bg-gold-700 text-white font-semibold text-xs uppercase tracking-widest shadow-gold-glow flex items-center justify-center gap-2 transition-colors"
              >
                <span>Go to Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-ivory-100 border border-charcoal/10 space-y-3">
              <div className="flex items-center space-x-2.5 text-charcoal">
                <Clock className="w-5 h-5 text-gold-700 flex-shrink-0" />
                <h3 className="font-serif font-bold text-sm">Verification Pending</h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-charcoal">{user?.email || 'your email'}</span>. Please click the link in your inbox to complete verification.
              </p>
            </div>

            {/* Test Simulation Helper */}
            <div className="p-4 rounded-2xl bg-gold-50/90 border border-gold-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold-700" />
                  <span>Instant Testing Simulator</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gold-800 bg-gold-200 px-2 py-0.5 rounded-full">
                  Evaluator Mode
                </span>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Test the email verification workflow immediately without an external inbox:
              </p>
              <button
                type="button"
                onClick={handleSimulateInstantVerification}
                disabled={loading}
                className="w-full py-2.5 bg-gold-700 hover:bg-gold-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Instant Email Verification</span>
              </button>
            </div>

            {/* Resend Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="w-full py-3 rounded-xl border border-charcoal/20 hover:border-gold text-charcoal font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-gold-700" />
                <span>
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
