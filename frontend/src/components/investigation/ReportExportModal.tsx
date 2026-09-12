'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Copy, Shield, Check, Printer } from 'lucide-react';
import { Investigation } from '@/types/forensics';
import { downloadForensicReportPDF } from '@/lib/pdfExport';
import { normalizeReportData } from '@/lib/reportData';
import { ForensicReport } from '@/components/report/ForensicReport';

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

  const handleDownloadPDF = () => {
    const data = normalizeReportData({ investigation });
    downloadForensicReportPDF(data);
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
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-white text-ink-black">
          <ForensicReport investigation={investigation} />
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-[#0B0E14] flex flex-wrap items-center justify-between gap-3 border-t border-[#1E293B]">
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
            <a
              href="/report"
              className="px-3 py-1.5 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] text-white text-xs font-medium rounded flex items-center space-x-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-[#0C6CF2]" />
              <span>Dedicated Report View</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded flex items-center space-x-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-[#0C6CF2] hover:bg-blue-600 text-white text-xs font-semibold rounded flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
