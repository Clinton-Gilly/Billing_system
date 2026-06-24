'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    revenue: 0,
    activeSessions: 0,
    customers: 0,
    unpaid: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/analytics').then(res => {
      if (res.data.success) {
        setStats({
          revenue: res.data.data.revenue || 0,
          activeSessions: res.data.data.activeSessions || 0,
          customers: res.data.data.customers || 0,
          unpaid: res.data.data.unpaid || 0
        });
        setChartData(res.data.data.chartData || []);
      }
    }).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Total Revenue (7d)</div>
          <div className="text-3xl font-bold text-[#1A56DB]">KES {stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Active Sessions</div>
          <div className="text-3xl font-bold text-[#06B6D4]">{stats.activeSessions}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Total Customers</div>
          <div className="text-3xl font-bold text-[#0A1628]">{stats.customers}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Unpaid Invoices</div>
          <div className="text-3xl font-bold text-red-500">{stats.unpaid}</div>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#0A1628] mb-6">Revenue Over Time</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `Ksh ${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#06B6D4', stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
