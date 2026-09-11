import { create } from "zustand";

export interface GraphNode {
  id: string;
  label: string;
  type: "source" | "unhosted" | "peel_hub" | "mixer" | "vasp";
  address: string;
  balance: string;
  riskScore: number;
  entityName: string;
  jurisdiction?: string;
  firstSeen: string;
  lastSeen: string;
  inCount: number;
  outCount: number;
  clusterId: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string; // node id or Node object in d3
  target: string; // node id or Node object in d3
  txHash: string;
  valueBtc: number;
  valueUsd: number;
  timestamp: string;
  block: number;
  hopIndex: number;
  riskTag: "CRITICAL" | "SUSPICIOUS" | "PEEL_CHAIN" | "VERIFIED" | "MIXER_ENTRY";
}

export interface CandidateVASP {
  id: string;
  rank: number;
  name: string;
  codeName: string;
  confidenceScore: number;
  totalDepositedBtc: number;
  totalDepositedUsd: number;
  pathLengthHops: number;
  directnessScore: number;
  coSpendingLinkageScore: number;
  volumeCorrelationScore: number;
  timeProximityScore: number;
  riskCategory: "CRITICAL_EXPOSURE" | "HIGH_PROBABILITY" | "MEDIUM_PROBABILITY" | "LOW_PROBABILITY";
  vaspId: string;
  jurisdiction: string;
  complianceEmail: string;
  depositAddresses: string[];
  lastDepositTime: string;
}

export interface TransactionItem {
  id: string;
  txHash: string;
  block: number;
  timestamp: string;
  fromAddress: string;
  toAddress: string;
  valueBtc: number;
  valueUsd: number;
  hopIndex: number;
  feeBtc: number;
  gasPriceGwei?: number;
  riskTag: "CRITICAL" | "SUSPICIOUS" | "PEEL_CHAIN" | "VERIFIED" | "MIXER_ENTRY";
  status: "CONFIRMED" | "PENDING" | "SANCTIONED";
  inputsCount: number;
  outputsCount: number;
  scriptSig: string;
}

export interface WalletProfile {
  address: string;
  label: string;
  entityType: string;
  riskScore: number;
  currentBalanceBtc: number;
  currentBalanceUsd: number;
  totalReceivedBtc: number;
  totalSentBtc: number;
  firstSeen: string;
  lastSeen: string;
  txCount: number;
  tags: string[];
  coSpentCluster: string;
  associatedIPs: string[];
}

export interface MixerAlert {
  id: string;
  mixerName: string;
  branchName: string;
  detectedTime: string;
  obfuscatedAmountBtc: number;
  entropyScore: number; // 0-100
  equalOutputDenomBtc: number;
  inputHop: number;
  peelChainDepth: number;
  status: "ACTIVE_OBFUSCATION" | "PARTIALLY_TRACED" | "RESOLVED";
  unmixedVelocityBtc: number;
  txHashes: string[];
}

export interface LE28FormState {
  caseRef: string;
  vaspName: string;
  vaspId: string;
  targetAddress: string;
  seizureAmountBtc: number;
  officerName: string;
  badgeNumber: string;
  agencyName: string;
  urgencyLevel: "EXPEDITED_EMERGENCY" | "STANDARD_24H" | "INFORMATIONAL";
  justificationText: string;
  isSubmitted: boolean;
  transmissionReceipt?: {
    receiptId: string;
    sha256Hash: string;
    timestamp: string;
    deliveryStatus: "CONFIRMED_DELIVERED" | "ACKNOWLEDGED_BY_COMPLIANCE";
    digitalSignature: string;
  };
}

interface ForensicStore {
  // Case info
  caseId: string;
  caseTitle: string;
  leadOfficer: string;
  primaryWallet: string;
  totalValueBtc: number;
  maxHops: number;
  
  // Data
  nodes: GraphNode[];
  edges: GraphEdge[];
  candidates: CandidateVASP[];
  transactions: TransactionItem[];
  wallets: Record<string, WalletProfile>;
  mixerAlert: MixerAlert;
  
  // Interactive UI Filters & Selection
  selectedNodeId: string | null;
  selectedTxHash: string | null;
  hopDepthFilter: number;
  minTxValue: number;
  entityVisibility: {
    cex: boolean;
    unhosted: boolean;
    intermediary: boolean;
    mixer: boolean;
    highRiskOnly: boolean;
  };
  
