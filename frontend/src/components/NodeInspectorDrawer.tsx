"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { X, Copy, ExternalLink, ShieldAlert, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NodeInspectorDrawer() {
  const { selectedNodeId, setSelectedNodeId, nodes, setLE28ModalOpen } = useForensicStore();
  const [copied, setCopied] = useState(false);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(node.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 bg-surface-container-low border border-outline-variant/40 rounded-lg p-4 flex flex-col gap-4 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-secondary-container" />
          <span className="font-label-sm text-xs font-bold text-on-surface uppercase">
            Node Inspector
          </span>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-outline hover:text-on-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Entity Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-sm text-on-surface">
            {node.label}
          </span>
          <span
            className={`font-label-sm text-[10px] font-bold px-2 py-0.5 rounded ${
              node.riskScore > 80
                ? "bg-error-container text-error"
                : node.riskScore > 40
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            Risk {node.riskScore}/100
          </span>
        </div>

        {/* Address Chip with Copy */}
        <div className="mt-1 flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
          <span className="font-mono text-xs text-secondary-container truncate max-w-[190px]">
            {node.address}
          </span>
          <button
            onClick={copyAddress}
            className="text-outline hover:text-secondary transition-colors"
            title="Copy Address"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="p-2.5 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-0.5">
          <span className="font-label-sm text-[10px] text-outline uppercase">Balance</span>
          <span className="font-bold text-on-surface">{node.balance}</span>
        </div>
        <div className="p-2.5 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-0.5">
          <span className="font-label-sm text-[10px] text-outline uppercase">Cluster</span>
          <span className="font-bold text-secondary text-[11px] truncate">
            {node.clusterId}
          </span>
        </div>
        <div className="p-2.5 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-0.5">
          <span className="font-label-sm text-[10px] text-outline uppercase">In / Out Tx</span>
          <span className="font-bold text-on-surface">
            {node.inCount} / {node.outCount}
          </span>
        </div>
        <div className="p-2.5 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-0.5">
          <span className="font-label-sm text-[10px] text-outline uppercase">Type</span>
          <span className="font-bold text-primary uppercase text-[11px]">{node.type}</span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-col gap-1 text-[11px] font-mono text-outline">
        <div className="flex justify-between">
          <span>First Seen:</span>
          <span className="text-on-surface-variant">{node.firstSeen}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Active:</span>
          <span className="text-on-surface-variant">{node.lastSeen}</span>
        </div>
      </div>

      {/* Inspector Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
        <Link
          href={`/wallet/${node.address}`}
          className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span>DEEP WALLET INTELLIGENCE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {node.type === "vasp" && (
          <button
            onClick={() => setLE28ModalOpen(true, node.label)}
            className="w-full py-2 px-3 rounded-lg bg-error-container hover:bg-error text-on-primary-container font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ISSUE FORM LE-28 FREEZE</span>
          </button>
        )}
      </div>
    </div>
  );
}
