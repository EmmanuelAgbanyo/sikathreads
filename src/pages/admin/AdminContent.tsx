import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { SiteContent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Settings, CheckCircle, Save } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<SiteContent>(() => StoreService.getSiteContent());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StoreService.saveSiteContent(content, user?.email || 'admin@sikathreads.com.gh');
    setFeedback('Website configuration and content saved successfully.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Store Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Website Content &amp; Settings</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Edit announcement banner, hero copy, verified contact numbers, and regional delivery fees.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* 1. Announcement Bar */}
        <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif text-base font-bold text-charcoal pb-2 border-b border-ivory-200">
            Top Announcement Bar
          </h2>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={content.announcementBar.active}
              onChange={(e) =>
                setContent({
                  ...content,
                  announcementBar: { ...content.announcementBar, active: e.target.checked },
                })
              }
              className="accent-gold-600"
            />
            <span className="font-semibold text-charcoal">Display Announcement Bar at top of site</span>
          </label>

          <div>
            <label className="font-bold text-charcoal-600 block mb-1">Announcement Copy</label>
            <input
              type="text"
              value={content.announcementBar.text}
              onChange={(e) =>
                setContent({
                  ...content,
                  announcementBar: { ...content.announcementBar, text: e.target.value },
                })
              }
              className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Link Label (Optional)</label>
              <input
                type="text"
                value={content.announcementBar.linkText || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcementBar: { ...content.announcementBar, linkText: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>
            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Link URL</label>
              <input
                type="text"
                value={content.announcementBar.linkUrl || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcementBar: { ...content.announcementBar, linkUrl: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero Section Settings */}
        <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif text-base font-bold text-charcoal pb-2 border-b border-ivory-200">
            Homepage Hero Section
          </h2>

          <div>
            <label className="font-bold text-charcoal-600 block mb-1">Hero Main Headline</label>
            <input
              type="text"
              value={content.hero.headline}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, headline: e.target.value },
                })
              }
              className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
            />
          </div>

          <div>
            <label className="font-bold text-charcoal-600 block mb-1">Supporting Copy</label>
            <textarea
              rows={2}
              value={content.hero.supportingCopy}
              onChange={(e) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, supportingCopy: e.target.value },
                })
              }
              className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
            />
          </div>
        </div>

        {/* 3. Verified Contact Information */}
        <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-4">
          <h2 className="font-serif text-base font-bold text-charcoal pb-2 border-b border-ivory-200">
            Verified Customer Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Business Email</label>
              <input
                type="email"
                value={content.contactInfo.email}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, email: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Telephone</label>
              <input
                type="text"
                value={content.contactInfo.phone}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, phone: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-600 block mb-1">WhatsApp (Digits only)</label>
              <input
                type="text"
                value={content.contactInfo.whatsapp}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, whatsapp: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>

            <div>
              <label className="font-bold text-charcoal-600 block mb-1">Service Hours</label>
              <input
                type="text"
                value={content.contactInfo.openingHours}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, openingHours: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-charcoal-600 block mb-1">Physical Address (Optional)</label>
              <input
                type="text"
                placeholder="Leave blank for digital concierge (no physical address displayed)"
                value={content.contactInfo.address}
                onChange={(e) =>
                  setContent({
                    ...content,
                    contactInfo: { ...content.contactInfo, address: e.target.value },
                  })
                }
                className="w-full bg-ivory-50 border border-ivory-300 rounded p-2.5"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 bg-gold-600 hover:bg-gold-500 text-white rounded font-semibold text-xs tracking-wider uppercase shadow-gold-glow flex items-center space-x-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes to Content &amp; Settings</span>
        </button>
      </form>
    </div>
  );
};
