'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  speedLimit: string;
}

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    axios.get('/api/packages').then(res => {
      if (res.data.success) {
        setPackages(res.data.data);
      } else if (Array.isArray(res.data)) {
        setPackages(res.data);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-[#0A1628] text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1A56DB] opacity-10 transform skew-y-3 scale-150"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">Fast, Reliable Internet <span className="text-[#06B6D4]">Anywhere</span></h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Get connected instantly with Xuremi Net. Choose a package that fits your needs and start browsing in seconds.
          </p>
          <Link href="/auth/register" className="bg-[#06B6D4] hover:bg-[#0596b0] text-white font-bold py-4 px-10 rounded-full text-lg transition shadow-lg hover:shadow-cyan-500/50">
            Get Started
          </Link>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto flex-1 w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#0A1628]">Our Hotspot Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">Loading packages...</div>
          ) : packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition duration-300 flex flex-col">
              <h3 className="text-2xl font-bold text-[#0A1628] mb-2">{pkg.name}</h3>
              <div className="text-4xl font-extrabold text-[#1A56DB] mb-6">
                KES {pkg.price}
              </div>
              <ul className="text-gray-600 mb-8 space-y-3 flex-1">
                <li className="flex items-center justify-center gap-2"><span>🕒</span> {pkg.duration} Hours Access</li>
                <li className="flex items-center justify-center gap-2"><span>⚡</span> Up to {pkg.speedLimit || 'Unlimited'}</li>
                <li className="flex items-center justify-center gap-2"><span>🔄</span> Unlimited Data</li>
              </ul>
              <Link href="/auth/login" className="block w-full bg-[#0A1628] hover:bg-[#1A56DB] text-white font-bold py-3 rounded-lg transition shadow-md">
                Buy Now
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      <footer className="bg-[#0A1628] text-gray-400 py-8 text-center border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} Xuremi Net. All rights reserved.</p>
      </footer>
    </div>
  );
}
