'use client';

import React from 'react';
import { EvidenceItem } from '@/types/forensics';
import { ShieldAlert, ArrowRight, CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';

interface EvidenceTimelineProps {
  evidenceChain: EvidenceItem[];
}

export function EvidenceTimeline({ evidenceChain }: EvidenceTimelineProps) {
  return (
    <div className="bg-[#121722] border border-[#1E293B] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1E293B] bg-[#0B0E14] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#0C6CF2]" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Chain of Custody & Forensic Evidence
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Traceable multi-hop transaction proof connecting source wallet to candidate exchange
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-[#182030] border border-[#1E293B] text-xs font-mono text-white rounded">
          {evidenceChain.length} Evidence Items
        </span>
      </div>

      {/* Evidence Items Flow */}
      <div className="p-4 space-y-4">
        {evidenceChain.map((ev, index) => {
          const isLast = index === evidenceChain.length - 1;

          return (
            <div key={ev.id} className="relative flex items-start space-x-4 group">
              {/* Step Number Badge & Vertical Connector Line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border z-10 ${
                    ev.signalStrength === 'critical'
                      ? 'bg-red-500/10 border-red-500/40 text-red-400'
                      : 'bg-[#0C6CF2]/10 border-[#0C6CF2]/40 text-[#0C6CF2]'
                  }`}
                >
                  {ev.stepNumber}
                </div>
                {!isLast && <div className="w-0.5 h-full bg-[#1E293B] my-1" />}
              </div>

              {/* Evidence Card */}
              <div className="flex-1 p-3.5 bg-[#182030] border border-[#1E293B] rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm font-sans">{ev.title}</span>
                  <span className="text-[#94A3B8] font-mono flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#0C6CF2]" /> {ev.timestamp}
                  </span>
                </div>

                <p className="text-[#94A3B8] text-xs leading-relaxed">{ev.description}</p>

                {/* Wallets Hop Transfer Row */}
                <div className="p-2 bg-[#0B0E14] border border-[#1E293B] rounded flex flex-wrap items-center justify-between font-mono text-[11px] gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#64748B]">From:</span>
                    <span className="text-white truncate max-w-[140px]">{ev.fromWallet}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-[#0C6CF2] font-bold">
                    <span>{ev.amountBtc} BTC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[#64748B]">To:</span>
                    <span className="text-white truncate max-w-[140px]">{ev.toWallet}</span>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-[#64748B]">
                  <span>TX Hash: <span className="text-slate-300">{ev.txHash.slice(0, 24)}...</span></span>
                  <a
                    href={`https://mempool.space/tx/${ev.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0C6CF2] hover:underline flex items-center gap-1"
                  >
                    View TX <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
