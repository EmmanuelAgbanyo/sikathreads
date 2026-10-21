import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Lock, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { StoreService } from '../services/storeService';

export const FAQs: React.FC = () => {
  const faqs = [
    {
      q: 'How does ordering work at Sika Threads?',
      a: 'Browse our collection, select your desired fabric and yardage, and submit your order details. Our team checks the physical cloth in our inventory, confirms your measurements, and contacts you directly via WhatsApp or phone to finalize cutting, delivery, and payment arrangements.',
    },
    {
      q: 'Are all your Kente cloths handwoven?',
      a: 'Yes. All fabrics listed under our Authentic Handwoven Kente category are genuine, multi-strip handwoven cloths crafted on traditional wooden looms in Bonwire and Adanwomase, Ashanti Region. We do not sell cheap printed polyester replicas as genuine Kente.',
    },
    {
      q: 'How does Sika StyleMatch AI work?',
      a: 'You describe your event, theme, preferred colours, and budget. Our AI matches your request against currently available catalogue products. Every recommendation is reviewed and approved by our styling team before the final email is sent to you, with an operational turnaround target of 3 to 5 minutes.',
    },
    {
      q: 'What is the standard selling unit for fabrics?',
      a: 'Depending on the textile type, fabrics are sold either by the yard (e.g. French bridal lace, Duchess satin) or by standard pieces (e.g. 6-yard pieces for GTP wax prints, or full traditional cloths for Kente). The selling unit and minimum order quantity are clearly indicated on every product page.',
    },
    {
      q: 'Can you source a fabric that is out of stock?',
      a: 'Yes! Through our Fabric Sourcing Concierge, you can submit an image or description of any fabric you desire. We will reach out to our network of master weavers and textile partners to procure it.',
    },
    {
      q: 'How does fabric collection and delivery work?',
      a: 'We coordinate nationwide doorstep and regional transit delivery across Ghana. If you prefer to collect your order personally in Accra, free direct collection can be arranged when our concierge verifies your order.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Help &amp; Guidance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-charcoal-600">
          Everything you need to know about fabric selection, Sika StyleMatch AI, and delivery across Ghana.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-2">
            <h3 className="font-serif font-bold text-base text-charcoal flex items-start">
              <span className="text-gold-700 mr-2 font-sans font-bold">Q:</span>
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gold-50 border border-gold-300 rounded-xl text-center space-y-3">
        <h3 className="font-serif font-bold text-base text-charcoal">Still have questions?</h3>
        <p className="text-xs text-charcoal-600 max-w-md mx-auto">
          Our fabric concierge is available on WhatsApp or telephone to assist with measurements and custom requests.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center px-5 py-2.5 bg-charcoal text-white rounded text-xs font-semibold hover:bg-gold transition-colors"
        >
          <span>Contact Concierge</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
};

export const DeliveryPolicy: React.FC = () => {
  const content = StoreService.getSiteContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
      <div className="border-b border-ivory-300 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
          Fulfilment Information
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Delivery &amp; Collection Policy
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Direct Pickup / Collection (Accra)</h2>
          <p>
            Customers in Accra can opt for free arranged collection. Once your fabric request is inspected, measured, and cut, our concierge will coordinate a convenient collection point and time with you. Pickups are typically available same-day or next-day after confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Regional Delivery Schedule &amp; Rates</h2>
          <p>
            We coordinate insured delivery via reliable courier partners across all 16 regions of Ghana. Proposed delivery fees are subject to final confirmation based on package weight and destination:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-ivory-300 text-left">
              <thead className="bg-ivory-100 border-b border-ivory-300">
                <tr>
                  <th className="p-3 font-bold text-charcoal">Region / Zone</th>
                  <th className="p-3 font-bold text-charcoal">Estimated Fee</th>
                  <th className="p-3 font-bold text-charcoal">Transit Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {content.deliverySettings.regions.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-ivory-50">
                    <td className="p-3 font-medium text-charcoal">{reg.name}</td>
                    <td className="p-3 font-bold text-gold-700">
                      {reg.fee === 0 ? 'Free' : `GHS ${reg.fee}`}
                    </td>
                    <td className="p-3 text-charcoal-500">{reg.estimatedDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Packaging &amp; Fabric Care</h2>
          <p>
            All luxury fabrics, including beaded lace and royal Kente, are carefully inspected, folded in protective tissue, and dispatched in weatherproof, sealed packaging to prevent moisture and transport damage.
          </p>
        </section>
      </div>
    </div>
  );
};

export const ReturnsPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
      <div className="border-b border-ivory-300 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-burgundy block mb-1">
          Store Guidelines
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Returns &amp; Cancellations Policy
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Cut Fabrics</h2>
          <p>
            Because textiles are cut to your customized yardage specifications from master bolts, cut fabrics cannot be returned or exchanged once cutting has been executed and confirmed by the customer, unless there is a verifiable manufacturing defect or weave fault.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Order Request Cancellation</h2>
          <p>
            You may cancel or amend an order request at any time prior to your formal confirmation with our concierge. Once cutting has been authorized and dispatched, cancellation is no longer possible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Inspection on Delivery</h2>
          <p>
            We urge all customers to inspect fabric cuts immediately upon delivery or collection. Any defect or discrepancy must be reported within 48 hours to our team with clear photographs.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
      <div className="border-b border-ivory-300 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
          Legal &amp; Privacy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Privacy Policy
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <p>
          Sika Threads is committed to protecting your personal information in accordance with the Ghana Data Protection Act, 2012 (Act 843).
        </p>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Information We Collect</h2>
          <p>
            We collect customer contact details (name, email address, telephone number), delivery addresses in Ghana, order request details, and StyleMatch styling preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Purpose of Processing</h2>
          <p>
            Your information is used solely to verify fabric stock, prepare order requests, coordinate regional delivery, and formulate bespoke AI-assisted recommendations. We do not sell or rent personal information to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Security Controls</h2>
          <p>
            All customer records and order histories are secured with least-privilege backend role controls and audit logs.
          </p>
        </section>
      </div>
    </div>
  );
};

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
      <div className="border-b border-ivory-300 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
          Terms of Service
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Terms and Conditions
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-ivory-300 shadow-subtle space-y-6 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">1. Order Request Status</h2>
          <p>
            All transactions initiated through the website constitute <strong>Order Requests</strong>. The submission of an order request does not guarantee availability until verified by our staff.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">2. Currency &amp; Pricing</h2>
          <p>
            All prices are stated in Ghana Cedis (GHS). We reserve the right to correct pricing errors before an order is confirmed with the customer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-charcoal">3. Handwoven Characteristics</h2>
          <p>
            Authentic Ghanaian Kente and Fugu fabrics are artisanal products woven by hand. Slight variations in tension, selvedge, and strip alignment are natural hallmarks of authentic hand-loomed textiles, not defects.
          </p>
        </section>
      </div>
    </div>
  );
};
