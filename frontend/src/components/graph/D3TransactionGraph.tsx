'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge, GraphData } from '@/types';
import { useInvestigation } from '@/hooks/useInvestigation';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Info,
  Maximize2,
  Minimize2,
  Route,
  ShieldCheck,
  Building,
  AlertTriangle,
  Network,
  Shuffle,
  Eye,
} from 'lucide-react';

interface D3TransactionGraphProps {
  data?: GraphData;
  height?: number;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 320;

export type FilterId =
  | 'all'
  | 'mainPath'
  | 'vaspPath'
  | 'vaspCandidates'
  | 'highRisk'
  | 'secondaryNodes'
  | 'mixerIndicators';

export const D3TransactionGraph: React.FC<D3TransactionGraphProps> = ({
  data,
  height = 540,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { graphData, selectedNode, selectNode, maxHopsFilter, setMaxHopsFilter, attributions, mixerPatterns } = useInvestigation();
  const currentData = data || graphData;

  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set(['all']));
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: MIN_WIDTH,
    height,
  });

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodeSelectionRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const linkSelectionRef = useRef<d3.Selection<SVGLineElement, GraphEdge, SVGGElement, unknown> | null>(null);
  const edgeLabelSelectionRef = useRef<d3.Selection<SVGTextElement, GraphEdge, SVGGElement, unknown> | null>(null);

  // Dynamic Hop Depth computation based on actual investigation data
  const actualMaxHop = useMemo(() => {
    if (!currentData.nodes.length) return 4;
    const maxVal = Math.max(...currentData.nodes.map((n) => n.hopDistance || 0));
    return Math.max(1, maxVal);
  }, [currentData.nodes]);

  const availableHopOptions = useMemo(() => {
    const list: (number | 'ALL')[] = [];
    for (let i = 1; i <= Math.min(actualMaxHop, 5); i++) {
      list.push(i);
    }
    list.push('ALL');
    return list;
  }, [actualMaxHop]);

  // Stable references: only recompute when the underlying data or hop
  // filter actually changes, never on every render (e.g. a zoom/pan tick).
  const effectiveMaxHop = maxHopsFilter >= 999 ? 999 : maxHopsFilter;

  const filteredNodes = useMemo(
    () => currentData.nodes.filter((node) => (node.hopDistance || 0) <= effectiveMaxHop),
    [currentData, effectiveMaxHop]
  );
  const filteredEdges = useMemo(
    () =>
      currentData.edges.filter((edge) => {
        const sourceHop =
          typeof edge.source === 'object' ? edge.source.hopDistance : currentData.nodes.find((n) => n.id === edge.source)?.hopDistance || 0;
        const targetHop =
          typeof edge.target === 'object' ? edge.target.hopDistance : currentData.nodes.find((n) => n.id === edge.target)?.hopDistance || 0;
        return (sourceHop || 0) <= effectiveMaxHop && (targetHop || 0) <= effectiveMaxHop;
      }),
    [currentData, effectiveMaxHop]
  );

  // Track the container's REAL rendered size (normal layout, fullscreen
  // overlay, or a browser resize) instead of measuring once at mount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const nextWidth = Math.max(Math.round(rect.width), MIN_WIDTH);
      const nextHeight = Math.max(Math.round(rect.height), MIN_HEIGHT);
      setDimensions((prev) =>
        prev.width === nextWidth && prev.height === nextHeight ? prev : { width: nextWidth, height: nextHeight }
      );
    };

    measure();

    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [isFullscreen]);

  // Exit fullscreen on Escape, matching standard fullscreen UX.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // GRAPH LAYOUT: builds the force simulation and static scene graph. Only
  // reruns when the data itself, the hop filter, the highlight toggle, or
  // the measured container size actually change -- never on zoom/pan and
  // never merely because a different node got selected.
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = dimensions.width;
    const layoutHeight = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${layoutHeight}`).attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main container group
    const g = svg.append('g').attr('class', 'main-graph-group');

    // VIEW TRANSFORM: zoom/pan only ever repositions this group. It must
    // never touch node x/y or restart the force simulation.
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // SVG Defs for gradients & arrow markers
    const defs = svg.append('defs');

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

    // Clone node & edge data for simulation -- this is the one and only
    // place these clones get created, since this effect no longer reruns
    // on zoom or selection, the simulation's layout stays stable.
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
      .force('center', d3.forceCenter(width / 2, layoutHeight / 2))
      .force('collide', d3.forceCollide().radius(60));

    // Render Edges
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup
      .selectAll<SVGLineElement, GraphEdge>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => (d.isPrimaryPath ? '#F5B718' : '#D1D5DB'))
      .attr('stroke-width', (d) => (d.isPrimaryPath ? 3 : 1.5))
      .attr('stroke-dasharray', (d) => (d.isPrimaryPath ? '6,4' : 'none'))
      .attr('class', (d) => (d.isPrimaryPath ? 'active-flow-path transition-opacity duration-200' : 'transition-opacity duration-200'))
      .attr('marker-end', (d) =>
        d.isPrimaryPath ? 'url(#arrow-primary)' : 'url(#arrow-secondary)'
      );

    linkSelectionRef.current = link;

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
      .attr('fill', (d) => (d.isPrimaryPath ? '#B45309' : '#6B7280'))
      .attr('text-anchor', 'middle')
      .attr('dy', -6)
      .attr('class', 'transition-opacity duration-200');

    edgeLabelSelectionRef.current = edgeLabels;

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group cursor-pointer transition-opacity duration-200')
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

    nodeSelectionRef.current = node;

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

    // Selected node outline ring -- kept in its own tagged class so the
    // selection-only effect below can update it without a full rebuild.
    node
      .filter((d) => selectedNode?.id === d.id)
      .append('circle')
      .attr('class', 'selection-ring')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', '#0C0D0E')
      .attr('stroke-width', 3);

    // Main Node Circles:
    // 1. SOURCE: Red
    // 2. MAIN INTERMEDIATE: Yellow (#FDE047 / #FEF08A) with amber border (#EAB308 / #D97706)
    // 3. VASP / CANDIDATE: Dark ink-black or VASP styling with gold border (#F5B718)
    // 4. NEIGHBOR / CONNECTED NODES: Neutral gray (#F3F4F6) with subtle border (#D1D5DB)
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'VASP' ? 24 : d.type === 'SOURCE' ? 22 : d.isMainPath ? 20 : 16))
      .attr('fill', (d) => {
        if (d.type === 'SOURCE') return '#FEE2E2'; // Red tint
        if (d.type === 'VASP') return '#0C0D0E';   // Dark VASP ink
        if (d.type === 'MIXER') return '#EDE9FE';  // Purple
        if (d.isMainPath) return '#FEF08A';        // Vibrant Yellow for main intermediate
        return '#F3F4F6';                          // Neutral light gray for neighbors
      })
      .attr('stroke', (d) => {
        if (d.type === 'SOURCE') return '#EF4444'; // Red
        if (d.type === 'VASP') return '#F5B718';   // Gold
        if (d.type === 'MIXER') return '#8B5CF6';  // Purple
        if (d.isMainPath) return '#EAB308';        // Vibrant Yellow/Amber border for main intermediate
        return '#CBD5E1';                          // Muted slate border for neighbors
      })
      .attr('stroke-width', (d) => (d.type === 'VASP' ? 3 : d.isMainPath || d.type === 'SOURCE' ? 2.5 : 1.5))
      .attr('opacity', (d) => (d.isMainPath || d.type === 'SOURCE' || d.type === 'VASP' || d.type === 'MIXER' ? 1.0 : 0.8))
      .attr('class', (d) => (d.type === 'SOURCE' ? 'node-glow-critical' : d.type === 'VASP' ? 'node-glow-vasp' : ''));

    // Node Icons / Text Labels inside circle
    node
      .append('text')
      .text((d) => {
        if (d.type === 'SOURCE') return '⚠️';
        if (d.type === 'VASP') return '🏦';
        if (d.type === 'MIXER') return '🔀';
        if (d.isMainPath) return '⚡';
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
      .attr('font-weight', (d) => (d.isMainPath || d.type === 'SOURCE' || d.type === 'VASP' ? '700' : '500'))
      .attr('fill', (d) => (d.isMainPath || d.type === 'SOURCE' || d.type === 'VASP' ? '#0C0D0E' : '#6B7280'));

    // Address truncation
    node
      .append('text')
      .text((d) => `${d.address.substring(0, 6)}...${d.address.substring(d.address.length - 4)}`)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.type === 'VASP' ? 52 : 46))
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#6B7280');

    // 1. Source Node Risk Badge
    const sourceBadges = node.filter((d) => d.type === 'SOURCE' && d.riskScore !== null);
    sourceBadges
      .append('rect')
      .attr('x', -28)
      .attr('y', -38)
      .attr('width', 56)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#EF4444');

    sourceBadges
      .append('text')
      .text((d) => `RISK: ${d.riskScore}`)
      .attr('x', 0)
      .attr('y', -26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', '700')
      .attr('fill', '#FFFFFF');

    // 2. Main Intermediate Node Risk Badge (Active Traced Fund Flow)
    const relayBadges = node.filter(
      (d) => d.type === 'INTERMEDIARY' && !!d.isMainPath && d.riskScore !== null
    );
    relayBadges
      .append('rect')
      .attr('x', -28)
      .attr('y', -36)
      .attr('width', 56)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#FEF08A')
      .attr('stroke', '#EAB308')
      .attr('stroke-width', 1.5);

    relayBadges
      .append('text')
      .text((d) => `RISK: ${d.riskScore}`)
      .attr('x', 0)
      .attr('y', -24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('font-weight', '700')
      .attr('fill', '#854D0E');

    // 3. Candidate Match Badge for Target VASP
    const vaspBadges = node.filter(
      (d) => (d.type === 'VASP' || !!d.candidateConfidence) && !!d.isCandidateTarget
    );
    vaspBadges
      .append('rect')
      .attr('x', -34)
      .attr('y', -40)
      .attr('width', 68)
      .attr('height', 16)
      .attr('rx', 8)
      .attr('fill', '#F5B718');

    vaspBadges
      .append('text')
      .text((d) => {
        if (d.candidateConfidence != null) {
          return `${d.candidateConfidence}% MATCH`;
        }
        const match = attributions.find((a) => a.depositAddress === d.address);
        return match ? `${match.confidenceScore}% MATCH` : 'MATCH';
      })
      .attr('x', 0)
      .attr('y', -28)
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
      nodeSelectionRef.current = null;
      linkSelectionRef.current = null;
      edgeLabelSelectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNodes, filteredEdges, dimensions.width, dimensions.height]);

  // SELECTION HIGHLIGHT: runs independently of the layout effect above, so
  // clicking a node to open the drawer never rebuilds/restarts the
  // simulation or disturbs the current zoom/pan/positions.
  useEffect(() => {
    const node = nodeSelectionRef.current;
    if (!node) return;

    node.selectAll('circle.selection-ring').remove();
    node
      .filter((d) => selectedNode?.id === d.id)
      .append('circle')
      .attr('class', 'selection-ring')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', '#0C0D0E')
      .attr('stroke-width', 3);
  }, [selectedNode]);

  // FORENSIC FILTER APPLICATION: Update opacities, strokes, and highlights
  // dynamically without restarting the force simulation, moving nodes, or resetting pan/zoom!
  useEffect(() => {
    const nodeSel = nodeSelectionRef.current;
    const linkSel = linkSelectionRef.current;
    const labelSel = edgeLabelSelectionRef.current;
    if (!nodeSel || !linkSel) return;

    // Fast lookups from investigation data
    const candidateAddresses = new Set(
      attributions.map((a) => a.depositAddress).filter(Boolean)
    );
    // Include any node explicitly tagged as candidateTarget
    currentData.nodes.forEach((n) => {
      if (n.isCandidateTarget) candidateAddresses.add(n.address);
    });

    const isAll = activeFilters.has('all');
    const hasMainPath = activeFilters.has('mainPath');
    const hasVaspPath = activeFilters.has('vaspPath');
    const hasVaspCandidates = activeFilters.has('vaspCandidates');
    const hasHighRisk = activeFilters.has('highRisk');
    const hasSecondaryNodes = activeFilters.has('secondaryNodes');
    const hasMixerIndicators = activeFilters.has('mixerIndicators');

    // Helper: test if node matches active filter criteria
    const isNodeActive = (d: GraphNode) => {
      if (isAll) return true;
      let matched = false;

      if (hasMainPath && (d.isMainPath || d.type === 'SOURCE')) matched = true;
      if (hasVaspPath) {
        // Source -> main intermediaries -> top candidate VASP
        if (d.type === 'SOURCE') matched = true;
        if (d.isMainPath) matched = true;
        if (d.type === 'VASP' && d.isCandidateTarget) matched = true;
      }
      if (hasVaspCandidates && (d.type === 'VASP' || candidateAddresses.has(d.address) || d.isCandidateTarget)) {
        matched = true;
      }
      if (hasHighRisk && d.riskScore !== null && d.riskScore >= 70) matched = true;
      if (hasSecondaryNodes && !d.isMainPath && d.type !== 'SOURCE') matched = true;
      if (hasMixerIndicators && (d.type === 'MIXER' || (d.clusterTag && d.clusterTag.toLowerCase().includes('mixer')))) {
        matched = true;
      }

      return matched;
    };

    // Helper: test if edge is highlighted
    const isEdgeActive = (d: GraphEdge) => {
      if (isAll) return true;
      if (hasMainPath || hasVaspPath) {
        return Boolean(d.isPrimaryPath || d.isMainPath);
      }
      // If filtering by specific nodes, highlight links between active nodes
      const sId = typeof d.source === 'object' ? d.source.id : d.source;
      const tId = typeof d.target === 'object' ? d.target.id : d.target;
      const sNode = currentData.nodes.find((n) => n.id === sId);
      const tNode = currentData.nodes.find((n) => n.id === tId);
      if (sNode && tNode && isNodeActive(sNode) && isNodeActive(tNode)) {
        return true;
      }
      return false;
    };

    // Update Node visual emphasis
    nodeSel.each(function (d) {
      const g = d3.select(this);
      const active = isNodeActive(d);

      // Node group opacity
      g.attr('opacity', active ? 1.0 : 0.2);

      // Node outer glow / rings enhancement
      const mainCircle = g.select('circle:not(.selection-ring)');
      if (active && (hasHighRisk || hasMixerIndicators)) {
        if (hasHighRisk && d.riskScore !== null && d.riskScore >= 70) {
          mainCircle.attr('class', 'node-glow-highrisk');
        } else if (hasMixerIndicators && d.type === 'MIXER') {
          mainCircle.attr('class', 'node-glow-mixer');
        }
      } else {
        mainCircle.attr('class', d.type === 'SOURCE' ? 'node-glow-critical' : d.type === 'VASP' ? 'node-glow-vasp' : '');
      }
    });

    // Update Links (edges)
    linkSel.each(function (d) {
      const l = d3.select(this);
      const active = isEdgeActive(d);
      const isPrimary = Boolean(d.isPrimaryPath || (hasVaspPath && d.isPrimaryPath));

      l.attr('opacity', active ? 1.0 : 0.15);
      if (isPrimary && (isAll || hasMainPath || hasVaspPath)) {
        l.attr('stroke', '#F5B718')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '6,4')
          .attr('class', 'active-flow-path transition-opacity duration-200')
          .attr('marker-end', 'url(#arrow-primary)');
      } else {
        l.attr('stroke', '#D1D5DB')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', 'none')
          .attr('class', 'transition-opacity duration-200')
          .attr('marker-end', 'url(#arrow-secondary)');
      }
    });

    // Update Edge Labels
    if (labelSel) {
      labelSel.each(function (d) {
        const text = d3.select(this);
        const active = isEdgeActive(d);
        text.attr('opacity', active ? 1.0 : 0.15);
      });
    }
  }, [activeFilters, currentData, attributions]);

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

  // Toggle Graph Filters with smart multi-select
  const toggleFilter = (filter: FilterId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (filter === 'all') {
        return new Set(['all']);
      }
      // If toggling a specific filter, remove 'all'
      next.delete('all');
      if (next.has(filter)) {
        next.delete(filter);
        // If no filter selected, fallback to 'all'
        if (next.size === 0) {
          return new Set(['all']);
        }
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  // Check data availability for badges/disabled filters
  const hasGenuineScoredNodes = useMemo(
    () => currentData.nodes.some((n) => n.riskScore !== null),
    [currentData.nodes]
  );
  const hasMixerData = useMemo(
    () =>
      mixerPatterns.length > 0 ||
      currentData.nodes.some((n) => n.type === 'MIXER' || (n.clusterTag && n.clusterTag.toLowerCase().includes('mixer'))),
    [mixerPatterns, currentData.nodes]
  );
  const hasCandidates = useMemo(
    () =>
      attributions.length > 0 ||
      currentData.nodes.some((n) => n.type === 'VASP' || n.isCandidateTarget),
    [attributions, currentData.nodes]
  );

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-40 rounded-none bg-pure-white' // below the node detail drawer's z-50 so it stays usable in fullscreen
          : 'relative w-full rounded-[36px] bg-pure-white shadow-[0_4px_24px_rgba(12,13,14,0.05)] border border-surface-dim overflow-hidden'
      }
      style={isFullscreen ? undefined : { minHeight: height }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Floating Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Toolbar: Separated HOP DEPTH & Compact GRAPH FILTERS */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto font-outfit text-xs">
          {/* 1. SEPARATE HOP DEPTH CONTROL */}
          <div className="flex items-center gap-1.5 bg-pure-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-surface-dim/70">
            <span className="text-slate-gray font-bold uppercase tracking-wider text-[10px] pl-0.5">
              Hop Depth:
            </span>
            <div className="flex items-center gap-1">
              {availableHopOptions.map((opt) => {
                const isSelected =
                  opt === 'ALL'
                    ? maxHopsFilter >= 999
                    : maxHopsFilter === opt;
                return (
                  <button
                    key={String(opt)}
                    onClick={() => setMaxHopsFilter(opt === 'ALL' ? 999 : (opt as number))}
                    className={`h-6 px-2 rounded-full font-bold text-[11px] transition-all ${
                      isSelected
                        ? 'bg-signal-orange text-ink-black shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-slate-gray'
                    }`}
                    title={
                      opt === 'ALL'
                        ? 'Show all hops in investigation'
                        : `Show up to Hop ${opt} from source wallet`
                    }
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. COMPACT GRAPH FILTERS (MULTI-SELECT) */}
          <div className="flex flex-wrap items-center gap-1 bg-pure-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-md border border-surface-dim/70">
            <span className="text-slate-gray font-bold uppercase tracking-wider text-[10px] pr-1 hidden sm:inline">
              Filters:
            </span>

            {/* All Connections */}
            <button
              onClick={() => toggleFilter('all')}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                activeFilters.has('all')
                  ? 'bg-ink-black text-pure-white shadow-xs'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title="Show the complete investigation graph"
            >
              <Eye className="w-3 h-3" />
              <span>All Connections</span>
            </button>

            {/* Main Path */}
            <button
              onClick={() => toggleFilter('mainPath')}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                activeFilters.has('mainPath')
                  ? 'bg-amber-400 text-ink-black shadow-xs ring-1 ring-amber-500'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title="Highlight primary source → intermediary → endpoint path"
            >
              <Route className="w-3 h-3" />
              <span>Main Path</span>
            </button>

            {/* VASP Path */}
            <button
              onClick={() => toggleFilter('vaspPath')}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                activeFilters.has('vaspPath')
                  ? 'bg-signal-orange text-ink-black shadow-xs ring-1 ring-orange-400'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title="Highlight Source → Relay → Strongest VASP candidate"
            >
              <Layers className="w-3 h-3" />
              <span>VASP Path</span>
            </button>

            {/* VASP Candidates */}
            <button
              onClick={() => toggleFilter('vaspCandidates')}
              disabled={!hasCandidates}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                !hasCandidates
                  ? 'opacity-40 cursor-not-allowed bg-surface-container text-slate-gray'
                  : activeFilters.has('vaspCandidates')
                  ? 'bg-blue-600 text-pure-white shadow-xs'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title="Highlight candidate VASP deposit clusters"
            >
              <Building className="w-3 h-3" />
              <span>VASP Candidates</span>
            </button>

            {/* High Risk */}
            <button
              onClick={() => toggleFilter('highRisk')}
              disabled={!hasGenuineScoredNodes}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                !hasGenuineScoredNodes
                  ? 'opacity-40 cursor-not-allowed bg-surface-container text-slate-gray'
                  : activeFilters.has('highRisk')
                  ? 'bg-error text-pure-white shadow-xs'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title={hasGenuineScoredNodes ? 'Highlight genuine scored high-risk nodes (score >= 70)' : 'No scored nodes in current data'}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>High Risk</span>
            </button>

            {/* Secondary Nodes */}
            <button
              onClick={() => toggleFilter('secondaryNodes')}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                activeFilters.has('secondaryNodes')
                  ? 'bg-slate-700 text-pure-white shadow-xs'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title="Highlight peripheral/connected nodes and fan-out"
            >
              <Network className="w-3 h-3" />
              <span>Secondary Nodes</span>
            </button>

            {/* Mixer Indicators */}
            <button
              onClick={() => toggleFilter('mixerIndicators')}
              disabled={!hasMixerData}
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                !hasMixerData
                  ? 'opacity-40 cursor-not-allowed bg-surface-container text-slate-gray'
                  : activeFilters.has('mixerIndicators')
                  ? 'bg-purple-600 text-pure-white shadow-xs'
                  : 'bg-surface-container text-slate-gray hover:bg-surface-container-high'
              }`}
              title={hasMixerData ? 'Highlight tumbler / CoinJoin obfuscation nodes' : 'No mixer patterns identified in investigation'}
            >
              <Shuffle className="w-3 h-3" />
              <span>Mixer</span>
            </button>
          </div>
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
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-ink-black transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ height: isFullscreen ? '100%' : height }}
      ></svg>

      {/* Footer Info Hint */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5 text-[11px] font-outfit text-slate-gray bg-pure-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-surface-dim/50 pointer-events-none">
        <Info className="w-3.5 h-3.5 text-signal-orange" />
        <span>Click node to open Forensic Drawer. Drag nodes to reposition graph.</span>
      </div>
    </div>
  );
};
