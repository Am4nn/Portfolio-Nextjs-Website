'use client';

import React, { useEffect, useMemo } from 'react';
import { createWebAgent } from '@agent/web-agent';
import { WebAgentChat } from '@agent/chatbot-ui';
import { useWebAgentBridge } from '@/lib/web-agent-bridge';

/**
 * Client-side web agent wrapper.
 * Creates the agent instance and renders the chatbot UI.
 */
export default function WebAgentProvider() {
  // Set up the React bridge
  useWebAgentBridge();

  // Create agent instance (memoized so it persists across renders)
  const agent = useMemo(() => {
    return createWebAgent({
      endpoint: '/api/agent/chat',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => agent.destroy();
  }, [agent]);

  return <WebAgentChat agent={agent} position="bottom-right" theme="dark" />;
}
