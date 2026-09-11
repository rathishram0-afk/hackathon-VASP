'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Lock, Building, FileCheck, CheckCircle2, ShieldAlert, Download, Send, AlertTriangle } from 'lucide-react';

export default function FreezeActionPage() {
  const { activeCase, attributions } = useInvestigation();
  const primaryVasp = attributions[0] || {
    name: 'Binance',
    clusterId: '#BN-US-481',
    depositAddress: 'bc1qVaspDep91Binance884901',
    confidenceScore: 91,
    jurisdiction: 'Global Compliance',
  };

  const [officerName, setOfficerName] = useState<string>('Special Agent D. Vance');
  const [agencyName, setAgencyName] = useState<string>('Federal Crypto Asset Recovery Taskforce');
  const [subpoenaRef, setSubpoenaRef] = useState<string>(`SUB-${activeCase.id}-2026`);
  const [legalBasis, setLegalBasis] = useState<string>(
    'Emergency Restraining Order under ISO/IEC 27037 Attested Fraud Investigation.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

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
              <Lock className="w-8 h-8 text-signal-orange" />
              <span>Freeze Request & Legal Action Center</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              Generate formal emergency freeze notices and law-enforcement subpoena packages for compliance desks at candidate VASPs.
            </p>
          </div>

          <Link
            href="/report"
            className="px-6 py-3 rounded-full bg-pure-white border border-surface-dim text-ink-black hover:bg-surface-container-high transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-slate-gray" />
            <span>View Full Investigation Report</span>
          </Link>
        </div>

        {/* Target VASP Notice Preview Header */}
        <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ink-black text-signal-orange-light flex items-center justify-center text-xl font-bold">
              🏦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-xl text-ink-black">{primaryVasp.name} Compliance Desk</span>
                <span className="px-2.5 py-0.5 rounded-full bg-signal-orange text-ink-black font-outfit text-[10px] font-bold uppercase">
                  {primaryVasp.confidenceScore}% Match Target
                </span>
              </div>
              <span className="font-dmsans text-xs text-slate-gray">
                Jurisdiction: {primaryVasp.jurisdiction} • Cluster: {primaryVasp.clusterId}
              </span>
            </div>
          </div>

          <div className="text-right font-outfit text-xs space-y-1">
            <span className="text-slate-gray block">Target Deposit Address:</span>
            <span className="font-mono text-ink-black font-bold text-sm block">
              {primaryVasp.depositAddress}
            </span>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-8 rounded-[36px] bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-outfit font-bold text-2xl text-emerald-900">
              Emergency Freeze Request Package Generated!
            </h2>
            <p className="font-dmsans text-sm text-emerald-800 max-w-xl mx-auto leading-relaxed">
              Dossier reference <code className="font-mono font-bold">{subpoenaRef}</code> has been compiled into court-admissible PDF & JSON formats for transmission to {primaryVasp.name} legal compliance.
            </p>
            <div className="flex justify-center gap-4 pt-2 font-outfit text-xs">
              <button
                onClick={() => alert(`Downloading Subpoena Package ${subpoenaRef}.pdf`)}
                className="px-6 py-3 rounded-full bg-ink-black text-pure-white font-bold hover:bg-emerald-800 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Subpoena Dossier (PDF)</span>
              </button>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 rounded-full bg-pure-white border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>Edit Request Parameters</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form to Generate Request */
          <form
            onSubmit={handleSubmitNotice}
            className="p-8 rounded-[36px] bg-pure-white border border-surface-dim shadow-sm space-y-6"
          >
            <h3 className="font-outfit font-bold text-xl text-ink-black border-b border-surface-dim pb-4">
              Law-Enforcement Freeze Notice Generator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Investigating Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Enforcement Agency / Taskforce
                </label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Official Subpoena Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={subpoenaRef}
                  onChange={(e) => setSubpoenaRef(e.target.value)}
                  className="w-full bg-surface-container font-mono text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Legal Basis & Fraud Statutory Reference
                </label>
                <input
                  type="text"
                  required
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-dmsans text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                Simulated Action: Submitting this form compiles on-chain forensic evidence into a formal legal freeze request. No real-world subpoena is transmitted.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-sm hover:bg-signal-orange-light transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Generate Court-Admissible Subpoena Notice</span>
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
