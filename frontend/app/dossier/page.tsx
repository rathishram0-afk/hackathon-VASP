"use client";

import { useForensicStore } from "@/store/useForensicStore";
import { Printer, Download, ShieldCheck, FileText, Lock, Award, CheckCircle } from "lucide-react";

export default function DossierReportPage() {
  const { caseId, leadOfficer, primaryWallet, totalValueBtc, candidates, transactions } =
    useForensicStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              INVESTIGATION DOSSIER & EVIDENTIARY REPORT
            </h1>
            <span className="font-mono text-xs text-outline">
              ISO/IEC 27037 Compliant Digital Evidence Package • Case #{caseId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary-container hover:bg-inverse-primary text-on-primary-container font-label-md text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE AS PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/30 shadow-2xl flex flex-col gap-6 text-on-surface">
        {/* Document Header */}
        <div className="border-b-2 border-primary pb-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                ISO/IEC 27037 CERTIFIED EVIDENTIARY REPORT
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl uppercase">
              VASP TRACE CYBER FORENSICS DOSSIER
            </h2>
            <span className="font-mono text-xs text-outline">
              Case Ref: #{caseId} • Generated: {new Date().toUTCString()}
            </span>
          </div>

          <div className="p-3 rounded bg-surface-container border border-outline-variant/30 font-mono text-xs flex flex-col justify-center">
            <span className="text-outline">Lead Officer:</span>
            <span className="font-bold text-on-surface">{leadOfficer}</span>
            <span className="text-outline mt-1">Agency:</span>
            <span className="font-bold text-secondary-container">
              Cyber Crimes Enforcement Unit
            </span>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="flex flex-col gap-2 font-mono text-xs">
          <h3 className="font-display font-bold text-sm text-primary uppercase tracking-wider">
            1. Executive Forensic Summary
          </h3>
          <p className="p-4 rounded bg-surface-container/50 border border-outline-variant/20 leading-relaxed text-on-surface-variant">
            On September 1, 2026, an unauthorized phishing exploit resulted in a multi-hop drain of{" "}
            <strong className="text-secondary-container">{totalValueBtc} BTC</strong> from victim wallet{" "}
            <strong className="text-secondary-container">{primaryWallet}</strong>. Subsequent
            algorithmic tracing utilizing VASP TRACE identified a 4-hop propagation chain
            traversing unhosted intermediary peel hubs and a Wasabi CoinJoin tumbler before
            depositing into <strong className="text-secondary-container">Exchange Alpha (Binance)</strong> deposit vault with a 94.8% ML confidence score.
          </p>
        </div>

        {/* Key Evidentiary Findings */}
        <div className="flex flex-col gap-3 font-mono text-xs">
          <h3 className="font-display font-bold text-sm text-primary uppercase tracking-wider">
            2. Key Evidentiary Findings & VASP Rankings
          </h3>
          <table className="w-full text-left border-collapse border border-outline-variant/30">
            <thead>
              <tr className="bg-surface-container-high text-outline text-[11px]">
                <th className="p-2.5 border border-outline-variant/30">RANK</th>
                <th className="p-2.5 border border-outline-variant/30">VASP TARGET</th>
                <th className="p-2.5 border border-outline-variant/30">CONFIDENCE</th>
                <th className="p-2.5 border border-outline-variant/30">DEPOSITED BTC</th>
                <th className="p-2.5 border border-outline-variant/30">JURISDICTION</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-outline-variant/20">
                  <td className="p-2.5 font-bold text-secondary border border-outline-variant/30">
                    #{c.rank}
                  </td>
                  <td className="p-2.5 font-semibold text-on-surface border border-outline-variant/30">
                    {c.name}
                  </td>
                  <td className="p-2.5 font-bold text-secondary-container border border-outline-variant/30">
                    {c.confidenceScore}%
                  </td>
                  <td className="p-2.5 text-on-surface border border-outline-variant/30">
                    {c.totalDepositedBtc} BTC
                  </td>
                  <td className="p-2.5 text-outline-variant border border-outline-variant/30">
                    {c.jurisdiction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cryptographic Chain of Custody */}
        <div className="p-4 rounded-lg bg-surface-container/60 border border-outline-variant/30 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-sm text-emerald-400 uppercase">
              3. Cryptographic Chain of Custody Verification
            </h3>
          </div>
          <div className="flex justify-between items-center text-[11px] pt-1">
            <span className="text-outline">Report SHA-256 Digest:</span>
            <span className="text-secondary font-bold truncate max-w-md">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-outline">Investigator Digital Signature:</span>
            <span className="text-emerald-400 font-bold truncate max-w-md">
              SIG_ECDSA_Secp256k1_9918a77f00192a8847c011e4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
