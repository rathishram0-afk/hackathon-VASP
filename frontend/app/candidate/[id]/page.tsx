"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  FileText,
  Copy,
  ExternalLink,
  Layers,
  Activity,
  Award,
} from "lucide-react";
import { useState } from "react";

export default function CandidateDeepDivePage() {
  const params = useParams();
  const router = useRouter();
  const { candidates, setLE28ModalOpen } = useForensicStore();

  const id = params?.id as string;
  const candidate = candidates.find((c) => c.id === id) || candidates[0];

  const [copied, setCopied] = useState(false);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-mono text-outline hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidates Ranking</span>
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/dossier"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate ISO/IEC 27037 Dossier</span>
          </Link>
          <button
            onClick={() => setLE28ModalOpen(true, candidate.name)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-error-container hover:bg-error text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ISSUE FORM LE-28 ASSET FREEZE</span>
          </button>
        </div>
      </div>

      {/* Main Candidate Header Card */}
      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center font-mono font-bold text-secondary-container text-xl">
            #{candidate.rank}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl text-on-surface">
                {candidate.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-semibold">
                {candidate.codeName}
              </span>
            </div>
            <p className="font-mono text-xs text-outline-variant">
              VASP ID: {candidate.vaspId} • Jurisdiction: {candidate.jurisdiction} • Contact:{" "}
              {candidate.complianceEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-surface-container/60 p-4 rounded-lg border border-outline-variant/30">
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-outline uppercase">
              ATTRIBUTION CONFIDENCE
            </span>
            <span className="font-mono text-3xl font-bold text-secondary-container">
              {candidate.confidenceScore}%
            </span>
          </div>
          <div className="h-10 w-px bg-outline-variant/40"></div>
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-outline uppercase">
              TOTAL DEPOSITED
            </span>
            <span className="font-mono text-xl font-bold text-on-surface">
              {candidate.totalDepositedBtc} BTC
            </span>
            <span className="font-mono text-[10px] text-outline">
              ≈ ${candidate.totalDepositedUsd.toLocaleString()} USD
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Evidence Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Evidence Matrix (6 cols) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
            <h2 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
              EVIDENTIARY CONFIDENCE METRICS BREAKDOWN
            </h2>

            <div className="flex flex-col gap-4 font-mono text-xs">
              {/* Path Directness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">
                    Path Directness & Hop Horizon (35% Weight)
                  </span>
                  <span className="font-bold text-secondary-container">
                    {candidate.directnessScore}%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary-container h-full rounded-full"
                    style={{ width: `${candidate.directnessScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Co-spent Linkage */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">
                    Co-Spent UTXO Cluster Linkage (25% Weight)
                  </span>
                  <span className="font-bold text-emerald-400">
                    {candidate.coSpendingLinkageScore}%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${candidate.coSpendingLinkageScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Volume Match */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">
                    Flow Volume Correlation (20% Weight)
                  </span>
                  <span className="font-bold text-primary">
                    {candidate.volumeCorrelationScore}%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${candidate.volumeCorrelationScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Time Proximity */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">
                    Temporal Execution Proximity (20% Weight)
                  </span>
                  <span className="font-bold text-tertiary">
                    {candidate.timeProximityScore}%
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full"
                    style={{ width: `${candidate.timeProximityScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Vault Addresses */}
          <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-3">
            <h3 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
              TARGET DEPOSIT VAULT ADDRESSES ({candidate.depositAddresses.length})
            </h3>
            <div className="flex flex-col gap-2 font-mono text-xs">
              {candidate.depositAddresses.map((addr) => (
                <div
                  key={addr}
                  className="flex items-center justify-between p-3 rounded bg-surface-container/60 border border-outline-variant/20"
                >
                  <span className="text-secondary-container font-semibold">{addr}</span>
                  <button
                    onClick={() => copyAddress(addr)}
                    className="text-outline hover:text-secondary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Hop Provenance Path (6 cols) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4">
            <h2 className="font-display font-semibold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
              MULTI-HOP PROVENANCE PATH TRAVERSAL
            </h2>

            <div className="flex flex-col gap-4 font-mono text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded bg-surface-container/60 border-l-4 border-error flex justify-between items-center">
                <div>
                  <span className="text-error font-bold block">HOP 1: SCAM EXPLOIT WALLET</span>
                  <span className="text-on-surface">0x83A1e91F24c90a1b2c4e51291884391F2</span>
                </div>
                <span className="text-outline">1.45 BTC</span>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded bg-surface-container/60 border-l-4 border-amber-400 flex justify-between items-center">
                <div>
                  <span className="text-amber-400 font-bold block">
                    HOP 2: UNHOSTED PEEL CHAIN HUB
                  </span>
                  <span className="text-on-surface">bc1q79x881a2k3m4p5q6r7s8t9u...</span>
                </div>
                <span className="text-outline">1.40 BTC</span>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded bg-surface-container/60 border-l-4 border-tertiary flex justify-between items-center">
                <div>
                  <span className="text-tertiary font-bold block">
                    HOP 3: WASABI COINJOIN OBFUSCATION
                  </span>
                  <span className="text-on-surface">bc1qmixerservice999wasabi...</span>
                </div>
                <span className="text-outline">0.90 BTC</span>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded bg-surface-container/60 border-l-4 border-emerald-400 flex justify-between items-center">
                <div>
                  <span className="text-emerald-400 font-bold block">
                    HOP 4: TARGET VASP DEPOSIT DESK ({candidate.name})
                  </span>
                  <span className="text-secondary-container font-bold">
                    {candidate.depositAddresses[0]}
                  </span>
                </div>
                <span className="text-secondary-container font-bold">
                  {candidate.totalDepositedBtc} BTC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
