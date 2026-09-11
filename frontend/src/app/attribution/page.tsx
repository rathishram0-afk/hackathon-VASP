'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Building, ShieldCheck, CheckCircle2, ChevronRight, FileText, ArrowUpRight, Globe, Lock } from 'lucide-react';

export default function AttributionPage() {
  const { activeCase, attributions } = useInvestigation();

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
              <Building className="w-8 h-8 text-signal-orange" />
              <span>VASP Attribution Leaderboard</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              Analytical ranking of Virtual Asset Service Providers (VASPs) identified as likely termination endpoints for exfiltrated funds.
            </p>
          </div>

          <Link
            href="/freeze"
            className="px-6 py-3 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-xs hover:bg-signal-orange-light transition-colors shadow-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Issue Freeze Notice to Primary VASP</span>
          </Link>
        </div>

        {/* Top Highlight Banner for Rank #1 */}
        {attributions[0] && (
          <div className="p-8 rounded-[36px] bg-ink-black text-pure-white shadow-[0_24px_48px_rgba(20,20,19,0.12)] space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-signal-orange/20 blur-3xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-signal-orange text-ink-black font-outfit text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Primary Attributed VASP ({attributions[0].confidenceScore}% Match)</span>
              </div>
              <span className="font-mono text-xs text-signal-orange-light font-bold">
                Cluster ID: {attributions[0].clusterId}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
              <div className="space-y-2 lg:col-span-2">
                <h2 className="font-outfit font-bold text-4xl text-pure-white">
                  {attributions[0].name}
                </h2>
                <p className="font-dmsans text-sm text-surface-variant leading-relaxed">
                  Consolidation deposit sweep detected into tagged {attributions[0].name} hot-wallet pool ({attributions[0].depositAddress}) within 2 blocks of exfiltration.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-highest/15 border border-pure-white/10 text-right space-y-1">
                <span className="font-outfit text-xs text-surface-variant font-medium block">Confidence Score</span>
                <span className="font-outfit font-bold text-5xl text-signal-orange-light block">
                  {attributions[0].confidenceScore}%
                </span>
                <span className="font-outfit text-[11px] text-pure-white/80 block">Verified Swept Deposit</span>
              </div>
            </div>

            <div className="pt-4 border-t border-pure-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 font-outfit text-xs relative z-10">
              <div>
                <span className="text-slate-gray block">Jurisdiction:</span>
                <span className="text-pure-white font-bold">{attributions[0].jurisdiction}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Compliance Attestation:</span>
                <span className="text-pure-white font-bold">{attributions[0].kycAttestation}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Supporting Inflow Volume:</span>
                <span className="text-signal-orange-light font-mono font-bold">{attributions[0].supportingVolumeBtc} BTC</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranked Leaderboard Table */}
        <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-4">
          <h3 className="font-outfit font-bold text-lg text-ink-black">
            Complete Candidate VASP Rankings
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-outfit text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-dim text-slate-gray font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">VASP / Exchange Entity</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Deposit Address Cluster</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dim">
                {attributions.map((vasp, index) => (
                  <tr key={vasp.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 font-bold text-ink-black">#{index + 1}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-ink-black text-sm block">{vasp.name}</span>
                      <span className="text-[11px] text-slate-gray">{vasp.jurisdiction}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-gray">{vasp.entityType}</td>
                    <td className="py-4 px-4 font-mono text-ink-black">
                      {vasp.depositAddress.substring(0, 10)}...{vasp.depositAddress.substring(vasp.depositAddress.length - 4)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-ink-black">
                      {vasp.supportingVolumeBtc} BTC
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`font-bold text-base ${
                          vasp.confidenceScore >= 80 ? 'text-signal-orange' : 'text-slate-gray'
                        }`}
                      >
                        {vasp.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href="/freeze"
                        className="px-3.5 py-1.5 rounded-full bg-ink-black hover:bg-signal-orange transition-colors text-pure-white font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Draft Notice</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