  // LE-28 Notice Modal
  isLE28ModalOpen: boolean;
  le28Form: LE28FormState;
  
  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setSelectedTxHash: (txHash: string | null) => void;
  setHopDepthFilter: (hops: number) => void;
  setMinTxValue: (val: number) => void;
  toggleEntityVisibility: (key: keyof ForensicStore["entityVisibility"]) => void;
  setLE28ModalOpen: (open: boolean, vaspName?: string) => void;
  submitLE28Form: (form: Partial<LE28FormState>) => void;
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: "node_scam_source",
    label: "Scam Exploit Wallet (Source)",
    type: "source",
    address: "0x83A1e91F24c90a1b2c4e51291884391F2",
    balance: "0.12 BTC",
    riskScore: 98,
    entityName: "Phishing Exploit #VT-0921",
    firstSeen: "2026-09-01 04:12:00 UTC",
    lastSeen: "2026-09-11 14:02:00 UTC",
    inCount: 14,
    outCount: 8,
    clusterId: "CLUSTER-ALPHA-99",
  },
  {
    id: "node_unhosted_1",
    label: "Unhosted Intermediary 1",
    type: "unhosted",
    address: "13A1p99Xz7kL0029aBv491xZ0091Aa",
    balance: "0.05 BTC",
    riskScore: 84,
    entityName: "Peel Chain Node 1",
    firstSeen: "2026-09-02 08:30:00 UTC",
    lastSeen: "2026-09-11 12:15:00 UTC",
    inCount: 2,
    outCount: 2,
    clusterId: "CLUSTER-ALPHA-99",
  },
  {
    id: "node_peel_hub",
    label: "Peel Chain Split Hub",
    type: "peel_hub",
    address: "bc1q79x881a2k3m4p5q6r7s8t9u0v1w2x3y4z5a6",
    balance: "0.45 BTC",
    riskScore: 89,
    entityName: "High Velocity Peel Hub",
    firstSeen: "2026-09-03 11:20:00 UTC",
    lastSeen: "2026-09-11 13:45:00 UTC",
    inCount: 6,
    outCount: 12,
    clusterId: "CLUSTER-PEEL-402",
  },
  {
    id: "node_wasabi_mixer",
    label: "Wasabi CoinJoin Mixer",
    type: "mixer",
    address: "bc1qmixerservice999wasabicoinjoin0001",
    balance: "18.40 BTC",
    riskScore: 95,
    entityName: "Wasabi Wallet Tumbler",
    jurisdiction: "Non-Compliant / Decentralized",
    firstSeen: "2024-01-15 00:00:00 UTC",
    lastSeen: "2026-09-11 14:30:00 UTC",
    inCount: 1420,
    outCount: 1420,
    clusterId: "CLUSTER-WASABI-MIX",
  },
  {
    id: "node_vasp_alpha",
    label: "Exchange Alpha (Binance)",
    type: "vasp",
    address: "381a99XzDepositBinanceVault0091x",
    balance: "4,120.5 BTC",
    riskScore: 12,
    entityName: "Binance VASP Deposit Desk",
    jurisdiction: "Cayman Islands / Global",
    firstSeen: "2020-03-10 00:00:00 UTC",
    lastSeen: "2026-09-11 14:32:00 UTC",
    inCount: 89400,
    outCount: 65200,
    clusterId: "VASP-BINANCE-HOT01",
  },
  {
    id: "node_vasp_beta",
    label: "Exchange Beta (Kraken)",
    type: "vasp",
    address: "bc1qkrakenofficialdeposit33918a",
    balance: "1,850.2 BTC",
    riskScore: 15,
    entityName: "Kraken Custody Desk",
    jurisdiction: "United States (FinCEN Registered)",
    firstSeen: "2019-05-12 00:00:00 UTC",
    lastSeen: "2026-09-11 14:10:00 UTC",
    inCount: 42100,
    outCount: 38900,
    clusterId: "VASP-KRAKEN-CUSTODY",
  },
  {
    id: "node_vasp_gamma",
    label: "Exchange Gamma (Coinbase)",
    type: "vasp",
    address: "3CoinbasePrimeDepositVault8912A",
    balance: "9,420.0 BTC",
    riskScore: 8,
    entityName: "Coinbase Institutional",
    jurisdiction: "United States (NYDFS BitLicense)",
    firstSeen: "2018-01-01 00:00:00 UTC",
    lastSeen: "2026-09-11 14:28:00 UTC",
    inCount: 154000,
    outCount: 149000,
    clusterId: "VASP-COINBASE-PRIME",
  },
];

