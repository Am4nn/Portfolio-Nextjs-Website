export interface ChatRequest {
  system?: string;
  messages: any[];
  tools?: any[];
  max_tokens?: number;
}

export type ChatEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'stop'; stop_reason: string }
  | { type: 'error'; error: string };

export interface LLMProvider {
  /**
   * Initializes the stream and emits normalized events via the emitter function.
   */
  streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void>;
}
