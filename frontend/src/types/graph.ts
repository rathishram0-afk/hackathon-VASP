import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type NodeType = 'SOURCE' | 'INTERMEDIARY' | 'UNHOSTED' | 'VASP' | 'MIXER' | 'HIGH_RISK' | 'SIDE_NODE';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  address: string;
  type: NodeType;
  /** Genuine node-level risk score (0-100), or null if the backend does not
   * provide a node-level risk assessment for this address. Never label
   * candidate confidence as risk score. */
  riskScore: number | null;
  /** VASP attribution confidence percentage (0-100), set only if this exact
   * address is evaluated by the backend scoring engine as a candidate. */
  candidateConfidence?: number | null;
  /** Whether this node participates in the primary traced transaction flow path */
  isMainPath?: boolean;
  balanceBtc: number;
  outflowBtc: number;
  inflowBtc: number;
  hopDistance: number;
  clusterTag?: string;
  entityName?: string;
  isCandidateTarget?: boolean;
  outputsCount?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  amountBtc: number;
  txHash: string;
  timestamp: string;
  blockHeight: number;
  isPrimaryPath: boolean;
  isMainPath?: boolean;
  hop: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
