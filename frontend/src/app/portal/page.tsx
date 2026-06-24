'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import SessionCountdown from '@/components/SessionCountdown';

export default function PortalDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/sessions').then(res => {
      // Assuming active session is returned in data array
      const active = res.data.data?.find((s: any) => s.status === 'ACTIVE');
      setSession(active);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading your portal...</div>;

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#0A1628]">My Portal</h1>
        <Link href="/portal/invoices" className="text-sm font-semibold text-[#1A56DB] hover:text-[#06B6D4] transition">View Invoices &rarr;</Link>
      </div>
      
      {session ? (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Active Session Remaining</h2>
          <SessionCountdown expiresAt={session.expiresAt} />
          
          <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-[#0A1628] mb-4">Connection Details</h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="text-gray-500 text-sm">Username</div>
              <div className="font-mono font-bold text-gray-800">{session.username}</div>
              <div className="text-gray-500 text-sm">Password</div>
              <div className="font-mono font-bold text-gray-800">{session.password}</div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Connect to the Xuremi Net Wi-Fi and enter these credentials to browse.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-md border border-gray-100 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛜</div>
          <h2 className="text-2xl font-bold text-[#0A1628] mb-4">No Active Session</h2>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            You currently don't have an active internet session. Purchase a package to get connected immediately.
          </p>
          <Link href="/portal/packages" className="inline-block bg-[#1A56DB] hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-lg transition shadow-md">
            Buy Internet Package
          </Link>
        </div>
      )}
    </div>
  );
}
