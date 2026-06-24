'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, PowerOff } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    axios.get('/api/sessions/active').then(res => {
      if (res.data.success) {
        setSessions(res.data.data);
      } else if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleTerminate = async (username: string) => {
    if (confirm(`Are you sure you want to terminate the session for ${username}?`)) {
      try {
        await axios.post('/api/mikrotik/terminate', { username }); // Example route mapping
        fetchSessions();
      } catch (err) {
        alert('Failed to terminate session.');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-[#06B6D4]" size={36} />
        <h1 className="text-3xl font-bold text-[#0A1628]">Live Router Sessions</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-800">
            {sessions.length} Active Connection{sessions.length !== 1 ? 's' : ''}
          </span>
          <button onClick={fetchSessions} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition">
            Refresh Data
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-5 font-semibold">Username</th>
              <th className="p-5 font-semibold">IP Address</th>
              <th className="p-5 font-semibold">Uptime</th>
              <th className="p-5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && sessions.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">Fetching live router data...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">No active sessions found on router.</td></tr>
            ) : sessions.map((session, idx) => (
              <tr key={session.id || idx} className="hover:bg-gray-50 transition">
                <td className="p-5 font-bold text-[#0A1628]">{session.user || session.username}</td>
                <td className="p-5 font-mono text-sm text-gray-600">{session.address || session.ip}</td>
                <td className="p-5 text-sm font-medium text-green-600">{session.uptime}</td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => handleTerminate(session.user || session.username)} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <PowerOff size={14} /> Terminate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
