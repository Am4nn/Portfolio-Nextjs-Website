"use client";

import React from "react";
import { AGENT_ENABLED } from "../core/config";
import { AgentRuntimeProvider } from "../state/agent-context";
import { AgentRuntimeBridge } from "./AgentRuntimeBridge";

const AgentProvider: React.FC<Readonly<{ children: React.ReactNode }>> = ({ children }) => {
  if (!AGENT_ENABLED) {
    return <>{children}</>;
  }

  return (
    <AgentRuntimeProvider>
      <AgentRuntimeBridge />
      {children}
    </AgentRuntimeProvider>
  );
};

export default AgentProvider;
