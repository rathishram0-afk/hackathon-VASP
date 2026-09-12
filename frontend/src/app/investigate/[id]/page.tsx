'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { fetchInvestigationById } from '@/services/api';
import { Investigation, GraphNode, NodeType } from '@/types/forensics';
import { TransactionGraph } from '@/components/graph/TransactionGraph';
import { GraphControls } from '@/components/graph/GraphControls';
import { NodeDetailDrawer } from '@/components/investigation/NodeDetailDrawer';
import { VASPAttributionCard } from '@/components/investigation/VASPAttributionCard';
import { EvidenceTimeline } from '@/components/investigation/EvidenceTimeline';
import { MixerDetectionPanel } from '@/components/investigation/MixerDetectionPanel';
import { ReportExportModal } from '@/components/investigation/ReportExportModal';
import { InvestigatorCopilot } from '@/components/copilot/InvestigatorCopilot';

import {
  ShieldAlert,
  Building2,
  FileText,
  Shuffle,
  Clock,
  Layers,
  Copy,
  ExternalLink,
  Download,
  Activity,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export default function InvestigationWorkspacePage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'case-vt-2024-8891';

  const [caseData, setCaseData] = useState<Investigation | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'attribution' | 'evidence' | 'mixer' | 'timeline'>('graph');
  const [selectedHops, setSelectedHops] = useState<number>(4);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);


  const [activeFilters, setActiveFilters] = useState<Record<NodeType, boolean>>({
    scam_source: true,
    intermediary: true,
    unhosted: true,
    vasp: true,
    mixer: true,
    high_risk: true,
  });

  useEffect(() => {
    fetchInvestigationById(caseId).then((res) => {
      if (res) {
        setCaseData(res);
        setSelectedHops(res.maxHops || 4);
      }
    });
  }, [caseId]);

  if (!caseData) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xs font-mono text-[#94A3B8] flex items-center space-x-2">
            <Activity className="w-4 h-4 animate-spin text-[#0C6CF2]" />
            <span>Loading Forensic Investigation Workspace...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(caseData.sourceWallet);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1500);
  };

  const handleToggleFilter = (type: NodeType) => {
    setActiveFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Top Case Header Bar */}
        <div className="p-4 bg-[#121722] border border-[#1E293B] rounded-lg space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 bg-[#0C6CF2]/10 border border-[#0C6CF2]/30 text-[#0C6CF2] font-mono text-xs font-bold rounded uppercase">
                {caseData.caseNumber}
              </span>
              <h1 className="text-base font-bold text-white font-sans">{caseData.title}</h1>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 font-mono text-[10px] font-bold rounded border border-red-500/30 uppercase">
                {caseData.scamType}
              </span>
            </div>

            {/* Action CTA: Investigator Copilot & Prepare Freeze Request */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCopilotOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-md shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition font-sans cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Investigator Copilot</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 bg-[#0C6CF2] hover:bg-blue-600 active:scale-[0.98] text-white text-xs font-semibold rounded-md shadow-md shadow-blue-500/10 flex items-center space-x-1.5 transition font-sans"
              >
                <Download className="w-4 h-4" />
                <span>Prepare Freeze Request / Report</span>
              </button>
            </div>

          </div>

          {/* Key Intelligence Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded font-mono">
              <div className="text-[10px] text-[#64748B] uppercase font-sans">Source Target Address</div>
              <div className="flex items-center justify-between text-white font-bold mt-0.5">
                <span className="truncate mr-1 text-[#38BDF8]">{caseData.sourceWallet.slice(0, 14)}...</span>
                <button onClick={handleCopyAddress} className="text-[#94A3B8] hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedAddress && <span className="text-[10px] text-emerald-400">✓ Copied</span>}
            </div>

            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded font-mono">
              <div className="text-[10px] text-[#64748B] uppercase font-sans">Traced Illicit Volume</div>
              <div className="text-white font-bold mt-0.5">{caseData.totalTracedVolumeBtc} BTC</div>
              <div className="text-[10px] text-[#94A3B8] font-sans">~ $3.01M USD</div>
            </div>

            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded font-mono">
              <div className="text-[10px] text-[#64748B] uppercase font-sans">Top Candidate VASP</div>
              <div className="text-[#0C6CF2] font-bold mt-0.5">{caseData.targetVasp} ({caseData.topConfidence}%)</div>
              <div className="text-[10px] text-emerald-400 font-sans">✓ Verified Hot-Wallet Match</div>
            </div>

            <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] rounded font-mono">
              <div className="text-[10px] text-[#64748B] uppercase font-sans">Max Traversal Hops</div>
              <div className="text-white font-bold mt-0.5">{caseData.maxHops} Hops</div>
              <div className="text-[10px] text-[#94A3B8] font-sans">{caseData.graphData.nodes.length} Total Nodes</div>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-[#1E293B] pb-1 font-sans text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2.5 rounded-t-md font-semibold flex items-center space-x-2 transition ${
              activeTab === 'graph'
                ? 'bg-[#121722] text-[#0C6CF2] border-t-2 border-[#0C6CF2] border-x border-[#1E293B]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#121722]/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Transaction Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('attribution')}
            className={`px-4 py-2.5 rounded-t-md font-semibold flex items-center space-x-2 transition ${
              activeTab === 'attribution'
                ? 'bg-[#121722] text-[#0C6CF2] border-t-2 border-[#0C6CF2] border-x border-[#1E293B]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#121722]/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>VASP Attribution & Ranking ({caseData.attributions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 rounded-t-md font-semibold flex items-center space-x-2 transition ${
              activeTab === 'evidence'
                ? 'bg-[#121722] text-[#0C6CF2] border-t-2 border-[#0C6CF2] border-x border-[#1E293B]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#121722]/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Evidence Chain ({caseData.evidenceChain.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`px-4 py-2.5 rounded-t-md font-semibold flex items-center space-x-2 transition ${
              activeTab === 'mixer'
                ? 'bg-[#121722] text-purple-400 border-t-2 border-purple-400 border-x border-[#1E293B]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#121722]/50'
            }`}
          >
            <Shuffle className="w-4 h-4 text-purple-400" />
            <span>Mixer Pattern Analysis ({caseData.mixerPatterns.length})</span>
          </button>
        </div>

        {/* Tab 1: Interactive D3 Canvas Workstation */}
        {activeTab === 'graph' && (
          <div className="space-y-3">
            <GraphControls
              maxHops={caseData.maxHops}
              selectedHops={selectedHops}
              onHopsChange={setSelectedHops}
              activeFilters={activeFilters}
              onToggleFilter={handleToggleFilter}
              onResetView={() => setSelectedHops(caseData.maxHops)}
              onZoomIn={() => {}}
              onZoomOut={() => {}}
            />

            <TransactionGraph
              graphData={caseData.graphData}
              selectedHops={selectedHops}
              activeFilters={activeFilters}
              onSelectNode={(node) => setSelectedNode(node)}
              selectedNodeId={selectedNode?.id}
            />
          </div>
        )}

        {/* Tab 2: VASP Attribution Engine */}
        {activeTab === 'attribution' && (
          <VASPAttributionCard
            attributions={caseData.attributions}
            onSelectVasp={(id) => {}}
          />
        )}

        {/* Tab 3: Forensic Evidence & Chain of Custody */}
        {activeTab === 'evidence' && (
          <EvidenceTimeline evidenceChain={caseData.evidenceChain} />
        )}

        {/* Tab 4: Mixer & Tumbler Detection */}
        {activeTab === 'mixer' && (
          <MixerDetectionPanel mixerPatterns={caseData.mixerPatterns} />
        )}

        {/* Node Intelligence Drawer Overlay */}
        <NodeDetailDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />

        {/* Freeze Request & Report Modal */}
        <ReportExportModal
          investigation={caseData}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />

        {/* AI Forensic Investigator Copilot */}
        <InvestigatorCopilot
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          investigationId={caseData.id || caseId}
          traceContext={{
            source: caseData.sourceWallet,
            truncated: false,
            graph: {
              nodes: (caseData.graphData?.nodes || []).map((n) => ({
                address: n.id,
                hop_distance: n.hop || 0,
                tag: n.entityName ? { exchange: n.entityName, label: n.label || '' } : null,
              })),
              edges: (caseData.graphData?.edges || []).map((e) => ({
                src: typeof e.source === 'object' ? (e.source as any).id : e.source,
                dst: typeof e.target === 'object' ? (e.target as any).id : e.target,
                tx_hash: e.txHash || null,
                value_btc: e.amountBtc || null,
                timestamp: e.timestamp ? Math.floor(new Date(e.timestamp).getTime() / 1000) : null,
              })),
            },
            candidates: (caseData.attributions || []).map((a) => ({
              exchange: a.vaspName,
              address: a.destinationWallet,
              confidence: a.confidenceScore > 1 ? a.confidenceScore / 100 : a.confidenceScore,
              hop_distance: a.hopProximity,
              path: [caseData.sourceWallet, a.destinationWallet],
              kind: 'heuristic',
              mixer_obscured: false,
            })),
          }}

          onSelectNode={(addr) => {
            const found = caseData.graphData?.nodes?.find((n) => n.id === addr || n.label === addr);
            if (found) {
              setSelectedNode(found);
            }
          }}
        />
      </div>
    </AppShell>

  );
}
