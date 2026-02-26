// @agent/web-agent — Main entry point

export { createWebAgent } from './agent';
export { getBrowserContext, getPageData, getUniqueSelector } from './context';
export { buildSystemPrompt } from './system-prompt';
export { setupBridge, teardownBridge, createStateBridge } from './bridge';
export { executeTool } from './tools/executors';
export { TOOL_DEFINITIONS } from './tools/definitions';

// Re-export all types
export type {
  WebAgent,
  WebAgentConfig,
  WebAgentBridge,
  RegisteredComponent,
  BrowserContext,
  FormInfo,
  FormFieldInfo,
  AgentChunk,
  AgentChunkType,
  AgentAction,
  ToolName,
  ToolExecutionResult,
  ChatMessage,
  ActionLogEntry,
} from './types';
