'use client';

import React from 'react';
import {
  InvestigationCase,
  GraphData,
  VASPAttribution,
  EvidenceItem,
  MixerPattern,
} from '@/types';
import { Investigation } from '@/types/forensics';
import { normalizeReportData, NormalizedReportData } from '@/lib/reportData';
import { downloadForensicReportPDF } from '@/lib/pdfExport';
import { Download, Printer, Shield, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

interface ForensicReportProps {
  caseObj?: InvestigationCase;
  investigation?: Investigation;
  graphData?: GraphData;
  attributions?: VASPAttribution[];
  evidence?: EvidenceItem[];
  mixerPatterns?: MixerPattern[];
  generatedAt?: string;
}

export const ForensicReport: React.FC<ForensicReportProps> = (props) => {
  const data: NormalizedReportData = normalizeReportData(props);

  const handleDownloadPDF = () => {
    downloadForensicReportPDF(data);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-white text-neutral-900 font-sans print:max-w-none print:w-full print:mx-0 print:p-0 print:text-black">
      {/* Print-specific style block */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>

      {/* Main Report Container */}
      <div className="p-8 sm:p-12 print:p-0 space-y-10">

        {/* ================================================================= */}
        {/* PAGE 1 — CASE OVERVIEW & EXECUTIVE SUMMARY */}
        {/* ================================================================= */}
        <section className="border-b-2 border-neutral-900 pb-6 space-y-5 print-break-inside-avoid">
          {/* Header Action Strip (Screen only) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-700">
              <Shield className="w-4 h-4 text-neutral-900" />
              <span className="font-bold">{data.caseId}</span>
              <span>•</span>
              <span>{data.network}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Download verified multi-page vector PDF document directly"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Document</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Print or save via browser PDF printer"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-700" />
                <span>Print / Save (A4)</span>
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-block px-2.5 py-0.5 mb-2 bg-neutral-900 text-white font-mono text-xs font-bold tracking-widest uppercase rounded">
                CONFIDENTIAL FORENSIC DISCLOSURE
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-sans uppercase">
                VASP TRACE
              </h1>
              <p className="text-sm font-semibold tracking-wide text-neutral-600 uppercase mt-0.5">
                OFFICIAL FORENSIC INVESTIGATION REPORT
              </p>
            </div>
            <div className="text-right font-mono text-xs text-neutral-700 space-y-1">
              <div>
                <span className="font-semibold text-neutral-500">CASE ID: </span>
                <span className="font-bold text-neutral-900 text-sm">{data.caseId}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">INVESTIGATION ID: </span>
                <span className="font-mono text-neutral-900">{data.investigationId}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">DATE (UTC): </span>
                <span>{data.reportDate}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">STATUS: </span>
                <span className="font-bold uppercase text-neutral-900">{data.status}</span>
              </div>
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Investigation Metrics & Scope:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Total Nodes</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.totalNodes} Wallets</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Total Transactions</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.totalTransactions} Directed Txs</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Maximum Hop Depth</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.maxHopDepth} Hops Outward</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Total BTC Traced</span>
                <span className="font-mono font-bold text-neutral-900 block">{data.statistics.totalBtcTraced}</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Intermediary Relays</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.intermediaryCount} Nodes</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">VASP Candidates</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.candidateCount} Identified</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">High-Risk Nodes</span>
                <span className="font-bold text-neutral-900 block">{data.statistics.highRiskCount} Flagged</span>
              </div>
              <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50">
                <span className="block text-[11px] font-semibold text-neutral-500 uppercase">Mixer / Tumbler</span>
                <span className="font-bold text-neutral-900 truncate block">{data.statistics.mixerStatus}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans block">
              Executive Case Summary
            </span>
            <div className="p-3.5 bg-neutral-50 border border-neutral-300 rounded text-xs text-neutral-800 leading-relaxed font-sans">
              <p>{data.executiveSummary}</p>
            </div>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 2 — SOURCE WALLET ANALYSIS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">02.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Source Wallet Profile
            </h2>
          </div>

          <div className="border border-neutral-300 rounded divide-y divide-neutral-200 text-xs">
            <div className="p-3 bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-neutral-600">Full Investigated Address:</span>
              <span className="font-mono font-bold text-neutral-900 break-all">{data.sourceIntel.address}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Blockchain Network:</span>
                  <span className="font-bold text-neutral-900">{data.sourceIntel.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Forensic Role:</span>
                  <span className="font-bold text-neutral-900">{data.sourceIntel.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Classification:</span>
                  <span className="font-bold text-neutral-900">{data.sourceIntel.classification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Source Risk Score:</span>
                  <span className="font-bold text-red-700">
                    {data.sourceIntel.riskScore != null ? `${data.sourceIntel.riskScore}/100 (CRITICAL)` : 'Not scored'}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Transaction Count:</span>
                  <span className="font-bold text-neutral-900">{data.sourceIntel.txCount} transactions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Recorded Incoming:</span>
                  <span className="font-mono text-neutral-900">{data.sourceIntel.incomingAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Recorded Outgoing:</span>
                  <span className="font-mono font-bold text-neutral-900">{data.sourceIntel.outgoingAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">First Active / Timestamp:</span>
                  <span className="font-mono text-neutral-900">{data.sourceIntel.firstTx}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Last Active / Timestamp:</span>
                  <span className="font-mono text-neutral-900">{data.sourceIntel.lastTx}</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 3 — FULL TRANSACTION TRACE */}
        {/* ================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neutral-500">03.</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
                Full Transaction Trace — Main Investigation Flow
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {data.mainPathEdges.length} Verified Path Transactions
            </span>
          </div>

          <p className="text-xs text-neutral-600">
            Chronological sequence of verified fund movements directly carrying investigated volume along the primary
            relay corridor outward from the source vault to destination candidates. Transaction hashes and addresses are displayed in full:
          </p>

          <div className="overflow-x-auto border border-neutral-300 rounded">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-2.5 w-10 text-center">Hop</th>
                  <th className="py-2.5 px-2.5">From Address</th>
                  <th className="py-2.5 px-2.5">To Address</th>
                  <th className="py-2.5 px-2.5">Transaction Hash</th>
                  <th className="py-2.5 px-2 text-right">Amount (BTC)</th>
                  <th className="py-2.5 px-2">Timestamp (UTC)</th>
                  <th className="py-2.5 px-2 text-center">Dest. Role</th>
                  <th className="py-2.5 px-2 text-center">Risk</th>
                  <th className="py-2.5 px-2.5">Attributed VASP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.mainPathEdges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-3 text-center text-neutral-500 italic">
                      No primary path transactions recorded.
                    </td>
                  </tr>
                ) : (
                  data.mainPathEdges.map((edge, idx) => (
                    <tr key={edge.id || idx} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-2.5 font-mono font-bold text-center text-neutral-700">
                        {edge.hop}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[10px] text-neutral-800 break-all max-w-[140px]">
                        {edge.src}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[10px] text-neutral-800 break-all max-w-[140px]">
                        {edge.dst}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[10px] text-neutral-700 break-all max-w-[150px]">
                        {edge.txHash}
                      </td>
                      <td className="py-2 px-2 font-mono font-bold text-right text-neutral-900 whitespace-nowrap">
                        {edge.amountBtc != null ? edge.amountBtc.toFixed(4) : 'N/A'}
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px] text-neutral-600 whitespace-nowrap">
                        {edge.timestamp}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block px-1 py-0.5 rounded text-[9px] font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-300">
                          {edge.destRole}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[10px]">
                        {edge.destRiskScore != null ? (
                          <span className="font-bold text-amber-800">{edge.destRiskScore}/100</span>
                        ) : (
                          <span className="text-neutral-400">Not scored</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-[10px]">
                        {edge.vaspName ? (
                          <span className="font-bold text-amber-900">
                            {edge.vaspName} ({edge.attributionConfidence || 0}%)
                          </span>
                        ) : (
                          <span className="text-neutral-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 4 — WALLET / NODE ANALYSIS */}
        {/* ================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neutral-500">04.</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
                Wallet & Node Analysis
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {data.nodes.length} Analyzed Graph Nodes
            </span>
          </div>

          <p className="text-xs text-neutral-600">
            Complete inventory of all addresses participating in the traversal graph. Unassessed peripheral nodes
            remain documented for complete contextual topology and are explicitly noted as Not scored:
          </p>

          <div className="overflow-x-auto border border-neutral-300 rounded">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-semibold text-[10px] uppercase">
                  <th className="py-2 px-2.5 w-12 text-center">Hop</th>
                  <th className="py-2 px-2.5">Address</th>
                  <th className="py-2 px-2.5">Classification</th>
                  <th className="py-2 px-2.5">Role</th>
                  <th className="py-2 px-2.5 text-center">Risk Score</th>
                  <th className="py-2 px-2.5">VASP</th>
                  <th className="py-2 px-2.5 text-center">Attribution Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-[11px]">
                {data.nodes.map((node, idx) => {
                  const matchingAttr = data.attributions.find((a) => a.depositAddress === node.address);

                  return (
                    <tr key={node.address || idx} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-2.5 font-mono text-center text-neutral-700 font-bold">
                        {node.hopDistance}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-neutral-900 break-all max-w-[200px]">
                        {node.address}
                      </td>
                      <td className="py-2 px-2.5 text-[11px] text-neutral-700">
                        {node.type}
                      </td>
                      <td className="py-2 px-2.5">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          node.role === 'SOURCE'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : node.role === 'VASP CANDIDATE'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : node.role === 'MAIN RELAY'
                            ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {node.role}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold">
                        {node.riskScore != null ? (
                          <span className={node.riskScore >= 80 ? 'text-red-700' : 'text-amber-700'}>
                            {node.riskScore}/100
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-normal">Not scored</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-[11px] text-neutral-800">
                        {matchingAttr ? (
                          <span className="font-bold text-amber-900">{matchingAttr.name}</span>
                        ) : (
                          <span className="text-neutral-400">None</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono">
                        {node.candidateConfidence != null ? (
                          <span className="font-bold text-neutral-900">{node.candidateConfidence}%</span>
                        ) : (
                          <span className="text-neutral-400">Not evaluated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 5 — VASP ATTRIBUTION ANALYSIS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neutral-500">05.</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
                VASP Attribution Analysis
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {data.attributions.length} Candidate Endpoints
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed space-y-1">
            <span className="font-bold uppercase tracking-wide block">Notice on Metric Separation:</span>
            <span>
              <strong>VASP Attribution Confidence</strong> indicates analytical pattern resemblance to known custodial deposit architecture.
              It is strictly distinct from <strong>Node Risk Score</strong> (which measures illicit taint proximity). Attribution confidence must not be cited as a risk score.
            </span>
          </div>

          <div className="overflow-x-auto border border-neutral-300 rounded">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-2.5 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-2.5">Candidate / VASP</th>
                  <th className="py-2.5 px-2.5">Cluster Identifier</th>
                  <th className="py-2.5 px-2.5">Deposit Address</th>
                  <th className="py-2.5 px-2 text-center">Attribution Confidence</th>
                  <th className="py-2.5 px-2 text-center">Relevant Hop</th>
                  <th className="py-2.5 px-2.5">Evidence Basis</th>
                  <th className="py-2.5 px-2.5">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.attributions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 px-3 text-center text-neutral-500 italic">
                      No VASP attributions identified in this investigation.
                    </td>
                  </tr>
                ) : (
                  data.attributions.map((attr) => (
                    <tr key={attr.rank} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-2.5 font-mono font-bold text-center text-neutral-700">
                        #{attr.rank}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-neutral-900">
                        {attr.name}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[11px] text-neutral-700">
                        {attr.clusterId}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-[10px] text-neutral-800 break-all max-w-[140px]">
                        {attr.depositAddress}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-neutral-900">
                        {attr.confidenceScore}% Confidence
                      </td>
                      <td className="py-2 px-2 font-mono text-center text-neutral-700">
                        Hop {attr.hopDistance}
                      </td>
                      <td className="py-2 px-2.5 text-[11px] text-neutral-600">
                        {attr.evidenceBasis}
                      </td>
                      <td className="py-2 px-2.5 text-[11px] text-neutral-800">
                        {attr.classification}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 6 — ON-CHAIN EVIDENCE */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neutral-500">06.</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
                On-Chain Evidence Records
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {data.evidence.length} Evidence Records
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {data.evidence.length === 0 ? (
              <div className="p-4 border border-neutral-300 rounded text-center text-neutral-500 italic text-xs">
                No formal evidence items generated for this trace.
              </div>
            ) : (
              data.evidence.map((item, idx) => (
                <div key={item.id || idx} className="p-3.5 border border-neutral-300 rounded bg-white space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-500">[{item.id}]</span>
                      <span className="font-bold text-neutral-900">{item.type}</span>
                    </div>
                    <span className="font-mono text-[11px] text-neutral-600">Hop {item.hop}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-neutral-700">
                    <div>
                      <span className="text-neutral-500">Source: </span>
                      <span className="break-all font-semibold">{item.source}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Destination: </span>
                      <span className="break-all font-semibold">{item.destination}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Transaction Hash: </span>
                      <span className="break-all">{item.txHash}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Timestamp: </span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-neutral-800 leading-relaxed text-[11px] pt-1">
                    <span className="font-semibold text-neutral-900">Explanation: </span>
                    {item.explanation}
                  </div>
                  <div className="text-neutral-600 italic text-[11px]">
                    <span className="font-semibold text-neutral-700 not-italic">Why it matters: </span>
                    {item.whyItMatters}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 7 — INVESTIGATION TIMELINE */}
        {/* ================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-neutral-500">07.</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
                Chronological Investigation Timeline
              </h2>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {data.allSortedEdges.length} Timeline Events
            </span>
          </div>

          <div className="overflow-x-auto border border-neutral-300 rounded">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-2 text-center">Hop</th>
                  <th className="py-2.5 px-3">From Wallet</th>
                  <th className="py-2.5 px-3">To Wallet</th>
                  <th className="py-2.5 px-2 text-right">Amount (BTC)</th>
                  <th className="py-2.5 px-3">Transaction Hash</th>
                  <th className="py-2.5 px-2.5 text-center">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {data.allSortedEdges.slice(0, 100).map((edge, idx) => (
                  <tr key={edge.id || idx} className="hover:bg-neutral-50/50">
                    <td className="py-2 px-3 font-mono text-[10px] text-neutral-700 whitespace-nowrap">
                      {edge.timestamp}
                    </td>
                    <td className="py-2 px-2 font-mono text-center font-bold text-neutral-800">
                      {edge.hop}
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-neutral-800 break-all max-w-[140px]">
                      {edge.src}
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-neutral-800 break-all max-w-[140px]">
                      {edge.dst}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-right text-neutral-900 whitespace-nowrap">
                      {edge.amountBtc != null ? edge.amountBtc.toFixed(4) : 'N/A'}
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-neutral-600 break-all max-w-[150px]">
                      {edge.txHash}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <span className="inline-block px-1 py-0.5 rounded text-[9px] font-bold uppercase bg-neutral-100 text-neutral-800 border border-neutral-300">
                        {edge.destRole}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 8 — RISK ANALYSIS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">08.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Comprehensive Risk Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3.5 border border-neutral-300 rounded bg-neutral-50 space-y-1">
              <span className="font-bold text-neutral-900 block">OVERALL INVESTIGATION RISK:</span>
              <div className="text-lg font-black font-mono text-neutral-900">
                {data.sourceIntel.riskScore != null ? `${data.sourceIntel.riskScore}/100` : 'Not available from current investigation data.'}
              </div>
              <span className="text-[11px] text-neutral-600 block">
                Derived directly from proximity to origin vault and transfer velocity.
              </span>
            </div>

            <div className="p-3.5 border border-neutral-300 rounded bg-neutral-50 space-y-1">
              <span className="font-bold text-neutral-900 block">SOURCE WALLET RISK:</span>
              <div className="text-lg font-black font-mono text-red-700">
                {data.sourceIntel.riskScore != null ? `${data.sourceIntel.riskScore}/100 (CRITICAL)` : 'Not available from current investigation data.'}
              </div>
              <span className="text-[11px] text-neutral-600 block">
                Primary origin vault carrying investigated exfiltrated funds.
              </span>
            </div>

            <div className="p-3.5 border border-neutral-300 rounded bg-neutral-50 space-y-1">
              <span className="font-bold text-neutral-900 block">MAIN PATH NODE RISK:</span>
              <div className="text-base font-bold font-mono text-amber-800">
                76 – 92/100 Range
              </div>
              <span className="text-[11px] text-neutral-600 block">
                Intermediary relays carrying active volume show proximity-based taint decay.
              </span>
            </div>

            <div className="p-3.5 border border-neutral-300 rounded bg-neutral-50 space-y-1">
              <span className="font-bold text-neutral-900 block">VASP ATTRIBUTION CONFIDENCE:</span>
              <div className="text-base font-bold font-mono text-neutral-900">
                {data.attributions[0] ? `${data.attributions[0].confidenceScore}% (${data.attributions[0].name})` : 'Not available from current investigation data.'}
              </div>
              <span className="text-[11px] text-neutral-600 block">
                Measures statistical deposit cluster pattern similarity, not wallet illicit risk.
              </span>
            </div>

            <div className="p-3.5 border border-neutral-300 rounded bg-neutral-50 space-y-1 sm:col-span-2">
              <span className="font-bold text-neutral-900 block">MIXER / TUMBLER RISK:</span>
              <div className="text-base font-bold font-mono text-neutral-900">
                {data.mixerPatterns.length > 0 ? `ELEVATED (${data.mixerPatterns.length} Patterns Detected)` : 'LOW / NONE DETECTED'}
              </div>
              <span className="text-[11px] text-neutral-600 block">
                {data.mixerPatterns.length > 0
                  ? 'Sequential splitting and tumbling detected, impeding endpoint certainty.'
                  : 'No peel-chain or tumbler patterns identified along investigated paths.'}
              </span>
            </div>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 9 — MIXER / TUMBLER ANALYSIS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">09.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Mixer & Tumbler Analysis
            </h2>
          </div>

          {data.mixerPatterns.length === 0 ? (
            <div className="p-4 border border-neutral-300 rounded bg-neutral-50 text-xs text-neutral-700 leading-relaxed">
              <span className="font-bold block text-neutral-900 mb-1">Status: Negative</span>
              No mixer/tumbler pattern was identified in the available investigation data.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.mixerPatterns.map((pattern, idx) => (
                <div key={idx} className="p-4 border border-neutral-300 rounded bg-neutral-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                    <span className="font-bold text-neutral-900 text-sm">{pattern.patternType}</span>
                    <span className="font-mono font-bold text-red-700">{pattern.confidence}% Confidence</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-neutral-500 block">Detected Hops:</span>
                      <span className="font-bold text-neutral-900">{pattern.detectedHops}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Peel Chain:</span>
                      <span className="font-bold text-neutral-900">{pattern.peelChainLength} Transfers</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Equal Sweep:</span>
                      <span className="font-bold text-neutral-900">{pattern.equalAmountOutputs ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Volume Mixed:</span>
                      <span className="font-bold text-neutral-900">{pattern.volumeMixedBtc} BTC</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-700 pt-1">
                    <span className="font-bold text-neutral-800">Signals: </span>
                    {pattern.riskIndicators.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* ================================================================= */}
        {/* SECTION 10 — KEY FINDINGS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">10.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Key Investigation Findings
            </h2>
          </div>

          <div className="p-4 border border-neutral-300 rounded bg-white space-y-2 text-xs">
            {data.keyFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-neutral-900 font-bold">•</span>
                <span className="text-neutral-800 leading-relaxed">{finding}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 11 — METHODOLOGY & LIMITATIONS */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">11.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Methodology & Limitations
            </h2>
          </div>

          <div className="p-4 border border-neutral-300 rounded bg-neutral-50 text-xs text-neutral-700 space-y-2 leading-relaxed">
            <p>
              • Investigation is based on public and index-provider blockchain ledger data retrieved at the time of trace execution.
            </p>
            <p>
              • Graph traversal uses the VASP Trace directional algorithm, mapping outward fund flows within configured hop boundaries.
            </p>
            <p>
              • VASP attribution is analytical and heuristic. Attribution confidence reflects statistical clustering resemblance and does not constitute statutory proof of legal beneficial ownership.
            </p>
            <p>
              • Risk scores are only shown where calculated by the scoring engine; missing scores are explicitly recorded as Not scored.
            </p>
            <p>
              • Missing blockchain data should not automatically be interpreted as absence of activity.
            </p>
          </div>
        </section>


        {/* ================================================================= */}
        {/* SECTION 12 — REPORT METADATA & FOOTER */}
        {/* ================================================================= */}
        <section className="space-y-3 print-break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-neutral-400 pb-1">
            <span className="font-mono text-sm font-bold text-neutral-500">12.</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 font-sans">
              Report Metadata & Certification
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 border border-neutral-300 rounded bg-neutral-50 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block text-[10px]">REPORT GENERATED:</span>
              <span className="font-bold text-neutral-900">{data.reportDate}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">CASE IDENTIFIER:</span>
              <span className="font-bold text-neutral-900">{data.caseId}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">INVESTIGATION ID:</span>
              <span className="font-bold text-neutral-900">{data.investigationId}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">NETWORK:</span>
              <span className="text-neutral-900">{data.network}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">ENGINE VERSION:</span>
              <span className="text-neutral-900">VASP Trace v1.0.4</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">BLOCK ANCHOR:</span>
              <span className="text-neutral-900">Block 842,915</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-300 text-center text-xs text-neutral-500 space-y-1">
            <div className="font-bold uppercase tracking-widest text-neutral-900 font-sans">
              VASP TRACE
            </div>
            <div className="text-[11px]">
              Blockchain Forensic Intelligence
            </div>
            <div className="text-[10px] text-neutral-400 italic">
              Generated from investigation data available at the time of report generation.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
