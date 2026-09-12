export type NodeType = 'scam_source' | 'intermediary' | 'unhosted' | 'vasp' | 'mixer' | 'high_risk';
export type BlockchainType = 'BTC' | 'ETH' | 'TRX' | 'SOL';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Wallet {
  address: string;
  blockchain: BlockchainType;
  balance: string;
  balanceUsd: string;
  txCount: number;
  firstSeen: string;
  lastSeen: string;
  riskScore: number; // 0 - 100
  classification: NodeType;
  label?: string;
  entityName?: string;
  knownTags: string[];
  totalIncomingBtc: number;
  totalOutgoingBtc: number;
  directCounterpartiesCount: number;
}

export interface Transaction {
  hash: string;
  fromAddress: string;
  toAddress: string;
  amountBtc: number;
  amountUsd: number;
  timestamp: string;
  blockHeight: number;
  feeBtc: number;
  hopIndex: number;
  flag?: string;
}

export interface GraphNode {
  id: string; // address
  label: string;
  nodeType: NodeType;
  blockchain: BlockchainType;
  /** Real backend-derived candidate confidence (0-100), or null when the
   * backend provides no per-node score for this address. */
  riskScore: number | null;
  candidateConfidence?: number | null;
  isMainPath?: boolean;
  hop: number;
  balanceBtc: number;
  entityName?: string;
  isTarget?: boolean;
  isCandidateVasp?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  amountBtc: number;
  txHash: string;
  timestamp: string;
  hop: number;
  isPeelChain?: boolean;
  isMixerFlow?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AttributionSignal {
  id: string;
  title: string;
  description: string;
  weight: 'high' | 'medium' | 'low';
  type: 'proximity' | 'retention' | 'timing' | 'cluster' | 'behavior';
  scoreImpact: number; // e.g. +35%
}

export interface VASPAttribution {
  vaspId: string;
  vaspName: string;
  logoUrl?: string;
  confidenceScore: number; // 0 - 100
  riskCategory: 'low' | 'medium' | 'high';
  hopProximity: number;
  amountRetentionPercent: number;
  timingDelayMinutes: number;
  depositClusterId: string;
  knownAddressCount: number;
  signals: AttributionSignal[];
  supportingTxHashes: string[];
  destinationWallet: string;
}

export interface MixerPattern {
  id: string;
  patternType: 'peel_chain' | 'fan_out_split' | 'rapid_movement' | 'tumbler_hop';
  confidence: number; // 0 - 100
  title: string;
  description: string;
  affectedWallets: string[];
  inputTxCount: number;
  outputTxCount: number;
  avgDelaySeconds: number;
  totalVolumeBtc: number;
}

export interface EvidenceItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  fromWallet: string;
  toWallet: string;
  amountBtc: number;
  txHash: string;
  timestamp: string;
  signalStrength: 'critical' | 'strong' | 'moderate';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'tx' | 'attribution' | 'mixer_alert' | 'note' | 'freeze_prep';
  detail: string;
  relatedAddress?: string;
  risk: RiskLevel;
}

export interface Investigation {
  id: string;
  caseNumber: string; // e.g. "VT-2024-8891"
  title: string;
  scamType: string;
  sourceWallet: string;
  blockchain: BlockchainType;
  status: 'active' | 'attributed' | 'escalated' | 'archived';
  createdAt: string;
  updatedAt: string;
  investigator: string;
  totalTracedVolumeBtc: number;
  maxHops: number;
  targetVasp?: string;
  topConfidence: number;
  graphData: GraphData;
  attributions: VASPAttribution[];
  mixerPatterns: MixerPattern[];
  evidenceChain: EvidenceItem[];
  timeline: TimelineEvent[];
  summary: string;
}

export interface CaseFilterOptions {
  blockchain?: BlockchainType;
  minRisk?: number;
  status?: string;
  searchQuery?: string;
}
