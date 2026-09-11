'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  InvestigationCase,
  GraphNode,
  VASPAttribution,
  EvidenceItem,
  MixerPattern,
  GraphData
} from '@/types';
import {
  MOCK_CASES,
  MOCK_GRAPH_DATA,
  MOCK_ATTRIBUTIONS,
  MOCK_EVIDENCE,
  MOCK_MIXER_PATTERNS
} from '@/data/mockData';
import {
  executeBackendTrace,
  adaptBackendTrace,
  checkBackendHealth
} from '@/services/api';

interface InvestigationContextType {
  activeCase: InvestigationCase;
  casesList: InvestigationCase[];
  graphData: GraphData;
  attributions: VASPAttribution[];
  evidence: EvidenceItem[];
  mixerPatterns: MixerPattern[];
  selectedNode: GraphNode | null;
  isDrawerOpen: boolean;
  maxHopsFilter: number;
  searchQuery: string;
  isTracing: boolean;
  traceError: string | null;
  backendOnline: boolean | null;
  selectCase: (caseId: string) => void;
  selectNode: (node: GraphNode | null) => void;
  closeDrawer: () => void;
  setMaxHopsFilter: (hops: number) => void;
  setSearchQuery: (query: string) => void;
  startNewTrace: (address: string, caseTitle?: string, maxHops?: number) => Promise<boolean>;
  clearTraceError: () => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export const InvestigationProvider = ({ children }: { children: ReactNode }) => {
  const [casesList, setCasesList] = useState<InvestigationCase[]>(MOCK_CASES);
  const [activeCaseId, setActiveCaseId] = useState<string>('VT-2024-8891');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [maxHopsFilter, setMaxHopsFilter] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Dynamic store for live backend traces
  const [dynamicGraphData, setDynamicGraphData] = useState<Record<string, GraphData>>({});
  const [dynamicAttributions, setDynamicAttributions] = useState<Record<string, VASPAttribution[]>>({});
  const [dynamicEvidence, setDynamicEvidence] = useState<Record<string, EvidenceItem[]>>({});
  const [dynamicMixerPatterns, setDynamicMixerPatterns] = useState<Record<string, MixerPattern[]>>({});

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth()
      .then((res) => {
        setBackendOnline(res.status === 'ok');
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  const activeCase = casesList.find((c) => c.id === activeCaseId) || casesList[0];
  const graphData =
    dynamicGraphData[activeCase.id] ||
    MOCK_GRAPH_DATA[activeCase.id] ||
    MOCK_GRAPH_DATA['VT-2024-8891'] || { nodes: [], edges: [] };
  const attributions =
    dynamicAttributions[activeCase.id] ||
    MOCK_ATTRIBUTIONS[activeCase.id] ||
    MOCK_ATTRIBUTIONS['VT-2024-8891'] || [];
  const evidence =
    dynamicEvidence[activeCase.id] ||
    MOCK_EVIDENCE[activeCase.id] ||
    MOCK_EVIDENCE['VT-2024-8891'] || [];
  const mixerPatterns =
    dynamicMixerPatterns[activeCase.id] ||
    MOCK_MIXER_PATTERNS[activeCase.id] ||
    MOCK_MIXER_PATTERNS['VT-2024-8891'] || [];

  const selectCase = (caseId: string) => {
    const targetCase = casesList.find((c) => c.id === caseId);
    if (targetCase) {
      setActiveCaseId(caseId);
      setSelectedNode(null);
      setIsDrawerOpen(false);
      setTraceError(null);
    }
  };

  const selectNode = (node: GraphNode | null) => {
    setSelectedNode(node);
    setIsDrawerOpen(Boolean(node));
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const clearTraceError = () => {
    setTraceError(null);
  };

  const startNewTrace = async (
    address: string,
    caseTitle?: string,
    maxHops?: number
  ): Promise<boolean> => {
    setIsTracing(true);
    setTraceError(null);

    try {
      const hops = maxHops ?? maxHopsFilter ?? 4;
      const rawResponse = await executeBackendTrace({
        wallet_address: address.trim(),
        max_hops: hops,
        max_nodes: 150,
        top_n: 10,
      });

      const adapted = adaptBackendTrace(rawResponse, {
        caseTitle,
        requestedHops: hops,
      });

      // Update dynamic states
      setDynamicGraphData((prev) => ({ ...prev, [adapted.caseObj.id]: adapted.graphData }));
      setDynamicAttributions((prev) => ({ ...prev, [adapted.caseObj.id]: adapted.attributions }));
      setDynamicEvidence((prev) => ({ ...prev, [adapted.caseObj.id]: adapted.evidence }));
      setDynamicMixerPatterns((prev) => ({ ...prev, [adapted.caseObj.id]: adapted.mixerPatterns }));

      // Add to case list (ensuring no duplicate IDs)
      setCasesList((prev) => [adapted.caseObj, ...prev.filter((c) => c.id !== adapted.caseObj.id)]);
      setActiveCaseId(adapted.caseObj.id);
      setSelectedNode(null);
      setIsDrawerOpen(false);

      return true;
    } catch (err: any) {
      const msg = err?.message || 'Failed to execute on-chain trace via backend';
      setTraceError(msg);
      return false;
    } finally {
      setIsTracing(false);
    }
  };

  return (
    <InvestigationContext.Provider
      value={{
        activeCase,
        casesList,
        graphData,
        attributions,
        evidence,
        mixerPatterns,
        selectedNode,
        isDrawerOpen,
        maxHopsFilter,
        searchQuery,
        isTracing,
        traceError,
        backendOnline,
        selectCase,
        selectNode,
        closeDrawer,
        setMaxHopsFilter,
        setSearchQuery,
        startNewTrace,
        clearTraceError,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
