import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { SiteContent } from '../types';

interface AnnouncementBarProps {
  content: SiteContent['announcementBar'];
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ content }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!content.active || dismissed) return null;

  return (
    <div className="bg-charcoal text-ivory text-xs sm:text-sm py-2 px-4 relative z-50 border-b border-gold/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 text-center pr-6">
          <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-pulse hidden sm:inline-block" />
          <span className="font-medium tracking-wide">{content.text}</span>
          {content.linkText && content.linkUrl && (
            <Link
              to={content.linkUrl}
              className="inline-flex items-center text-gold hover:text-gold-300 font-semibold underline underline-offset-2 ml-1"
            >
              <span>{content.linkText}</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-ivory/60 hover:text-ivory p-1"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
