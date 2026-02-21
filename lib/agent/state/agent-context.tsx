"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { AgentState } from "../core/types";
import { createAgentLog } from "../core/log";
import { runAgentRuntime } from "../runtime/agent-runtime";
import { createToolDispatcher } from "../tools/dispatcher";
import { agentReducer, AgentAction } from "./agent-reducer";
import { createInitialAgentState } from "./initial-state";
import { loadPersistedAgentState, persistAgentState } from "./session-persistence";

interface AgentRuntimeContextValue {
  state: AgentState;
  dispatch: React.Dispatch<AgentAction>;
  runGoal: (goal: string) => Promise<void>;
  stopRun: () => void;
  restoreSnapshot: (snapshotId?: string) => void;
}

const AgentRuntimeContext = createContext<AgentRuntimeContextValue | null>(null);

export const AgentRuntimeProvider: React.FC<Readonly<{ children: React.ReactNode }>> = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, undefined, createInitialAgentState);
  const stateRef = useRef(state);
  const isRunningRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const hydrated = loadPersistedAgentState();
    if (hydrated) {
      dispatch({ type: "HYDRATE_SESSION", payload: hydrated });
    }
  }, []);

  useEffect(() => {
    persistAgentState(state);
  }, [state]);

  const dispatchTool = useMemo(() => {
    return createToolDispatcher({
      getState: () => stateRef.current,
      dispatch,
    });
  }, [dispatch]);

  const runGoal = useCallback(async (goal: string) => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal) {
      return;
    }
    if (isRunningRef.current) {
      dispatch({
        type: "ADD_LOG",
        payload: createAgentLog("Runtime is already running", "warn"),
      });
      return;
    }

    isRunningRef.current = true;
    try {
      await runAgentRuntime(trimmedGoal, {
        dispatch,
        getState: () => stateRef.current,
        dispatchTool,
      });
    } finally {
      isRunningRef.current = false;
    }
  }, [dispatch, dispatchTool]);

  const stopRun = useCallback(() => {
    dispatch({ type: "STOP_REQUESTED" });
    dispatch({
      type: "ADD_LOG",
      payload: createAgentLog("Stop requested"),
    });
  }, [dispatch]);

  const restoreSnapshot = useCallback((snapshotId?: string) => {
    const fallbackSnapshotId = stateRef.current.snapshotOrder.at(-1);
    const resolvedSnapshotId = snapshotId ?? fallbackSnapshotId;

    if (!resolvedSnapshotId) {
      dispatch({
        type: "ADD_LOG",
        payload: createAgentLog("No snapshot available to restore", "warn"),
      });
      return;
    }

    dispatch({
      type: "REQUEST_RESTORE",
      payload: {
        snapshotId: resolvedSnapshotId,
        reason: "manual restore",
      },
    });
  }, [dispatch]);

  const value = useMemo<AgentRuntimeContextValue>(() => ({
    state,
    dispatch,
    runGoal,
    stopRun,
    restoreSnapshot,
  }), [restoreSnapshot, runGoal, state, stopRun]);

  return (
    <AgentRuntimeContext.Provider value={value}>
      {children}
    </AgentRuntimeContext.Provider>
  );
};

export const useAgentRuntimeContext = () => {
  const context = useContext(AgentRuntimeContext);
  if (!context) {
    throw new Error("useAgentRuntimeContext must be used inside AgentRuntimeProvider");
  }
  return context;
};

export const useAgent = () => {
  const { state, runGoal, stopRun, restoreSnapshot } = useAgentRuntimeContext();

  return {
    state,
    runGoal,
    stopRun,
    restoreSnapshot,
  };
};
