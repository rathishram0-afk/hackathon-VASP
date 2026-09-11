'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Shuffle, AlertTriangle, CheckCircle2, ShieldAlert, Zap, Layers, ArrowUpRight } from 'lucide-react';

export default function MixerPage() {
  const { activeCase, mixerPatterns } = useInvestigation();

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
              <Shuffle className="w-8 h-8 text-amber-600" />
              <span>Mixer & Obfuscation Analysis</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              De-anonymization module detecting peel-chain liquidity siphoning, CoinJoin equal-denomination outputs, and rapid relay obfuscation.
            </p>
          </div>

          <Link
            href="/graph"
            className="px-6 py-3 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Layers className="w-4 h-4" />
            <span>Inspect Obfuscation Graph</span>
          </Link>
        </div>

        {/* Top Warning Banner / Clear Banner */}
        {mixerPatterns.length > 0 ? (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-200 flex items-center justify-center shrink-0 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-outfit font-bold text-base text-amber-900">
                Potential Obfuscation Pattern Detected ({mixerPatterns[0]?.confidence || 85}% Confidence)
              </h3>
              <p className="font-dmsans text-xs text-amber-800 leading-relaxed">
                Backend heuristic engine flagged an intermediary node matching tumbler / CoinJoin signature. Candidate attribution confidence has been adjusted accordingly.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-outfit font-bold text-base text-emerald-900">
                No Mixer / Tumbler Obfuscation Detected
              </h3>
              <p className="font-dmsans text-xs text-emerald-800 leading-relaxed">
                Direct on-chain transaction graph contains no high-frequency tumbler fan-out or equal-denomination splitting signatures along this trail.
              </p>
            </div>
          </div>
        )}

        {/* Mixer Pattern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mixerPatterns.length === 0 && (
            <div className="col-span-2 p-8 rounded-3xl bg-pure-white border border-surface-dim text-center space-y-2">
              <p className="font-outfit font-bold text-sm text-ink-black">Zero Obfuscation Flags Recorded</p>
              <p className="font-dmsans text-xs text-slate-gray">All observed hops represent standard direct UTXO transactions or exchange sweeps.</p>
            </div>
          )}
          {mixerPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold uppercase tracking-wider">
                    {pattern.patternType}
                  </span>
                  <span className="font-outfit text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {pattern.confidence}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-outfit text-xs pt-1">
                  <div className="p-3 rounded-xl bg-surface-container/60 space-y-1">
                    <span className="text-slate-gray block">Detected Hops:</span>
                    <span className="font-bold text-ink-black text-sm block">{pattern.detectedHops} Hops</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container/60 space-y-1">
                    <span className="text-slate-gray block">Volume Mixed:</span>
                    <span className="font-mono font-bold text-ink-black text-sm block">
                      {pattern.volumeMixedBtc} BTC
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                    Risk Indicators & Heuristics:
                  </span>
                  <ul className="space-y-1.5 font-dmsans text-xs text-slate-gray">
                    {pattern.riskIndicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-dim flex items-center justify-between font-outfit text-xs">
                <span className="text-slate-gray">Equal Amount Splitting:</span>
                <span className="font-bold text-ink-black">
                  {pattern.equalAmountOutputs ? 'CONFIRMED' : 'ASYMMETRIC PEEL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
