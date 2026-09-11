"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle, FileText, ShieldAlert, Layers } from "lucide-react";
import { useState } from "react";

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { transactions } = useForensicStore();

  const id = params?.id as string;
  const tx = transactions.find((t) => t.id === id) || transactions[0];

  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(tx.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-mono text-outline hover:text-on-surface transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Transaction Explorer</span>
      </button>

      {/* Main Tx Summary Header */}
      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
              TRANSACTION INSPECTION • HOP #{tx.hopIndex}
            </span>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-lg font-bold text-secondary-container truncate max-w-xl">
                {tx.txHash}
              </h1>
              <button onClick={copyHash} className="text-outline hover:text-secondary">
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold ${
              tx.status === "CONFIRMED"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-error-container text-error"
            }`}
          >
            {tx.status}
          </span>
        </div>

        {/* Technical Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
            <span className="text-outline text-[10px] uppercase">Block Height</span>
            <span className="font-bold text-on-surface">#{tx.block}</span>
          </div>
          <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
            <span className="text-outline text-[10px] uppercase">Value Traced</span>
            <span className="font-bold text-secondary-container">
              {tx.valueBtc} BTC (${tx.valueUsd.toLocaleString()})
            </span>
          </div>
          <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
            <span className="text-outline text-[10px] uppercase">Tx Fee</span>
            <span className="font-bold text-on-surface">{tx.feeBtc} BTC</span>
          </div>
          <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
            <span className="text-outline text-[10px] uppercase">Gas Price</span>
            <span className="font-bold text-primary">
              {tx.gasPriceGwei || 18.5} Gwei
            </span>
          </div>
        </div>

        {/* Inputs & Outputs Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Inputs */}
          <div className="p-4 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-2 font-mono text-xs">
            <span className="text-outline text-[11px] font-bold uppercase border-b border-outline-variant/20 pb-1">
              Inputs ({tx.inputsCount})
            </span>
            <div className="flex justify-between items-center p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-secondary">{tx.fromAddress}</span>
              <span className="text-on-surface font-bold">{tx.valueBtc} BTC</span>
            </div>
          </div>

          {/* Outputs */}
          <div className="p-4 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-2 font-mono text-xs">
            <span className="text-outline text-[11px] font-bold uppercase border-b border-outline-variant/20 pb-1">
              Outputs ({tx.outputsCount})
            </span>
            <div className="flex justify-between items-center p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-secondary">{tx.toAddress}</span>
              <span className="text-on-surface font-bold">{tx.valueBtc} BTC</span>
            </div>
          </div>
        </div>

        {/* ScriptSig Hex */}
        <div className="flex flex-col gap-1.5 font-mono text-xs pt-2">
          <span className="text-outline text-[10px] uppercase font-bold">
            Raw Cryptographic scriptSig Hex
          </span>
          <div className="p-3 rounded bg-surface-container-lowest border border-outline-variant/30 text-outline break-all">
            {tx.scriptSig}
          </div>
        </div>
      </div>
    </div>
  );
}
