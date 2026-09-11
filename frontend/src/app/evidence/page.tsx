'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { CheckCircle2, ShieldAlert, Fingerprint, Layers, ExternalLink, ArrowRight, Zap } from 'lucide-react';

export default function EvidencePage() {
  const { activeCase, evidence } = useInvestigation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-8 lg:pl-64">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
              CASE #{activeCase.id}
            </span>
            <h1 className="font-outfit font-bold text-3xl text-ink-black flex items-center gap-3 mt-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <span>Attribution Evidence Engine</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              Analytical reasoning breakdown supporting the {activeCase.confidenceScore}% candidate attribution for {activeCase.candidateVasp}.
            </p>
          </div>

          <Link
            href="/report"
            className="px-6 py-3 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Certified Evidence Report</span>
          </Link>
        </div>

        {/* Evidence Signals Matrix */}
        <div className="space-y-4">
          <h2 className="font-outfit font-bold text-xl text-ink-black">
            Verified On-Chain Evidence Signals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evidence.length === 0 && (
              <div className="col-span-2 p-8 rounded-3xl bg-pure-white border border-surface-dim text-center space-y-2">
                <p className="font-outfit font-bold text-sm text-ink-black">No Evidence Signals for Current Scope</p>
                <p className="font-dmsans text-xs text-slate-gray">Evidence signals are derived from reconstructed on-chain paths once a trace completes.</p>
              </div>
            )}
            {evidence.map((signal) => (
              <div
                key={signal.id}
                className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-gray/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold uppercase tracking-wider">
                      {signal.category.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-sm font-bold text-signal-orange">
                      +{signal.confidenceContribution}% Contribution
                    </span>
                  </div>

                  <h3 className="font-outfit font-bold text-lg text-ink-black">
                    {signal.title}
                  </h3>

                  <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
                    {signal.description}
                  </p>
                </div>

                {signal.txHash && (
                  <div className="pt-3 border-t border-surface-dim flex items-center justify-between font-outfit text-xs">
                    <span className="text-slate-gray">Transaction Hash:</span>
                    <a
                      href={`https://mempool.space/tx/${signal.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-ink-black hover:text-signal-orange font-bold flex items-center gap-1"
                    >
                      <span>{signal.txHash.substring(0, 10)}...</span>
                      <ExternalLink className="w-3 h-3 text-slate-gray" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Traversal Reasoning Flow */}
        <div className="p-8 rounded-[36px] bg-pure-white border border-surface-dim shadow-sm space-y-6">
          <h3 className="font-outfit font-bold text-xl text-ink-black">
            Forensic Traversal Reasoning Chain
          </h3>

          <div className="relative border-l-2 border-signal-orange/40 pl-6 ml-4 space-y-8 font-outfit text-xs">
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-signal-orange ring-4 ring-pure-white"></span>
              <div className="space-y-1">
                <span className="font-bold text-ink-black text-sm block">Step 1: Origin Scam Syndicate Exfiltration</span>
                <p className="font-dmsans text-slate-gray text-xs">
                  Address <code className="font-mono text-ink-black bg-surface-container px-1.5 py-0.5 rounded">3EktnHQ...gzQX</code> siphoned 23.22 BTC into initial relay hub.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-gray ring-4 ring-pure-white"></span>
              <div className="space-y-1">
                <span className="font-bold text-ink-black text-sm block">Step 2: Intermediary Peel-Chain Division</span>
                <p className="font-dmsans text-slate-gray text-xs">
                  Relay hub <code className="font-mono text-ink-black bg-surface-container px-1.5 py-0.5 rounded">1P3x8V...Lk99a</code> split funds into unhosted address bc1qm3k... and change.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-pure-white"></span>
              <div className="space-y-1">
                <span className="font-bold text-ink-black text-sm block">Step 3: Target VASP Hot-Wallet Sweep</span>
                <p className="font-dmsans text-slate-gray text-xs">
                  Deposit cluster <code className="font-mono text-ink-black bg-surface-container px-1.5 py-0.5 rounded">bc1qVaspDep91Binance884901</code> swept 8.40 BTC into Binance omnibus pool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
