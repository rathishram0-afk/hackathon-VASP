"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useForensicStore, GraphNode, GraphEdge } from "@/store/useForensicStore";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

export default function GraphCanvas({
  width = 1200,
  height = 700,
  isFullScreen = false,
}: {
  width?: number;
  height?: number;
  isFullScreen?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { nodes, edges, selectedNodeId, setSelectedNodeId, hopDepthFilter } =
    useForensicStore();

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter nodes/edges based on hop depth filter
    const activeEdges = edges.filter((e) => e.hopIndex <= hopDepthFilter);
    const activeNodeIds = new Set<string>();

    activeEdges.forEach((e) => {
      const srcId = typeof e.source === "object" ? (e.source as any).id : e.source;
      const tgtId = typeof e.target === "object" ? (e.target as any).id : e.target;
      activeNodeIds.add(srcId);
      activeNodeIds.add(tgtId);
    });

    const activeNodes = nodes.filter((n) => activeNodeIds.has(n.id) || n.type === "source");

    // Deep clone nodes & edges to avoid mutating Zustand state directly during D3 simulation
    const nodesData: (GraphNode & d3.SimulationNodeDatum)[] = activeNodes.map((n) => ({
      ...n,
    }));

    const edgesData: (GraphEdge & d3.SimulationLinkDatum<d3.SimulationNodeDatum>)[] =
      activeEdges.map((e) => ({
        ...e,
        source: typeof e.source === "object" ? (e.source as any).id : e.source,
        target: typeof e.target === "object" ? (e.target as any).id : e.target,
      }));

    const svgWidth = containerRef.current?.clientWidth || width;
    const svgHeight = containerRef.current?.clientHeight || height;

    svg.attr("width", svgWidth).attr("height", svgHeight);

    // Create marker definitions for edge arrows
    const defs = svg.append("defs");

    // Arrow marker standard
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#414754");

    // Arrow marker highlight
    defs
      .append("marker")
      .attr("id", "arrowhead-active")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 26)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#00d2ff");

    // Container for zoom/pan
    const g = svg.append("g").attr("class", "graph-container");

    // Setup zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior as any);

    // Setup Force Simulation
    const simulation = d3
      .forceSimulation<d3.SimulationNodeDatum>(nodesData)
      .force(
        "link",
        d3
          .forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>(
            edgesData
          )
          .id((d: any) => d.id)
          .distance(180)
      )
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Render Edges
    const linkGroup = g.append("g").attr("class", "links");

    const link = linkGroup
      .selectAll("line")
      .data(edgesData)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        if (d.riskTag === "CRITICAL") return "#EF4444";
        if (d.riskTag === "MIXER_ENTRY") return "#8B5CF6";
        if (d.riskTag === "PEEL_CHAIN") return "#F59E0B";
        return "#414754";
      })
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", (d) => Math.max(1.5, Math.min(d.valueBtc * 2, 5)))
      .attr("marker-end", "url(#arrowhead)");

    // Render Edge Labels (BTC Amount & Tx Hash snippet)
    const linkLabelGroup = g.append("g").attr("class", "link-labels");

    const linkLabel = linkLabelGroup
      .selectAll("text")
      .data(edgesData)
      .enter()
      .append("text")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "10px")
      .attr("fill", "#00d2ff")
      .attr("text-anchor", "middle")
      .text((d) => `${d.valueBtc} BTC (Hop ${d.hopIndex})`);

    // Render Nodes Group
    const nodeGroup = g.append("g").attr("class", "nodes");

    const node = nodeGroup
      .selectAll(".node")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
      })
      .call(
        d3
          .drag<SVGGElement, d3.SimulationNodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any
      );

    // Node Circle Background / Glow
    node
      .append("circle")
      .attr("r", (d: any) => (d.id === selectedNodeId ? 26 : 20))
      .attr("fill", (d: any) => {
        if (d.type === "source") return "#93000a";
        if (d.type === "mixer") return "#3c0091";
        if (d.type === "vasp") return "#003543";
        if (d.type === "peel_hub") return "#1c1f29";
        return "#131a29";
      })
      .attr("stroke", (d: any) => {
        if (d.id === selectedNodeId) return "#00d2ff";
        if (d.type === "source") return "#EF4444";
        if (d.type === "mixer") return "#8B5CF6";
        if (d.type === "vasp") return "#10B981";
        if (d.type === "peel_hub") return "#F59E0B";
        return "#0070f3";
      })
      .attr("stroke-width", (d: any) => (d.id === selectedNodeId ? 3 : 2))
      .attr("filter", (d: any) =>
        d.id === selectedNodeId ? "drop-shadow(0px 0px 8px #00d2ff)" : "none"
      );

    // Node Icon / Type text
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-family", "Inter")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff")
      .text((d: any) => {
        if (d.type === "source") return "SRC";
        if (d.type === "mixer") return "MIX";
        if (d.type === "vasp") return "VASP";
        if (d.type === "peel_hub") return "HUB";
        return "HOP";
      });

    // Node Labels below
    node
      .append("text")
      .attr("dy", 34)
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("fill", (d: any) => (d.id === selectedNodeId ? "#00d2ff" : "#dfe2ef"))
      .text((d: any) => d.label);

    // Node Subtitle (Address snippet)
    node
      .append("text")
      .attr("dy", 46)
      .attr("text-anchor", "middle")
      .attr("font-family", "JetBrains Mono")
      .attr("font-size", "9px")
      .attr("fill", "#8b90a0")
      .text((d: any) => `${d.address.substring(0, 6)}...${d.address.slice(-4)}`);

    // Simulation Ticks
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 8);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag Helper Functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // SVG Background Click -> Deselect Node
    svg.on("click", () => {
      setSelectedNodeId(null);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, selectedNodeId, hopDepthFilter, width, height, setSelectedNodeId]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isFullScreen ? "h-[calc(100vh-8rem)]" : "h-[500px]"
      } bg-surface-container-lowest border border-outline-variant/30 rounded-lg overflow-hidden select-none`}
    >
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Graph Floating Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 rounded-lg bg-surface-container-low/90 border border-outline-variant/40 backdrop-blur-md shadow-lg">
        <button
          onClick={() => {
            if (svgRef.current) {
              d3.select(svgRef.current)
                .transition()
                .duration(500)
                .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.2);
            }
          }}
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (svgRef.current) {
              d3.select(svgRef.current)
                .transition()
                .duration(500)
                .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.8);
            }
          }}
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-outline-variant/40"></div>
        <button
          onClick={() => {
            if (svgRef.current) {
              d3.select(svgRef.current)
                .transition()
                .duration(500)
                .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
            }
          }}
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Badge Overlay */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-surface-container-low/90 border border-outline-variant/40 backdrop-blur-md shadow-lg flex flex-col gap-2">
        <span className="font-label-sm text-[10px] text-outline uppercase font-bold tracking-wider">
          Network Topology Legend
        </span>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-error/30"></span>
            <span className="font-label-sm text-[10px] text-on-surface">Scam Source</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
            <span className="font-label-sm text-[10px] text-on-surface">Unhosted Hop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-label-sm text-[10px] text-on-surface">Peel Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-label-sm text-[10px] text-on-surface">Mixer / Tumbler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-label-sm text-[10px] text-on-surface">VASP Exchange</span>
          </div>
        </div>
      </div>
    </div>
  );
}