const INITIAL_EDGES: GraphEdge[] = [
  {
    id: "edge_1",
    source: "node_scam_source",
    target: "node_unhosted_1",
    txHash: "8f72a19b84c2d3a4e5f678901234567890abcdef1234567890abcdef8f7291bc",
    valueBtc: 1.45,
    valueUsd: 94250,
    timestamp: "2026-09-02 08:30:00 UTC",
    block: 891350,
    hopIndex: 1,
    riskTag: "CRITICAL",
  },
  {
    id: "edge_2",
    source: "node_unhosted_1",
    target: "node_peel_hub",
    txHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    valueBtc: 1.40,
    valueUsd: 91000,
    timestamp: "2026-09-03 11:20:00 UTC",
    block: 891368,
    hopIndex: 2,
    riskTag: "PEEL_CHAIN",
  },
  {
    id: "edge_3",
    source: "node_peel_hub",
    target: "node_wasabi_mixer",
    txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    valueBtc: 0.90,
    valueUsd: 58500,
    timestamp: "2026-09-05 16:45:00 UTC",
    block: 891390,
    hopIndex: 3,
    riskTag: "MIXER_ENTRY",
  },
  {
    id: "edge_4",
    source: "node_peel_hub",
    target: "node_vasp_alpha",
    txHash: "7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e",
    valueBtc: 0.45,
    valueUsd: 29250,
    timestamp: "2026-09-06 09:12:00 UTC",
    block: 891398,
    hopIndex: 3,
    riskTag: "SUSPICIOUS",
  },
  {
    id: "edge_5",
    source: "node_wasabi_mixer",
    target: "node_vasp_alpha",
    txHash: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    valueBtc: 0.88,
    valueUsd: 57200,
    timestamp: "2026-09-08 14:00:00 UTC",
    block: 891410,
    hopIndex: 4,
    riskTag: "CRITICAL",
  },
  {
    id: "edge_6",
    source: "node_scam_source",
    target: "node_vasp_beta",
    txHash: "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    valueBtc: 0.39,
    valueUsd: 25350,
    timestamp: "2026-09-04 19:30:00 UTC",
    block: 891380,
    hopIndex: 2,
    riskTag: "SUSPICIOUS",
  },
  {
    id: "edge_7",
    source: "node_unhosted_1",
    target: "node_vasp_gamma",
    txHash: "9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e",
    valueBtc: 0.15,
    valueUsd: 9750,
    timestamp: "2026-09-07 22:15:00 UTC",
    block: 891405,
    hopIndex: 3,
    riskTag: "VERIFIED",
  },
];

