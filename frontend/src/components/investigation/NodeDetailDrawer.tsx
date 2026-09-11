'use client';

import React, { useState } from 'react';
import { X, Copy, ExternalLink, ShieldAlert, ArrowUpRight, ArrowDownLeft, Clock, Wallet, Building2, Tag } from 'lucide-react';
import { GraphNode, Wallet as WalletType } from '@/types/forensics';
import { getMockWalletDetails } from '@/services/mockData';

interface NodeDetailDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailDrawer({ node, onClose }: NodeDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const walletDetails: WalletType = getMockWalletDetails(node.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121722] border-l border-[#1E293B] shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-200">
      {/* Header Bar */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0E14]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#0C6CF2]/10 border border-[#0C6CF2]/30 text-[#0C6CF2] rounded">
            {node.nodeType === 'vasp' ? <Building2 className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Node Intelligence Inspector
            </h3>
            <span className="text-[11px] text-[#64748B] font-mono">Hop Distance: {node.hop}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E293B] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Address Card & Entity Header */}
        <div className="p-3.5 bg-[#182030] border border-[#1E293B] rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-sans font-medium">Wallet Address</span>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${getRiskColor(node.riskScore)}`}>
              Risk Score: {node.riskScore}/100
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#0B0E14] p-2 rounded border border-[#1E293B] font-mono text-xs text-white">
            <span className="truncate mr-2">{node.id}</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                title="Copy Address"
                className="p-1 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E293B] transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://mempool.space/address/${node.id}`}
                target="_blank"
                rel="noreferrer"
                title="View on Explorer"
                className="p-1 text-[#94A3B8] hover:text-[#0C6CF2] rounded hover:bg-[#1E293B] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          {copied && <div className="text-[10px] text-emerald-400 font-mono">✓ Copied to clipboard</div>}

          {node.entityName && (
            <div className="text-xs font-semibold text-white pt-1">
              Attributed Entity: <span className="text-[#0C6CF2] font-mono">{node.entityName}</span>
            </div>
          )}
        </div>

        {/* Known Tags & Entity Labels */}
        <div>
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Known Behavioral Tags
          </div>
          <div className="flex flex-wrap gap-1.5">
            {walletDetails.knownTags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-[#0B0E14] border border-[#1E293B] text-[#94A3B8] text-xs font-mono rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Balance & Financial Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#182030] border border-[#1E293B] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-medium">Current Balance</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{walletDetails.balance}</div>
            <div className="text-[10px] text-[#94A3B8] font-mono">{walletDetails.balanceUsd}</div>
          </div>

          <div className="p-3 bg-[#182030] border border-[#1E293B] rounded-lg">
            <div className="text-[11px] text-[#64748B] font-medium">Total Counterparties</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">{walletDetails.directCounterpartiesCount}</div>
            <div className="text-[10px] text-[#94A3B8] font-mono">{walletDetails.txCount} total transactions</div>
          </div>
        </div>

        {/* Activity Timeline metadata */}
        <div className="p-3 bg-[#182030] border border-[#1E293B] rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#0C6CF2]" /> First Seen:</span>
            <span className="font-mono text-white">{walletDetails.firstSeen}</span>
          </div>
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#0C6CF2]" /> Last Active:</span>
            <span className="font-mono text-white">{walletDetails.lastSeen}</span>
          </div>
        </div>

        {/* Direct Inflow / Outflow Summary */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Transaction Flow Volume</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded flex items-center justify-between">
              <span className="text-emerald-400 font-medium flex items-center gap-1"><ArrowDownLeft className="w-3.5 h-3.5" /> Inflow:</span>
              <span className="font-mono text-white font-bold">{walletDetails.totalIncomingBtc} BTC</span>
            </div>
            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded flex items-center justify-between">
              <span className="text-red-400 font-medium flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Outflow:</span>
              <span className="font-mono text-white font-bold">{walletDetails.totalOutgoingBtc} BTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Footer CTA */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0B0E14]">
        <button
          onClick={onClose}
          className="w-full py-2 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] text-white text-xs font-semibold rounded transition"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
