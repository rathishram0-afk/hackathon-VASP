'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ChevronRight,
  Shield,
  Layers,
  FileSearch,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Terminal,
  Activity,
} from 'lucide-react';
import { useCopilot, CopilotUIMessage } from '@/hooks/useCopilot';
import { Citation } from '@/services/copilot';

interface InvestigatorCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  investigationId: string;
  traceContext?: any;
  onSelectNode?: (address: string) => void;
  onSelectTx?: (txHash: string) => void;
}

export function InvestigatorCopilot({
  isOpen,
  onClose,
  investigationId,
  traceContext,
  onSelectNode,
  onSelectTx,
}: InvestigatorCopilotProps) {
  const {
    messages,
    isLoading,
    error,
    suggestedPrompts,
    sendMessage,
    clearMessages,
  } = useCopilot(investigationId, traceContext);

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    sendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleCitationClick = (citation: Citation) => {
    if (citation.type === 'node' && onSelectNode) {
      onSelectNode(citation.value);
    } else if (citation.type === 'transaction' && onSelectTx) {
      onSelectTx(citation.value);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      aria-label="Investigator AI Copilot"
    >
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-md shadow-emerald-500/20 text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Investigator Copilot
              </h2>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Forensic Reasoning & Graph Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={clearMessages}
            title="Reset Conversation"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Copilot Drawer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      {suggestedPrompts.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> Prompts:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-cyan-300 bg-slate-800/60 hover:bg-cyan-950/40 border border-slate-700/60 hover:border-cyan-500/30 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{prompt}</span>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-500">
              {msg.role === 'user' ? (
                <>
                  <span>Investigator</span>
                  <User className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400 font-medium">Copilot Analyst</span>
                </>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-600/10'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-tl-none shadow-sm'
              }`}
            >
              <MarkdownContent content={msg.content} />

              {/* Tools Used Badge */}
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                  <Terminal className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500">Tools:</span>
                  {msg.toolsUsed.map((tool, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-slate-800/80 text-cyan-400/90 rounded text-[10px] font-mono border border-slate-700/40"
                    >
                      {tool}()
                    </span>
                  ))}
                </div>
              )}

              {/* Interactive Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                    <FileSearch className="w-3 h-3 text-emerald-400" /> References & Citations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleCitationClick(c)}
                        title={`Click to inspect ${c.label}`}
                        className={`px-2 py-1 text-xs rounded-lg font-mono flex items-center gap-1.5 transition-colors border ${
                          c.type === 'node'
                            ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-amber-500/20'
                            : c.type === 'transaction'
                            ? 'bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border-cyan-500/20'
                            : 'bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        <span>{c.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-400 text-xs font-mono">
                Investigating graph & executing tools...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about transaction flows, VASP candidates, or mixer signatures..."
            className="w-full bg-slate-950 text-slate-100 text-sm placeholder-slate-500 border border-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-30 text-white rounded-lg transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-slate-500">
          Forensic reasoning strictly grounded in graph state. Metric integrity enforced.
        </p>
      </div>
    </aside>
  );
}

/**
 * Lightweight formatting for markdown elements: bold, headers, lists, code, and line breaks.
 */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        // Headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-white mt-2 mb-1 flex items-center gap-1.5">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-bold text-white mt-2 mb-1">
              {line.replace('## ', '')}
            </h2>
          );
        }

        // Unordered bullet list
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const itemText = line.trim().substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="flex-1">{formatInline(itemText)}</span>
            </div>
          );
        }

        // Ordered list
        const matchNumber = line.trim().match(/^(\d+)\.\s+(.*)$/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1">
              <span className="text-cyan-400 font-mono text-xs mt-0.5">{matchNumber[1]}.</span>
              <span className="flex-1">{formatInline(matchNumber[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{formatInline(line)}</p>;
      })}
    </div>
  );
}

/**
 * Format inline bold **text** and backtick `code`.
 */
function formatInline(text: string) {
  // Regex to split by bold (**...**) and code (`...`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 bg-slate-800 text-cyan-300 rounded font-mono text-xs border border-slate-700/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
