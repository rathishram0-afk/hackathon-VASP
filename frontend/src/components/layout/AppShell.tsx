'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, PlusCircle, Activity, ChevronRight } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Workstation', href: '/investigate/case-vt-2024-8891' },
    { label: 'VASP Directory', href: '/attribution' },
    { label: 'Evidence Vault', href: '/evidence' },
    { label: 'Mixer Analysis', href: '/mixer-analysis' },
    { label: 'Reports', href: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col antialiased">
      {/* Top Banner Status Bar - Blockchain.com Inspired */}
      <header className="sticky top-0 z-40 bg-[#0B0E14] border-b border-[#1E293B]">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Identity & Nav Links */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#0C6CF2] to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <Shield className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold tracking-tight text-white font-sans">
                    VASP<span className="text-[#0C6CF2]">TRACE</span>
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#0C6CF2]/10 border border-[#0C6CF2]/30 text-[#0C6CF2] text-[10px] font-mono rounded font-semibold uppercase tracking-wider">
                    Forensics
                  </span>
                </div>
                <span className="text-[11px] text-[#64748B] block font-medium">
                  Trace the wallet. Reveal the VASP.
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-[#1E293B]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[#182030] text-white border border-[#1E293B]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[#121722]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Global Search Trigger & CTA */}
          <div className="flex items-center space-x-3">
            {/* Active Demo Case Quick Badge */}
            <Link
              href="/investigate/case-vt-2024-8891"
              className="hidden xl:flex items-center space-x-2 px-3 py-1.5 bg-[#121722] hover:bg-[#182030] border border-[#1E293B] rounded-md text-xs transition"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[#64748B]">Active:</span>
              <span className="font-mono text-white font-semibold">VT-2024-8891</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            </Link>

            {/* Search Trigger Input Box */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-3 px-3 py-1.5 bg-[#121722] hover:bg-[#182030] border border-[#1E293B] rounded-md text-xs text-[#94A3B8] hover:text-white transition group"
            >
              <Search className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white transition" />
              <span className="font-mono">Search wallet / case...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[#0B0E14] border border-[#1E293B] rounded text-[10px] text-[#64748B] font-mono">
                Ctrl + K
              </kbd>
            </button>

            {/* Primary Action Button - Blockchain.com Solid Blue */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-4 py-2 bg-[#0C6CF2] hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-semibold rounded-md shadow-md shadow-blue-500/10 flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Investigation</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6">
        {children}
      </main>

      {/* Global Keyboard Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
