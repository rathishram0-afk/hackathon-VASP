"use client";

import { useForensicStore } from "@/store/useForensicStore";
import GraphCanvas from "@/components/GraphCanvas";
import NodeInspectorDrawer from "@/components/NodeInspectorDrawer";
import Link from "next/link";
import {
  RefreshCw,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  SlidersHorizontal,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function InvestigationDashboard() {
  const {
    caseId,
    leadOfficer,
    primaryWallet,
    totalValueBtc,
    maxHops,
    candidates,
    transactions,
    hopDepthFilter,
    setHopDepthFilter,
    minTxValue,
    setMinTxValue,
    entityVisibility,
    toggleEntityVisibility,
    setLE28ModalOpen,
  } = useForensicStore();

  const [copied, setCopied] = useState(false);

  const copyWallet = () => {
    navigator.clipboard.writeText(primaryWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const workflowSteps = [
    { num: 1, title: "Scam Wallet", desc: "0x83A1...91F2 Exploit" },
    { num: 2, title: "Multi-Hop Trace", desc: "4 Hops Analyzed" },
    { num: 3, title: "Unhosted Hops", desc: "18 Addresses Identified" },
    { num: 4, title: "Candidate Paths", desc: "6 Discovered Flows" },
    { num: 5, title: "Exchange Ranking", desc: "Ranked by ML Model" },
    { num: 6, title: "Confidence Score", desc: "94.8% Top Match" },
    { num: 7, title: "Supporting Evidence", desc: "UTXO & Peel Chain" },
    { num: 8, title: "Mixer Detection", desc: "Wasabi Branch Alert" },
  ];

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Top Bar: Case Identity & Command Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-lg shadow-sm border border-outline-variant/20">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-xl font-bold text-on-surface tracking-tight">
              INVESTIGATION #{caseId}
            </h1>
            <span className="font-label-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-semibold">
              SCAM-LINKED MULTI-HOP DRAIN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse shadow-sm"></span>
              <span className="font-label-sm text-[10px] text-secondary-container font-semibold uppercase tracking-wider">
                Active Investigation
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container font-label-sm text-xs text-on-surface-variant">
              <span>Case Lead:</span>
              <span className="font-semibold text-on-surface">{leadOfficer}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-xs transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>TRACE AGAIN</span>
          </button>
          <Link
            href="/dossier"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT FORENSIC REPORT</span>
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-xs transition-all">
            <Share2 className="w-3.5 h-3.5 text-outline" />
            <span>SHARE DOSSIER</span>
          </button>
        </div>
      </div>

      {/* 8 High-Density Technical Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Card 1: Source Wallet */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Source Wallet</span>
            <span className="w-2 h-2 rounded-full bg-error"></span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-on-surface font-semibold truncate">
              0x83A1...91F2
            </span>
            <button onClick={copyWallet} className="text-outline hover:text-secondary">
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <span className="mt-1 font-label-sm text-[9px] text-outline-variant uppercase">
            BTC Core Target
          </span>
        </div>

        {/* Card 2: Blockchain */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Blockchain</span>
            <Layers className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-2 font-display text-base font-semibold text-on-surface">
            BTC Core
          </div>
          <span className="mt-1 font-mono text-[9px] text-outline-variant">
            #891,402 SYNCED
          </span>
        </div>

        {/* Card 3: Traced TX */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Transactions</span>
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="mt-2 font-display text-base font-bold text-on-surface">1,284</div>
          <span className="mt-1 font-label-sm text-[9px] text-secondary-container">
            +14 new (1hr)
          </span>
        </div>

        {/* Card 4: Max Hops */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Max Hops</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-tertiary" />
          </div>
          <div className="mt-2 font-display text-base font-bold text-on-surface">
            {maxHops} Hops
          </div>
          <span className="mt-1 font-label-sm text-[9px] text-outline-variant">
            Analyzed depth
          </span>
        </div>

        {/* Card 5: Value Traced */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Value Traced</span>
            <span className="font-mono text-[10px] text-secondary-container">$</span>
          </div>
          <div className="mt-2 font-mono text-base font-bold text-secondary-container">
            {totalValueBtc} BTC
          </div>
          <span className="mt-1 font-mono text-[9px] text-outline-variant">
            ≈ $184,620 USD
          </span>
        </div>

        {/* Card 6: Candidate Exchanges */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Exchanges</span>
            <Building2 className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="mt-2 font-display text-base font-bold text-on-surface">6 Found</div>
          <span className="mt-1 font-label-sm text-[9px] text-primary font-semibold">
            Top Conf: 94.8%
          </span>
        </div>

        {/* Card 7: Mixers / Tumblers */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Mixers</span>
            <AlertTriangle className="w-3.5 h-3.5 text-tertiary" />
          </div>
          <div className="mt-2 font-display text-base font-bold text-tertiary">1 Suspected</div>
          <span className="mt-1 font-label-sm text-[9px] text-error font-semibold">
            Wasabi Branch
          </span>
        </div>

        {/* Card 8: Active Alerts */}
        <div className="flex flex-col justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-[10px] uppercase tracking-wider">Active Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-error" />
          </div>
          <div className="mt-2 font-display text-base font-bold text-error">3 Triggered</div>
          <span className="mt-1 font-label-sm text-[9px] text-outline-variant">
            1 Crit • 2 High
          </span>
        </div>
      </div>

      {/* Workflow Stepper Bar */}
      <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <span className="font-label-sm text-xs font-bold text-outline uppercase tracking-wider">
            Problem Statement 09 Core Forensics Pipeline Workflow
          </span>
          <span className="font-mono text-[10px] text-secondary-container">
            All 8 Steps Operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-2 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-1 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="w-4 h-4 rounded-full bg-secondary-container text-on-secondary-container font-mono font-bold text-[9px] flex items-center justify-center">
                  {step.num}
                </span>
                <ChevronRight className="w-3 h-3 text-outline" />
              </div>
              <span className="font-label-sm text-xs font-semibold text-on-surface truncate">
                {step.title}
              </span>
              <span className="font-mono text-[9px] text-outline truncate">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-Column Forensic Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Trace Controls & Entity Filters (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Filter Parameters Card */}
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <span className="font-label-sm text-xs uppercase tracking-widest text-outline font-bold">
                Trace Parameters
              </span>
              <SlidersHorizontal className="w-4 h-4 text-outline" />
            </div>

            {/* Hop Depth Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-label-sm text-on-surface-variant font-medium">
                  Hop Depth Horizon
                </span>
                <span className="font-mono text-secondary-container font-semibold">
                  {hopDepthFilter} Hops Active
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((hop) => (
                  <button
                    key={hop}
                    onClick={() => setHopDepthFilter(hop)}
                    className={`py-1.5 rounded font-mono text-xs text-center transition-colors ${
                      hopDepthFilter === hop
                        ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {hop}
                  </button>
                ))}
              </div>
            </div>

            {/* Min TX Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-label-sm text-on-surface-variant font-medium">
                  Minimum Tx Value
                </span>
                <span className="font-mono text-secondary-container">
                  ≥ {minTxValue} BTC
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minTxValue}
                onChange={(e) => setMinTxValue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded cursor-pointer accent-primary-container"
              />
              <div className="flex justify-between font-mono text-[10px] text-outline">
                <span>0.00 BTC</span>
                <span>1.00 BTC</span>
              </div>
            </div>

            {/* Entity Filters */}
            <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/20">
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-semibold">
                Entity Visibility
              </span>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center justify-between p-2 rounded bg-surface-container/50 hover:bg-surface-container cursor-pointer transition-colors text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={entityVisibility.cex}
                      onChange={() => toggleEntityVisibility("cex")}
                      className="w-3.5 h-3.5 rounded bg-surface-container accent-primary-container"
                    />
                    <span className="font-label-md text-on-surface">Centralized Exchanges</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary-container/20 text-secondary-container font-bold">
                    6
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-surface-container/50 hover:bg-surface-container cursor-pointer transition-colors text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={entityVisibility.unhosted}
                      onChange={() => toggleEntityVisibility("unhosted")}
                      className="w-3.5 h-3.5 rounded bg-surface-container accent-primary-container"
                    />
                    <span className="font-label-md text-on-surface">Unhosted Wallets</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-bold">
                    18
                  </span>
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-surface-container/50 hover:bg-surface-container cursor-pointer transition-colors text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={entityVisibility.mixer}
                      onChange={() => toggleEntityVisibility("mixer")}
                      className="w-3.5 h-3.5 rounded bg-surface-container accent-primary-container"
                    />
                    <span className="font-label-md text-tertiary">Suspected Mixers</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-bold">
                    1
                  </span>
                </label>
              </div>
            </div>

            {/* Quick Jump */}
            <Link
              href="/graph"
              className="w-full py-2 px-3 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>EXPAND TO FULL GRAPH</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CENTER COLUMN: D3 Graph & VASP Ranking Preview (9 cols or flex) */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          {/* Graph Explorer Card */}
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-sm text-on-surface">
                  MULTI-HOP TRANSACTION GRAPH VISUALIZER (D3.JS)
                </h2>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NetworkX Compatible
                </span>
              </div>
              <Link
                href="/graph"
                className="text-xs text-secondary hover:underline flex items-center gap-1 font-mono"
              >
                <span>Full Canvas</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Interactive D3 Graph Canvas */}
            <div className="relative">
              <GraphCanvas height={480} />
            </div>
          </div>

          {/* Candidate Exchanges Ranking Quick Table */}
          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <h3 className="font-display font-semibold text-sm text-on-surface">
                CANDIDATE EXCHANGE RANKING (VASP ATTRIBUTION)
              </h3>
              <Link
                href="/rankings"
                className="text-xs text-secondary hover:underline font-mono"
              >
                View All Candidates ({candidates.length}) →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-outline text-[11px]">
                    <th className="py-2 px-3">RANK</th>
                    <th className="py-2 px-3">CANDIDATE VASP</th>
                    <th className="py-2 px-3">CONFIDENCE SCORE</th>
                    <th className="py-2 px-3">DEPOSITED (BTC)</th>
                    <th className="py-2 px-3">PATH HOPS</th>
                    <th className="py-2 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-secondary">#{c.rank}</td>
                      <td className="py-2.5 px-3 font-semibold text-on-surface">{c.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-container h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-secondary-container h-full rounded-full"
                              style={{ width: `${c.confidenceScore}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-secondary-container">
                            {c.confidenceScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-on-surface font-semibold">
                        {c.totalDepositedBtc} BTC
                      </td>
                      <td className="py-2.5 px-3 text-outline-variant">
                        {c.pathLengthHops} Hops
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/candidate/${c.id}`}
                            className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-secondary text-[11px] font-semibold"
                          >
                            Deep Dive
                          </Link>
                          <button
                            onClick={() => setLE28ModalOpen(true, c.name)}
                            className="px-2 py-1 rounded bg-error-container/30 hover:bg-error-container text-error text-[11px] font-semibold"
                          >
                            LE-28
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Node Inspector Side Drawer overlay if a node is selected */}
      <div className="fixed bottom-6 right-6 z-40">
        <NodeInspectorDrawer />
      </div>
    </div>
  );
}
