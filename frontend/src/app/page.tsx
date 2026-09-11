'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { D3TransactionGraph } from '@/components/graph/D3TransactionGraph';
import { NodeDetailDrawer } from '@/components/drawer/NodeDetailDrawer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { ArrowRight, Play, Shield, Fingerprint, Lock, Download, Layers, Activity } from 'lucide-react';

export default function LandingPage() {
  const { activeCase, selectCase } = useInvestigation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-10 lg:pl-64">
        {/* Editorial Hero Section */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 pt-4">
          {/* Top Intelligence Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lifted-cream shadow-[0_4px_24px_rgba(20,20,19,0.04)] border border-surface-dim/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal-orange"></span>
            </span>
            <span className="font-outfit text-xs text-ink-black uppercase tracking-wider font-bold">
              Autonomous VASP Intelligence Platform
            </span>
            <span className="text-slate-gray text-xs">|</span>
            <span className="font-outfit text-xs text-signal-orange font-bold">
              ISO/IEC 27037 Attested
            </span>
          </div>

          {/* Editorial Headline Pair */}
          <h1 className="font-outfit font-bold text-4xl sm:text-6xl text-ink-black tracking-tight leading-[1.08]">
            Trace the wallet. <br className="hidden sm:inline" />
            <span className="text-signal-orange">Reveal the VASP.</span>
          </h1>

          {/* Supporting Message */}
          <p className="font-dmsans text-base sm:text-lg text-slate-gray max-w-2xl leading-relaxed">
            Follow suspicious cryptocurrency transactions, uncover intermediary wallets, and identify likely Virtual Asset Service Providers through evidence-backed blockchain analysis.
          </p>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-ink-black hover:bg-signal-orange transition-all rounded-full shadow-[0_4px_24px_rgba(20,20,19,0.1)] text-pure-white font-outfit font-bold text-sm"
            >
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/graph"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-pure-white hover:bg-surface-container-low transition-all rounded-full shadow-[0_4px_24px_rgba(20,20,19,0.04)] border border-surface-dim text-ink-black font-outfit font-bold text-sm"
            >
              <Play className="w-4 h-4 fill-ink-black" />
              <span>View Interactive Graph</span>
              <span className="font-outfit text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-slate-gray font-bold uppercase">
                4m walk
              </span>
            </Link>
          </div>
        </section>

        {/* Stadium Graph Container */}
        <section className="relative w-full">
          <D3TransactionGraph height={500} />

          {/* Forensic Evidence Match Telemetry Ribbon below graph */}
          <div className="mt-6 p-5 rounded-3xl bg-pure-white shadow-[0_4px_24px_rgba(20,20,19,0.03)] border border-surface-dim flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-signal-orange shrink-0">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-outfit text-sm">
                  <span className="font-bold text-ink-black">Evidence Match Signature:</span>
                  <span className="font-mono text-xs font-bold text-signal-orange bg-error-container/60 px-2 py-0.5 rounded-md">
                    DEPOSIT_SWEEP_CONFIRMED
                  </span>
                </div>
                <span className="font-dmsans text-xs text-slate-gray mt-0.5">
                  Sweep pattern matches known exchange hot-wallet consolidation within 2 blocks (Block {activeCase.createdBlock}).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/report"
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-outfit font-bold text-xs text-ink-black flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-gray" />
                <span>Export Dossier</span>
              </Link>
              <Link
                href="/freeze"
                className="px-4 py-2 rounded-full bg-signal-orange text-ink-black hover:bg-signal-orange-light transition-colors font-outfit font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Draft Freeze Request</span>
              </Link>
            </div>
          </div>
        </section>

        {/* High-Level Proof Metrics Band */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-ink-black font-outfit font-bold">
              01
            </div>
            <h3 className="font-outfit font-bold text-lg text-ink-black">
              Multi-Hop Traversal Engine
            </h3>
            <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
              Automatically traverses peeling chains, unhosted intermediate relays, and split outputs up to 5 hops deep across major blockchains.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-signal-orange font-outfit font-bold">
              02
            </div>
            <h3 className="font-outfit font-bold text-lg text-ink-black">
              Candidate VASP Attribution
            </h3>
            <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
              Heuristic scoring engine ranks candidate Virtual Asset Service Providers based on sweep timing, deposit cluster matching, and volume retention.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-ink-black font-outfit font-bold">
              03
            </div>
            <h3 className="font-outfit font-bold text-lg text-ink-black">
              Legal Subpoena Dossiers
            </h3>
            <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
              Generates formal law-enforcement freeze requests and court-admissible forensic dossiers ready for exchange compliance desks.
            </p>
          </div>
        </section>
      </main>

      <NodeDetailDrawer />
      <Footer />
    </div>
  );
}
