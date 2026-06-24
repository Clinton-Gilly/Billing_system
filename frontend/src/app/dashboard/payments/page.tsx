'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/payments').then(res => {
      if (res.data.success) setPayments(res.data.data);
    }).catch(console.error);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="text-[#06B6D4]" size={36} />
        <h1 className="text-3xl font-bold text-[#0A1628]">Payment History</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-5 font-semibold">Receipt No.</th>
              <th className="p-5 font-semibold">Customer</th>
              <th className="p-5 font-semibold">Amount</th>
              <th className="p-5 font-semibold">Date</th>
              <th className="p-5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-gray-50 transition">
                <td className="p-5 font-mono text-sm font-bold text-gray-800">{p.receiptNumber || `XUR-${(p.id || '').slice(0,6).toUpperCase()}`}</td>
                <td className="p-5 font-medium text-gray-700">{p.invoice?.user?.name || 'Walk-in Customer'}</td>
                <td className="p-5 font-bold text-[#1A56DB]">KES {p.amount}</td>
                <td className="p-5 text-sm text-gray-500">{new Date(p.createdAt || Date.now()).toLocaleString()}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    p.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border border-green-200' :
                    p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {p.status || 'SUCCESS'}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No payment records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
