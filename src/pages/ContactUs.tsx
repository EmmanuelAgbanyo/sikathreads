import React, { useState } from 'react';
import { StoreService } from '../services/storeService';
import { ContactEnquiry } from '../types';
import {
  Phone,
  Mail,
  Clock,
  MessageCircle,
  CheckCircle,
  Send,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  const content = StoreService.getSiteContent();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Fabric Availability Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, valid email address, and message.');
      return;
    }

    setSubmitting(true);

    try {
      const enquiry: ContactEnquiry = {
        id: 'enq-' + Date.now(),
        name,
        email,
        phone,
        subject,
        message,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      StoreService.saveEnquiry(enquiry);

      StoreService.recordAuditLog(
        email,
        'guest',
        'SUBMIT_CONTACT_ENQUIRY',
        'enquiry',
        enquiry.id,
        `Submitted contact inquiry: "${subject}"`
      );

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Client Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Get in Touch with Sika Threads
        </h1>
        <p className="text-sm text-charcoal-600">
          Have a question about fabric yardage, custom orders, or personal styling consultations? Our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl border border-ivory-300 shadow-premium">
          <h2 className="font-serif text-xl font-bold text-charcoal mb-6">Send an Inquiry</h2>

          {success && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-start space-x-2 animate-in fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <strong>Thank you!</strong> Your message has been received by our Accra concierge team. We will respond within 24 business hours.
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 055 771 8472 or +233 55 771 8472"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
                >
                  <option value="Fabric Availability Inquiry">Fabric Availability Inquiry</option>
                  <option value="Custom Kente Weaving Order">Custom Kente Weaving Order</option>
                  <option value="Bridal Lace Consultation">Bridal Lace Consultation</option>
                  <option value="Wholesale &amp; Group Orders">Wholesale &amp; Group Orders</option>
                  <option value="Existing Order Request Follow-up">Existing Order Request Follow-up</option>
                  <option value="Personal Styling Consultation">Personal Styling Consultation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                Your Message *
              </label>
              <textarea
                rows={5}
                required
                placeholder="How can Sika Threads assist with your textile requirements?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-sm bg-ivory-50 border border-ivory-300 rounded p-2.5 focus:ring-gold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-md bg-gold-600 hover:bg-gold-500 text-white font-semibold text-sm tracking-wide shadow-gold-glow flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        {/* Right: Concierge Details & Direct WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal pb-3 border-b border-ivory-200">
              Customer Concierge
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-charcoal-700">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Telephone</span>
                  <span>{content.contactInfo.phone}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Email</span>
                  <a href={`mailto:${content.contactInfo.email}`} className="text-gold-700 hover:underline">
                    {content.contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gold-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">Service Hours</span>
                  <span>{content.contactInfo.openingHours}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center font-bold text-emerald-900 text-sm">
                <MessageCircle className="w-4 h-4 text-emerald-600 mr-2" />
                Instant WhatsApp Support
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Need immediate fabric video previews or urgent yardage confirmations? Chat with our lead stylist directly on WhatsApp.
              </p>
              <a
                href={`https://wa.me/${content.contactInfo.whatsapp.replace(/\D/g, '')}?text=Hello%20Sika%20Threads,%20I'd%20like%20to%20inquire%20about%20your%20fabrics.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-900 underline underline-offset-2"
              >
                <span>Open WhatsApp Concierge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
