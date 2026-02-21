"use client";

import React from "react";
import { AgentRuntimeProvider } from "../state/agent-context";
import { AgentRuntimeBridge } from "./AgentRuntimeBridge";

const AgentProvider: React.FC<Readonly<{ children: React.ReactNode }>> = ({ children }) => {
  return (
    <AgentRuntimeProvider>
      <AgentRuntimeBridge />
      {children}
    </AgentRuntimeProvider>
  );
};

export default AgentProvider;
