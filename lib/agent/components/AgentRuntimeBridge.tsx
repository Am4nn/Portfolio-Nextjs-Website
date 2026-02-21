"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import { MutationEngine } from "../dom/mutation-engine";
import { useAgentRuntimeContext } from "../state/agent-context";

export const AgentRuntimeBridge: React.FC = () => {
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
