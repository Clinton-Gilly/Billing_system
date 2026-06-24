'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PortalPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>(''); // PENDING, SUCCESS, FAILED
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/packages').then(res => {
      if (res.data.success) setPackages(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleBuy = async (pkg: any) => {
    try {
      const res = await axios.post('/api/invoices', { amount: pkg.price, packageId: pkg.id });
      const pid = res.data.data?.paymentId || res.data.data?.id || 'dummy';
      setPaymentId(pid);
      setPaymentStatus('PENDING');
      setModalOpen(true);
      startPolling(pid);
    } catch (err) {
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const startPolling = (pid: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/payments/${pid}/status`);
        if (res.data.status === 'SUCCESS' || res.data.status === 'FAILED') {
          setPaymentStatus(res.data.status);
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 3000);
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading packages...</div>;

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Purchase Package</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col hover:border-[#06B6D4] hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-[#0A1628] mb-2">{pkg.name}</h3>
            <div className="text-3xl font-extrabold text-[#1A56DB] mb-6">KES {pkg.price}</div>
            <ul className="text-gray-600 mb-8 space-y-3 flex-1 text-sm font-medium">
              <li className="flex items-center gap-2"><span>🕒</span> {pkg.duration} Hours Access</li>
              <li className="flex items-center gap-2"><span>⚡</span> Up to {pkg.speedLimit || 'Unlimited'}</li>
            </ul>
            <button 
              onClick={() => handleBuy(pkg)}
              className="w-full bg-[#0A1628] hover:bg-[#1A56DB] text-white font-bold py-3 rounded-lg shadow transition"
            >
              Buy via M-Pesa
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-[#0A1628] mb-4">M-Pesa Payment</h2>
            
            {paymentStatus === 'PENDING' && (
              <>
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#06B6D4] rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-600 mb-2 font-medium">Check your phone.</p>
                <p className="text-sm text-gray-500">An STK Push has been sent. Please enter your PIN to confirm payment.</p>
              </>
            )}

            {paymentStatus === 'SUCCESS' && (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                <p className="text-gray-800 font-bold mb-2 text-lg">Payment Successful!</p>
                <p className="text-sm text-gray-500 mb-8">Your internet is now active.</p>
                <button onClick={() => window.location.href = '/portal'} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                  View Session Details
                </button>
              </>
            )}

            {paymentStatus === 'FAILED' && (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✕</div>
                <p className="text-gray-800 font-bold mb-2 text-lg">Payment Failed</p>
                <p className="text-sm text-gray-500 mb-8">You cancelled or the request timed out.</p>
                <button onClick={() => setModalOpen(false)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition">
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
