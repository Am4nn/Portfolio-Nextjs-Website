import { createBaselineFromElement, createSnapshot } from "../snapshots/snapshot-manager";
import { Dispatch } from "react";
import { AgentState, MutationKind, ToolCall, ToolResult } from "../core/types";
import { AgentAction } from "../state/agent-reducer";
import { ensureDiscoveryFirst, validateToolCall } from "../validation/mutation-validator";
import { TOOL_REGISTRY, ToolExecutionContext, isMutationTool } from "./tool-registry";
import { getTargetById } from "../registry";

interface DispatcherDependencies {
  getState: () => AgentState;
  dispatch: Dispatch<AgentAction>;
}

const createMutationId = () => `mutation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const extractMutationTargetIds = (call: ToolCall): string[] => {
  const getIdInput = () => {
    if (typeof call.input?.id === "string") {
      return call.input.id;
    }
    return null;
  };

  switch (call.name) {
    case "updateCSS":
    case "addClass":
    case "removeClass":
    case "animate":
    case "toggleSection":
    case "updateText":
    case "replaceWithComponent": {
      const id = getIdInput();
      return id ? [id] : [];
    }
    case "drawDiagram":
    case "clearCanvas":
    case "animateTraffic":
    case "changeCameraMode":
      return ["hero-canvas"];
    default:
      return [];
  }
};

const captureBaselinesForCall = (
  state: AgentState,
  call: ToolCall
) => {
  const targetIds = Array.from(new Set(extractMutationTargetIds(call)));
  const captured: Record<string, ReturnType<typeof createBaselineFromElement>> = {};

  targetIds.forEach(targetId => {
    if (state.baselines[targetId]) {
      return;
    }

    const target = getTargetById(targetId);
    if (!target) {
      return;
    }

    const element = document.querySelector(target.selector);
    if (!element || !(element instanceof HTMLElement)) {
      return;
    }

    captured[targetId] = createBaselineFromElement(targetId, element);
  });

  return captured;
};

export const createToolDispatcher = ({ getState, dispatch }: DispatcherDependencies) => {
  return async (call: ToolCall): Promise<ToolResult> => {
    const stateBeforeCall = getState();
    const discoveryGate = ensureDiscoveryFirst(call, stateBeforeCall.discovery);
    if (!discoveryGate.ok) {
      return {
        ok: false,
        tool: call.name,
        error: discoveryGate.error,
      };
    }

    console.log('🎈', call, stateBeforeCall);
    const validationResult = validateToolCall(call, stateBeforeCall.discovery);
    if (!validationResult.ok) {
      return {
        ok: false,
        tool: call.name,
        error: validationResult.error,
      };
    }

    const handler = TOOL_REGISTRY[call.name];
    if (!handler) {
      return {
        ok: false,
        tool: call.name,
        error: "Tool handler not found",
      };
    }

    let transactionSnapshotId: string | undefined;
    if (isMutationTool(call.name)) {
      const capturedBaselines = captureBaselinesForCall(stateBeforeCall, call);

      Object.values(capturedBaselines).forEach(baseline => {
        dispatch({ type: "ADD_BASELINE", payload: baseline });
      });

      const snapshot = createSnapshot(stateBeforeCall, `transaction:${call.name}`, {
        baselines: {
          ...stateBeforeCall.baselines,
          ...capturedBaselines,
        },
      });
      dispatch({ type: "SAVE_SNAPSHOT", payload: snapshot });
      transactionSnapshotId = snapshot.id;
    }

    const context: ToolExecutionContext = {
      getState,
      dispatch,
      enqueueMutation: (targetId, kind: MutationKind, payload, snapshotId = transactionSnapshotId) => {
        const mutation = {
          id: createMutationId(),
          targetId,
          kind,
          payload,
          createdAt: Date.now(),
          snapshotId,
        };

        dispatch({ type: "ENQUEUE_MUTATION", payload: mutation });
        return mutation;
      },
    };

    try {
      const result = await handler(call.input ?? {}, context);
      if (!result.ok && transactionSnapshotId) {
        dispatch({
          type: "REQUEST_RESTORE",
          payload: {
            snapshotId: transactionSnapshotId,
            reason: result.error ?? `Tool ${call.name} failed`,
          },
        });
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool execution failed";
      if (transactionSnapshotId) {
        dispatch({
          type: "REQUEST_RESTORE",
          payload: {
            snapshotId: transactionSnapshotId,
            reason: message,
          },
        });
      }
      return {
        ok: false,
        tool: call.name,
        error: message,
      };
    }
  };
};
