export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'ATTRIBUTED' | 'SUBPOENA_ISSUED' | 'CLOSED';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  blockHeight: number;
  title: string;
  description: string;
  eventType: 'ORIGIN' | 'PEEL' | 'MIXER_ENTER' | 'SPLIT' | 'DEPOSIT_SWEEP' | 'NOTE';
  amountBtc?: number;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  flag?: string;
}

export interface WalletIntelligence {
  address: string;
  network: string;
  balanceBtc: number;
  balanceUsd: number;
  txCount: number;
  firstActive: string;
  lastActive: string;
  riskScore: number;
  riskLevel: RiskLevel;
  classification: string;
  clusterTag?: string;
  knownEntity?: string;
  incomingCount: number;
  outgoingCount: number;
  counterpartiesCount: number;
  relatedWallets: string[];
}

export interface InvestigationCase {
  id: string;
  title: string;
  sourceWallet: string;
  network: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: CaseStatus;
  candidateVasp: string;
  confidenceScore: number;
  totalVolumeBtc: number;
  totalVolumeUsd: number;
  lastUpdated: string;
  createdBlock: number;
  investigator: string;
  summary: string;
  walletIntel: WalletIntelligence;
  timeline: TimelineEvent[];
}
