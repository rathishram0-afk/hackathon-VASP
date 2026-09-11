"use client";

import { useForensicStore } from "@/store/useForensicStore";
import Link from "next/link";
import { ArrowRightLeft, Search, Filter, ExternalLink, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function TransactionsPage() {
  const { transactions } = useForensicStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "ALL" || tx.riskTag === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-primary-container/20 text-primary">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline-lg text-xl font-bold text-on-surface">
              MULTI-HOP TRANSACTION EXPLORER
            </h1>
            <p className="font-mono text-xs text-outline">
              Comprehensive Ledger Trace & Cryptographic Input/Output Inspection • Case #VT-0921
            </p>
          </div>
        </div>

        <span className="font-mono text-xs text-outline px-3 py-1 rounded bg-surface-container-high border border-outline-variant/30">
          {transactions.length} Traced Hops Recorded
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Tx Hash, From or To Address..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-4 py-2 font-mono text-xs text-on-surface focus:outline-none focus:border-secondary-container"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-outline">Risk Level:</span>
          {["ALL", "CRITICAL", "PEEL_CHAIN", "MIXER_ENTRY", "SUSPICIOUS"].map((tag) => (
            <button
              key={tag}
              onClick={() => setRiskFilter(tag)}
              className={`px-3 py-1.5 rounded transition-colors ${
                riskFilter === tag
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "bg-surface-container text-outline hover:text-on-surface"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-outline-variant/30 text-outline text-[11px]">
              <th className="py-3 px-4">TX HASH</th>
              <th className="py-3 px-4">BLOCK & TIME</th>
              <th className="py-3 px-4">FROM ADDRESS</th>
              <th className="py-3 px-4">TO ADDRESS</th>
              <th className="py-3 px-4">VALUE (BTC)</th>
              <th className="py-3 px-4">HOP</th>
              <th className="py-3 px-4">RISK TAG</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors"
              >
                <td className="py-3 px-4 font-semibold text-secondary-container">
                  {tx.txHash.substring(0, 10)}...{tx.txHash.slice(-8)}
                </td>
                <td className="py-3 px-4 text-on-surface-variant">
                  #{tx.block}
                  <span className="block text-[10px] text-outline">{tx.timestamp}</span>
                </td>
                <td className="py-3 px-4 text-outline">
                  {tx.fromAddress.substring(0, 8)}...
                </td>
                <td className="py-3 px-4 text-outline">
                  {tx.toAddress.substring(0, 8)}...
                </td>
                <td className="py-3 px-4 font-bold text-on-surface">
                  {tx.valueBtc} BTC
                  <span className="block text-[10px] text-outline">
                    ${tx.valueUsd.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4 text-secondary font-bold">Hop #{tx.hopIndex}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.riskTag === "CRITICAL"
                        ? "bg-error-container text-error"
                        : tx.riskTag === "MIXER_ENTRY"
                        ? "bg-tertiary-container/30 text-tertiary"
                        : tx.riskTag === "PEEL_CHAIN"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-surface-container-highest text-secondary"
                    }`}
                  >
                    {tx.riskTag}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/transactions/${tx.id}`}
                    className="px-3 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-secondary text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
