"use client";

import { useForensicStore } from "@/store/useForensicStore";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, ArrowRight, Activity, RefreshCw, Zap } from "lucide-react";

export default function MixersAlertPage() {
  const { mixerAlert } = useForensicStore();

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Alert Header */}
      <div className="bg-surface-container-low p-6 rounded-lg border border-error/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-tertiary-container/30 border border-tertiary text-tertiary">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-error-container text-error font-mono text-[10px] font-bold uppercase">
                HIGH SEVERITY OBFUSCATION DETECTED
              </span>
              <span className="font-mono text-xs text-outline">{mixerAlert.id}</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-on-surface">
              POTENTIAL MIXER / TUMBLER ALERT: {mixerAlert.mixerName}
            </h1>
            <p className="font-mono text-xs text-outline-variant">
              Detected at: {mixerAlert.detectedTime} • Branch: {mixerAlert.branchName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-surface-container/60 p-4 rounded-lg border border-outline-variant/30">
          <div className="flex flex-col items-end font-mono">
            <span className="text-outline text-[10px] uppercase">ENTROPY SCORE</span>
            <span className="text-2xl font-bold text-tertiary">
              {mixerAlert.entropyScore}%
            </span>
          </div>
          <div className="h-10 w-px bg-outline-variant/40"></div>
          <div className="flex flex-col font-mono">
            <span className="text-outline text-[10px] uppercase">OBFUSCATED VALUE</span>
            <span className="text-2xl font-bold text-error">
              {mixerAlert.obfuscatedAmountBtc} BTC
            </span>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Equal Output Pattern Breakdown (7 cols) */}
        <div className="xl:col-span-7 bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
          <h2 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
            EQUAL-OUTPUT COINJOIN DENOMINATION PATTERN ANALYSIS
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20">
              <span className="text-outline text-[10px] uppercase block">Equal Output Denom</span>
              <span className="font-bold text-secondary-container text-sm">
                {mixerAlert.equalOutputDenomBtc} BTC
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20">
              <span className="text-outline text-[10px] uppercase block">Input Hop Index</span>
              <span className="font-bold text-on-surface text-sm">
                Hop #{mixerAlert.inputHop}
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container/40 border border-outline-variant/20">
              <span className="text-outline text-[10px] uppercase block">Peel Chain Horizon</span>
              <span className="font-bold text-amber-400 text-sm">
                {mixerAlert.peelChainDepth} Levels Deep
              </span>
            </div>
          </div>

          {/* Associated Hashes */}
          <div className="flex flex-col gap-2 font-mono text-xs pt-2">
            <span className="text-outline text-[11px] font-bold uppercase">
              Flagged CoinJoin Transaction Hashes
            </span>
            {mixerAlert.txHashes.map((hash) => (
              <div
                key={hash}
                className="p-3 rounded bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between"
              >
                <span className="text-tertiary font-semibold truncate max-w-md">{hash}</span>
                <Link
                  href="/transactions"
                  className="px-2.5 py-1 rounded bg-surface-container-high text-secondary text-[10px] font-semibold"
                >
                  Inspect Tx
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Demixing Velocity & Target Recommendations (5 cols) */}
        <div className="xl:col-span-5 bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4 font-mono text-xs">
          <h2 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
            POST-MIX UNMIXING VELOCITY & RECOMMENDATIONS
          </h2>

          <div className="p-4 rounded bg-surface-container/60 border border-outline-variant/30 flex flex-col gap-2">
            <span className="text-outline text-[10px] uppercase">Post-Mix Exit Velocity</span>
            <span className="text-xl font-bold text-emerald-400">
              {mixerAlert.unmixedVelocityBtc} BTC Swept to Deposit Desks
            </span>
            <p className="text-outline-variant text-[11px] leading-relaxed">
              Heuristic analysis indicates 97.7% of the mixed output volume was consolidated into
              unhosted peel chains leading directly to Exchange Alpha deposit vault within 72 hours.
            </p>
          </div>

          <Link
            href="/rankings"
            className="w-full py-3 px-4 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md mt-4"
          >
            <span>PROCEED TO CANDIDATE VASP RANKING</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
