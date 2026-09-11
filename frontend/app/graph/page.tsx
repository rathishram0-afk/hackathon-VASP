"use client";

import { useForensicStore } from "@/store/useForensicStore";
import GraphCanvas from "@/components/GraphCanvas";
import NodeInspectorDrawer from "@/components/NodeInspectorDrawer";
import {
  SlidersHorizontal,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Layers,
  Filter,
} from "lucide-react";
import { useState } from "react";

export default function GraphExplorerPage() {
  const {
    nodes,
    edges,
    hopDepthFilter,
    setHopDepthFilter,
    minTxValue,
    setMinTxValue,
    entityVisibility,
    toggleEntityVisibility,
  } = useForensicStore();

  const [layoutMode, setLayoutMode] = useState<"force" | "layered">("force");
  const [selectedAsset, setSelectedAsset] = useState("BTC");

  const exportNetworkXJson = () => {
    const data = {
      directed: true,
      multigraph: false,
      graph: { name: "VASP TRACE Case #VT-0921 NetworkX Graph" },
      nodes: nodes.map((n) => ({ ...n })),
      links: edges.map((e) => ({ ...e })),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vasp_trace_graph_networkx.json";
    a.click();
  };

  return (
    <div className="p-6 flex flex-col gap-4 h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant/20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-secondary-container" />
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              FULL-SCREEN GRAPH EXPLORER
            </h1>
          </div>
          <span className="font-mono text-[10px] text-outline px-2 py-0.5 rounded bg-surface-container-highest">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Asset Selector */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded border border-outline-variant/30 text-xs font-mono">
            {["BTC", "ETH", "USDT"].map((asset) => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(asset)}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  selectedAsset === asset
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>

          {/* Hop Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-outline">Hops:</span>
            {[1, 2, 3, 4, 5].map((hop) => (
              <button
                key={hop}
                onClick={() => setHopDepthFilter(hop)}
                className={`w-6 h-6 rounded flex items-center justify-center font-bold transition-colors ${
                  hopDepthFilter === hop
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-outline hover:text-on-surface"
                }`}
              >
                {hop}
              </button>
            ))}
          </div>

          {/* Export Graph JSON Button */}
          <button
            onClick={exportNetworkXJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-md text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT GRAPH JSON (NETWORKX)</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Left Side Filters Bar */}
        <div className="w-64 bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col gap-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <span className="font-label-sm text-xs font-bold text-outline uppercase">
              Topology Controls
            </span>
            <Filter className="w-3.5 h-3.5 text-outline" />
          </div>

          {/* Value Slider */}
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-outline">Min Value:</span>
              <span className="text-secondary-container">≥ {minTxValue} BTC</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minTxValue}
              onChange={(e) => setMinTxValue(parseFloat(e.target.value))}
              className="w-full accent-primary-container cursor-pointer"
            />
          </div>

          {/* Entity Filters */}
          <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-semibold">
              Filter Node Types
            </span>
            <div className="flex flex-col gap-1 text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-surface-container/40 hover:bg-surface-container cursor-pointer">
                <span>VASP Exchanges</span>
                <input
                  type="checkbox"
                  checked={entityVisibility.cex}
                  onChange={() => toggleEntityVisibility("cex")}
                  className="accent-primary-container"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded bg-surface-container/40 hover:bg-surface-container cursor-pointer">
                <span>Unhosted Hops</span>
                <input
                  type="checkbox"
                  checked={entityVisibility.unhosted}
                  onChange={() => toggleEntityVisibility("unhosted")}
                  className="accent-primary-container"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded bg-surface-container/40 hover:bg-surface-container cursor-pointer">
                <span className="text-tertiary">Mixers & Tumblers</span>
                <input
                  type="checkbox"
                  checked={entityVisibility.mixer}
                  onChange={() => toggleEntityVisibility("mixer")}
                  className="accent-tertiary-container"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Full D3 Canvas */}
        <div className="flex-1 min-w-0">
          <GraphCanvas isFullScreen={true} />
        </div>

        {/* Floating Node Inspector Drawer */}
        <div className="absolute top-4 right-4 z-30">
          <NodeInspectorDrawer />
        </div>
      </div>
    </div>
  );
}
