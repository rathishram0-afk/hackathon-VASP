'use client';

import React from 'react';
import { MixerPattern } from '@/types/forensics';
import { Shuffle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MixerDetectionPanelProps {
  mixerPatterns: MixerPattern[];
}

export function MixerDetectionPanel({ mixerPatterns }: MixerDetectionPanelProps) {
  return (
    <div className="bg-[#121722] border border-[#1E293B] rounded-lg overflow-hidden space-y-0">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#1E293B] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shuffle className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Mixer / Tumbler Pattern Analysis
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Heuristic identification of potential peel chains, tumbler nodes, and amount splitting
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 rounded font-semibold">
          {mixerPatterns.length} Patterns Flagged
        </span>
      </div>

      {/* Distinction Warning Banner - Critical Requirement */}
      <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 px-4 flex items-start space-x-2 text-xs text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider font-mono">ANALYTICAL NOTICE: </span>
          <span>
            The items below represent <strong className="text-white">DETECTED PATTERNS</strong> based on graph heuristics. They are distinct from <strong className="text-white">CONFIRMED ATTRIBUTION</strong> and serve as investigative indicators.
          </span>
        </div>
      </div>

      {/* Pattern Cards List */}
      <div className="p-4 space-y-3">
        {mixerPatterns.map((pat) => (
          <div key={pat.id} className="p-3.5 bg-[#182030] border border-[#1E293B] rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold rounded uppercase">
                  {pat.patternType.replace('_', ' ')}
                </span>
                <span className="font-bold text-white text-sm font-sans">{pat.title}</span>
              </div>
              <div className="font-mono text-xs font-bold text-purple-400 flex items-center gap-1">
                <span>{pat.confidence}%</span>
                <span className="text-[10px] text-[#94A3B8] font-normal">Confidence</span>
              </div>
            </div>

            <p className="text-[#94A3B8] text-xs leading-relaxed">{pat.description}</p>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                <span className="text-[#64748B] block text-[10px]">Inputs / Outputs</span>
                <span className="text-white font-bold">{pat.inputTxCount} in → {pat.outputTxCount} out</span>
              </div>
              <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                <span className="text-[#64748B] block text-[10px]">Avg Delay</span>
                <span className="text-white font-bold">{Math.round(pat.avgDelaySeconds / 60)} mins</span>
              </div>
              <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                <span className="text-[#64748B] block text-[10px]">Volume Obfuscated</span>
                <span className="text-purple-400 font-bold">{pat.totalVolumeBtc} BTC</span>
              </div>
              <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded">
                <span className="text-[#64748B] block text-[10px]">Affected Nodes</span>
                <span className="text-white font-bold">{pat.affectedWallets.length} Addresses</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
