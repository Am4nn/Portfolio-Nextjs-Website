/**
 * lib/agent/client/AgentContainer.tsx
 * 
 * Single client-side entry point for the agent module.
 * 
 * This component mounts the agent runtime provider, bridge, and panel.
 * It is only instantiated when the agent is enabled (via dynamic import
 * from AgentLoader). This provides a clean boundary for agent initialization.
 */

"use client";

import React from 'react';
import { AgentRuntimeProvider } from '../state/agent-context';
import { AgentRuntimeBridge } from '../components/AgentRuntimeBridge';
import { AgentPanel } from '../components/AgentPanel';

/**
 * Mounts:
 * - AgentRuntimeProvider: provides context for agent state + dispatch
 * - AgentRuntimeBridge: syncs agent state with app UI (theme, mutations, etc.)
 * - AgentPanel: UI for planning, executing, and inspecting agent runs
 */
const AgentContainer: React.FC = () => {
  return (
    <AgentRuntimeProvider>
      <AgentRuntimeBridge />
      <AgentPanel />
    </AgentRuntimeProvider>
  );
};

export default AgentContainer;
