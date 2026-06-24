'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Mail, Zap, X } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [provisionModal, setProvisionModal] = useState<string | null>(null); // userId
  const [broadcastModal, setBroadcastModal] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('sms');

  useEffect(() => {
    axios.get('/api/customers').then(res => {
      if (res.data.success) setCustomers(res.data.data);
    });
    axios.get('/api/packages').then(res => {
      if (res.data.success) setPackages(res.data.data);
    });
  }, []);

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const handleProvision = async () => {
    if (!provisionModal || !selectedPackage) return;
    try {
      const res = await axios.post('/api/sessions/manual', {
        userId: provisionModal,
        packageId: selectedPackage
      });
      alert('Session provisioned successfully!');
      setProvisionModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to provision session');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg) return;
    const userIds = filtered.map(c => c.id);
    try {
      const res = await axios.post('/api/communications/broadcast', {
        type: broadcastType,
        message: broadcastMsg,
        userIds
      });
      alert(res.data.message);
      setBroadcastModal(false);
      setBroadcastMsg('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Broadcast failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#0A1628]">Customers</h1>
        <button 
          onClick={() => setBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] hover:bg-gray-800 text-white rounded-lg transition font-medium"
        >
          <Mail size={18} /> Broadcast to Filtered
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
            />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-5 font-semibold">Name</th>
              <th className="p-5 font-semibold">Phone</th>
              <th className="p-5 font-semibold">Email</th>
              <th className="p-5 font-semibold">Status</th>
              <th className="p-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="p-5 font-medium text-gray-800">{c.name}</td>
                <td className="p-5 text-gray-600 text-sm">{c.phone}</td>
                <td className="p-5 text-gray-600 text-sm">{c.email}</td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    Active
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => setProvisionModal(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition ml-auto"
                  >
                    <Zap size={14} /> Provision
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-gray-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Provision Modal */}
      {provisionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setProvisionModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20}/></button>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">Manual Provisioning</h2>
            <p className="text-sm text-gray-500 mb-4">Instantly activate a package for this user. This bypasses payment.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Package</label>
              <select 
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#06B6D4] outline-none"
                value={selectedPackage}
                onChange={e => setSelectedPackage(e.target.value)}
              >
                <option value="">-- Choose --</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.duration}h)</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleProvision}
              disabled={!selectedPackage}
              className="w-full bg-[#1A56DB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded transition"
            >
              Activate Now
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setBroadcastModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20}/></button>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">Broadcast Message</h2>
            <p className="text-sm text-gray-500 mb-4">Send a message to all {filtered.length} currently filtered customers.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select 
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#06B6D4] outline-none"
                value={broadcastType}
                onChange={e => setBroadcastType(e.target.value)}
              >
                <option value="sms">SMS via Africa's Talking</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#06B6D4] outline-none h-24"
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                placeholder="We will be doing maintenance..."
              />
            </div>
            <button 
              onClick={handleBroadcast}
              disabled={!broadcastMsg}
              className="w-full bg-[#0A1628] hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-2.5 rounded transition"
            >
              Send Broadcast
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
