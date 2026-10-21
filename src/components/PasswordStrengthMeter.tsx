import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const hasMinLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: 'At least 8 characters', met: hasMinLength },
    { label: 'Uppercase & lowercase letters', met: hasMixedCase },
    { label: 'At least one number', met: hasNumber },
    { label: 'At least one symbol (e.g. !@#$)', met: hasSymbol },
  ];

  const score = criteria.filter((c) => c.met).length;

  let strengthLabel = 'Weak';
  let barColor = 'bg-burgundy-500';
  let textColor = 'text-burgundy-700';

  if (score === 2) {
    strengthLabel = 'Fair';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else if (score === 3) {
    strengthLabel = 'Good';
    barColor = 'bg-gold-500';
    textColor = 'text-gold-800';
  } else if (score === 4) {
    strengthLabel = 'Strong';
    barColor = 'bg-emerald-600';
    textColor = 'text-emerald-700';
  }

  return (
    <div className="space-y-2 pt-1 text-xs animate-fadeIn">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-charcoal-500">Security strength:</span>
        <span className={`font-semibold ${textColor}`}>{strengthLabel}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? barColor : 'bg-charcoal/10'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center space-x-1.5 ${
              c.met ? 'text-emerald-700 font-medium' : 'text-charcoal-400'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-charcoal-300 flex-shrink-0" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
