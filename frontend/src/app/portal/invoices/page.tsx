'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PortalInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/invoices').then(res => {
      if (res.data.success) setInvoices(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading invoices...</div>;

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Invoice History</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-5 font-semibold">ID</th>
                <th className="p-5 font-semibold">Date</th>
                <th className="p-5 font-semibold">Amount</th>
                <th className="p-5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No invoices found.</td>
                </tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition">
                  <td className="p-5 font-mono text-xs text-gray-500">#{inv.id.slice(0, 8)}</td>
                  <td className="p-5 text-sm text-gray-800">{new Date(inv.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="p-5 text-sm font-bold text-[#0A1628]">KES {inv.amount}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700 border border-green-200' :
                      inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {inv.status || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
