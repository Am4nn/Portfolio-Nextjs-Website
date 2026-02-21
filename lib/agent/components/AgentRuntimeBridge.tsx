"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import { AGENT_ENABLED } from "../core/config";
import { MutationEngine } from "../dom/mutation-engine";
import { useAgentRuntimeContext } from "../state/agent-context";

const AgentRuntimeBridgeEnabled: React.FC = () => {
  const { state, dispatch } = useAgentRuntimeContext();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    if (state.themeSyncNonce === 0) {
      return;
    }
    setTheme(state.theme);
  }, [setTheme, state.theme, state.themeSyncNonce]);

  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }
    if (resolvedTheme !== state.theme && (resolvedTheme === "light" || resolvedTheme === "dark")) {
      dispatch({ type: "SET_THEME", payload: resolvedTheme, source: "external" });
    }
  }, [dispatch, resolvedTheme, state.theme]);

  return <MutationEngine />;
};

export const AgentRuntimeBridge: React.FC = () => {
  if (!AGENT_ENABLED) {
    return null;
  }

  return <AgentRuntimeBridgeEnabled />;
};
