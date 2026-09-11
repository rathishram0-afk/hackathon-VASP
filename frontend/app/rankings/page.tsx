"use client";

import { useForensicStore } from "@/store/useForensicStore";
import Link from "next/link";
import { Building2, ShieldAlert, ArrowRight, CheckCircle2, Sliders, ExternalLink } from "lucide-react";

export default function RankingsPage() {
  const { candidates, setLE28ModalOpen } = useForensicStore();

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-secondary-container/20 text-secondary-container">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline-lg text-xl font-bold text-on-surface">
              CANDIDATE EXCHANGE RANKING & VASP ATTRIBUTION
            </h1>
            <p className="font-mono text-xs text-outline">
              Machine Learning Confidence Scoring & UTXO Provenance Matrix • Case #VT-0921
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-outline px-3 py-1 rounded bg-surface-container-high border border-outline-variant/30">
            {candidates.length} Candidate VASPs Identified
          </span>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="flex flex-col gap-4">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4 hover:border-secondary-container/50 transition-all"
          >
            {/* Card Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-mono font-bold text-secondary text-base border border-outline-variant/30">
                  #{c.rank}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-semibold text-lg text-on-surface">
                      {c.name}
                    </h2>
                    <span className="font-mono text-xs text-outline">({c.codeName})</span>
                    <span
                      className={`font-label-sm text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.riskCategory === "CRITICAL_EXPOSURE"
                          ? "bg-error-container text-error"
                          : c.riskCategory === "HIGH_PROBABILITY"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {c.riskCategory.replace("_", " ")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-outline-variant">
                    VASP ID: {c.vaspId} • Jurisdiction: {c.jurisdiction}
                  </span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="flex items-center gap-4 bg-surface-container/60 p-3 rounded-lg border border-outline-variant/30">
                <div className="flex flex-col items-end">
                  <span className="font-label-sm text-[10px] text-outline uppercase">
                    ML Confidence Score
                  </span>
                  <span className="font-mono text-xl font-bold text-secondary-container">
                    {c.confidenceScore}%
                  </span>
                </div>
                <div className="w-24 bg-surface-container-lowest h-3 rounded-full overflow-hidden p-0.5 border border-outline-variant/40">
                  <div
                    className="bg-secondary-container h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.confidenceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sub-Metrics Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-label-sm text-[10px] text-outline uppercase">
                  Total Deposited
                </span>
                <span className="font-bold text-on-surface text-sm">
                  {c.totalDepositedBtc} BTC
                </span>
                <span className="text-[10px] text-outline-variant">
                  ≈ ${c.totalDepositedUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-label-sm text-[10px] text-outline uppercase">
                  Path Horizon
                </span>
                <span className="font-bold text-secondary text-sm">
                  {c.pathLengthHops} Hops
                </span>
                <span className="text-[10px] text-outline-variant">
                  Directness Score: {c.directnessScore}%
                </span>
              </div>

              <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-label-sm text-[10px] text-outline uppercase">
                  Co-Spending Link
                </span>
                <span className="font-bold text-emerald-400 text-sm">
                  {c.coSpendingLinkageScore}% Match
                </span>
                <span className="text-[10px] text-outline-variant">
                  Cluster Co-spend Verification
                </span>
              </div>

              <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20 flex flex-col gap-1">
                <span className="font-label-sm text-[10px] text-outline uppercase">
                  Time Proximity
                </span>
                <span className="font-bold text-tertiary text-sm">
                  {c.timeProximityScore}%
                </span>
                <span className="text-[10px] text-outline-variant">
                  Last: {c.lastDepositTime}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <span className="font-mono text-xs text-outline">
                Legal Contact: {c.complianceEmail}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLE28ModalOpen(true, c.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-error-container/30 hover:bg-error-container text-error font-label-md text-xs font-semibold transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>ISSUE FORM LE-28 FREEZE</span>
                </button>
                <Link
                  href={`/candidate/${c.id}`}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-md text-xs font-semibold transition-all shadow-sm"
                >
                  <span>DEEP DIVE EVIDENCE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
