'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Building, Layers, ArrowLeft } from 'lucide-react';

export default function ReportPage() {
  const { activeCase, attributions, evidence } = useInvestigation();

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    alert(`Downloading Official Forensic Report Dossier: ${activeCase.id}_Forensic_Report.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 lg:pl-64">
        {/* Top Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-outfit text-xs text-slate-gray hover:text-ink-black font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2.5 rounded-full bg-pure-white border border-surface-dim text-ink-black font-outfit font-semibold text-xs hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-gray" />
              <span>Print Document</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-5 py-2.5 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Dossier (PDF/JSON)</span>
            </button>
          </div>
        </div>

        {/* Formal Report Document Paper Container */}
        <div className="p-8 sm:p-12 rounded-[40px] bg-pure-white border border-surface-dim shadow-[0_24px_48px_rgba(20,20,19,0.06)] space-y-8 text-ink-black">
          {/* Header & Attestation Seal */}
          <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-surface-dim">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-signal-orange" />
                <span className="font-outfit font-bold text-xl tracking-wider text-ink-black uppercase">
                  VASP TRACE FORENSIC DOSSIER
                </span>
              </div>
              <p className="font-dmsans text-xs text-slate-gray">
                Official Court-Admissible Blockchain Intelligence Report
              </p>
            </div>

            <div className="text-right font-outfit text-xs space-y-1">
              <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-bold block">
                CASE #{activeCase.id}
              </span>
              <span className="text-slate-gray block text-[11px] pt-1">
                Generated: {activeCase.lastUpdated}
              </span>
              <span className="text-signal-orange font-bold text-[10px] uppercase block">
                ISO/IEC 27037 Attested System
              </span>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="space-y-3">
            <h2 className="font-outfit font-bold text-base uppercase tracking-wider text-slate-gray border-b border-surface-dim pb-1">
              1. Executive Case Summary
            </h2>
            <p className="font-dmsans text-sm text-ink-black leading-relaxed">
              {activeCase.summary}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface-container/40 font-outfit text-xs">
              <div>
                <span className="text-slate-gray block">Source Network:</span>
                <span className="font-bold text-ink-black">{activeCase.network}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Exfiltrated Volume:</span>
                <span className="font-mono font-bold text-signal-orange">{activeCase.totalVolumeBtc} BTC</span>
              </div>
              <div>
                <span className="text-slate-gray block">Target Candidate:</span>
                <span className="font-bold text-ink-black">{activeCase.candidateVasp}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Attribution Confidence:</span>
                <span className="font-bold text-emerald-600">{activeCase.confidenceScore}% Verified</span>
              </div>
            </div>
          </div>

          {/* Target VASP Attribution Certificate */}
          <div className="p-6 rounded-3xl bg-lifted-cream border border-signal-orange/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit font-bold text-lg text-ink-black flex items-center gap-2">
                <Building className="w-5 h-5 text-signal-orange" />
                <span>Primary Attributed VASP Entity</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-signal-orange text-pure-white font-outfit text-xs font-bold">
                91% MATCH
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-outfit text-xs">
              <div>
                <span className="text-slate-gray block">Entity Name:</span>
                <span className="font-bold text-ink-black text-sm">{attributions[0]?.name || 'Binance'}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Deposit Cluster ID:</span>
                <span className="font-mono font-bold text-ink-black">{attributions[0]?.clusterId || '#BN-US-481'}</span>
              </div>
              <div>
                <span className="text-slate-gray block">Swept Deposit Address:</span>
                <span className="font-mono text-xs text-signal-orange font-bold break-all">
                  {attributions[0]?.depositAddress || 'bc1qVaspDep91Binance884901'}
                </span>
              </div>
            </div>
          </div>

          {/* Evidence Digest Table */}
          <div className="space-y-3">
            <h2 className="font-outfit font-bold text-base uppercase tracking-wider text-slate-gray border-b border-surface-dim pb-1">
              2. Supporting On-Chain Evidence Signals
            </h2>

            <div className="space-y-2 font-outfit text-xs">
              {evidence.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-surface-container/40 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-ink-black block">{item.title}</span>
                    <span className="font-dmsans text-[11px] text-slate-gray block">{item.description}</span>
                  </div>
                  <span className="font-mono font-bold text-signal-orange shrink-0">
                    +{item.confidenceContribution}% Contribution
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off & Legal Attestation */}
          <div className="pt-6 border-t border-surface-dim flex flex-wrap items-center justify-between gap-4 font-outfit text-xs text-slate-gray">
            <div>
              <span className="block font-bold text-ink-black">Lead Forensic Officer:</span>
              <span>{activeCase.investigator}</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-ink-black">Attestation Status:</span>
              <span className="text-emerald-700 font-bold">DIGITALLY SIGNED & SEALED</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
