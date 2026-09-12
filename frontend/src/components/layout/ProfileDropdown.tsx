'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/context/AuthContext';
import {
  UserCheck,
  Shield,
  Briefcase,
  KeyRound,
  ExternalLink,
  LogOut,
  FolderLock,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ProfileDropdownProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-pure-white border border-surface-dim shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-ink-black"
    >
      {/* Header with Avatar & Investigator Details */}
      <div className="p-5 bg-gradient-to-br from-surface-container/80 to-surface-container/30 border-b border-surface-dim relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-gray hover:text-ink-black p-1 transition-colors"
          title="Close profile"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-signal-orange flex items-center justify-center text-ink-black font-extrabold text-base shadow-sm shrink-0">
            {user.avatarInitials}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-outfit font-bold text-sm text-ink-black truncate">
                {user.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold shrink-0">
                ACTIVE
              </span>
            </div>
            <p className="font-dmsans text-xs text-slate-gray truncate">{user.email}</p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 font-outfit text-xs">
          <div className="p-2.5 rounded-xl bg-pure-white/80 border border-surface-dim/60 space-y-0.5">
            <span className="text-[10px] text-slate-gray font-medium uppercase tracking-wider block">
              Badge ID
            </span>
            <span className="font-mono font-bold text-ink-black">{user.badgeId}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-pure-white/80 border border-surface-dim/60 space-y-0.5">
            <span className="text-[10px] text-slate-gray font-medium uppercase tracking-wider block">
              Clearance
            </span>
            <span className="font-semibold text-signal-orange">{user.clearanceLevel}</span>
          </div>
        </div>
      </div>

      {/* Agency & Unit Banner */}
      <div className="px-5 py-3 border-b border-surface-dim flex items-center gap-2.5 text-xs text-slate-gray font-dmsans bg-surface-container/20">
        <Shield className="w-4 h-4 text-signal-orange shrink-0" />
        <span className="truncate">{user.agency}</span>
      </div>

      {/* Quick Navigation Items */}
      <div className="p-3 space-y-1 font-outfit text-xs">
        <Link
          href="/cases"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-ink-black"
        >
          <div className="flex items-center gap-2.5">
            <FolderLock className="w-4 h-4 text-slate-gray" />
            <span className="font-medium">Assigned Cases & Registry</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-gray/60" />
        </Link>

        <Link
          href="/freeze"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-ink-black"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-slate-gray" />
            <span className="font-medium">Subpoena & Legal Freezes</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-gray/60" />
        </Link>

        {/* Theme Quick Toggle inside profile */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-ink-black"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-signal-orange" />
            ) : (
              <Moon className="w-4 h-4 text-slate-gray" />
            )}
            <span className="font-medium">
              Appearance: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <span className="text-[11px] text-slate-gray font-mono">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Footer Sign Out Button */}
      <div className="p-3 bg-surface-container/30 border-t border-surface-dim">
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-outfit font-bold text-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Terminal</span>
        </button>
      </div>
    </div>
  );
};