const INITIAL_CANDIDATES: CandidateVASP[] = [
  {
    id: "vasp_alpha",
    rank: 1,
    name: "Exchange Alpha (Binance)",
    codeName: "EXCHANGE_ALPHA_GLOBAL",
    confidenceScore: 94.8,
    totalDepositedBtc: 1.33,
    totalDepositedUsd: 86450,
    pathLengthHops: 3,
    directnessScore: 88.5,
    coSpendingLinkageScore: 96.0,
    volumeCorrelationScore: 92.4,
    timeProximityScore: 95.0,
    riskCategory: "CRITICAL_EXPOSURE",
    vaspId: "VASP-BN-9921",
    jurisdiction: "Cayman Islands / Global",
    complianceEmail: "compliance-desk@exchange-alpha.io",
    depositAddresses: ["381a99XzDepositBinanceVault0091x", "bc1qbinancedeposit8891a2k3m4"],
    lastDepositTime: "2026-09-08 14:00:00 UTC",
  },
  {
    id: "vasp_beta",
    rank: 2,
    name: "Exchange Beta (Kraken)",
    codeName: "EXCHANGE_BETA_US",
    confidenceScore: 78.2,
    totalDepositedBtc: 0.39,
    totalDepositedUsd: 25350,
    pathLengthHops: 2,
    directnessScore: 72.0,
    coSpendingLinkageScore: 81.5,
    volumeCorrelationScore: 76.0,
    timeProximityScore: 83.2,
    riskCategory: "HIGH_PROBABILITY",
    vaspId: "VASP-KR-4401",
    jurisdiction: "United States (FinCEN)",
    complianceEmail: "le-requests@exchange-beta.com",
    depositAddresses: ["bc1qkrakenofficialdeposit33918a"],
    lastDepositTime: "2026-09-04 19:30:00 UTC",
  },
  {
    id: "vasp_gamma",
    rank: 3,
    name: "Exchange Gamma (Coinbase)",
    codeName: "EXCHANGE_GAMMA_PRIME",
    confidenceScore: 42.1,
    totalDepositedBtc: 0.15,
    totalDepositedUsd: 9750,
    pathLengthHops: 3,
    directnessScore: 45.0,
    coSpendingLinkageScore: 38.0,
    volumeCorrelationScore: 41.2,
    timeProximityScore: 44.5,
    riskCategory: "MEDIUM_PROBABILITY",
    vaspId: "VASP-CB-1002",
    jurisdiction: "United States (NYDFS)",
    complianceEmail: "lawenforcement@exchange-gamma.com",
    depositAddresses: ["3CoinbasePrimeDepositVault8912A"],
    lastDepositTime: "2026-09-07 22:15:00 UTC",
  },
];

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx_1",
    txHash: "8f72a19b84c2d3a4e5f678901234567890abcdef1234567890abcdef8f7291bc",
    block: 891350,
    timestamp: "2026-09-02 08:30:00 UTC",
    fromAddress: "0x83A1e91F24c90a1b2c4e51291884391F2",
    toAddress: "13A1p99Xz7kL0029aBv491xZ0091Aa",
    valueBtc: 1.45,
    valueUsd: 94250,
    hopIndex: 1,
    feeBtc: 0.00012,
    gasPriceGwei: 18.5,
    riskTag: "CRITICAL",
    status: "CONFIRMED",
    inputsCount: 1,
    outputsCount: 2,
    scriptSig: "0x47304402207a9b...02206c4b",
  },
  {
    id: "tx_2",
    txHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    block: 891368,
    timestamp: "2026-09-03 11:20:00 UTC",
    fromAddress: "13A1p99Xz7kL0029aBv491xZ0091Aa",
    toAddress: "bc1q79x881a2k3m4p5q6r7s8t9u0v1w2x3y4z5a6",
    valueBtc: 1.40,
    valueUsd: 91000,
    hopIndex: 2,
    feeBtc: 0.00015,
    riskTag: "PEEL_CHAIN",
    status: "CONFIRMED",
    inputsCount: 2,
    outputsCount: 3,
    scriptSig: "0x483045022100e4...02204a11",
  },
  {
    id: "tx_3",
    txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    block: 891390,
    timestamp: "2026-09-05 16:45:00 UTC",
    fromAddress: "bc1q79x881a2k3m4p5q6r7s8t9u0v1w2x3y4z5a6",
    toAddress: "bc1qmixerservice999wasabicoinjoin0001",
    valueBtc: 0.90,
    valueUsd: 58500,
    hopIndex: 3,
    feeBtc: 0.00045,
    riskTag: "MIXER_ENTRY",
    status: "SANCTIONED",
    inputsCount: 5,
    outputsCount: 10,
    scriptSig: "0x493046022100c8...02210088",
  },
  {
    id: "tx_4",
    txHash: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    block: 891410,
    timestamp: "2026-09-08 14:00:00 UTC",
    fromAddress: "bc1qmixerservice999wasabicoinjoin0001",
    toAddress: "381a99XzDepositBinanceVault0091x",
    valueBtc: 0.88,
    valueUsd: 57200,
    hopIndex: 4,
    feeBtc: 0.00030,
    riskTag: "CRITICAL",
    status: "CONFIRMED",
    inputsCount: 10,
    outputsCount: 2,
    scriptSig: "0x47304402206d7e...02203e21",
  },
];

