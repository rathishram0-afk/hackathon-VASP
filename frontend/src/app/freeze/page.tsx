'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { downloadSubpoenaPDF } from '@/lib/subpoenaPdfExport';
import {
  Lock,
  Building,
  FileCheck,
  CheckCircle2,
  Download,
  Send,
  AlertTriangle,
  Printer,
  FileCode,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Scale,
  X
} from 'lucide-react';

interface ToastNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

function FreezeActionContent() {
  const searchParams = useSearchParams();
  const addressParam = searchParams.get('address') || '';

  const { activeCase, attributions, graphData, evidence } = useInvestigation();
  const primaryVasp = attributions[0] || {
    name: 'Binance',
    clusterId: '#BN-US-481',
    depositAddress: 'bc1qVaspDep91Binance884901',
    confidenceScore: 91,
    jurisdiction: 'Global Compliance',
  };

  const targetDepositAddress = addressParam || primaryVasp.depositAddress;

  const [officerName, setOfficerName] = useState<string>('Special Agent D. Vance');
  const [agencyName, setAgencyName] = useState<string>('Federal Crypto Asset Recovery Taskforce');
  const [subpoenaRef, setSubpoenaRef] = useState<string>(`SUB-${activeCase.id}-2026`);
  const [legalBasis, setLegalBasis] = useState<string>(
    'Emergency Restraining Order under ISO/IEC 27037 Attested Fraud Investigation.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Auto-dismiss in-app toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const targetFilename = `SUB-${activeCase.id}-2026.pdf`;

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      const actualTransactions = (graphData?.edges || []).map((e) => ({
        txHash: e.txHash,
        src: typeof e.source === 'object' && e.source !== null ? (e.source as { address?: string; id?: string }).address || (e.source as { address?: string; id?: string }).id || '' : String(e.source || ''),
        dst: typeof e.target === 'object' && e.target !== null ? (e.target as { address?: string; id?: string }).address || (e.target as { address?: string; id?: string }).id || '' : String(e.target || ''),
        valueBtc: e.amountBtc,
        timestamp: e.timestamp,
      }));

      const actualEvidence = (evidence || []).map((ev) => ({
        category: ev.category,
        description: ev.description,
        txHash: ev.txHash,
      }));

      downloadSubpoenaPDF(
        {
          subpoenaRef,
          caseId: activeCase.id,
          sourceWallet: activeCase.sourceWallet || activeCase.walletIntel?.address,
          network: activeCase.network || 'Bitcoin Mainnet',
          totalVolumeBtc: activeCase.totalVolumeBtc,
          riskLevel: activeCase.riskLevel,
          officerName,
          agencyName,
          legalBasis,
          issuedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          vasp: {
            name: primaryVasp.name,
            clusterId: primaryVasp.clusterId,
            depositAddress: targetDepositAddress,
            confidenceScore: primaryVasp.confidenceScore,
            jurisdiction: primaryVasp.jurisdiction,
          },
          transactions: actualTransactions,
          evidenceItems: actualEvidence,
        },
        targetFilename
      );

      // Requirement 14: Show professional success toast
      setToast({
        type: 'success',
        title: 'Subpoena dossier generated',
        message: `${targetFilename} is ready.`,
      });
    } catch (err) {
      console.error('Failed to generate Subpoena PDF:', err);
      // Requirement 15: In-app error notification with actual failure reason
      const reason = err instanceof Error ? err.message : String(err);
      setToast({
        type: 'error',
        title: 'Subpoena generation failed',
        message: reason,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportJSON = () => {
    const payload = {
      documentType: 'SUBPOENA_DUCES_TECUM_AND_FREEZE_NOTICE',
      subpoenaReference: subpoenaRef,
      caseId: activeCase.id,
      sourceWallet: activeCase.sourceWallet || activeCase.walletIntel?.address,
      network: activeCase.network || 'Bitcoin Mainnet',
      totalVolumeBtc: activeCase.totalVolumeBtc,
      riskLevel: activeCase.riskLevel,
      issuedAt: new Date().toISOString(),
      investigatingOfficer: officerName,
      enforcementAgency: agencyName,
      legalBasis,
      standard: 'ISO/IEC 27037 Attested Digital Evidence',
      targetVASP: {
        name: primaryVasp.name,
        clusterId: primaryVasp.clusterId,
        depositAddress: targetDepositAddress,
        confidenceScore: primaryVasp.confidenceScore,
        jurisdiction: primaryVasp.jurisdiction,
      },
      mandatedDirectives: [
        {
          clause: 'A',
          action: 'IMMEDIATE_ASSET_FREEZE',
          description: `Freeze all unspent transaction outputs (UTXOs) and withdrawal permissions associated with deposit address ${targetDepositAddress}.`,
        },
        {
          clause: 'B',
          action: 'PRODUCE_VERIFIED_KYC',
          description: 'Provide full customer identification records including legal name, government ID, linked bank accounts, and physical addresses.',
        },
        {
          clause: 'C',
          action: 'TELEMETRY_LOGS',
          description: 'Produce complete timestamped IP login history, session tokens, and device signatures.',
        },
        {
          clause: 'D',
          action: '180_DAY_PRESERVATION',
          description: 'Preserve all internal audit trails and communications for a statutory minimum of 180 days.',
        },
      ],
      cryptographicDigest: `SHA256:${subpoenaRef}-VERIFIED-ONCHAIN-DISCLOSURE`,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SUB-${activeCase.id}-2026_evidence.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(targetDepositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      {/* Floating In-App Toast Notification (Requirements 13-15) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 flex items-start gap-3 p-4 rounded-2xl bg-ink-black text-pure-white border border-surface-dim shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 max-w-md pointer-events-auto"
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="font-outfit font-bold text-sm leading-tight text-pure-white">
              {toast.title}
            </h4>
            <p className="font-dmsans text-xs text-slate-400 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-pure-white p-1 transition-colors shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="print:hidden">
        <NavigationHeader />
        <CaseScopeBar />
      </div>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-8 lg:pl-64 print:p-0 print:m-0 print:max-w-none">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
              CASE #{activeCase.id}
            </span>
            <h1 className="font-outfit font-bold text-3xl text-ink-black flex items-center gap-3 mt-1">
              <Lock className="w-8 h-8 text-signal-orange" />
              <span>Freeze Request & Legal Action Center</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              Generate formal emergency freeze notices and law-enforcement subpoena packages for compliance desks at candidate VASPs.
            </p>
          </div>

          <Link
            href="/report"
            className="px-6 py-3 rounded-full bg-pure-white border border-surface-dim text-ink-black hover:bg-surface-container-high transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-slate-gray" />
            <span>View Full Investigation Report</span>
          </Link>
        </div>

        {/* Target VASP Notice Preview Header */}
        <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm flex flex-wrap items-center justify-between gap-6 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-signal-orange/15 text-signal-orange flex items-center justify-center text-xl font-bold">
              <Building className="w-6 h-6 text-signal-orange" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit font-bold text-xl text-ink-black">
                  {primaryVasp.name} Compliance Desk
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-signal-orange text-ink-black font-outfit text-[10px] font-bold uppercase">
                  {primaryVasp.confidenceScore}% Match Target
                </span>
              </div>
              <span className="font-dmsans text-xs text-slate-gray">
                Jurisdiction: {primaryVasp.jurisdiction || 'International / Unspecified'} • Cluster: {primaryVasp.clusterId || '#CLUSTER-ATTRIBUTED'}
              </span>
            </div>
          </div>

          <div className="text-right font-outfit text-xs space-y-1">
            <span className="text-slate-gray block">Target Deposit Address:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-ink-black font-bold text-sm">
                {targetDepositAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                title="Copy Address"
                className="p-1 text-slate-gray hover:text-signal-orange transition-colors"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            {/* Status & Actions Card */}
            <div className="p-8 rounded-[36px] bg-emerald-500/10 border border-emerald-500/30 text-ink-black shadow-sm text-center space-y-4 print:hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-outfit font-bold text-2xl text-ink-black">
                Emergency Freeze Request Package Generated!
              </h2>
              <p className="font-dmsans text-sm text-slate-gray max-w-xl mx-auto leading-relaxed">
                Dossier reference <code className="font-mono font-bold text-ink-black">{subpoenaRef}</code> has been compiled into court-admissible PDF & JSON formats for transmission to {primaryVasp.name} legal compliance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-2 font-outfit text-xs">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-6 py-3 rounded-full bg-ink-black text-pure-white font-bold hover:bg-signal-orange hover:text-ink-black transition-colors flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download Subpoena Dossier (PDF)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-3 rounded-full bg-pure-white border border-surface-dim text-ink-black font-bold hover:bg-surface-container transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-gray" />
                  <span>Print Subpoena Notice</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-5 py-3 rounded-full bg-pure-white border border-surface-dim text-ink-black font-bold hover:bg-surface-container transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileCode className="w-4 h-4 text-slate-gray" />
                  <span>Export Evidence (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-3 rounded-full bg-transparent hover:bg-surface-container text-slate-gray hover:text-ink-black font-medium transition-colors cursor-pointer"
                >
                  <span>Edit Parameters</span>
                </button>
              </div>
            </div>

            {/* Formal Court-Admissible Subpoena Document Preview */}
            <div className="p-8 sm:p-12 rounded-[36px] bg-pure-white border border-surface-dim shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none">
              {/* Document Judicial Header */}
              <div className="border-b-2 border-ink-black pb-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-signal-orange mb-1">
                  <Scale className="w-6 h-6" />
                  <span className="font-outfit font-extrabold text-xs tracking-widest uppercase">
                    Official Law Enforcement Directive
                  </span>
                </div>
                <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-ink-black uppercase tracking-tight">
                  Formal Notice of Emergency Asset Freeze & Subpoena Duces Tecum
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-outfit text-slate-gray pt-1">
                  <span>REF: <strong className="text-ink-black font-mono">{subpoenaRef}</strong></span>
                  <span>•</span>
                  <span>CASE FILE: <strong className="text-ink-black font-mono">#{activeCase.id}</strong></span>
                  <span>•</span>
                  <span>DATE: <strong className="text-ink-black">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
                </div>
              </div>

              {/* Section 1: Addressee & Target Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-outfit font-bold uppercase tracking-wider text-slate-gray">
                  <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[10px] text-ink-black font-bold">1</span>
                  <span>Recipient Compliance Authority & Target VASP</span>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container/60 border border-surface-dim grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-dmsans">
                  <div>
                    <span className="text-slate-gray block text-[11px]">Addressed Compliance Desk:</span>
                    <strong className="text-ink-black text-sm font-outfit">{primaryVasp.name} Legal Compliance & Inquiries Department</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Operational Jurisdiction:</span>
                    <strong className="text-ink-black">{primaryVasp.jurisdiction || 'International / Unspecified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Target Deposit Address:</span>
                    <strong className="font-mono text-ink-black break-all">{targetDepositAddress}</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Cluster Attribution Confidence:</span>
                    <strong className="text-signal-orange font-bold font-outfit">{primaryVasp.confidenceScore}% Mathematical Certainty (Heuristic Match)</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Investigation Scope & Origin */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-outfit font-bold uppercase tracking-wider text-slate-gray">
                  <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[10px] text-ink-black font-bold">2</span>
                  <span>Investigation Origin & Traced Scope</span>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container/60 border border-surface-dim grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-dmsans">
                  <div>
                    <span className="text-slate-gray block text-[11px]">Originating Suspicious Address:</span>
                    <strong className="font-mono text-ink-black break-all">{activeCase.sourceWallet || activeCase.walletIntel?.address || 'Recorded in Ledger'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Blockchain Network:</span>
                    <strong className="text-ink-black">{activeCase.network || 'Bitcoin Mainnet'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Total Volume Traced:</span>
                    <strong className="text-ink-black">{activeCase.totalVolumeBtc ? `${activeCase.totalVolumeBtc} BTC` : 'Documented in Case Ledger'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-gray block text-[11px]">Risk Assessment:</span>
                    <strong className="text-red-600 dark:text-red-400 font-bold">{activeCase.riskLevel || 'CRITICAL'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 3: Statutory Authority & Legal Mandate */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-outfit font-bold uppercase tracking-wider text-slate-gray">
                  <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[10px] text-ink-black font-bold">3</span>
                  <span>Statutory Authority & Fraud Directive</span>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container/30 border border-surface-dim text-xs font-dmsans text-ink-black leading-relaxed space-y-2">
                  <p>
                    Pursuant to 18 U.S.C. §§ 981 and 982 (Civil & Criminal Asset Forfeiture), the Bank Secrecy Act (31 U.S.C. 5311 et seq.), and applicable international Mutual Legal Assistance Treaties (MLAT), formal notice is served upon the compliance directors of <strong>{primaryVasp.name}</strong>.
                  </p>
                  <p className="text-slate-gray">
                    <strong>Investigative Basis:</strong> {legalBasis} The target deposit address identified has received traced proceeds linked directly to reported illicit cryptocurrency transactions under active law enforcement inquiry.
                  </p>
                </div>
              </div>

              {/* Section 4: Mandated Directives */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-outfit font-bold uppercase tracking-wider text-slate-gray">
                  <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-[10px] text-ink-black font-bold">4</span>
                  <span>Mandated Actions & Production Requirements</span>
                </div>

                <div className="space-y-2 text-xs font-dmsans">
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <span className="font-outfit font-bold text-red-600 dark:text-red-400 shrink-0">CLAUSE A.</span>
                    <p className="text-ink-black leading-snug">
                      <strong>Immediate Asset Restraint:</strong> Immediately place an administrative freeze upon deposit address <code className="font-mono font-bold text-xs">{targetDepositAddress}</code>, restricting all external withdrawals, off-chain conversions, and internal transfers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container/50 border border-surface-dim flex items-start gap-3">
                    <span className="font-outfit font-bold text-ink-black shrink-0">CLAUSE B.</span>
                    <p className="text-ink-black leading-snug">
                      <strong>Production of KYC & Identity Records:</strong> Produce unredacted verified customer documentation including legal full name, government identification credentials, linked bank account identifiers, physical mailing address, and registered contact information.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container/50 border border-surface-dim flex items-start gap-3">
                    <span className="font-outfit font-bold text-ink-black shrink-0">CLAUSE C.</span>
                    <p className="text-ink-black leading-snug">
                      <strong>Audit Telemetry & Connection Logs:</strong> Disclose timestamped IP connection logs, session cookies, user-agent fingerprints, and API trading credentials utilized for account operations.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container/50 border border-surface-dim flex items-start gap-3">
                    <span className="font-outfit font-bold text-ink-black shrink-0">CLAUSE D.</span>
                    <p className="text-ink-black leading-snug">
                      <strong>180-Day Preservation Directive:</strong> Preserve all database ledger entries, communications, and audit trails intact for one hundred eighty (180) days from service date.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: Officer Certification & Digital Stamp */}
              <div className="pt-4 border-t border-surface-dim flex flex-wrap items-center justify-between gap-6 text-xs font-outfit">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-gray uppercase tracking-wider block">
                    Authorizing Investigating Officer
                  </span>
                  <div className="text-base font-extrabold text-ink-black">{officerName}</div>
                  <div className="text-slate-gray">{agencyName}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    ✓ ISO/IEC 27037 Attested Electronic Disclosure
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container/80 border border-surface-dim text-right font-mono text-[10px] space-y-1">
                  <span className="text-slate-gray block">Digital Verification Stamp</span>
                  <span className="font-bold text-ink-black block">SHA256:{subpoenaRef}-VERIFIED</span>
                  <span className="text-slate-gray block">Transmitted via VASP Trace Legal Action Center</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Form to Generate Request */
          <form
            onSubmit={handleSubmitNotice}
            className="p-8 rounded-[36px] bg-pure-white border border-surface-dim shadow-sm space-y-6"
          >
            <h3 className="font-outfit font-bold text-xl text-ink-black border-b border-surface-dim pb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-signal-orange" />
              <span>Law-Enforcement Freeze Notice Generator</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Investigating Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Enforcement Agency / Taskforce
                </label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Official Subpoena Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={subpoenaRef}
                  onChange={(e) => setSubpoenaRef(e.target.value)}
                  className="w-full bg-surface-container font-mono text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
              </div>

              <div className="space-y-2">
                <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
                  Legal Basis & Fraud Statutory Reference
                </label>
                <input
                  type="text"
                  required
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value)}
                  className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none focus:ring-1 focus:ring-ink-black"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 font-dmsans text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-signal-orange shrink-0" />
              <span>
                Compliance Directive: Submitting this form compiles verified on-chain forensic evidence into a formal court-admissible legal freeze request package ready for PDF download or judicial transmission.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-signal-orange text-ink-black font-outfit font-bold text-sm hover:bg-signal-orange-light transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Generate Court-Admissible Subpoena Notice</span>
            </button>
          </form>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default function FreezeActionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas-cream" />}>
      <FreezeActionContent />
    </Suspense>
  );
}
