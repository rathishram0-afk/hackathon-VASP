'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoading) return; // Prevent premature redirects while session initializes

    if (!isAuthenticated && !isLoginPage) {
      // Unauthenticated user attempting to access protected route
      router.replace('/login');
    } else if (isAuthenticated && isLoginPage) {
      // Authenticated user attempting to access /login
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Loading state while checking authentication session
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas-cream text-ink-black font-dmsans">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-signal-orange flex items-center justify-center text-ink-black shadow-md">
            <Shield className="w-6 h-6 animate-pulse text-ink-black" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className="font-outfit font-extrabold text-base tracking-wider uppercase text-ink-black">
              VASP <span className="text-signal-orange">TRACE</span>
            </span>
            <span className="font-outfit text-xs text-slate-gray font-medium tracking-wide">
              Verifying Security Credentials...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated user on protected route: hold render while redirecting to /login
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-cream" />
    );
  }

  // Authenticated user on /login: hold render while redirecting to /dashboard
  if (isAuthenticated && isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-cream" />
    );
  }

  return <>{children}</>;
};
