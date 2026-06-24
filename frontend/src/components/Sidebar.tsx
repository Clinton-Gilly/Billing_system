import Link from 'next/link';
import { LayoutDashboard, Users, Package, Activity, CreditCard, Router, Settings } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Packages', href: '/dashboard/packages', icon: Package },
    { name: 'Live Sessions', href: '/dashboard/sessions', icon: Activity },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Router Health', href: '/dashboard/router', icon: Router },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A1628] text-white h-screen fixed left-0 top-0 pt-16 flex flex-col border-r border-gray-800 z-40">
      <div className="p-6 text-lg font-bold border-b border-gray-800 text-[#06B6D4] uppercase tracking-wider">
        Admin Panel
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1A56DB] transition text-gray-300 hover:text-white"
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
