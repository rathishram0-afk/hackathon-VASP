'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Layers, ShieldAlert, Building2, Shuffle, Wallet } from 'lucide-react';
import { NodeType } from '@/types/forensics';

interface GraphControlsProps {
  maxHops: number;
  selectedHops: number;
  onHopsChange: (hops: number) => void;
  activeFilters: Record<NodeType, boolean>;
  onToggleFilter: (type: NodeType) => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function GraphControls({
  maxHops,
  selectedHops,
  onHopsChange,
  activeFilters,
  onToggleFilter,
  onResetView,
  onZoomIn,
  onZoomOut,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#121722] border border-[#1E293B] rounded-lg text-xs font-mono text-[#94A3B8]">
      {/* Left: Hop Depth Selector */}
      <div className="flex items-center space-x-3">
        <span className="flex items-center gap-1.5 text-white font-semibold font-sans">
          <Layers className="w-3.5 h-3.5 text-[#0C6CF2]" /> Hop Depth Filter:
        </span>
        <div className="flex items-center space-x-1 bg-[#0B0E14] border border-[#1E293B] rounded p-0.5">
          {[1, 2, 3, 4].map((hop) => (
            <button
              key={hop}
              onClick={() => onHopsChange(hop)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                selectedHops === hop
                  ? 'bg-[#0C6CF2] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {hop} {hop === 1 ? 'Hop' : 'Hops'}
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Node Type Filters Legend */}
      <div className="flex items-center space-x-2">
        <span className="text-white font-sans font-semibold mr-1">Legend & Filter:</span>
        
        <button
          onClick={() => onToggleFilter('scam_source')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition ${
            activeFilters.scam_source
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B] opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Source</span>
        </button>

        <button
          onClick={() => onToggleFilter('intermediary')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition ${
            activeFilters.intermediary
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B] opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Intermediary</span>
        </button>

        <button
          onClick={() => onToggleFilter('mixer')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition ${
            activeFilters.mixer
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B] opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Mixer</span>
        </button>

        <button
          onClick={() => onToggleFilter('unhosted')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition ${
            activeFilters.unhosted
              ? 'bg-slate-500/10 border-slate-500/30 text-slate-300'
              : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B] opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Unhosted</span>
        </button>

        <button
          onClick={() => onToggleFilter('vasp')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded border transition ${
            activeFilters.vasp
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold'
              : 'bg-[#0B0E14] border-[#1E293B] text-[#64748B] opacity-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#0C6CF2]" />
          <span>VASP Exchange</span>
        </button>
      </div>

      {/* Right: Zoom & Reset Canvas Buttons */}
      <div className="flex items-center space-x-1 bg-[#0B0E14] border border-[#1E293B] rounded p-1">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1 hover:bg-[#1E293B] rounded text-[#94A3B8] hover:text-white transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1 hover:bg-[#1E293B] rounded text-[#94A3B8] hover:text-white transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetView}
          title="Reset Graph Layout"
          className="p-1 hover:bg-[#1E293B] rounded text-[#94A3B8] hover:text-white transition flex items-center gap-1 font-sans"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-[10px]">Reset</span>
        </button>
      </div>
    </div>
  );
}
