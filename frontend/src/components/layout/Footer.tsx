'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, Lock, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-ink-black text-pure-white mt-auto border-t border-surface-container/20 lg:pl-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-surface-container/10">
          {/* Col 1: Brand & Attestation */}
          <div className="flex flex-col space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-signal-orange flex items-center justify-center text-pure-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-outfit font-bold text-lg text-pure-white tracking-wider">
                VASP <span className="text-signal-orange-light">TRACE</span>
              </span>
            </div>
            <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
              Autonomous blockchain forensic intelligence platform. Tracing wallet transactions and revealing Virtual Asset Service Provider (VASP) attributions.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-outfit text-signal-orange-light">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ISO/IEC 27037 Attested Forensic System</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="flex flex-col space-y-2 font-outfit text-xs">
            <span className="font-bold text-pure-white uppercase tracking-wider text-[11px] mb-1">
              Forensic Navigation
            </span>
            <Link href="/dashboard" className="text-slate-gray hover:text-pure-white transition-colors">
              Investigation Dashboard
            </Link>
            <Link href="/cases" className="text-slate-gray hover:text-pure-white transition-colors">
              Active Case Registry
            </Link>
            <Link href="/graph" className="text-slate-gray hover:text-pure-white transition-colors">
              D3 Transaction Graph
            </Link>
            <Link href="/attribution" className="text-slate-gray hover:text-pure-white transition-colors">
              VASP Attribution Leaderboard
            </Link>
          </div>

          {/* Col 3: Intelligence Modules */}
          <div className="flex flex-col space-y-2 font-outfit text-xs">
            <span className="font-bold text-pure-white uppercase tracking-wider text-[11px] mb-1">
              Analysis Engines
            </span>
            <Link href="/evidence" className="text-slate-gray hover:text-pure-white transition-colors">
              Evidence Reasoning Matrix
            </Link>
            <Link href="/mixer" className="text-slate-gray hover:text-pure-white transition-colors">
              Mixer & Obfuscation De-anonymizer
            </Link>
            <Link href="/timeline" className="text-slate-gray hover:text-pure-white transition-colors">
              Chronological Forensic Timeline
            </Link>
            <Link href="/freeze" className="text-slate-gray hover:text-pure-white transition-colors">
              Subpoena & Freeze Request Center
            </Link>
          </div>

          {/* Col 4: Attestation & System Status */}
          <div className="flex flex-col space-y-3 font-outfit text-xs">
            <span className="font-bold text-pure-white uppercase tracking-wider text-[11px] mb-1">
              System Telemetry
            </span>
            <div className="p-3 rounded-2xl bg-surface-container/10 border border-surface-container/20 flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-gray">Ledger Nodes:</span>
                <span className="text-pure-white font-mono font-bold">Synced (842,912)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-gray">VASP Clusters:</span>
                <span className="text-pure-white font-mono font-bold">1,248 Attested</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-gray">Attestation Engine:</span>
                <span className="text-signal-orange-light font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 font-outfit text-xs text-slate-gray">
          <span>© 2026 VASP Trace Forensic Intelligence Suite. Frontend Prototype Only.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-pure-white transition-colors cursor-pointer">Security Attestation</span>
            <span>•</span>
            <span className="hover:text-pure-white transition-colors cursor-pointer">AML Compliance Standards</span>
            <span>•</span>
            <span className="hover:text-pure-white transition-colors cursor-pointer">Legal Subpoena Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
