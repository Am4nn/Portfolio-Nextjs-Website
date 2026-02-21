/**
 * INTERNAL EXPORTS ONLY - Do not import from @/lib/agent in core portfolio code
 * 
 * Agent exports are for internal agent runtime use only. The agent is a pluggable,
 * feature-flagged module that should be accessed through:
 * - AgentLoader component (components/AgentLoader.tsx) for conditional rendering
 * - AgentContainer (lib/agent/client/AgentContainer.tsx) for agent-internal setup
 * 
 * Core portfolio should:
 * - Read UI state from lib/sections.ts (DEFAULT_SECTION_CONFIG)
 * - Not depend on useAgent() hook
 * - Not mount AgentProvider/AgentPanel directly
 */

// Internal agent runtime components - used only by AgentContainer
export { default as AgentProvider } from "./components/AgentProvider";
export { AgentPanel } from "./components/AgentPanel";
export { useAgent } from "./state/agent-context";
export { AgentRuntimeBridge } from "./components/AgentRuntimeBridge";

// Export adapter for agent to notify app state changes
export * from "./adapter";
