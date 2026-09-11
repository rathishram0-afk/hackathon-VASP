'use client';

import React from 'react';
import Link from 'next/link';
import { useInvestigation } from '@/hooks/useInvestigation';
import {
  Folder,
  Layers,
  RotateCcw,
  Download,
  Share2,
  Clock,
  ArrowLeftRight,
  Building,
  AlertTriangle,
  Bell,
  Coins,
  Network
} from 'lucide-react';

export const CaseScopeBar: React.FC = () => {
  const { activeCase, casesList, selectCase, attributions, mixerPatterns } = useInvestigation();

  return (
    <div className="lg:pl-64 pt-16 w-full bg-canvas-cream">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-6 pb-2 space-y-5">
        {/* Top Scope Row: Case Title & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-outfit text-xs">
              <span className="text-slate-gray font-bold uppercase tracking-wider">
                INVESTIGATION #{activeCase.id}
              </span>
              <span className="text-slate-gray">•</span>
              <select
                value={activeCase.id}
                onChange={(e) => selectCase(e.target.value)}
                className="bg-surface-container px-2.5 py-0.5 rounded-lg text-xs font-bold text-ink-black border border-surface-dim focus:outline-none cursor-pointer"
              >
                {casesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    Switch to #{c.id} ({c.title.substring(0, 24)}...)
                  </option>
                ))}
              </select>
            </div>

            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-ink-black uppercase tracking-tight">
              {activeCase.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 font-outfit text-xs pt-0.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-signal-orange text-ink-black font-bold uppercase tracking-wide text-[11px] shadow-2xs">
                ★ {activeCase.status.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1 text-slate-gray">
                <Clock className="w-3.5 h-3.5" />
                Updated {activeCase.lastUpdated}
              </span>
              <span className="text-slate-gray hidden sm:inline">•</span>
              <span className="text-slate-gray">
                Synced at <strong className="text-ink-black">Block {activeCase.createdBlock}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons Cluster (Matching Image) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/trace"
              className="px-4 py-2 rounded-xl bg-ink-black hover:bg-ink-black/80 text-pure-white font-outfit font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Trace Again</span>
            </Link>

            <Link
              href="/report"
              className="px-4 py-2 rounded-xl bg-pure-white hover:bg-surface-container border border-surface-dim text-ink-black font-outfit font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-gray" />
              <span>Export Report</span>
            </Link>

            <Link
              href="/freeze"
              className="px-4 py-2 rounded-xl bg-signal-orange hover:bg-signal-orange-light text-ink-black font-outfit font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Dossier</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Ribbon (Matching the 8 Cards in the Image) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-outfit text-xs">
          {/* 1. Source Wallet */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Folder className="w-3.5 h-3.5 text-signal-orange" />
              <span>Source Wallet</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink-black block truncate">
              {activeCase.sourceWallet.substring(0, 6)}...{activeCase.sourceWallet.substring(activeCase.sourceWallet.length - 4)}
            </span>
          </div>

          {/* 2. Blockchain */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Layers className="w-3.5 h-3.5 text-signal-orange" />
              <span>Blockchain</span>
            </div>
            <span className="text-xs font-bold text-ink-black block truncate">
              {activeCase.network.replace(' Mainnet', ' (BTC)')}
            </span>
          </div>

          {/* 3. Transactions */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <ArrowLeftRight className="w-3.5 h-3.5 text-signal-orange" />
              <span>Transactions</span>
            </div>
            <span className="text-sm font-bold text-ink-black block">
              {activeCase.walletIntel.txCount * 45}
            </span>
          </div>

          {/* 4. Max Hops */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Network className="w-3.5 h-3.5 text-signal-orange" />
              <span>Max Hops</span>
            </div>
            <span className="text-sm font-bold text-ink-black block">
              4
            </span>
          </div>

          {/* 5. Value Traced */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Coins className="w-3.5 h-3.5 text-signal-orange" />
              <span>Value Traced</span>
            </div>
            <span className="text-xs font-bold text-ink-black block truncate">
              {activeCase.totalVolumeBtc} BTC
            </span>
          </div>

          {/* 6. Candidate VASPs */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Building className="w-3.5 h-3.5 text-signal-orange" />
              <span>Candidate VASPs</span>
            </div>
            <span className="text-xs font-bold text-ink-black block truncate">
              {attributions.length} Found
            </span>
          </div>

          {/* 7. Mixer Alerts */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-error" />
              <span>Mixer Alerts</span>
            </div>
            <span className="text-xs font-bold text-error block truncate">
              {mixerPatterns.length} Suspected
            </span>
          </div>

          {/* 8. Active Alerts */}
          <div className="p-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-gray text-[11px]">
              <Bell className="w-3.5 h-3.5 text-signal-orange" />
              <span>Active Alerts</span>
            </div>
            <span className="text-xs font-bold text-ink-black block truncate">
              3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
