import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#0A1628] text-white p-4 flex justify-between items-center shadow-md relative z-50">
      <Link href="/" className="text-2xl font-bold text-[#06B6D4]">
        Xuremi Net
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/portal" className="hover:text-[#06B6D4] transition font-medium">Portal</Link>
        <Link href="/dashboard" className="hover:text-[#06B6D4] transition font-medium">Admin</Link>
        <div className="flex items-center gap-3 border-l border-gray-600 pl-4">
          <div className="w-8 h-8 rounded-full bg-[#1A56DB] flex items-center justify-center font-bold text-sm">
            U
          </div>
          <button className="text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
