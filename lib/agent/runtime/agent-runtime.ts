import { buildDiscoverySnapshot } from "../discovery/discovery-engine";
import { Dispatch } from "react";
import { ToolCall } from "../core/types";
import { createAgentLog } from "../core/log";
import { MAX_TOOL_CALLS_PER_ITERATION } from "../core/constants";
import { AgentAction } from "../state/agent-reducer";
import { requestPlannerPlan } from "./planner-client";
import { reflectGoalCompletion } from "./reflector";
import { isMutationTool } from "../tools/tool-registry";

interface RuntimeDependencies {
  getState: () => {
    currentGoal: string;
    layoutMode: string;
    reflections: string[];
    reflectionEnabled: boolean;
    maxIterations: number;
    stopRequested: boolean;
    theme: "light" | "dark";
    sectionOrder: string[];
    visibleSections: string[];
  };
  dispatch: Dispatch<AgentAction>;
  dispatchTool: (call: ToolCall) => Promise<{ ok: boolean; tool: string; error?: string }>;
}

export const runAgentRuntime = async (goal: string, dependencies: RuntimeDependencies) => {
  const { dispatch, getState, dispatchTool } = dependencies;

  dispatch({ type: "START_RUN", payload: { goal } });
  dispatch({ type: "ADD_LOG", payload: createAgentLog(`Goal received: ${goal}`) });

  try {
    const loops = getState().reflectionEnabled ? getState().maxIterations : 1;

    for (let loopIndex = 0; loopIndex < loops; loopIndex += 1) {
      if (getState().stopRequested) {
        break;
      }

      dispatch({ type: "INCREMENT_ITERATION" });
      dispatch({ type: "SET_STATUS", payload: "discovering" });

      const discovery = buildDiscoverySnapshot(getState().layoutMode);
      dispatch({ type: "SET_DISCOVERY", payload: discovery });

      dispatch({ type: "SET_STATUS", payload: "planning" });
      const plannerResponse = await requestPlannerPlan({
        goal,
        iteration: loopIndex + 1,
        discovery,
        previousReflections: getState().reflections,
      });

      const beforeState = {
        theme: getState().theme,
        sectionOrder: [...getState().sectionOrder],
        visibleSections: [...getState().visibleSections],
      };
      const executionPlan = plannerResponse.plan.slice(0, MAX_TOOL_CALLS_PER_ITERATION);

      dispatch({
        type: "ADD_LOG",
        payload: createAgentLog(`Planner source: ${plannerResponse.source}. Steps: ${executionPlan.length}`),
      });

      if (plannerResponse.plan.length > MAX_TOOL_CALLS_PER_ITERATION) {
        dispatch({
          type: "ADD_LOG",
          payload: createAgentLog(
            `Tool budget reached. Truncated ${plannerResponse.plan.length - MAX_TOOL_CALLS_PER_ITERATION} step(s).`,
            "warn"
          ),
        });
      }

      dispatch({ type: "SET_STATUS", payload: "executing" });
      let executedMutationCount = 0;

      for (const step of executionPlan) {
        if (getState().stopRequested) {
          break;
        }

        const result = await dispatchTool(step);
        if (!result.ok) {
          dispatch({
            type: "ADD_LOG",
            payload: createAgentLog(`Tool ${result.tool} failed: ${result.error ?? "unknown error"}`, "warn"),
          });
          continue;
        }

        if (isMutationTool(step.name)) {
          executedMutationCount += 1;
        }

        dispatch({
          type: "ADD_LOG",
          payload: createAgentLog(`Tool ${result.tool} executed`),
        });
      }

      if (!getState().reflectionEnabled) {
        break;
      }

      if (getState().stopRequested) {
        break;
      }

      dispatch({ type: "SET_STATUS", payload: "reflecting" });
      const reflectedDiscovery = buildDiscoverySnapshot(getState().layoutMode);
      dispatch({ type: "SET_DISCOVERY", payload: reflectedDiscovery });

      const reflection = reflectGoalCompletion({
        goal,
        beforeDiscovery: discovery,
        afterDiscovery: reflectedDiscovery,
        beforeState,
        afterState: {
          theme: getState().theme,
          sectionOrder: [...getState().sectionOrder],
          visibleSections: [...getState().visibleSections],
        },
        executedMutationCount,
      });
      dispatch({ type: "ADD_REFLECTION", payload: reflection.summary });
      dispatch({
        type: "ADD_LOG",
        payload: createAgentLog(`Reflection: ${reflection.summary}`),
      });

      if (reflection.goalAchieved) {
        break;
      }
    }

    if (getState().stopRequested) {
      dispatch({ type: "STOPPED" });
    } else {
      dispatch({ type: "SET_STATUS", payload: "idle" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown runtime error";
    dispatch({ type: "SET_ERROR", payload: message });
    dispatch({
      type: "ADD_LOG",
      payload: createAgentLog(`Runtime error: ${message}`, "error"),
    });
  }
};
