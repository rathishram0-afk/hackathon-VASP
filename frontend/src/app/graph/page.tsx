'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { D3TransactionGraph } from '@/components/graph/D3TransactionGraph';
import { NodeDetailDrawer } from '@/components/drawer/NodeDetailDrawer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Layers, Sliders, Info, Download, FileText, ArrowRight, Building } from 'lucide-react';

export default function GraphWorkspacePage() {
  const { activeCase, maxHopsFilter, setMaxHopsFilter } = useInvestigation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-6 lg:pl-64">
        {/* Workspace Top Header */}
        <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
                CASE #{activeCase.id}
              </span>
              <span className="text-xs text-slate-gray font-outfit font-medium">• Block {activeCase.createdBlock}</span>
            </div>
            <h1 className="font-outfit font-bold text-2xl text-ink-black flex items-center gap-2.5 mt-1">
              <Layers className="w-6 h-6 text-signal-orange" />
              <span>Full Transaction Graph Workspace</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-0.5">
              Interactive force-directed graph rendering transaction hops from origin scam vault to candidate VASP deposit cluster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/attribution"
              className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-outfit font-bold text-xs text-ink-black flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-signal-orange" />
              <span>View VASP Ranking</span>
            </Link>
            <Link
              href="/freeze"
              className="px-4 py-2 rounded-full bg-signal-orange text-pure-white hover:opacity-90 transition-opacity font-outfit font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft Subpoena</span>
            </Link>
          </div>
        </div>

        {/* Full Bleed Interactive D3 Canvas */}
        <D3TransactionGraph height={620} />

        {/* Traversal Instructions & Legend */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div>
              <span className="font-outfit font-bold text-xs text-ink-black block">Origin Source</span>
              <span className="font-dmsans text-[11px] text-slate-gray">Sanctioned scam syndicate vault</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container text-ink-black flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <span className="font-outfit font-bold text-xs text-ink-black block">Relay Intermediary</span>
              <span className="font-dmsans text-[11px] text-slate-gray">Peeling chain split relay</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <span className="font-outfit font-bold text-xs text-ink-black block">Obfuscation Mixer</span>
              <span className="font-dmsans text-[11px] text-slate-gray">CoinJoin equal-amount pool</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-ink-black text-signal-orange-light flex items-center justify-center text-xs font-bold">
              4
            </div>
            <div>
              <span className="font-outfit font-bold text-xs text-ink-black block">Target VASP (91%)</span>
              <span className="font-dmsans text-[11px] text-slate-gray">Binance deposit cluster</span>
            </div>
          </div>
        </div>
      </main>

      <NodeDetailDrawer />
      <Footer />
    </div>
  );
}
