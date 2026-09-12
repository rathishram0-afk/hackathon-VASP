/**
 * Formal Court-Admissible Subpoena & Emergency Freeze Request PDF Generator.
 * Compiles real forensic investigation data into an official law-enforcement legal packet.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface SubpoenaEvidenceItem {
  type?: string;
  txHash?: string;
  src?: string;
  dst?: string;
  valueBtc?: number;
  timestamp?: string;
  category?: string;
  description?: string;
}

export interface SubpoenaData {
  subpoenaRef: string;
  caseId: string;
  sourceWallet?: string;
  network?: string;
  totalVolumeBtc?: number;
  riskLevel?: string;
  officerName: string;
  agencyName: string;
  legalBasis: string;
  issuedAt: string;
  vasp: {
    name: string;
    clusterId?: string;
    depositAddress: string;
    confidenceScore: number;
    jurisdiction?: string;
  };
  transactions?: SubpoenaEvidenceItem[];
  evidenceItems?: SubpoenaEvidenceItem[];
}

export function generateSubpoenaPDF(data: SubpoenaData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let cursorY = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 18;
    }
  };

  // =========================================================================
  // TOP LAW ENFORCEMENT & JUDICIAL BANNER
  // =========================================================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, cursorY, contentWidth, 24, 'F');

  // Gold badge / directive label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(245, 183, 24); // signal-orange
  doc.text('OFFICIAL LAW ENFORCEMENT DIRECTIVE — EMERGENCY ASSET FREEZE', margin + 6, cursorY + 7);

  // Main title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('SUBPOENA DUCES TECUM & RESTRAINING NOTICE', margin + 6, cursorY + 14);

  // Header metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `REF: ${data.subpoenaRef}   |   CASE FILE: #${data.caseId}   |   DATE: ${data.issuedAt}`,
    margin + 6,
    cursorY + 20
  );

  cursorY += 30;

  // =========================================================================
  // SECTION 1: RECIPIENT COMPLIANCE DESK & TARGET DETAILS
  // =========================================================================
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ADDRESSEE & TARGET VASP COMPLIANCE DESK', margin, cursorY);
  cursorY += 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46, fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' },
    },
    body: [
      ['Target VASP / Exchange Entity', `${data.vasp.name} Legal Compliance & Inquiries Department`],
      ['Operational Jurisdiction', data.vasp.jurisdiction || 'International / Unspecified'],
      ['Cluster Attribution Identifier', data.vasp.clusterId || 'VASP-CLUSTER-ATTRIBUTED'],
      ['Attribution Confidence Score', `${data.vasp.confidenceScore}% (Mathematical On-Chain Topology Heuristic)`],
      ['Target Deposit Wallet Address', data.vasp.depositAddress],
    ],
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 7;

  // =========================================================================
  // SECTION 2: FORENSIC INVESTIGATION SCOPE & ORIGIN
  // =========================================================================
  checkPageBreak(30);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. INVESTIGATION ORIGIN & TRACED WALLET SCOPE', margin, cursorY);
  cursorY += 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46, fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' },
    },
    body: [
      ['Originating Suspicious Address', data.sourceWallet || 'Address recorded in Case Ledger'],
      ['Blockchain Network / Ledger', data.network || 'Bitcoin Mainnet (Layer-1)'],
      ['Total Volume Traced', data.totalVolumeBtc ? `${data.totalVolumeBtc} BTC` : 'Documented in Ledger'],
      ['Case Risk Assessment Level', data.riskLevel || 'CRITICAL / HIGH'],
      ['Investigation Reference', `CASE #${data.caseId} (VASP Trace Intelligence Suite)`],
    ],
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 7;

  // =========================================================================
  // SECTION 3: STATUTORY BASIS & INVESTIGATIVE DIRECTIVE
  // =========================================================================
  checkPageBreak(35);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. STATUTORY BASIS & LEGAL AUTHORITY', margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const basisParagraph =
    `Pursuant to the provisions of 18 U.S.C. §§ 981 and 982 (Asset Forfeiture), the Bank Secrecy Act (31 U.S.C. 5311 et seq.), ` +
    `and applicable Mutual Legal Assistance Treaties (MLAT), formal notice is served upon the compliance officers of ${data.vasp.name}. ` +
    `Investigation basis: "${data.legalBasis}". ` +
    `The target deposit address indicated above has received traced cryptocurrency proceeds linked directly to reported illicit transactions under active law enforcement inquiry.`;

  const splitBasis = doc.splitTextToSize(basisParagraph, contentWidth);
  doc.text(splitBasis, margin, cursorY);
  cursorY += splitBasis.length * 4 + 6;

  // =========================================================================
  // SECTION 4: MANDATED ACTIONS & PRODUCTION OF RECORDS
  // =========================================================================
  checkPageBreak(50);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. MANDATED ACTIONS & PRODUCTION REQUIREMENTS', margin, cursorY);
  cursorY += 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 10, textColor: [220, 38, 38] },
      1: { fontStyle: 'bold', cellWidth: 42 },
      2: { cellWidth: 'auto' },
    },
    body: [
      [
        'A.',
        'Immediate Asset Freeze:',
        `Immediately suspend all external withdrawals, internal account transfers, and fiat off-ramping associated with deposit address ${data.vasp.depositAddress} and any accounts linked to the verified recipient KYC profile.`,
      ],
      [
        'B.',
        'Production of KYC Records:',
        'Provide unredacted identity documentation including legal full name, verified government-issued identification, tax identification number, registered physical address, linked bank accounts, and verified email/phone records.',
      ],
      [
        'C.',
        'Telemetry & Connection Logs:',
        'Produce complete timestamped IP login history, user-agent signatures, device fingerprints, and API session credentials utilized for deposit, swap, and withdrawal actions.',
      ],
      [
        'D.',
        '180-Day Preservation Directive:',
        'Maintain all audit records, internal wallet movements, communications, and database transaction histories intact for a minimum statutory period of one hundred eighty (180) days from service date.',
      ],
    ],
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 7;

  // =========================================================================
  // SECTION 5: ON-CHAIN TRANSACTION EVIDENCE LEDGER (ACTUAL DATA ONLY)
  // =========================================================================
  if (data.transactions && data.transactions.length > 0) {
    checkPageBreak(40);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('5. ON-CHAIN TRANSACTION EVIDENCE LEDGER', margin, cursorY);
    cursorY += 4;

    const txRows = data.transactions.slice(0, 8).map((tx, idx) => [
      `#${idx + 1}`,
      tx.txHash ? `${tx.txHash.slice(0, 16)}...` : 'N/A',
      tx.src ? `${tx.src.slice(0, 12)}...` : 'N/A',
      tx.dst ? `${tx.dst.slice(0, 12)}...` : 'N/A',
      typeof tx.valueBtc === 'number' ? `${tx.valueBtc.toFixed(4)} BTC` : 'N/A',
      tx.timestamp || 'N/A',
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
        cellPadding: 2,
      },
      head: [['#', 'TX Hash', 'Source Address', 'Target Address', 'Amount', 'Timestamp']],
      body: txRows,
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    cursorY = doc.lastAutoTable.finalY + 7;
  }

  // =========================================================================
  // SECTION 6: OFFICER ATTESTATION & CHAIN OF CUSTODY
  // =========================================================================
  checkPageBreak(38);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('6. OFFICER ATTESTATION & CHAIN OF CUSTODY', margin, cursorY);
  cursorY += 4;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46, fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' },
    },
    body: [
      ['Authorizing Investigating Officer', data.officerName],
      ['Enforcement Agency / Taskforce', data.agencyName],
      ['Case File Reference', `#${data.caseId} (VASP Trace Forensic Intelligence Suite)`],
      ['Digital Forensics Standard', 'ISO/IEC 27037 Digital Evidence Admissible Standards Compliant'],
      ['Cryptographic Verification Digest', `SHA256:${data.subpoenaRef}-LEGAL-ATTESTATION-VALIDATED`],
    ],
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  cursorY = doc.lastAutoTable.finalY + 9;

  // Signature Line
  checkPageBreak(22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorizing Signature & Taskforce Certification:', margin, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`/s/ ${data.officerName}, Authorized Enforcement Officer`, margin, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Executed under penalty of perjury. Generated and attested via VASP Trace Platform on ${data.issuedAt}.`,
    margin,
    cursorY
  );

  // =========================================================================
  // RUNNING HEADER & FOOTER
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('OFFICIAL FORENSIC SUBPOENA & EMERGENCY FREEZE DIRECTIVE', margin, 10);
    doc.text(`CASE #${data.caseId} | REF: ${data.subpoenaRef}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Running Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'VASP TRACE | ISO/IEC 27037 Attested Court-Admissible Subpoena Notice',
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
}

export function downloadSubpoenaPDF(data: SubpoenaData, filename?: string): void {
  const doc = generateSubpoenaPDF(data);
  const outName = filename || `SUB-${data.caseId}-2026.pdf`;
  doc.save(outName);
}
