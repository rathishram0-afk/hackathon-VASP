'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

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
            Routing to Secure Terminal...
          </span>
        </div>
      </div>
    </div>
  );
}
