'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Shuffle, AlertTriangle, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import Link from 'next/link';

export default function MixerAnalysisPage() {
  const mixerProtocols = [
    {
      name: 'ChipMixer Pass-Through Relay',
      type: 'Centralized Obfuscator',
      riskScore: 88,
      detectedCases: 'VT-2024-8891',
      patternType: 'Tumbler Hop',
      avgDelay: '43 mins',
      volumeTraced: '28.4 BTC',
    },
    {
      name: 'Peel-Chain Fan-out Split',
      type: 'Micro-change Obfuscation',
      riskScore: 82,
      detectedCases: 'VT-2024-8891',
      patternType: 'Peel Chain',
      avgDelay: '7 mins',
      volumeTraced: '38.7 BTC',
    },
    {
      name: 'Tornado Cash ERC-20 Pool',
      type: 'Decentralized zk-Mixer',
      riskScore: 95,
      detectedCases: 'VT-2024-4029',
      patternType: 'Smart Contract Relay',
      avgDelay: '120 mins',
      volumeTraced: '120.0 ETH',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div>
            <h1 className="text-xl font-bold text-white font-sans uppercase tracking-tight">
              Mixer & Obfuscation Intelligence Module
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Heuristic identification of peel-chains, tumbler nodes, zero-balance relays, and amount splitting
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-mono uppercase">HEURISTIC NOTICE: </span>
            <span>
              All obfuscation patterns listed in this module represent <strong className="text-white">DETECTED PATTERNS</strong> derived from multi-hop transaction heuristics. They serve as investigative indicators and are not deterministic proof of entity identity.
            </span>
          </div>
        </div>

        {/* Protocols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mixerProtocols.map((m, i) => (
            <div key={i} className="p-4 bg-[#121722] border border-[#1E293B] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg flex items-center justify-center">
                  <Shuffle className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold rounded border border-purple-500/30">
                  {m.patternType}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-sans">{m.name}</h3>
                <span className="text-xs text-[#94A3B8] font-mono">{m.type}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-[#1E293B]">
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                  <span className="text-[#64748B] block text-[10px]">Heuristic Risk</span>
                  <span className="text-purple-400 font-bold">{m.riskScore}/100</span>
                </div>
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                  <span className="text-[#64748B] block text-[10px]">Volume Obfuscated</span>
                  <span className="text-white font-bold">{m.volumeTraced}</span>
                </div>
              </div>

              <div className="pt-1 text-right">
                <Link
                  href="/investigate/case-vt-2024-8891"
                  className="text-xs font-mono text-[#0C6CF2] hover:underline inline-flex items-center gap-1"
                >
                  View Case Heuristics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
