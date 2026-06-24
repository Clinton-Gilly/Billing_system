'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Wifi, Plus, Trash2, X, Server } from 'lucide-react';

export default function RoutersPage() {
  const [routers, setRouters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 8728,
    username: '',
    password: '',
    location: ''
  });

  useEffect(() => {
    fetchRouters();
  }, []);

  const fetchRouters = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/routers');
      setRouters(res.data.routers);
    } catch (err) {
      console.error('Failed to load routers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/routers', formData);
      setIsModalOpen(false);
      setFormData({ name: '', host: '', port: 8728, username: '', password: '', location: '' });
      fetchRouters();
    } catch (err) {
      console.error('Failed to save router', err);
      alert('Failed to save router');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this router?')) return;
    try {
      await api.delete(`/routers/${id}`);
      fetchRouters();
    } catch (err) {
      console.error('Failed to delete router', err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">MikroTik Routers</h1>
          <p className="text-gray-400">Manage your connected access points and their credentials.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Router
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-gray-500">Loading routers...</p>
        ) : routers.length === 0 ? (
          <div className="col-span-full p-10 text-center border border-dashed border-gray-700 rounded-2xl">
            <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Routers Configured</h3>
            <p className="text-gray-400">Add a MikroTik router to start provisioning users automatically.</p>
          </div>
        ) : (
          routers.map((router) => (
            <div key={router.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleDelete(router.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{router.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-sm text-gray-400">{router.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Host IP</span>
                  <span className="font-mono text-gray-300">{router.host}:{router.port}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">API User</span>
                  <span className="font-mono text-gray-300">{router.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="text-gray-300">{router.location || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">New Router</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Friendly Name</label>
                <input required type="text" placeholder="e.g. Main Office Router" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">IP Address</label>
                  <input required type="text" placeholder="192.168.88.1" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">API Port</label>
                  <input required type="number" value={formData.port} onChange={e => setFormData({...formData, port: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none font-mono text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">API Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">API Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location (Optional)</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors">
                  Save Router
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
