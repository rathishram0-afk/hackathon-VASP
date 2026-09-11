"use client";

import { useState, useEffect } from "react";
import { Search, Clock, Bell, Download, HelpCircle, ShieldAlert } from "lucide-react";
import { useForensicStore } from "@/store/useForensicStore";
import Link from "next/link";

export default function Header() {
  const [timeStr, setTimeStr] = useState("UTC 14:32:05");
  const { setLE28ModalOpen } = useForensicStore();

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTimeStr(`UTC ${d.toISOString().substring(11, 19)}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 flex items-center justify-between gap-4">
      {/* Case Identity Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant/30">
          <span className="font-mono text-secondary-container font-semibold text-xs">
            #VT-0921
          </span>
          <span className="text-outline-variant">•</span>
          <span className="font-label-sm text-on-surface tracking-wider uppercase truncate text-xs">
            SCAM-LINKED MULTI-HOP CLUSTER
          </span>
          <span className="px-1.5 py-0.5 rounded bg-error-container text-error font-label-sm font-bold text-[9px] tracking-wider uppercase">
            HIGH PRIORITY
          </span>
        </div>
      </div>

      {/* Quick Search Input */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-outline w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search wallet (0x...), tx hash, entity or investigation ID..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-14 py-1.5 font-mono text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary-container transition-colors"
          />
          <div className="absolute right-2 flex items-center gap-0.5">
            <kbd className="font-mono px-1.5 py-0.5 text-[10px] rounded bg-surface-container-high border border-outline-variant/40 text-outline">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-mono text-xs text-outline">
          <Clock className="w-3.5 h-3.5 text-secondary" />
          <span>{timeStr}</span>
        </div>

        <button
          onClick={() => setLE28ModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-error-container/30 border border-error-container text-error font-label-sm text-xs hover:bg-error-container/50 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Form LE-28 Freeze</span>
        </button>

        <button className="relative p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface-container-low"></span>
        </button>

        <Link
          href="/dossier"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high text-on-surface font-label-md text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Export Dossier</span>
        </Link>

        <div className="h-4 w-px bg-outline-variant/40"></div>

        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-secondary-container/40 ring-1 ring-secondary-container/20 flex items-center justify-center font-bold text-secondary text-xs">
          MV
        </div>
      </div>
    </header>
  );
}
