'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import { CaseScopeBar } from '@/components/layout/CaseScopeBar';
import { Footer } from '@/components/layout/Footer';
import { useInvestigation } from '@/hooks/useInvestigation';
import { Clock, Shield, ExternalLink, ArrowRight, Layers, FileText } from 'lucide-react';

export default function TimelinePage() {
  const { activeCase } = useInvestigation();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-cream">
      <NavigationHeader />
      <CaseScopeBar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 space-y-8 lg:pl-64">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-surface-container text-ink-black font-outfit text-xs font-bold">
              CASE #{activeCase.id}
            </span>
            <h1 className="font-outfit font-bold text-3xl text-ink-black flex items-center gap-3 mt-1">
              <Clock className="w-8 h-8 text-signal-orange" />
              <span>Chronological Forensic Timeline</span>
            </h1>
            <p className="font-dmsans text-xs text-slate-gray mt-1 max-w-2xl">
              Sequential block-by-block audit log recording asset movement velocity from origin vault to final VASP sweep.
            </p>
          </div>

          <Link
            href="/report"
            className="px-6 py-3 rounded-full bg-ink-black text-pure-white hover:bg-signal-orange transition-colors font-outfit font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Export Timeline Log</span>
          </Link>
        </div>

        {/* Timeline Log Stream */}
        <div className="p-8 rounded-[36px] bg-pure-white border border-surface-dim shadow-sm space-y-8">
          <div className="relative border-l-2 border-surface-dim pl-6 ml-4 space-y-10">
            {activeCase.timeline.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline Dot */}
                <span
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 ring-pure-white ${
                    event.eventType === 'ORIGIN'
                      ? 'bg-error'
                      : event.eventType === 'DEPOSIT_SWEEP'
                      ? 'bg-signal-orange'
                      : 'bg-ink-black'
                  }`}
                ></span>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-surface-container/40 border border-surface-dim space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-outfit text-xs">
                    <span className="font-bold text-ink-black text-sm">{event.title}</span>
                    <span className="font-mono text-slate-gray">
                      {event.timestamp} • Block #{event.blockHeight}
                    </span>
                  </div>

                  <p className="font-dmsans text-xs text-slate-gray leading-relaxed">
                    {event.description}
                  </p>

                  <div className="pt-2 border-t border-surface-dim/60 flex flex-wrap items-center justify-between gap-2 font-outfit text-xs">
                    <div className="flex items-center gap-4">
                      {event.amountBtc && (
                        <span className="font-mono font-bold text-signal-orange">
                          {event.amountBtc} BTC
                        </span>
                      )}
                      {event.fromAddress && (
                        <span className="font-mono text-slate-gray">
                          From: {event.fromAddress.substring(0, 8)}...
                        </span>
                      )}
                      {event.toAddress && (
                        <span className="font-mono text-slate-gray">
                          To: {event.toAddress.substring(0, 8)}...
                        </span>
                      )}
                    </div>

                    {event.txHash && (
                      <a
                        href={`https://mempool.space/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-ink-black hover:text-signal-orange font-bold flex items-center gap-1"
                      >
                        <span>{event.txHash.substring(0, 10)}...</span>
                        <ExternalLink className="w-3 h-3 text-slate-gray" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
