'use client';

import React, { useState } from 'react';
import { VASPAttribution } from '@/types/forensics';
import { Building2, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Link as LinkIcon, Clock, Percent, MapPin } from 'lucide-react';

interface VASPAttributionCardProps {
  attributions: VASPAttribution[];
  onSelectVasp?: (vaspId: string) => void;
  selectedVaspId?: string;
}

export function VASPAttributionCard({ attributions, onSelectVasp, selectedVaspId }: VASPAttributionCardProps) {
  const [expandedVasp, setExpandedVasp] = useState<string | null>(attributions[0]?.vaspId || null);

  const toggleExpand = (vaspId: string) => {
    setExpandedVasp(expandedVasp === vaspId ? null : vaspId);
    if (onSelectVasp) onSelectVasp(vaspId);
  };

  return (
    <div className="bg-[#121722] border border-[#1E293B] rounded-lg overflow-hidden space-y-0">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#1E293B] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-[#0C6CF2]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Candidate VASP Attribution Ranking
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Heuristic & cluster evidence attribution ranking for candidate exchanges
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#182030] border border-[#1E293B] text-xs font-mono text-[#0C6CF2] rounded">
          {attributions.length} Candidates Identified
        </span>
      </div>

      {/* Attribution List */}
      <div className="divide-y divide-[#1E293B]">
        {attributions.map((item, index) => {
          const isExpanded = expandedVasp === item.vaspId;
          const isTop = index === 0;

          return (
            <div
              key={item.vaspId}
              className={`transition ${isTop ? 'bg-[#182030]/50' : 'hover:bg-[#182030]/30'}`}
            >
              {/* Card Summary Header */}
              <div
                onClick={() => toggleExpand(item.vaspId)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-[#0B0E14] border border-[#1E293B] font-mono text-xs font-bold text-[#94A3B8]">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white font-sans">{item.vaspName}</span>
                      {isTop && (
                        <span className="px-2 py-0.5 bg-[#0C6CF2]/10 border border-[#0C6CF2]/30 text-[#0C6CF2] text-[10px] font-mono rounded font-semibold uppercase">
                          Top Match
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#94A3B8] font-mono flex items-center space-x-3 mt-0.5">
                      <span>Deposit Cluster: {item.depositClusterId}</span>
                      <span>•</span>
                      <span>Target: {item.destinationWallet.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>

                {/* Score & Confidence Bar */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-white flex items-center justify-end gap-1">
                      <span>{item.confidenceScore}%</span>
                      <span className="text-xs text-[#94A3B8] font-normal">Confidence</span>
                    </div>
                    <div className="w-32 h-1.5 bg-[#0B0E14] border border-[#1E293B] rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.confidenceScore >= 80
                            ? 'bg-[#0C6CF2]'
                            : item.confidenceScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                        style={{ width: `${item.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  <button className="text-[#94A3B8] hover:text-white transition">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Detailed Breakdown: WHO? HOW CONFIDENT? WHY? */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#1E293B]/60 bg-[#0B0E14]/60 space-y-4 text-xs">
                  {/* Three Core Forensic Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* WHO */}
                    <div className="p-3 bg-[#121722] border border-[#1E293B] rounded">
                      <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                        WHO? (Candidate VASP)
                      </div>
                      <div className="text-sm font-bold text-white font-mono">{item.vaspName} Exchange</div>
                      <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                        Known Cluster Addresses: {item.knownAddressCount}
                      </div>
                    </div>

                    {/* HOW CONFIDENT */}
                    <div className="p-3 bg-[#121722] border border-[#1E293B] rounded">
                      <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                        HOW CONFIDENT?
                      </div>
                      <div className="text-sm font-bold text-[#0C6CF2] font-mono">
                        {item.confidenceScore}% Analytical Match
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-1">
                        Heuristic attribution score (Non-deterministic)
                      </div>
                    </div>

                    {/* WHY */}
                    <div className="p-3 bg-[#121722] border border-[#1E293B] rounded">
                      <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                        PRIMARY METRICS
                      </div>
                      <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-white mt-1">
                        <div>
                          <div className="text-[#64748B]">Hops</div>
                          <div>{item.hopProximity}</div>
                        </div>
                        <div>
                          <div className="text-[#64748B]">Retention</div>
                          <div>{item.amountRetentionPercent}%</div>
                        </div>
                        <div>
                          <div className="text-[#64748B]">Delay</div>
                          <div>{item.timingDelayMinutes}m</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Attribution Signals */}
                  <div>
                    <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                      Supporting Evidence Signals
                    </div>
                    <div className="space-y-2">
                      {item.signals.map((sig) => (
                        <div
                          key={sig.id}
                          className="p-2.5 bg-[#121722] border border-[#1E293B] rounded flex items-start justify-between"
                        >
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#0C6CF2]" />
                              {sig.title}
                            </div>
                            <div className="text-[#94A3B8] text-[11px] mt-0.5">{sig.description}</div>
                          </div>
                          <span className="px-2 py-0.5 bg-[#0C6CF2]/10 text-[#0C6CF2] font-mono text-[11px] font-bold rounded">
                            +{sig.scoreImpact}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
