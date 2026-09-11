'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, ShieldAlert, ArrowRight, Database, FileText } from 'lucide-react';
import { validateAddress } from '@/services/api';
import { useRouter } from 'next/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; blockchain: string; message?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.length > 5) {
      validateAddress(query).then(setValidationResult);
    } else {
      setValidationResult(null);
    }
  }, [query]);

  if (!isOpen) return null;

  const handleSelectCase = (caseId: string) => {
    onClose();
    router.push(`/investigate/${caseId}`);
  };

  const handleStartSearch = () => {
    if (query.trim()) {
      onClose();
      router.push(`/investigate/case-vt-2024-8891?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#121722] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <Search className="w-5 h-5 text-[#94A3B8] mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search wallet address, TX hash, VASP name, or Case ID (e.g. VT-2024-8891)..."
            className="w-full bg-transparent text-white placeholder-[#64748B] outline-none text-sm font-mono"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-white rounded hover:bg-[#1E293B] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Feedback */}
        {validationResult && (
          <div className="px-4 py-2 bg-[#0B0E14] border-b border-[#1E293B] flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-semibold flex items-center">
              ✓ Valid {validationResult.blockchain} Address Detected
            </span>
            <button
              onClick={handleStartSearch}
              className="px-3 py-1 bg-[#0C6CF2] hover:bg-blue-600 text-white rounded text-xs font-medium flex items-center gap-1 transition"
            >
              Trace Address <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Demo Cases & Quick Presets */}
        <div className="p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Featured Demo Cases
            </div>
            <div className="space-y-2">
              <div
                onClick={() => handleSelectCase('case-vt-2024-8891')}
                className="p-3 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] rounded-md cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 text-red-400 rounded">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#0C6CF2] font-semibold">VT-2024-8891</div>
                    <div className="text-sm text-white font-medium">Darknet Ransomware Exfiltration & VASP Off-ramp</div>
                    <div className="text-xs font-mono text-[#94A3B8]">Target: 3EktnHQ7...gzQX (BTC) • Binance 91% Match</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition" />
              </div>

              <div
                onClick={() => handleSelectCase('case-vt-2024-4029')}
                className="p-3 bg-[#182030] hover:bg-[#1E293B] border border-[#1E293B] rounded-md cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#0C6CF2] font-semibold">VT-2024-4029</div>
                    <div className="text-sm text-white font-medium">Pig Butchering Syndicate Multi-Exchange Flow</div>
                    <div className="text-xs font-mono text-[#94A3B8]">Target: 0x71C76...976F (ETH) • Kraken 89% Match</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#64748B]">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#0B0E14] border border-[#1E293B] rounded text-white font-mono">ESC</kbd> to exit</span>
            <span className="flex items-center gap-1 font-mono"><FileText className="w-3 h-3" /> Live Blockchain Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
