'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInvestigation } from '@/hooks/useInvestigation';
import {
  X,
  Copy,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Shuffle,
  UserCheck,
  FileCheck,
  Check
} from 'lucide-react';

export const NodeDetailDrawer: React.FC = () => {
  const { selectedNode, isDrawerOpen, closeDrawer, activeCase } = useInvestigation();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isDrawerOpen || !selectedNode) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedNode.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadgeColor = (risk: number | null) => {
    if (risk === null) return 'bg-surface-container text-slate-gray border-surface-dim';
    if (risk >= 80) return 'bg-error-container text-error border-error/30';
    if (risk >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-lifted-cream shadow-[0_24px_48px_rgba(20,20,19,0.18)] border-l border-surface-dim flex flex-col transition-all animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-6 bg-pure-white border-b border-surface-dim flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ink-black flex items-center justify-center text-pure-white">
            {selectedNode.type === 'VASP' ? (
              <Building className="w-5 h-5 text-signal-orange-light" />
            ) : selectedNode.type === 'MIXER' ? (
              <Shuffle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-signal-orange" />
            )}
          </div>
          <div>
            <h3 className="font-outfit font-bold text-lg text-ink-black leading-snug">
              {selectedNode.label}
            </h3>
            <span className="font-outfit text-xs text-slate-gray font-medium">
              Hop {selectedNode.hopDistance} •{' '}
              {selectedNode.isMainPath
                ? 'Main Flow Path'
                : selectedNode.type === 'VASP'
                ? 'VASP Gateway'
                : 'Secondary / Connected Node'}
            </span>
          </div>
        </div>

        <button
          onClick={closeDrawer}
          className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-ink-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Address Card */}
        <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim space-y-2">
          <div className="flex items-center justify-between text-xs font-outfit text-slate-gray">
            <span>On-Chain Address:</span>
            <div className="flex items-center gap-1.5">
              {selectedNode.isMainPath && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Main Flow
                </span>
              )}
              <span className="font-mono text-ink-black font-semibold">BTC Mainnet</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-container p-2.5 rounded-xl font-mono text-xs text-ink-black break-all">
            <span>{selectedNode.address}</span>
            <button
              onClick={handleCopyAddress}
              title="Copy Address"
              className="ml-2 p-1.5 rounded-lg bg-pure-white hover:bg-surface-container-high transition-colors text-ink-black shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs font-outfit">
            <span className="text-slate-gray">Cluster Identifier:</span>
            <span className="font-bold text-ink-black">{selectedNode.clusterTag || '#UNTAGGED-CLUSTER'}</span>
          </div>
        </div>

        {/* Risk & Entity Classification */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Genuine Node-Level Risk Score */}
          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex flex-col justify-between">
            <span className="font-outfit text-xs text-slate-gray font-medium">Node Risk Score</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-outfit font-bold text-2xl text-ink-black">
                {selectedNode.riskScore === null ? 'N/A' : selectedNode.riskScore}
              </span>
              {selectedNode.riskScore !== null && <span className="text-xs text-slate-gray">/100</span>}
            </div>
            <span
              className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-outfit font-bold tracking-wider uppercase border text-center ${getRiskBadgeColor(
                selectedNode.riskScore
              )}`}
            >
              {selectedNode.riskScore === null
                ? 'UNSCORED'
                : selectedNode.riskScore >= 80
                ? 'CRITICAL RISK'
                : selectedNode.riskScore >= 50
                ? 'MEDIUM RISK'
                : 'LOW RISK'}
            </span>
            <span className="mt-1.5 text-[10px] font-outfit text-slate-gray leading-tight">
              {selectedNode.riskScore === null
                ? 'No node-level risk score provided'
                : 'Direct on-chain risk rating'}
            </span>
          </div>

          {/* Card 2: VASP Attribution Confidence & Flow Role */}
          <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim flex flex-col justify-between">
            <span className="font-outfit text-xs text-slate-gray font-medium">
              {selectedNode.candidateConfidence != null
                ? 'VASP Attribution'
                : selectedNode.isMainPath
                ? 'Transaction Path'
                : 'Attribution Match'}
            </span>
            <div className="mt-2 flex flex-col">
              <span className="font-outfit font-bold text-base text-ink-black truncate">
                {selectedNode.entityName || (selectedNode.type === 'VASP' ? activeCase.candidateVasp : selectedNode.isMainPath ? 'Main Path Relay' : 'Connected Address')}
              </span>
              <span className="font-outfit text-xs text-signal-orange font-bold">
                {selectedNode.candidateConfidence != null
                  ? `${selectedNode.candidateConfidence}% Confidence`
                  : selectedNode.isCandidateTarget
                  ? `${activeCase.confidenceScore}% Confidence`
                  : selectedNode.isMainPath
                  ? 'Main Traced Flow'
                  : 'Side Transaction'}
              </span>
            </div>
            <span className="mt-1.5 text-[10px] font-outfit text-slate-gray leading-tight">
              {selectedNode.candidateConfidence != null
                ? 'Heuristic VASP Deposit Candidate'
                : selectedNode.type === 'VASP'
                ? 'Verified Exchange Gateway'
                : selectedNode.isMainPath
                ? 'Active Fund Flow Path'
                : 'Peripheral Fan-Out'}
            </span>
          </div>
        </div>

        {/* Financial Flow Metrics */}
        <div className="p-4 rounded-2xl bg-pure-white border border-surface-dim space-y-3">
          <h4 className="font-outfit font-bold text-sm text-ink-black">Financial Flow Telemetry</h4>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-surface-container/60 space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-gray font-outfit">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Inflow</span>
              </div>
              <span className="font-mono text-sm font-bold text-ink-black block">
                {selectedNode.inflowBtc.toFixed(2)} BTC
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container/60 space-y-1">
              <div className="flex items-center gap-1 text-xs text-slate-gray font-outfit">
                <ArrowUpRight className="w-3.5 h-3.5 text-signal-orange" />
                <span>Total Outflow</span>
              </div>
              <span className="font-mono text-sm font-bold text-ink-black block">
                {selectedNode.outflowBtc.toFixed(2)} BTC
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-dim flex items-center justify-between font-outfit text-xs">
            <span className="text-slate-gray">Unspent Balance:</span>
            <span className="font-mono font-bold text-ink-black">{selectedNode.balanceBtc.toFixed(2)} BTC</span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-2 pt-2">
          <Link
            href={`/freeze?address=${encodeURIComponent(selectedNode.address)}`}
            className="w-full py-3 rounded-full bg-ink-black text-pure-white font-outfit font-bold text-xs hover:bg-signal-orange hover:text-ink-black transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <FileCheck className="w-4 h-4" />
            <span>Draft Freeze Request for Node</span>
          </Link>

          <a
            href={`https://mempool.space/address/${selectedNode.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-full bg-pure-white border border-surface-dim text-ink-black font-outfit font-semibold text-xs hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-gray" />
            <span>View on Blockchain Explorer</span>
          </a>
        </div>
      </div>
    </div>
  );
};
