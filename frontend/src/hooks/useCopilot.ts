'use client';

import { useState, useCallback, useRef } from 'react';
import { sendCopilotMessage, Citation, ChatMessage } from '@/services/copilot';

export interface CopilotUIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  toolsUsed?: string[];
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  'Explain this investigation and fund flow',
  'Why is this VASP the strongest candidate?',
  'Trace the flow of funds hop-by-hop',
  'Check for mixer or obfuscation behavior',
  'What should I investigate next?',
];

export function useCopilot(investigationId: string, traceContext?: any) {
  const isSendingRef = useRef(false);
  const [messages, setMessages] = useState<CopilotUIMessage[]>([
    {
      id: 'welcome-0',
      role: 'assistant',
      content:
        '👋 **Investigator Copilot Ready.**\n\n' +
        'I am your Senior Forensic Analyst assistant powered by Google Gemini. ' +
        'I have direct access to controlled forensic tools to inspect this investigation graph, transaction paths, VASP cluster candidates, and mixer signals.\n\n' +
        'Select a suggested query below or ask any question about the investigated flow.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_SUGGESTIONS);

  const sendMessage = useCallback(
    async (userText: string) => {
      // Guard against empty or duplicate/concurrent requests (Rule 7)
      if (!userText.trim() || isLoading || isSendingRef.current) return;

      const trimmed = userText.trim();
      isSendingRef.current = true;
      setError(null);

      const userMessage: CopilotUIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build history for backend
        const history: ChatMessage[] = messages
          .filter((m) => m.id !== 'welcome-0')
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }));

        const res = await sendCopilotMessage({
          investigation_id: investigationId || 'current',
          message: trimmed,
          history,
          trace_context: traceContext,
        });

        const assistantMessage: CopilotUIMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.response,
          citations: res.citations,
          toolsUsed: res.tools_used,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (res.suggested_prompts && res.suggested_prompts.length > 0) {
          setSuggestedPrompts(res.suggested_prompts);
        }
      } catch (err: any) {
        const rawMsg = err?.message || '';
        const isQuota =
          rawMsg.includes('429') ||
          rawMsg.toLowerCase().includes('quota') ||
          rawMsg.toLowerCase().includes('exhausted') ||
          rawMsg.toLowerCase().includes('resource');

        const errorDetail = isQuota
          ? 'AI quota temporarily exhausted. Please wait a moment before asking another question.'
          : rawMsg || 'Failed to query Investigator Copilot.';
        setError(errorDetail);

        const errorMessage: CopilotUIMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **AI Quota Temporarily Exhausted**: ${errorDetail}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        isSendingRef.current = false;
      }
    },
    [investigationId, traceContext, messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          '🔄 **Conversation Reset.** How can I assist with your blockchain forensic analysis?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
    setSuggestedPrompts(DEFAULT_SUGGESTIONS);
  }, []);

  return {
    messages,
    isLoading,
    error,
    suggestedPrompts,
    sendMessage,
    clearMessages,
  };
}
