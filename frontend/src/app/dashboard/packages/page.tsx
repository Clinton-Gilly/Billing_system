'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus } from 'lucide-react';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);

  const fetchPackages = () => {
    axios.get('/api/packages').then(res => {
      if (res.data.success) setPackages(res.data.data);
    });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await axios.delete(`/api/packages/${id}`);
      fetchPackages();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 w-full">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Manage Packages</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-5 font-semibold">Name</th>
                <th className="p-5 font-semibold">Price (KES)</th>
                <th className="p-5 font-semibold">Duration (hrs)</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition">
                  <td className="p-5 font-bold text-[#0A1628]">{pkg.name}</td>
                  <td className="p-5 font-bold text-[#1A56DB]">{pkg.price}</td>
                  <td className="p-5 text-gray-600 text-sm">{pkg.duration}</td>
                  <td className="p-5 flex gap-2 justify-end">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-600 hover:bg-red-100 rounded transition"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-gray-500">No packages found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white p-8 rounded-xl shadow-sm border border-gray-100 lg:sticky lg:top-8">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="text-[#06B6D4]" size={24} />
          <h2 className="text-xl font-bold text-[#0A1628]">Create Package</h2>
        </div>
        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Name</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#06B6D4] outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (KES)</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#06B6D4] outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (Hours)</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#06B6D4] outline-none transition" />
          </div>
          <button type="submit" className="w-full bg-[#0A1628] hover:bg-[#1A56DB] text-white font-bold py-3 rounded-lg transition shadow-md mt-4">
            Save Package
          </button>
        </form>
      </div>
    </div>
  );
}
