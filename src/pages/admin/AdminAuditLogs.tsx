import React from 'react';
import { StoreService } from '../../services/storeService';
import { ShieldAlert, ShieldCheck, Clock, User } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const logs = StoreService.getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-ivory-300">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block">
          Security &amp; Compliance
        </span>
        <h1 className="font-serif text-3xl font-bold text-charcoal">System Audit Logs</h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Immutable event log of administrative actions, inventory movements, order status adjustments, and StyleMatch approvals.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory-100 border-b border-ivory-300 text-charcoal-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor / Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="p-3.5 text-charcoal-500 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-charcoal block">{log.actorEmail}</span>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        log.actorRole === 'admin'
                          ? 'bg-gold-100 text-gold-900'
                          : log.actorRole === 'system'
                          ? 'bg-charcoal-100 text-charcoal-700'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-charcoal text-[11px]">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-mono text-charcoal-500 text-[11px]">
                    {log.targetType}:{log.targetId}
                  </td>
                  <td className="p-3.5 text-charcoal-700 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