const INITIAL_WALLETS: Record<string, WalletProfile> = {
  "0x83A1e91F24c90a1b2c4e51291884391F2": {
    address: "0x83A1e91F24c90a1b2c4e51291884391F2",
    label: "Phishing Exploit Source Wallet",
    entityType: "SCAM_LINKED_WALLETS",
    riskScore: 98,
    currentBalanceBtc: 0.12,
    currentBalanceUsd: 7800,
    totalReceivedBtc: 2.84,
    totalSentBtc: 2.72,
    firstSeen: "2026-09-01 04:12:00 UTC",
    lastSeen: "2026-09-11 14:02:00 UTC",
    txCount: 22,
    tags: ["OFAC Sanctioned", "Drainer Bot", "High Risk VASP Target"],
    coSpentCluster: "CLUSTER-ALPHA-99",
    associatedIPs: ["185.220.101.4', '194.26.29.112"],
  },
};

const INITIAL_MIXER_ALERT: MixerAlert = {
  id: "MIXER-WASABI-0921",
  mixerName: "Wasabi Wallet 2.0 (CoinJoin)",
  branchName: "Wasabi Branch #0921",
  detectedTime: "2026-09-05 16:45:00 UTC",
  obfuscatedAmountBtc: 0.90,
  entropyScore: 87.4,
  equalOutputDenomBtc: 0.10,
  inputHop: 3,
  peelChainDepth: 4,
  status: "ACTIVE_OBFUSCATION",
  unmixedVelocityBtc: 0.88,
  txHashes: [
    "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
  ],
};

export const useForensicStore = create<ForensicStore>((set) => ({
  caseId: "VT-0921",
  caseTitle: "SCAM-LINKED MULTI-HOP DRAIN",
  leadOfficer: "Det. Marcus Vance",
  primaryWallet: "0x83A1e91F24c90a1b2c4e51291884391F2",
  totalValueBtc: 2.84,
  maxHops: 4,

  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  candidates: INITIAL_CANDIDATES,
  transactions: INITIAL_TRANSACTIONS,
  wallets: INITIAL_WALLETS,
  mixerAlert: INITIAL_MIXER_ALERT,

  selectedNodeId: "node_scam_source",
  selectedTxHash: "8f72a19b84c2d3a4e5f678901234567890abcdef1234567890abcdef8f7291bc",
  hopDepthFilter: 4,
  minTxValue: 0.05,
  entityVisibility: {
    cex: true,
    unhosted: true,
    intermediary: true,
    mixer: true,
    highRiskOnly: false,
  },

  isLE28ModalOpen: false,
  le28Form: {
    caseRef: "VT-0921",
    vaspName: "Exchange Alpha (Binance)",
    vaspId: "VASP-BN-9921",
    targetAddress: "381a99XzDepositBinanceVault0091x",
    seizureAmountBtc: 1.33,
    officerName: "Det. Marcus Vance",
    badgeNumber: "VT-88219",
    agencyName: "Cyber Crimes Enforcement Unit",
    urgencyLevel: "EXPEDITED_EMERGENCY",
    justificationText:
      "Forensic multi-hop tracing confirms 1.33 BTC drain from phishing victim wallet (0x83A1...91F2) deposited directly into target deposit vault. Request immediate 72-hour freeze under ISO/IEC 27037 protocol.",
    isSubmitted: false,
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedTxHash: (txHash) => set({ selectedTxHash: txHash }),
  setHopDepthFilter: (hops) => set({ hopDepthFilter: hops }),
  setMinTxValue: (val) => set({ minTxValue: val }),
  toggleEntityVisibility: (key) =>
    set((state) => ({
      entityVisibility: {
        ...state.entityVisibility,
        [key]: !state.entityVisibility[key],
      },
    })),
  setLE28ModalOpen: (open, vaspName) =>
    set((state) => ({
      isLE28ModalOpen: open,
      le28Form: {
        ...state.le28Form,
        ...(vaspName ? { vaspName } : {}),
      },
    })),
  submitLE28Form: (formUpdate) =>
    set((state) => {
      const updated = { ...state.le28Form, ...formUpdate, isSubmitted: true };
      updated.transmissionReceipt = {
        receiptId: `LE28-REC-${Math.floor(100000 + Math.random() * 900000)}`,
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        deliveryStatus: "CONFIRMED_DELIVERED",
        digitalSignature:
          "SIG_ECDSA_Secp256k1_9918a77f00192a8847c011e491a00f8821bc7729910a77f11902",
      };
      return { le28Form: updated };
    }),
}));
