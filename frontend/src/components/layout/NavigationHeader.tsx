'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Share2,
  ArrowLeftRight,
  Building,
  AlertTriangle,
  FileText,
  FileCheck,
  Search,
  Lock,
  Shield,
  Bell,
  Sun,
  Menu,
  X,
  MoreVertical,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useInvestigation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'New Investigation', path: '/trace', icon: PlusCircle },
    { label: 'Graph Explorer', path: '/graph', icon: Share2 },
    { label: 'Transactions', path: '/timeline', icon: ArrowLeftRight },
    { label: 'VASP Candidates', path: '/attribution', icon: Building },
    { label: 'Mixers & Alerts', path: '/mixer', icon: AlertTriangle },
    { label: 'Evidence', path: '/evidence', icon: FileText },
    { label: 'Reports', path: '/report', icon: FileCheck },
    { label: 'Address Registry', path: '/cases', icon: Search },
    { label: 'Freeze Action', path: '/freeze', icon: Lock },
    { label: 'Auth Portal', path: '/login', icon: LogIn },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/trace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* =========================================================================
          1. LEFT SIDEBAR NAVIGATION PANE (Fixed on Desktop, Drawer on Mobile)
         ========================================================================= */}
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0C0D0E] z-50 flex flex-col justify-between border-r border-[#1E2024] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand & Logo */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-[#1A1C20]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-signal-orange flex items-center justify-center text-ink-black shadow-xs shrink-0">
                <Shield className="w-5 h-5 text-ink-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-extrabold text-base tracking-wider text-pure-white uppercase leading-tight">
                  VASP <span className="text-signal-orange">TRACE</span>
                </span>
                <span className="font-outfit text-[10px] text-slate-400 font-medium tracking-wide">
                  Trace. Analyze. Attribute.
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1.5 font-outfit text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-signal-orange text-ink-black font-bold shadow-xs'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-ink-black' : 'text-[#9CA3AF]'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-[#1A1C20] space-y-3">
          {/* System Online Status Card */}
          <div className="p-3 rounded-xl bg-[#14161A] border border-[#22252B] flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="font-outfit font-bold text-xs text-emerald-400 leading-tight">
                System Online
              </span>
              <span className="font-dmsans text-[10px] text-slate-400 leading-tight">
                All services operational
              </span>
            </div>
          </div>

          {/* User Profile Footer Row */}
          <div className="flex items-center justify-between pt-1">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-signal-orange flex items-center justify-center text-ink-black font-bold text-xs shrink-0">
                  {user.avatarInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-outfit font-bold text-xs text-pure-white leading-tight truncate">
                    {user.name}
                  </span>
                  <span className="font-outfit text-[10px] text-slate-400 leading-tight truncate">
                    {user.badgeId} • {user.role}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-signal-orange font-outfit text-xs font-bold hover:underline"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Terminal</span>
              </Link>
            )}

            {isAuthenticated && (
              <button
                onClick={logout}
                title="Sign Out"
                className="text-slate-400 hover:text-signal-orange p-1 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. TOP HEADER BAR (Sits to the right of the Left Sidebar)
         ========================================================================= */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-pure-white border-b border-surface-dim z-40 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Global Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-ink-black hover:bg-surface-container"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-gray absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search wallet, transaction, or investigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container/70 font-dmsans text-xs text-ink-black pl-10 pr-12 py-2 rounded-xl border border-surface-dim/60 focus:outline-none focus:ring-1 focus:ring-ink-black placeholder:text-slate-gray"
            />
            <span className="absolute right-3 font-mono text-[10px] text-slate-gray border border-surface-dim px-1.5 py-0.5 rounded bg-pure-white shadow-2xs">
              ⌘ K
            </span>
          </form>
        </div>

        {/* Right: Theme Toggle, Notifications, User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-slate-gray hover:text-ink-black transition-colors"
          >
            <Sun className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-xl hover:bg-surface-container flex items-center justify-center text-slate-gray hover:text-ink-black transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-signal-orange ring-2 ring-pure-white"></span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-surface-dim">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-signal-orange flex items-center justify-center text-ink-black font-bold text-xs shrink-0">
                  {user.avatarInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left min-w-0">
                  <span className="font-outfit text-xs font-bold text-ink-black leading-none truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className="font-outfit text-[10px] text-slate-gray leading-tight mt-0.5">
                    {user.badgeId}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-gray hover:text-signal-orange p-1 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
