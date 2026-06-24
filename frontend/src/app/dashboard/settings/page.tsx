'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Server, Shield, Save, Search } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'router'|'roles'>('router');
  
  // Router State
  const [routerConfig, setRouterConfig] = useState({ host: '', port: 8728, username: '', password: '', name: 'Main Router' });
  const [routerSaving, setRouterSaving] = useState(false);

  // Roles State
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeTab === 'router') {
      fetchRouter();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchRouter = async () => {
    try {
      const res = await axios.get('/api/settings/router');
      if (res.data.data) {
        setRouterConfig(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/settings/roles');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveRouterConfig = async () => {
    setRouterSaving(true);
    try {
      await axios.post('/api/settings/router', routerConfig);
      alert('Router settings saved successfully');
      fetchRouter();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save router config');
    } finally {
      setRouterSaving(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.post('/api/settings/roles', { userId, role: newRole });
      alert('Role updated successfully');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="text-[#06B6D4]" size={36} />
        <h1 className="text-3xl font-bold text-[#0A1628]">Settings & Admin</h1>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('router')}
          className={`px-4 py-3 font-bold text-sm transition border-b-2 flex items-center gap-2 ${activeTab === 'router' ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Server size={18}/> Router Configuration
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 font-bold text-sm transition border-b-2 flex items-center gap-2 ${activeTab === 'roles' ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <Shield size={18}/> Role Management
        </button>
      </div>

      {activeTab === 'router' && (
        <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#0A1628] mb-6">MikroTik Router Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Router Name</label>
              <input 
                type="text" 
                value={routerConfig.name}
                onChange={e => setRouterConfig({...routerConfig, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#06B6D4] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host/IP Address</label>
                <input 
                  type="text" 
                  value={routerConfig.host}
                  onChange={e => setRouterConfig({...routerConfig, host: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#06B6D4] outline-none font-mono"
                  placeholder="192.168.88.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Port</label>
                <input 
                  type="number" 
                  value={routerConfig.port}
                  onChange={e => setRouterConfig({...routerConfig, port: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#06B6D4] outline-none font-mono"
                  placeholder="8728"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Username</label>
                <input 
                  type="text" 
                  value={routerConfig.username}
                  onChange={e => setRouterConfig({...routerConfig, username: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#06B6D4] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Password</label>
                <input 
                  type="password" 
                  value={routerConfig.password}
                  onChange={e => setRouterConfig({...routerConfig, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-[#06B6D4] outline-none"
                  placeholder="Leave as ******** to keep unchanged"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={saveRouterConfig}
              disabled={routerSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0A1628] hover:bg-gray-800 text-white rounded-lg transition font-bold disabled:opacity-50"
            >
              <Save size={18}/> {routerSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none transition"
              />
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-5 font-semibold">User</th>
                <th className="p-5 font-semibold">Contact</th>
                <th className="p-5 font-semibold">Current Role</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="p-5 font-medium text-gray-800">{u.name}</td>
                  <td className="p-5 text-gray-600 text-sm">
                    {u.email}<br/><span className="text-gray-400">{u.phone}</span>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {u.role === 'CUSTOMER' ? (
                      <button 
                        onClick={() => changeUserRole(u.id, 'ADMIN')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-bold transition ml-auto"
                      >
                        Promote to Admin
                      </button>
                    ) : (
                      <button 
                        onClick={() => changeUserRole(u.id, 'CUSTOMER')}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold transition ml-auto"
                      >
                        Demote to Customer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
