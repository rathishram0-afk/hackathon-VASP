import { fetchApi } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content: string;
}

export interface Citation {
  type: 'node' | 'transaction' | 'vasp' | 'evidence' | 'metric';
  value: string;
  label: string;
}

export interface CopilotChatRequest {
  investigation_id: string;
  message: string;
  history?: ChatMessage[];
  trace_context?: any;
}

export interface CopilotChatResponse {
  response: string;
  citations: Citation[];
  suggested_prompts: string[];
  tools_used: string[];
  model: string;
  gemini_calls_count?: number;
}

/**
 * Send a message to the VASP Trace Investigator AI Copilot backend.
 */
export async function sendCopilotMessage(
  request: CopilotChatRequest
): Promise<CopilotChatResponse> {
  return fetchApi<CopilotChatResponse>('/copilot/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}
