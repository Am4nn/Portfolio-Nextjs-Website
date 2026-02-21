"use client";

import React, { useEffect } from "react";
import { AgentMutation } from "../core/types";
import { createAgentLog } from "../core/log";
import { getTargetById } from "../registry";
import { applyBaselineToElement } from "../snapshots/snapshot-manager";
import { useAgentRuntimeContext } from "../state/agent-context";
import { runLayoutHealthCheck } from "./layout-health";

const normalizeCssProperty = (property: string) => {
  if (property.includes("-")) {
    return property.toLowerCase();
  }
  return property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
};

const applyMutationToElement = (mutation: AgentMutation, element: HTMLElement) => {
  switch (mutation.kind) {
    case "update_style": {
      const styleObject = mutation.payload.styleObject as Record<string, string | number>;
      Object.entries(styleObject).forEach(([property, value]) => {
        element.style.setProperty(normalizeCssProperty(property), String(value));
      });
      return;
    }
    case "add_class": {
      const className = String(mutation.payload.className);
      element.classList.add(className);
      return;
    }
    case "remove_class": {
      const className = String(mutation.payload.className);
      element.classList.remove(className);
      return;
    }
    case "set_visibility": {
      const visible = Boolean(mutation.payload.visible);
      if (visible) {
        element.removeAttribute("hidden");
      } else {
        element.setAttribute("hidden", "");
      }
      return;
    }
    case "set_text": {
      const content = String(mutation.payload.content);
      element.textContent = content;
      return;
    }
    case "replace_component": {
      const componentName = String(mutation.payload.componentName);
      element.setAttribute("data-agent-component", componentName);
      element.textContent = `[${componentName}]`;
      return;
    }
    case "animate": {
      const animationType = String(mutation.payload.animationType);
      element.setAttribute("data-agent-animation", animationType);
      return;
    }
    case "canvas_command": {
      const command = String(mutation.payload.command);
      element.setAttribute("data-agent-canvas-command", command);
      element.setAttribute("data-agent-canvas-payload", JSON.stringify(mutation.payload.payload ?? {}));
      return;
    }
    default:
      return;
  }
};

export const MutationEngine: React.FC = () => {
  const { state, dispatch } = useAgentRuntimeContext();

  useEffect(() => {
    if (state.pendingMutations.length === 0) {
      return;
    }

    state.pendingMutations.forEach(mutation => {
      const target = getTargetById(mutation.targetId);
      if (!target) {
        dispatch({
          type: "ADD_LOG",
          payload: createAgentLog(`Mutation skipped. Unknown target: ${mutation.targetId}`, "warn"),
        });
        dispatch({ type: "MARK_MUTATION_APPLIED", payload: { mutationId: mutation.id } });
        return;
      }

      const element = document.querySelector(target.selector);
      if (!element || !(element instanceof HTMLElement)) {
        dispatch({
          type: "ADD_LOG",
          payload: createAgentLog(`Mutation target not found in DOM: ${mutation.targetId}`, "warn"),
        });
        dispatch({ type: "MARK_MUTATION_APPLIED", payload: { mutationId: mutation.id } });
        return;
      }

      try {
        applyMutationToElement(mutation, element);
        const layoutHealth = runLayoutHealthCheck();
        if (!layoutHealth.ok && mutation.snapshotId) {
          dispatch({
            type: "ADD_LOG",
            payload: createAgentLog(`Layout health failed. Rolling back: ${layoutHealth.reason ?? "unknown"}`, "error"),
          });
          dispatch({
            type: "REQUEST_RESTORE",
            payload: {
              snapshotId: mutation.snapshotId,
              reason: layoutHealth.reason ?? "Layout health check failed",
            },
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Mutation failed";
        dispatch({ type: "SET_ERROR", payload: message });
        if (mutation.snapshotId) {
          dispatch({
            type: "REQUEST_RESTORE",
            payload: {
              snapshotId: mutation.snapshotId,
              reason: message,
            },
          });
        }
      } finally {
        dispatch({ type: "MARK_MUTATION_APPLIED", payload: { mutationId: mutation.id } });
      }
    });
  }, [dispatch, state.pendingMutations]);

  useEffect(() => {
    if (!state.restoreRequest) {
      return;
    }

    const snapshot = state.snapshots[state.restoreRequest.snapshotId];
    if (!snapshot) {
      dispatch({ type: "SET_ERROR", payload: "Snapshot not found for restore" });
      dispatch({ type: "COMPLETE_RESTORE" });
      return;
    }

    Object.values(snapshot.baselines).forEach(baseline => {
      const target = getTargetById(baseline.targetId);
      if (!target) {
        return;
      }
      const element = document.querySelector(target.selector);
      if (!element || !(element instanceof HTMLElement)) {
        return;
      }
      applyBaselineToElement(baseline, element);
    });

    dispatch({ type: "APPLY_RESTORED_SNAPSHOT", payload: snapshot });
    dispatch({
      type: "ADD_LOG",
      payload: createAgentLog(`Restored snapshot ${snapshot.id}`),
    });
    dispatch({ type: "COMPLETE_RESTORE" });
  }, [dispatch, state.restoreRequest, state.snapshots]);

  return null;
};
