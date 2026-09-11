'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge, GraphData } from '@/types';
import { useInvestigation } from '@/hooks/useInvestigation';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Layers, Info } from 'lucide-react';

interface D3TransactionGraphProps {
  data?: GraphData;
  height?: number;
}

export const D3TransactionGraph: React.FC<D3TransactionGraphProps> = ({
  data,
  height = 540,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { graphData, selectedNode, selectNode, maxHopsFilter, setMaxHopsFilter, attributions } = useInvestigation();
  const currentData = data || graphData;

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [highlightPrimaryPath, setHighlightPrimaryPath] = useState<boolean>(true);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null);

  // Filter nodes & edges by hop distance
  const filteredNodes = currentData.nodes.filter((node) => node.hopDistance <= maxHopsFilter);
  const filteredEdges = currentData.edges.filter((edge) => {
    const sourceHop = typeof edge.source === 'object' ? edge.source.hopDistance : currentData.nodes.find((n) => n.id === edge.source)?.hopDistance || 0;
    const targetHop = typeof edge.target === 'object' ? edge.target.hopDistance : currentData.nodes.find((n) => n.id === edge.target)?.hopDistance || 0;
    return sourceHop <= maxHopsFilter && targetHop <= maxHopsFilter;
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main container group
    const g = svg.append('g').attr('class', 'main-graph-group');
    svgGroupRef.current = g.node();

    // Setup D3 Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // SVG Defs for gradients & arrow markers
    const defs = svg.append('defs');

    // Arrow marker for primary path
    defs
      .append('marker')
      .attr('id', 'arrow-primary')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#F5B718');

    // Arrow marker for secondary path
    defs
      .append('marker')
      .attr('id', 'arrow-secondary')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9CA3AF');

    // Clone node & edge data for simulation
    const nodes: GraphNode[] = filteredNodes.map((n) => ({ ...n }));
    const links: GraphEdge[] = filteredEdges.map((e) => ({
      ...e,
      source: typeof e.source === 'object' ? e.source.id : e.source,
      target: typeof e.target === 'object' ? e.target.id : e.target,
    }));

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(links)
          .id((d) => d.id)
          .distance(180)
      )
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(60));

    // Render Edges
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll<SVGLineElement, GraphEdge>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => (d.isPrimaryPath && highlightPrimaryPath ? '#F5B718' : '#D1D5DB'))
      .attr('stroke-width', (d) => (d.isPrimaryPath && highlightPrimaryPath ? 3 : 1.5))
      .attr('stroke-dasharray', (d) => (d.isPrimaryPath && highlightPrimaryPath ? '6,4' : 'none'))
      .attr('class', (d) => (d.isPrimaryPath && highlightPrimaryPath ? 'active-flow-path' : ''))
      .attr('marker-end', (d) =>
        d.isPrimaryPath && highlightPrimaryPath ? 'url(#arrow-primary)' : 'url(#arrow-secondary)'
      );

    // Edge Labels (BTC Amount)
    const edgeLabelGroup = g.append('g').attr('class', 'edge-labels');
    const edgeLabels = edgeLabelGroup
      .selectAll<SVGTextElement, GraphEdge>('text')
      .data(links)
      .enter()
      .append('text')
      .text((d) => {
        const amt = d.amountBtc || 0;
        return amt >= 0.01 ? `${amt.toFixed(2)} BTC` : `${amt.toFixed(4)} BTC`;
      })
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .attr('fill', (d) => (d.isPrimaryPath && highlightPrimaryPath ? '#B45309' : '#6B7280'))
      .attr('text-anchor', 'middle')
      .attr('dy', -6);

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (d.type !== 'SOURCE' && d.type !== 'VASP') {
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        selectNode(d);
      });

    // Node Outer Glow / Rings
    node
      .filter((d) => d.type === 'VASP' && !!d.isCandidateTarget)
      .append('circle')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', '#F5B718')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.9)
      .attr('class', 'animate-pulse');

    node
      .filter((d) => d.type === 'SOURCE')
      .append('circle')
      .attr('r', 28)
      .attr('fill', 'none')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Selected node outline ring
    node
      .filter((d) => selectedNode?.id === d.id)
      .append('circle')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', '#0C0D0E')
      .attr('stroke-width', 3);

    // Main Node Circles
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'VASP' ? 24 : d.type === 'SOURCE' ? 22 : 18))
      .attr('fill', (d) => {
        if (d.type === 'VASP') return '#0C0D0E';
        if (d.type === 'SOURCE') return '#FEE2E2';
        if (d.type === 'MIXER') return '#EDE9FE';
        if (d.type === 'UNHOSTED') return '#FEF08A';
        return '#F3F4F6';
      })
      .attr('stroke', (d) => {
        if (d.type === 'VASP') return '#F5B718';
        if (d.type === 'SOURCE') return '#EF4444';
        if (d.type === 'MIXER') return '#8B5CF6';
        if (d.type === 'UNHOSTED') return '#F5B718';
        return '#9CA3AF';
      })
      .attr('stroke-width', (d) => (d.type === 'VASP' ? 3 : 2))
      .attr('class', (d) => (d.type === 'SOURCE' ? 'node-glow-critical' : d.type === 'VASP' ? 'node-glow-vasp' : ''));

    // Node Icons / Text Labels inside circle
    node
      .append('text')
      .text((d) => {
        if (d.type === 'SOURCE') return '⚠️';
        if (d.type === 'VASP') return '🏦';
        if (d.type === 'MIXER') return '🔀';
        if (d.type === 'UNHOSTED') return '👤';
        return '🔗';
      })
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', (d) => (d.type === 'VASP' || d.type === 'SOURCE' ? '14px' : '12px'));

    // Node Title Below
    node
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.type === 'VASP' ? 40 : 34))
      .attr('font-size', '11px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', '#0C0D0E');

    // Address truncation
    node
      .append('text')
      .text((d) => `${d.address.substring(0, 6)}...${d.address.substring(d.address.length - 4)}`)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.type === 'VASP' ? 52 : 46))
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#6B7280');

    // Candidate match badge for target VASP
    node
      .filter((d) => d.type === 'VASP' && !!d.isCandidateTarget)
      .append('rect')
      .attr('x', -32)
      .attr('y', -38)
      .attr('width', 64)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#F5B718');

    node
      .filter((d) => d.type === 'VASP' && !!d.isCandidateTarget)
      .append('text')
      .text((d) => {
        const match = attributions.find((a) => a.depositAddress === d.address);
        return match ? `${match.confidenceScore}% MATCH` : 'MATCH';
      })
      .attr('x', 0)
      .attr('y', -26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', '700')
      .attr('fill', '#0C0D0E');

    // Simulation Tick Event
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      edgeLabels
        .attr('x', (d) => (((d.source as GraphNode).x || 0) + ((d.target as GraphNode).x || 0)) / 2)
        .attr('y', (d) => (((d.source as GraphNode).y || 0) + ((d.target as GraphNode).y || 0)) / 2);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges, selectedNode, maxHopsFilter, highlightPrimaryPath, height]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-[36px] bg-pure-white shadow-[0_4px_24px_rgba(12,13,14,0.05)] border border-surface-dim overflow-hidden"
      style={{ minHeight: height }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Floating Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Toolbar: Hop Slider & Path Toggle */}
        <div className="flex items-center gap-2 bg-pure-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md border border-surface-dim/70 pointer-events-auto font-outfit text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-gray" />
          <span className="text-slate-gray font-medium">Hops:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((hop) => (
              <button
                key={hop}
                onClick={() => setMaxHopsFilter(hop)}
                className={`w-6 h-6 rounded-full font-bold text-[11px] transition-colors ${
                  maxHopsFilter === hop
                    ? 'bg-signal-orange text-ink-black'
                    : 'bg-surface-container hover:bg-surface-container-high text-slate-gray'
                }`}
              >
                {hop}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-surface-dim mx-1"></div>

          <button
            onClick={() => setHighlightPrimaryPath(!highlightPrimaryPath)}
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-colors flex items-center gap-1 ${
              highlightPrimaryPath
                ? 'bg-signal-orange text-ink-black'
                : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
            }`}
          >
            <Layers className="w-3 h-3" />
            VASP Path Highlight
          </button>
        </div>

        {/* Right Toolbar: Zoom Controls */}
        <div className="flex items-center gap-1 bg-pure-white/95 backdrop-blur-md p-1.5 rounded-full shadow-md border border-surface-dim/70 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-ink-black transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-ink-black transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset View"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-ink-black transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ height }}
      ></svg>

      {/* Footer Info Hint */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5 text-[11px] font-outfit text-slate-gray bg-pure-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-surface-dim/50 pointer-events-none">
        <Info className="w-3.5 h-3.5 text-signal-orange" />
        <span>Click node to open Forensic Drawer. Drag nodes to reposition graph.</span>
      </div>
    </div>
  );
};
