'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Search, ShieldAlert, ArrowRight, Layers, Sliders, Zap } from 'lucide-react';

function TraceWalletForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { startNewTrace, isTracing, traceError, clearTraceError, backendOnline } = useInvestigation();
  const [addressInput, setAddressInput] = useState<string>(initialQuery || '3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX');
  const [caseTitleInput, setCaseTitleInput] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Bitcoin Mainnet');
  const [hopDepth, setHopDepth] = useState<number>(4);

  useEffect(() => {
    if (initialQuery) {
      setAddressInput(initialQuery);
    }
  }, [initialQuery]);

  const handleStartTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = addressInput.trim();
    if (!addr) return;

    clearTraceError();
    const success = await startNewTrace(addr, caseTitleInput.trim() || undefined, hopDepth);
    if (success) {
      router.push('/dashboard');
    }
  };

  const setDemoAddress = (addr: string, title: string) => {
    clearTraceError();
    setAddressInput(addr);
    setCaseTitleInput(title);
  };

  return (
    <div className="space-y-8">
      {/* Backend Health Status Badge */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-pure-white border border-surface-dim shadow-2xs font-outfit text-xs">
        <span className="text-slate-gray font-medium">FastAPI Backend (POST /trace):</span>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              backendOnline === true
                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                : backendOnline === false
                ? 'bg-rose-500 ring-2 ring-rose-200'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span
            className={`font-bold ${
              backendOnline === true
                ? 'text-emerald-700'
                : backendOnline === false
                ? 'text-rose-700'
                : 'text-amber-700'
            }`}
          >
            {backendOnline === true
              ? 'Online (Connected to 127.0.0.1:8000)'
              : backendOnline === false
              ? 'Offline (FastAPI server unreachable)'
              : 'Checking connectivity...'}
          </span>
        </div>
      </div>

      {/* Backend Error Alert Banner */}
      {traceError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-outfit text-xs flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-900 block">Backend Trace Error:</span>
            <p className="font-dmsans text-xs text-rose-700">{traceError}</p>
          </div>
        </div>
      )}

      {/* Input Form Card */}
      <form
        onSubmit={handleStartTrace}
        className="p-8 rounded-[36px] bg-pure-white border border-surface-dim shadow-[0_24px_48px_rgba(20,20,19,0.06)] space-y-6"
      >
        {/* Target Address Input */}
        <div className="space-y-2">
          <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
            Target Wallet Address / Hash
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (traceError) clearTraceError();
              }}
              placeholder="e.g. 3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX"
              className="w-full bg-surface-container font-mono text-sm text-ink-black px-4 py-3.5 rounded-2xl border border-surface-dim focus:outline-none focus:ring-2 focus:ring-ink-black placeholder:text-slate-gray"
            />
            <Search className="w-5 h-5 text-slate-gray absolute right-4 pointer-events-none" />
          </div>
        </div>

        {/* Optional Title & Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
              Investigation Title (Optional)
            </label>
            <input
              type="text"
              value={caseTitleInput}
              onChange={(e) => setCaseTitleInput(e.target.value)}
              placeholder="e.g. Phishing Vault Exfiltration"
              className="w-full bg-surface-container font-dmsans text-xs text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none focus:ring-1 focus:ring-ink-black"
            />
          </div>

          <div className="space-y-2">
            <label className="font-outfit font-bold text-xs text-ink-black uppercase tracking-wider block">
              Blockchain Network
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full bg-surface-container font-outfit text-xs font-bold text-ink-black px-4 py-3 rounded-xl border border-surface-dim focus:outline-none cursor-pointer"
            >
              <option value="Bitcoin Mainnet">Bitcoin Mainnet (UTXO)</option>
              <option value="Ethereum Mainnet">Ethereum Mainnet (Account-based)</option>
              <option value="Solana Mainnet">Solana Mainnet (Token Program)</option>
            </select>
          </div>
        </div>

        {/* Hop Depth & Settings */}
        <div className="p-4 rounded-2xl bg-surface-container/60 space-y-3">
          <div className="flex items-center justify-between font-outfit text-xs">
            <span className="font-bold text-ink-black flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-signal-orange" />
              Traversal Hop Distance:
            </span>
            <span className="font-bold text-signal-orange bg-error-container/60 px-2 py-0.5 rounded-md">
              Up to {hopDepth} Hops Deep
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            value={hopDepth}
            onChange={(e) => setHopDepth(parseInt(e.target.value))}
            className="w-full accent-signal-orange cursor-pointer"
          />

          <div className="flex justify-between font-outfit text-[10px] text-slate-gray font-semibold">
            <span>1 Hop (Direct)</span>
            <span>3 Hops (Standard)</span>
            <span>5 Hops (Deep Traversal)</span>
          </div>
        </div>

        {/* Submit Trigger Button */}
        <button
          type="submit"
          disabled={isTracing}
          className="w-full py-4 rounded-full bg-ink-black hover:bg-signal-orange text-pure-white font-outfit font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isTracing ? (
            <>
              <span className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin"></span>
              <span>Executing On-Chain NetworkX Traversal...</span>
            </>
          ) : (
            <>
              <span>Execute Backend Trace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Pick Cases */}
      <div className="p-6 rounded-3xl bg-pure-white border border-surface-dim shadow-sm space-y-4">
        <span className="font-outfit font-bold text-xs text-slate-gray uppercase tracking-wider block">
          Or Quick Load Verified On-Chain Forensic Wallets:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-outfit text-xs">
          <button
            onClick={() =>
              setDemoAddress('3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX', 'Phishing Vault Live Trace')
            }
            className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-dim transition-colors text-left space-y-1 cursor-pointer"
          >
            <span className="font-bold text-ink-black block">Scam Syndicate Vault</span>
            <span className="font-mono text-[11px] text-slate-gray block truncate">
              3EktnHQD...SgzQX
            </span>
            <span className="text-[10px] font-bold text-signal-orange">Validated Primary Source</span>
          </button>

          <button
            onClick={() =>
              setDemoAddress('1L9DR9k5YEtoxTUzqe9uhzK1QCTgju1m73', 'High-Value Relay Node Trace')
            }
            className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-dim transition-colors text-left space-y-1 cursor-pointer"
          >
            <span className="font-bold text-ink-black block">High-Value Relay</span>
            <span className="font-mono text-[11px] text-slate-gray block truncate">
              1L9DR9k5...1m73
            </span>
            <span className="text-[10px] font-bold text-amber-700">Multi-Hop Intermediary</span>
          </button>

          <button
            onClick={() =>
              setDemoAddress('1135vxy8xNQk4GuV3pBMj4FL4mP2QLtNPx', 'Fan-out Splitter Wallet Trace')
            }
            className="p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-surface-dim transition-colors text-left space-y-1 cursor-pointer"
          >
            <span className="font-bold text-ink-black block">Splitter Relay</span>
            <span className="font-mono text-[11px] text-slate-gray block truncate">
              1135vxy8...tNPx
            </span>
            <span className="text-[10px] font-bold text-emerald-700">Consolidation Node</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TraceWalletPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 lg:pl-64">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lifted-cream border border-surface-dim shadow-xs">
            <Zap className="w-3.5 h-3.5 text-signal-orange" />
            <span className="font-outfit text-xs font-bold text-ink-black uppercase tracking-wider">
              Autonomous Trace Launcher
            </span>
          </div>

          <h1 className="font-outfit font-bold text-4xl text-ink-black tracking-tight">
            Start New Wallet Investigation
          </h1>
          <p className="font-dmsans text-sm text-slate-gray max-w-xl mx-auto leading-relaxed">
            Enter a target cryptocurrency wallet address to launch autonomous multi-hop transaction graph reconstruction and VASP attribution analysis.
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-slate-gray font-outfit text-xs">Loading form...</div>}>
          <TraceWalletForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
