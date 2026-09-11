"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Network,
  ArrowRightLeft,
  Building2,
  Bell,
  FileText,
  ShieldAlert,
  Activity,
  User,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "Investigations",
      href: "/",
      icon: Compass,
      badge: "#VT-0921",
      badgeColor: "bg-surface-container-highest text-primary font-mono text-[10px]",
      active: false,
    },
    {
      label: "Graph Explorer",
      href: "/graph",
      icon: Network,
      badge: "LIVE",
      badgeColor: "bg-tertiary-container/30 text-tertiary text-[9px] uppercase font-bold tracking-wide",
      active: pathname === "/graph",
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: ArrowRightLeft,
      active: pathname.startsWith("/transactions"),
    },
    {
      label: "Candidates",
      href: "/rankings",
      icon: Building2,
      subtext: "VASP Ranking",
      active: pathname === "/rankings" || pathname.startsWith("/candidate"),
    },
    {
      label: "Mixers & Alerts",
      href: "/mixers",
      icon: Bell,
      badge: "3",
      badgeColor: "bg-error-container text-error font-bold text-[10px]",
      active: pathname === "/mixers",
    },
    {
      label: "Dossier & Report",
      href: "/dossier",
      icon: FileText,
      active: pathname === "/dossier",
    },
    {
      label: "Form LE-28 Notice",
      href: "/notice",
      icon: ShieldAlert,
      active: pathname === "/notice",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-2 border-b border-outline-variant/20">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center font-bold text-on-primary-container text-sm">
            VT
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-headline-md text-base font-bold tracking-tight text-on-surface uppercase">
              VASP<span className="text-secondary-container">TRACE</span>
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-outline">
              Forensics v2.4
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-2">
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-outline px-2 py-1 font-semibold">
            Operations
          </div>
          <nav className="flex flex-col gap-0.5 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.active;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                    isActive
                      ? "bg-surface-container-high text-secondary-container font-semibold border-l-2 border-secondary-container shadow-inner"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.subtext && (
                    <span className="font-label-sm text-outline text-[10px]">
                      {item.subtext}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status & User Profile Footer */}
      <div className="p-3 border-t border-outline-variant/20 flex flex-col gap-2 bg-surface-container/40">
        <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span className="font-label-sm text-[10px] text-on-surface font-semibold tracking-wider">
                SYSTEM ONLINE
              </span>
            </div>
            <span className="font-mono text-outline text-[10px]">0.12ms</span>
          </div>
          <div className="font-mono text-outline-variant text-[11px] truncate flex items-center gap-1">
            <Activity className="w-3 h-3 text-secondary-container" />
            <span>BTC Synced #891,402</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-secondary font-bold text-xs">
              MV
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-surface-container-low"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-xs font-semibold text-on-surface truncate">
              Det. Marcus Vance
            </span>
            <span className="font-label-sm text-outline truncate text-[10px]">
              Sr. Financial Crime Analyst
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
