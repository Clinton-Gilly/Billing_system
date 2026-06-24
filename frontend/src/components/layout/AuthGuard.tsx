'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'CUSTOMER';
  redirectTo?: string;
}

/**
 * AuthGuard — wraps protected pages
 * - Shows nothing while loading auth state
 * - Redirects to login if not authenticated
 * - Redirects if wrong role
 */
export default function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      const fallback = user.role === 'ADMIN' ? '/dashboard' : '/portal';
      router.replace(redirectTo || fallback);
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
