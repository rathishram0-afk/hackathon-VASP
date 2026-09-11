export interface VASPAttribution {
  id: string;
  name: string;
  entityType: string;
  confidenceScore: number; // 0 - 100
  clusterId: string;
  depositAddress: string;
  hopDistance: number;
  jurisdiction: string;
  kycAttestation: string;
  matchSignature: string;
  evidenceCount: number;
  supportingVolumeBtc: number;
  logoUrl?: string;
  status: 'PRIMARY' | 'SECONDARY' | 'CANDIDATE';
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'SWEEP_PATTERN' | 'AMOUNT_RETENTION' | 'TIMING_CORRELATION' | 'CLUSTER_LINK' | 'PEEL_CHAIN';
  description: string;
  confidenceContribution: number;
  txHash?: string;
  blockTimestamp?: string;
  status: 'VERIFIED' | 'HEURISTIC' | 'STRONG';
}

export interface MixerPattern {
  id: string;
  patternType: string;
  confidence: number;
  detectedHops: number;
  equalAmountOutputs: boolean;
  rapidRelay: boolean;
  peelChainLength: number;
  volumeMixedBtc: number;
  riskIndicators: string[];
}
