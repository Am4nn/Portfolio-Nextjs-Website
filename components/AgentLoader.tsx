/**
 * components/AgentLoader.tsx
 * 
 * Client-only dynamic loader for the agent module.
 * 
 * This component ensures that when NEXT_PUBLIC_AGENT_ENABLED is false,
 * the agent code (provider, runtime, panel, etc.) is NOT included
 * in the client bundle. The agent is fully pluggable and only loaded
 * when the feature flag is enabled.
 */

"use client";

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Dynamically import AgentContainer only when enabled.
 * - ssr: false ensures no server-side rendering of agent code
 * - loading: () => null means no loading placeholder
 * - This way, agent code is excluded from the bundle entirely if disabled
 */
const AgentProviderWithPanel = dynamic(
  () => import('@/lib/agent/client/AgentContainer'),
  {
    ssr: false,
    loading: () => null,
  }
);

interface AgentLoaderProps {
  children: React.ReactNode;
}

const AgentLoader: React.FC<AgentLoaderProps> = ({ children }) => {
  // Feature flag check on client side
  const agentEnabled = process.env.NEXT_PUBLIC_AGENT_ENABLED === 'true';

  return (
    <>
      {agentEnabled && <AgentProviderWithPanel />}
      {children}
    </>
  );
};

export default AgentLoader;
