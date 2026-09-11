'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { D3TransactionGraph } from '@/components/graph/D3TransactionGraph';
import { NodeDetailDrawer } from '@/components/drawer/NodeDetailDrawer';
import { useInvestigation } from '@/hooks/useInvestigation';
import {
  ShieldAlert,
  Building,
  Layers,
  ArrowUpRight,
  CheckCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { activeCase, attributions, evidence, mixerPatterns, graphData } = useInvestigation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 lg:pl-64">
        {/* Workspace Top Banner */}
        <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
                CASE #{activeCase.id}
              </span>
              <span className="text-xs text-slate-gray font-outfit font-medium">• {activeCase.lastUpdated}</span>
            </div>
            <h1 className="font-outfit font-bold text-2xl text-ink-black">
              {activeCase.title}
            </h1>
            <p className="font-dmsans text-xs text-slate-gray max-w-3xl leading-relaxed">
              {activeCase.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/freeze"
              className="px-5 py-2.5 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-xs hover:bg-signal-orange-light transition-colors shadow-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Draft Subpoena</span>
            </Link>
            <Link
              href="/report"
              className="px-4 py-2.5 rounded-full bg-pure-white border border-surface-dim text-ink-black font-outfit font-semibold text-xs hover:bg-surface-container-high transition-colors"
            >
              <span>View Report</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-2">
            <span className="font-outfit text-xs text-slate-gray font-medium">Exfiltrated Principal</span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-bold text-2xl text-ink-black">{activeCase.totalVolumeBtc} BTC</span>
              <span className="font-outfit text-xs text-signal-orange font-bold">Primary Scope</span>
            </div>
            <span className="font-mono text-xs text-slate-gray block">${activeCase.totalVolumeUsd.toLocaleString('en-US')} USD</span>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-2">
            <span className="font-outfit text-xs text-slate-gray font-medium">Primary VASP Candidate</span>
            <div className="flex items-baseline justify-between">
              <span className="font-outfit font-bold text-2xl text-ink-black">{activeCase.candidateVasp}</span>
              <span className="font-outfit text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {activeCase.confidenceScore}% Match
              </span>
            </div>
            <span className="font-outfit text-xs text-slate-gray block truncate">
              {attributions[0]?.clusterId || 'Cluster Heuristic'} ({attributions[0]?.entityType || 'Analysis Pending'})
            </span>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-2">
            <span className="font-outfit text-xs text-slate-gray font-medium">Traversal Trajectory</span>
            <div className="flex items-baseline justify-between">
              <span className="font-outfit font-bold text-2xl text-ink-black">
                {attributions[0]?.hopDistance ? `${attributions[0].hopDistance} Rapid Hops` : `${graphData.nodes.length} Graph Nodes`}
              </span>
              <span className="font-outfit text-xs text-slate-gray">{graphData.edges.length} Tx Links</span>
            </div>
            <span className="font-outfit text-xs text-slate-gray block">
              {activeCase.summary.includes('Live backend') ? 'On-Chain UTXO Graph' : 'Block 842,900 → 842,912'}
            </span>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-2">
            <span className="font-outfit text-xs text-slate-gray font-medium">Overall Risk Rating</span>
            <div className="flex items-baseline justify-between">
              <span className="font-outfit font-bold text-2xl text-error">{activeCase.riskScore}/100</span>
              <span className="font-outfit text-xs font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                {activeCase.riskLevel}
              </span>
            </div>
            <span className="font-outfit text-xs text-slate-gray block">
              {mixerPatterns.length > 0 ? 'Obfuscation Flag Detected' : 'Direct Custodial Inflow'}
            </span>
          </div>
        </div>

        {/* Central D3 Graph Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-outfit font-bold text-xl text-ink-black flex items-center gap-2">
              <Layers className="w-5 h-5 text-signal-orange" />
              <span>Interactive Transaction Flow Graph</span>
            </h2>
            <Link
              href="/graph"
              className="font-outfit text-xs font-bold text-signal-orange hover:underline flex items-center gap-1"
            >
              <span>Full Screen Graph Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <D3TransactionGraph height={520} />
        </div>

        {/* Bottom Section: VASP Leaderboard & Evidence Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: VASP Attribution Leaderboard */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit font-bold text-lg text-ink-black flex items-center gap-2">
                <Building className="w-5 h-5 text-signal-orange" />
                <span>Candidate VASP Attribution Leaderboard</span>
              </h3>
              <Link href="/attribution" className="font-outfit text-xs text-slate-gray hover:text-ink-black font-semibold">
                View All Rank Details →
              </Link>
            </div>

            <div className="space-y-3">
              {attributions.map((vasp, index) => (
                <div
                  key={vasp.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                    index === 0
                      ? 'bg-lifted-cream border-signal-orange/40 shadow-sm'
                      : 'bg-pure-white border-surface-dim hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-outfit font-bold text-xs ${
                        index === 0 ? 'bg-ink-black text-pure-white' : 'bg-surface-container text-slate-gray'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-outfit font-bold text-base text-ink-black">{vasp.name}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-[10px] uppercase">
                            Primary Match
                          </span>
                        )}
                      </div>
                      <span className="font-dmsans text-xs text-slate-gray">
                        {vasp.entityType} • {vasp.jurisdiction}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-ink-black block">
                        {vasp.supportingVolumeBtc} BTC
                      </span>
                      <span className="font-outfit text-[11px] text-slate-gray">Supporting Flow</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span
                        className={`font-outfit font-bold text-lg block ${
                          vasp.confidenceScore >= 80 ? 'text-signal-orange' : 'text-slate-gray'
                        }`}
                      >
                        {vasp.confidenceScore}%
                      </span>
                      <span className="font-outfit text-[10px] text-slate-gray uppercase">Confidence</span>
                    </div>

                    <Link
                      href="/attribution"
                      className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-ink-black transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Evidence Summary */}
          <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit font-bold text-lg text-ink-black flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Evidence Reasoning</span>
                </h3>
                <span className="font-outfit text-xs text-slate-gray font-bold">
                  {evidence.length} Signals
                </span>
              </div>

              <div className="space-y-3">
                {evidence.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-surface-container/60 space-y-1">
                    <div className="flex items-center justify-between font-outfit text-xs">
                      <span className="font-bold text-ink-black truncate">{item.title}</span>
                      <span className="font-mono font-bold text-signal-orange">+{item.confidenceContribution}%</span>
                    </div>
                    <p className="font-dmsans text-[11px] text-slate-gray line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/evidence"
              className="w-full py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-outfit font-bold text-xs text-ink-black text-center block mt-4"
            >
              Inspect Full Evidence Matrix →
            </Link>
          </div>
        </div>
      </main>

      <NodeDetailDrawer />
      <Footer />
    </div>
  );
}
