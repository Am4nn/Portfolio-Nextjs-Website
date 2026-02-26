import type { WebAgentBridge, RegisteredComponent } from './types';

/**
 * Create and register the window.__webAgentBridge for React/framework integration.
 *
 * Usage in Next.js:
 *   import { setupBridge } from '@anthropic-ai/web-agent'
 *   setupBridge({ ... })
 */
export function setupBridge(bridge: WebAgentBridge): void {
  if (typeof window !== 'undefined') {
    (window as any).__webAgentBridge = bridge;
  }
}

/**
 * Remove the bridge from window.
 */
export function teardownBridge(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).__webAgentBridge;
  }
}

/**
 * Helper to create a simple state bridge from a React state map.
 * The caller provides get/set functions for state management.
 */
export function createStateBridge(options: {
  stateGetter: (key: string) => unknown;
  stateSetter: (key: string, value: unknown) => void;
  components?: RegisteredComponent[];
  actionHandler?: (name: string, payload: unknown) => void;
}): WebAgentBridge {
  return {
    getState: options.stateGetter,
    setState: options.stateSetter,
    getComponents: () => options.components ?? [],
    triggerAction: options.actionHandler ?? (() => { }),
  };
}
