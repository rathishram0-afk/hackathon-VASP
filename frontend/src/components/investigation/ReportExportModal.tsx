'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Copy, Shield, Check, Printer } from 'lucide-react';
import { Investigation } from '@/types/forensics';

interface ReportExportModalProps {
  investigation: Investigation;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportExportModal({ investigation, isOpen, onClose }: ReportExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const topAttribution = investigation.attributions[0];

  const handleCopySummary = () => {
    const text = `VASP TRACE FORENSIC REPORT
Case ID: ${investigation.caseNumber}
Scam Type: ${investigation.scamType}
Target Wallet: ${investigation.sourceWallet} (${investigation.blockchain})
Attributed VASP: ${topAttribution?.vaspName || 'Unknown'} (${topAttribution?.confidenceScore}% Confidence)
Destination Cluster: ${topAttribution?.destinationWallet || 'N/A'}
Traced Volume: ${investigation.totalTracedVolumeBtc} BTC across ${investigation.maxHops} Hops
Investigator: ${investigation.investigator}
Timestamp: ${new Date().toUTCString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(investigation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${investigation.caseNumber}_Forensic_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#121722] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-4 bg-[#0B0E14] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#0C6CF2]" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Formal Law Enforcement Freeze Request & Report
              </h3>
              <span className="text-xs text-[#64748B] font-mono">Case: {investigation.caseNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E293B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Document Content Body - Printable Format */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-[#07090E] text-[#E2E8F0] border-b border-[#1E293B]">
          {/* Header Identity Block */}
          <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
            <div>
              <div className="text-xl font-bold text-white font-sans tracking-tight">
                VASP<span className="text-[#0C6CF2]">TRACE</span> FORENSICS DISCLOSURE
              </div>
              <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Official Blockchain Evidence Disclosure & Asset Freeze Request
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-white font-bold">{investigation.caseNumber}</div>
              <div className="text-[#64748B]">{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

          {/* Case Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px]">
            <div className="p-2.5 bg-[#121722] border border-[#1E293B] rounded">
              <span className="text-[#64748B] block text-[10px]">SCAM CLASSIFICATION</span>
              <span className="text-white font-bold">{investigation.scamType}</span>
            </div>
            <div className="p-2.5 bg-[#121722] border border-[#1E293B] rounded">
              <span className="text-[#64748B] block text-[10px]">TARGET VASP</span>
              <span className="text-[#0C6CF2] font-bold">{topAttribution?.vaspName || 'Binance'}</span>
            </div>
            <div className="p-2.5 bg-[#121722] border border-[#1E293B] rounded">
              <span className="text-[#64748B] block text-[10px]">ATTRIBUTION SCORE</span>
              <span className="text-emerald-400 font-bold">{topAttribution?.confidenceScore}% Match</span>
            </div>
            <div className="p-2.5 bg-[#121722] border border-[#1E293B] rounded">
              <span className="text-[#64748B] block text-[10px]">TRACED VOLUME</span>
              <span className="text-white font-bold">{investigation.totalTracedVolumeBtc} BTC</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              1. Executive Summary & Evidence Finding
            </h4>
            <p className="p-3 bg-[#121722] border border-[#1E293B] rounded leading-relaxed text-[#94A3B8]">
              {investigation.summary}
            </p>
          </div>

          {/* Attribution Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              2. Candidate VASP Destination Cluster
            </h4>
            <div className="p-3 bg-[#121722] border border-[#1E293B] rounded font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Destination Deposit Cluster:</span>
                <span className="text-[#0C6CF2] font-bold">{topAttribution?.destinationWallet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Cluster Identifier:</span>
                <span className="text-white">{topAttribution?.depositClusterId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Hop Proximity:</span>
                <span className="text-white">{topAttribution?.hopProximity} Hops from Source</span>
              </div>
            </div>
          </div>

          {/* Formal Action Instructions */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              3. Recommended Law Enforcement Action
            </h4>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 space-y-1">
              <div className="font-bold font-mono">EMERGENCY COMPLIANCE HOLD REQUEST</div>
              <p className="text-[11px] leading-relaxed">
                Pursuant to financial crime regulations and emergency legal freeze procedures, request compliance desk of {topAttribution?.vaspName || 'Exchange'} to immediately place an administrative hold on incoming funds originating from cluster <code className="font-mono text-white">{topAttribution?.depositClusterId}</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-[#0B0E14] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] text-white text-xs font-medium rounded flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#94A3B8]" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] text-white text-xs font-medium rounded flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>JSON Bundle</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-[#0C6CF2] hover:bg-blue-600 text-white text-xs font-semibold rounded flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
