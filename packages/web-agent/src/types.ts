// ─── Core Types ─────────────────────────────────────────────────────────────

export type ToolName =
  | 'read_dom'
  | 'query_element'
  | 'mutate_element'
  | 'inject_html'
  | 'generate_and_inject'
  | 'navigate'
  | 'click_element'
  | 'fill_form'
  | 'get_storage'
  | 'set_storage'
  | 'get_page_data'
  | 'apply_theme'
  | 'highlight_element'
  | 'scroll_to'
  | 'emit_event'
  | 'execute_bridge';

export interface WebAgentConfig {
  /** Endpoint URL for the proxy API */
  endpoint: string;
  /** Custom system prompt override */
  systemPrompt?: string;
  /** Which tools to expose — 'all' or specific tool names */
  tools?: 'all' | ToolName[];
  /** Optional React/framework bridge */
  bridge?: WebAgentBridge;
  /** Position for default chatbot placement */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface WebAgentBridge {
  getState: (key: string) => unknown;
  setState: (key: string, value: unknown) => void;
  getComponents: () => RegisteredComponent[];
  triggerAction: (actionName: string, payload: unknown) => void;
}

export interface RegisteredComponent {
  id: string;
  name: string;
  selector: string;
  stateKeys?: string[];
  actions?: string[];
}

// ─── Browser Context ────────────────────────────────────────────────────────

export interface BrowserContext {
  url: string;
  title: string;
  viewport: { width: number; height: number };
  scrollPosition: { x: number; y: number };
  domSnapshot: string;
  forms: FormInfo[];
  metaTags: Record<string, string>;
  dataAttributes: { selector: string; attributes: Record<string, string> }[];
}

export interface FormInfo {
  selector: string;
  id?: string;
  action?: string;
  fields: FormFieldInfo[];
}

export interface FormFieldInfo {
  selector: string;
  type: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
}

// ─── Agent Streaming ────────────────────────────────────────────────────────

export type AgentChunkType = 'text' | 'tool_start' | 'tool_result' | 'error' | 'done';

export interface AgentChunk {
  type: AgentChunkType;
  /** For 'text' chunks — the streamed text delta */
  text?: string;
  /** For 'tool_start' — which tool is being called */
  toolName?: ToolName;
  /** For 'tool_start' — the tool input */
  toolInput?: Record<string, unknown>;
  /** For 'tool_result' — what the tool returned */
  toolResult?: ToolExecutionResult;
  /** For 'error' — error message */
  error?: string;
}

export interface ToolExecutionResult {
  ok: boolean;
  tool: string;
  data?: unknown;
  error?: string;
}

// ─── Agent Actions ──────────────────────────────────────────────────────────

export interface AgentAction {
  tool: ToolName;
  input: Record<string, unknown>;
}

// ─── Message Types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ActionLogEntry[];
  timestamp: number;
}

export interface ActionLogEntry {
  tool: string;
  input: Record<string, unknown>;
  result: ToolExecutionResult;
  timestamp: number;
}

// ─── Agent Interface ────────────────────────────────────────────────────────

export interface WebAgent {
  chat(message: string): AsyncGenerator<AgentChunk>;
  execute(action: AgentAction): Promise<ToolExecutionResult>;
  getContext(): BrowserContext;
  getMessages(): ChatMessage[];
  on(event: 'action', callback: (action: AgentAction, result: ToolExecutionResult) => void): () => void;
  destroy(): void;
}
