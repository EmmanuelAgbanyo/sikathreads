import React, { useState } from 'react';
import { StoreService } from '../../services/storeService';
import { ContactEnquiry } from '../../types';
import { MessageSquare, CheckCircle, Mail, Phone, Clock } from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(() => StoreService.getEnquiries());

  const handleUpdateStatus = (id: string, newStatus: ContactEnquiry['status']) => {
    const item = enquiries.find((e) => e.id === id);
    if (!item) return;

    item.status = newStatus;
    StoreService.saveEnquiry(item);
    setEnquiries([...StoreService.getEnquiries()]);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Client Communication
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Customer Inquiries</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Review incoming messages from the contact form and manage response status.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-ivory-300 text-center space-y-3 shadow-subtle">
          <MessageSquare className="w-12 h-12 text-charcoal-300 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-charcoal">No Inquiries Received</h2>
          <p className="text-xs text-charcoal-500">
            Messages sent via the Contact Us page will be recorded here safely.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white p-6 rounded-xl border border-ivory-300 shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ivory-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                    Subject: {enq.subject}
                  </span>
                  <h3 className="font-serif font-bold text-base text-charcoal">
                    {enq.name} ({enq.email})
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      enq.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : enq.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {enq.status}
                  </span>
                  <select
                    value={enq.status}
                    onChange={(e) => handleUpdateStatus(enq.id, e.target.value as ContactEnquiry['status'])}
                    className="text-xs bg-ivory-50 border border-ivory-300 rounded p-1"
                  >
                    <option value="new">Mark New</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-charcoal-700 leading-relaxed bg-ivory-50 p-4 rounded-lg border border-ivory-200">
                "{enq.message}"
              </p>

              <div className="flex justify-between items-center text-[11px] text-charcoal-400 pt-1">
                <span>Received on {new Date(enq.createdAt).toLocaleDateString()} at {new Date(enq.createdAt).toLocaleTimeString()}</span>
                {enq.phone && <span>Phone: {enq.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
