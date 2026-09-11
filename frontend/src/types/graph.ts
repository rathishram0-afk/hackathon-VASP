import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type NodeType = 'SOURCE' | 'INTERMEDIARY' | 'UNHOSTED' | 'VASP' | 'MIXER' | 'HIGH_RISK';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  address: string;
  type: NodeType;
  riskScore: number;
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
  hop: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
