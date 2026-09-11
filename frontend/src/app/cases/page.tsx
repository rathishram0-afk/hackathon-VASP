'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { FolderPlus, Search, Filter, Shield, ArrowRight, Building, CheckCircle2, Layers } from 'lucide-react';

export default function CasesPage() {
  const { casesList, activeCase, selectCase } = useInvestigation();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [caseSearch, setCaseSearch] = useState<string>('');

  const filteredCases = casesList.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.id.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.sourceWallet.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.candidateVasp.toLowerCase().includes(caseSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-8 lg:pl-64">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-bold text-3xl text-ink-black flex items-center gap-3">
              <Shield className="w-7 h-7 text-signal-orange" />
              <span>Forensic Case Management</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1">
              Select, manage, and launch active blockchain investigative cases across multi-hop networks.
            </p>
          </div>

          <Link
            href="/trace"
            className="px-6 py-3 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Start New Case</span>
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 font-outfit text-xs">
            {['ALL', 'ACTIVE', 'UNDER_REVIEW', 'ATTRIBUTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-ink-black text-pure-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-slate-gray'
                }`}
              >
                {status === 'ALL' ? 'All Cases' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center bg-surface-container rounded-full px-3.5 py-1.5 w-full sm:w-72 border border-surface-dim">
            <Search className="w-4 h-4 text-slate-gray mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search case ID, wallet, or VASP..."
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              className="bg-transparent font-dmsans text-xs text-ink-black placeholder:text-slate-gray focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => {
            const isSelected = c.id === activeCase.id;

            return (
              <div
                key={c.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'bg-lifted-cream border-signal-orange shadow-md ring-2 ring-signal-orange/20'
                    : 'bg-pure-white border-surface-dim hover:border-slate-gray/50 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Case ID & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
                      CASE #{c.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-outfit text-[10px] font-bold uppercase tracking-wider ${
                        c.riskLevel === 'CRITICAL'
                          ? 'bg-error-container text-error'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status} • {c.riskScore}/100 Risk
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="font-outfit font-bold text-lg text-ink-black leading-snug">
                      {c.title}
                    </h3>
                    <p className="font-dmsans text-xs text-slate-gray mt-1 line-clamp-3 leading-relaxed">
                      {c.summary}
                    </p>
                  </div>

                  {/* Wallet Info */}
                  <div className="p-3 rounded-2xl bg-surface-container/60 space-y-1.5 font-outfit text-xs">
                    <div className="flex items-center justify-between text-slate-gray">
                      <span>Source Wallet:</span>
                      <span className="font-mono text-ink-black font-semibold">{c.network}</span>
                    </div>
                    <span className="font-mono text-xs text-ink-black font-bold block truncate">
                      {c.sourceWallet}
                    </span>
                  </div>

                  {/* VASP Attribution Preview */}
                  <div className="flex items-center justify-between pt-1 font-outfit text-xs">
                    <span className="text-slate-gray flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-signal-orange" />
                      Candidate VASP:
                    </span>
                    <span className="font-bold text-ink-black">
                      {c.candidateVasp} ({c.confidenceScore}%)
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-surface-dim flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink-black">
                    {c.totalVolumeBtc} BTC
                  </span>

                  {isSelected ? (
                    <span className="px-4 py-1.5 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-xs flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Scope</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => selectCase(c.id)}
                      className="px-4 py-1.5 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange hover:text-ink-black transition-colors font-outfit font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Set Active</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
