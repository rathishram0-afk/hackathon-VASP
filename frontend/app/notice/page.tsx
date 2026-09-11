"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { ShieldAlert, CheckCircle2, Copy, FileText, Send, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LE28NoticePage() {
  const { le28Form, setLE28ModalOpen } = useForensicStore();
  const [copied, setCopied] = useState(false);

  const copyReceipt = () => {
    if (le28Form.transmissionReceipt) {
      navigator.clipboard.writeText(le28Form.transmissionReceipt.sha256Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-error-container/30 border border-error-container text-error">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline-lg text-lg font-bold text-on-surface">
              FORM LE-28 ASSET FREEZE NOTICE STATUS
            </h1>
            <p className="font-mono text-xs text-outline">
              ISO/IEC 27037 Emergency Compliance Notice • Case #{le28Form.caseRef}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLE28ModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error-container hover:bg-error text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
          <span>OPEN LE-28 NOTICE FORM</span>
        </button>
      </div>

      {/* Submission Receipt View */}
      {le28Form.isSubmitted && le28Form.transmissionReceipt ? (
        <div className="bg-surface-container-low p-8 rounded-lg border border-emerald-500/40 shadow-2xl flex flex-col gap-6 font-mono text-xs">
          {/* Status Badge */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="font-bold text-sm text-emerald-400 block">
                  NOTICE TRANSMITTED & ACKNOWLEDGED
                </span>
                <span className="text-outline text-[11px]">
                  Receipt ID: {le28Form.transmissionReceipt.receiptId}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              {le28Form.transmissionReceipt.deliveryStatus}
            </span>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-1">
              <span className="text-outline text-[10px] uppercase">Target VASP</span>
              <span className="font-bold text-on-surface text-sm">{le28Form.vaspName}</span>
            </div>
            <div className="p-3 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-1">
              <span className="text-outline text-[10px] uppercase">Seizure BTC Amount</span>
              <span className="font-bold text-secondary-container text-sm">
                {le28Form.seizureAmountBtc} BTC
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-1">
              <span className="text-outline text-[10px] uppercase">Target Deposit Vault</span>
              <span className="font-bold text-secondary text-xs truncate">
                {le28Form.targetAddress}
              </span>
            </div>
            <div className="p-3 rounded bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-1">
              <span className="text-outline text-[10px] uppercase">Transmitted Time</span>
              <span className="font-bold text-on-surface text-xs">
                {le28Form.transmissionReceipt.timestamp}
              </span>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div className="p-4 rounded bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-outline text-[10px] uppercase font-bold">
                Cryptographic SHA-256 Notice Hash
              </span>
              <button onClick={copyReceipt} className="text-outline hover:text-secondary">
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <span className="text-secondary-container font-mono text-xs break-all">
              {le28Form.transmissionReceipt.sha256Hash}
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/dossier"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-md"
            >
              <span>VIEW COMPLETE FORENSIC DOSSIER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-4 py-16">
          <ShieldAlert className="w-12 h-12 text-outline" />
          <h2 className="font-display font-semibold text-base text-on-surface">
            No Form LE-28 Freeze Notice Transmitted Yet
          </h2>
          <p className="font-mono text-xs text-outline max-w-md">
            Form LE-28 allows law enforcement officers to issue expedited 72-hour asset freeze
            requests to candidate VASP compliance desks under ISO/IEC 27037 protocols.
          </p>
          <button
            onClick={() => setLE28ModalOpen(true)}
            className="px-6 py-2.5 rounded-lg bg-error-container hover:bg-error text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-md mt-2"
          >
            ISSUE FORM LE-28 ASSET FREEZE
          </button>
        </div>
      )}
    </div>
  );
}
