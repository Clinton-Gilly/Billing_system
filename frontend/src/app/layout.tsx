import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HotspotBilling — ISP Management System',
  description:
    'Manage hotspot packages, customer sessions, M-Pesa payments, and MikroTik routers from one dashboard.',
  keywords: ['hotspot', 'billing', 'MikroTik', 'M-Pesa', 'ISP', 'Kenya'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
