'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphEdge, NodeType } from '@/types/forensics';
import { ShieldAlert, Building2, Shuffle, Wallet, CheckCircle, Info } from 'lucide-react';

interface TransactionGraphProps {
  graphData: GraphData;
  selectedHops: number;
  activeFilters: Record<NodeType, boolean>;
  onSelectNode: (node: GraphNode) => void;
  selectedNodeId?: string;
  highlightVaspId?: string;
}

export function TransactionGraph({
  graphData,
  selectedHops,
  activeFilters,
  onSelectNode,
  selectedNodeId,
  highlightVaspId,
}: TransactionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !graphData) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 580;

    // Filter nodes by Hop depth and Active Node Type Filters
    const filteredNodes = graphData.nodes.filter(
      (node) => node.hop <= selectedHops && activeFilters[node.nodeType]
    );

    const nodeIds = new Set(filteredNodes.map((n) => n.id));

    // Filter edges to only include nodes present in visible set
    const filteredEdges = graphData.edges
      .filter((edge) => {
        const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
        const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
        return nodeIds.has(sourceId) && nodeIds.has(targetId) && edge.hop <= selectedHops;
      })
      .map((e) => ({ ...e })); // clone for D3 layout mutation

    const nodesCopy = filteredNodes.map((n) => ({ ...n }));

    // Clear existing SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);

    // Zoom container
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Define Arrow Marker Definitions for Directed Edges
    const defs = svg.append('defs');

    // Standard arrow marker
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569');

    // Active highlighted arrow marker
    defs
      .append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#0C6CF2');

    // D3 Force Simulation Setup
    const simulation = d3
      .forceSimulation<GraphNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(filteredEdges)
          .id((d) => d.id)
          .distance(160)
      )
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45));

    // Render Directed Edges
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll('line')
      .data(filteredEdges)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.isMixerFlow) return '#A855F7';
        if (d.isPeelChain) return '#F59E0B';
        return '#334155';
      })
      .attr('stroke-width', (d) => Math.max(1.5, Math.min(d.amountBtc / 8, 5)))
      .attr('marker-end', 'url(#arrow)')
      .attr('class', (d) => (d.isPeelChain || d.isMixerFlow ? 'active-flow-path' : ''));

    // Render Edge Transaction Labels (BTC Amount)
    const linkLabels = g
      .append('g')
      .selectAll('text')
      .data(filteredEdges)
      .enter()
      .append('text')
      .text((d) => `${d.amountBtc.toFixed(2)} BTC`)
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'middle')
      .attr('dy', -5);

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll('.node-item')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNode(d);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        const bounds = containerRef.current?.getBoundingClientRect();
        if (bounds) {
          setTooltipPos({
            x: event.clientX - bounds.left + 15,
            y: event.clientY - bounds.top - 15,
          });
        }
      })
      .on('mouseout', () => {
        setHoveredNode(null);
      });

    // Outer Circle Ring
    node
      .append('circle')
      .attr('r', (d) => (d.isTarget || d.isCandidateVasp ? 22 : 17))
      .attr('fill', (d) => {
        switch (d.nodeType) {
          case 'scam_source':
            return '#1F1215';
          case 'vasp':
            return '#0B192E';
          case 'mixer':
            return '#1E122A';
          case 'intermediary':
            return '#261C10';
          default:
            return '#121722';
        }
      })
      .attr('stroke', (d) => {
        if (selectedNodeId === d.id) return '#FFFFFF';
        switch (d.nodeType) {
          case 'scam_source':
            return '#EF4444';
          case 'vasp':
            return '#0C6CF2';
          case 'mixer':
            return '#A855F7';
          case 'intermediary':
            return '#F59E0B';
          default:
            return '#475569';
        }
      })
      .attr('stroke-width', (d) => (selectedNodeId === d.id || d.isTarget ? 3 : 2))
      .attr('class', (d) => {
        if (d.nodeType === 'scam_source') return 'node-glow-critical';
        if (d.nodeType === 'vasp') return 'node-glow-vasp';
        return '';
      });

    // Inner Node Icon / Symbol
    node
      .append('text')
      .text((d) => {
        switch (d.nodeType) {
          case 'scam_source':
            return '⚠';
          case 'vasp':
            return '🏦';
          case 'mixer':
            return '🌀';
          case 'intermediary':
            return '⇄';
          default:
            return '💼';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', (d) => (d.isCandidateVasp ? '15px' : '13px'));

    // Node Labels
    node
      .append('text')
      .text((d) => d.label)
      .attr('x', 0)
      .attr('y', (d) => (d.isCandidateVasp ? 36 : 30))
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('fill', (d) => (d.isCandidateVasp ? '#38BDF8' : '#E2E8F0'))
      .attr('font-weight', (d) => (d.isCandidateVasp || d.isTarget ? 'bold' : 'normal'));

    // Simulation Tick Listener
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkLabels
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag Helper functions
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

    return () => {
      simulation.stop();
    };
  }, [graphData, selectedHops, activeFilters, selectedNodeId, onSelectNode]);

  return (
    <div ref={containerRef} className="relative w-full h-[580px] bg-[#07090E] border border-[#1E293B] rounded-lg overflow-hidden select-none">
      {/* Background Grid Pattern - Blockchain.com style */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Primary SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full relative z-10" />

      {/* Hover Tooltip Overlay */}
      {hoveredNode && (
        <div
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          className="absolute z-30 pointer-events-none bg-[#121722] border border-[#1E293B] p-3 rounded-lg shadow-xl max-w-xs space-y-1 text-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-1.5">
            <span className="font-mono text-[#0C6CF2] font-semibold">{hoveredNode.label}</span>
            <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 font-mono font-bold text-[10px] rounded">
              {hoveredNode.riskScore === null ? 'Risk Score: Unscored' : `Risk Score: ${hoveredNode.riskScore}/100`}
            </span>
          </div>
          <div className="text-white font-medium">{hoveredNode.entityName || 'Unhosted Node'}</div>
          <div className="flex items-center justify-between text-[#94A3B8] font-mono text-[11px] pt-1">
            <span>Hop Distance: {hoveredNode.hop}</span>
            <span>Bal: {hoveredNode.balanceBtc} BTC</span>
          </div>
        </div>
      )}

      {/* Instruction Badge overlay */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 bg-[#121722]/90 backdrop-blur border border-[#1E293B] rounded text-[11px] text-[#94A3B8] flex items-center space-x-2 font-mono">
        <Info className="w-3.5 h-3.5 text-[#0C6CF2]" />
        <span>Click node to open Forensic Inspector Drawer. Drag to re-position. Scroll to zoom.</span>
      </div>
    </div>
  );
}
