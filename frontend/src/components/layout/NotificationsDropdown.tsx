'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  Building,
  FileText,
  ShieldCheck,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';

export interface ForensicNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'alert' | 'vasp' | 'evidence' | 'system';
  unread: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: ForensicNotification[] = [
  {
    id: 'notif-1',
    title: 'Mixer Activity Flagged',
    description: 'Tumbler fan-out signature detected on Hop 2 (2.49 BTC routed through unverified intermediary).',
    timestamp: '12m ago',
    type: 'alert',
    unread: true,
    link: '/mixer',
  },
  {
    id: 'notif-2',
    title: 'VASP Candidate Identified',
    description: 'Binance Hot Wallet candidate attributed with 95% confidence score.',
    timestamp: '45m ago',
    type: 'vasp',
    unread: true,
    link: '/attribution',
  },
  {
    id: 'notif-3',
    title: 'Subpoena Evidence Compiled',
    description: 'Forensic evidence package generated for active case #TR-882 with full chain of custody.',
    timestamp: '2h ago',
    type: 'evidence',
    unread: true,
    link: '/evidence',
  },
  {
    id: 'notif-4',
    title: 'Mempool Provider Synced',
    description: 'On-chain RPC sync complete. Block height: 884,102. Zero provider latency detected.',
    timestamp: '5h ago',
    type: 'system',
    unread: false,
    link: '/dashboard',
  },
];

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<ForensicNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  if (!isOpen) return null;

  const filtered = filter === 'unread' ? notifications.filter((n) => n.unread) : notifications;

  const getIcon = (type: ForensicNotification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'vasp':
        return <Building className="w-4 h-4 text-signal-orange" />;
      case 'evidence':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-pure-white border border-surface-dim shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-ink-black"
    >
      {/* Header */}
      <div className="p-4 border-b border-surface-dim flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-outfit font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-signal-orange text-ink-black">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="text-[11px] text-slate-gray hover:text-signal-orange transition-colors flex items-center gap-1 font-outfit"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear all"
              className="text-slate-gray hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-surface-container/50 border-b border-surface-dim flex items-center gap-2 text-xs font-outfit">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-ink-black text-pure-white font-bold'
              : 'text-slate-gray hover:text-ink-black'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-ink-black text-pure-white font-bold'
              : 'text-slate-gray hover:text-ink-black'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-surface-dim/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-gray/40 mx-auto" />
            <p className="font-outfit text-xs font-semibold text-slate-gray">
              {filter === 'unread' ? 'No unread alerts' : 'No notifications'}
            </p>
            <p className="font-dmsans text-[11px] text-slate-gray/70">
              New forensic events will appear here in real-time.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-surface-container/60 cursor-pointer ${
                item.unread ? 'bg-signal-orange/5' : ''
              }`}
            >
              <div className="mt-0.5 p-2 rounded-xl bg-surface-container shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-outfit font-bold text-xs leading-tight truncate">
                    {item.title}
                  </span>
                  <span className="font-dmsans text-[10px] text-slate-gray shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="font-dmsans text-[11px] text-slate-gray leading-snug line-clamp-2">
                  {item.description}
                </p>
                {item.link && (
                  <Link
                    href={item.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[10px] font-outfit font-semibold text-signal-orange hover:underline pt-0.5"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-signal-orange shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Link */}
      <div className="p-2.5 bg-surface-container/30 border-t border-surface-dim text-center">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="text-xs font-outfit font-semibold text-slate-gray hover:text-signal-orange transition-colors"
        >
          Investigation Activity Feed →
        </Link>
      </div>
    </div>
  );
};
