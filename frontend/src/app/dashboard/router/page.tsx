'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Router as RouterIcon, Activity, Cpu, HardDrive } from 'lucide-react';

export default function RouterHealthPage() {
  const [resources, setResources] = useState<any>(null);
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRouterData = async () => {
    try {
      setError('');
      const [resHealth, resStats] = await Promise.all([
        axios.get('/api/mikrotik/health'),
        axios.get('/api/mikrotik/stats')
      ]);
      
      if (resHealth.data.success) {
        setResources(resHealth.data.data[0]); 
      }
      if (resStats.data.success) {
        setInterfaces(resStats.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to MikroTik router');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouterData();
    const interval = setInterval(fetchRouterData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !resources) return <div className="text-center mt-20 text-gray-500">Connecting to RouterOS...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <RouterIcon className="text-[#06B6D4]" size={36} />
          <h1 className="text-3xl font-bold text-[#0A1628]">Router Health & Diagnostics</h1>
        </div>
        <button onClick={fetchRouterData} className="px-4 py-2 bg-[#1A56DB] text-white rounded-lg shadow hover:bg-blue-700 transition font-bold text-sm">
          Refresh Now
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 font-medium">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-[#1A56DB] rounded-full"><Cpu size={24} /></div>
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">CPU Load</div>
            <div className="text-2xl font-bold text-[#0A1628]">{resources?.['cpu-load'] || 0}%</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full"><HardDrive size={24} /></div>
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Free Memory</div>
            <div className="text-2xl font-bold text-[#0A1628]">
              {resources?.['free-memory'] ? Math.round(resources['free-memory'] / 1024 / 1024) : 0} MB
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-full"><Activity size={24} /></div>
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wide">Uptime</div>
            <div className="text-2xl font-bold text-[#0A1628]">{resources?.uptime || 'N/A'}</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[#0A1628] mb-4">Network Interfaces</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-5 font-semibold">Name</th>
              <th className="p-5 font-semibold">Type</th>
              <th className="p-5 font-semibold">MAC Address</th>
              <th className="p-5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interfaces.map((iface, idx) => (
              <tr key={iface['.id'] || idx} className="hover:bg-gray-50 transition">
                <td className="p-5 font-bold text-[#0A1628]">{iface.name}</td>
                <td className="p-5 text-sm text-gray-600">{iface.type}</td>
                <td className="p-5 font-mono text-sm text-gray-500">{iface['mac-address']}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    iface.running === 'true' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {iface.running === 'true' ? 'RUNNING' : 'DOWN'}
                  </span>
                </td>
              </tr>
            ))}
            {interfaces.length === 0 && !error && (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">No interfaces found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
