'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { ForensicReport } from '@/components/report/ForensicReport';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Printer, Download, ArrowLeft, ShieldCheck, FileCheck } from 'lucide-react';

export default function ReportPage() {
  const { activeCase, graphData, attributions, evidence, mixerPatterns } = useInvestigation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream print:bg-white">
      {/* Non-printable layout elements */}
      <div className="no-print">
        <NavigationHeader />
        <CaseScopeBar />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6 lg:pl-64 print:pl-0 print:max-w-none print:w-full print:mx-0 print:p-0 print:space-y-0">
        {/* Top Control Bar (Screen only) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-pure-white border border-surface-dim shadow-xs">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 font-outfit text-xs text-slate-gray hover:text-ink-black font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-outfit text-slate-gray pr-2 border-r border-surface-dim">
              <ShieldCheck className="w-4 h-4 text-signal-orange" />
              <span>Forensic Investigation #{activeCase.id}</span>
            </div>

            <button
              onClick={() => {
                import('@/lib/pdfExport').then(({ downloadForensicReportPDF }) => {
                  import('@/lib/reportData').then(({ normalizeReportData }) => {
                    const data = normalizeReportData({
                      caseObj: activeCase,
                      graphData,
                      attributions,
                      evidence,
                      mixerPatterns,
                    });
                    downloadForensicReportPDF(data);
                  });
                });
              }}
              className="px-5 py-2.5 rounded-full bg-signal-orange hover:bg-orange-600 text-pure-white font-outfit font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Download official PDF forensic dossier with all 12 sections"
            >
              <Download className="w-4 h-4 text-pure-white" />
              <span>Download PDF Document</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full bg-ink-black hover:bg-slate-800 text-pure-white font-outfit font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Print directly or save as a high-resolution PDF document"
            >
              <Printer className="w-4 h-4 text-pure-white" />
              <span>Print / Save as PDF (A4)</span>
            </button>
          </div>
        </div>

        {/* Informational Guidance Banner (Screen only) */}
        <div className="no-print p-3 rounded-xl bg-lifted-cream border border-surface-dim text-xs font-outfit text-slate-gray flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-signal-orange shrink-0" />
            <span>
              This formal dossier is compiled dynamically from active investigation ledger data. To generate an official PDF file, click <strong>Print / Save as PDF</strong> and choose <strong>Save as PDF</strong> as your destination printer.
            </span>
          </div>
        </div>

        {/* Formal Report Document Container */}
        <div className="rounded-[32px] bg-white border border-surface-dim shadow-[0_20px_50px_rgba(20,20,19,0.06)] print:shadow-none print:border-none print:rounded-none overflow-hidden">
          <ForensicReport
            caseObj={activeCase}
            graphData={graphData}
            attributions={attributions}
            evidence={evidence}
            mixerPatterns={mixerPatterns}
          />
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
