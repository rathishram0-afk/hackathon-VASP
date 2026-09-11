'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FileText, Download, Shield, Printer, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ReportsCenterPage() {
  const reports = [
    {
      caseId: 'VT-2024-8891',
      title: 'Darknet Ransomware Exfiltration & VASP Off-ramp',
      vasp: 'Binance Compliance Desk',
      confidence: 91,
      tracedVolume: '48.5 BTC',
      status: 'Freeze Request Generated',
      date: '2026-09-11',
    },
    {
      caseId: 'VT-2024-4029',
      title: 'Pig Butchering Syndicate Multi-Exchange Flow',
      vasp: 'Kraken Law Enforcement Portal',
      confidence: 89,
      tracedVolume: '125.4 ETH',
      status: 'Subpoena Package Ready',
      date: '2026-09-10',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h1 className="text-xl font-bold text-white font-sans uppercase tracking-tight">
              Reports & Law Enforcement Disclosures
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Formal asset freeze requests, compliance subpoenas, and PDF/JSON case disclosure packages
            </p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.caseId} className="p-4 bg-[#121722] border border-[#1E293B] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#0C6CF2]/10 border border-[#0C6CF2]/30 text-[#0C6CF2] rounded">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-[#0C6CF2] font-bold">{r.caseId}</span>
                      <h3 className="text-base font-bold text-white font-sans">{r.title}</h3>
                    </div>
                    <span className="text-xs text-[#94A3B8] font-mono">Target: {r.vasp}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded font-bold">
                  {r.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-2 border-t border-[#1E293B]">
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                  <span className="text-[#64748B] block text-[10px]">Attribution Confidence</span>
                  <span className="text-[#0C6CF2] font-bold">{r.confidence}% Match</span>
                </div>
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                  <span className="text-[#64748B] block text-[10px]">Traced Volume</span>
                  <span className="text-white font-bold">{r.tracedVolume}</span>
                </div>
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                  <span className="text-[#64748B] block text-[10px]">Generated Date</span>
                  <span className="text-white font-bold">{r.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <Link
                  href={`/investigate/case-${r.caseId.toLowerCase()}`}
                  className="px-4 py-2 bg-[#0C6CF2] hover:bg-blue-600 text-white text-xs font-semibold rounded transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Open Report Generator</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
