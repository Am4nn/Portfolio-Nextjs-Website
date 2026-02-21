"use client";

import { buildDiscoverySnapshot } from "../discovery/discovery-engine";
import { ToolResult } from "../core/types";
import { getTargetById } from "../registry";
import { ToolExecutionContext } from "./tool-registry";

const styleProperties = [
  "color",
  "background-color",
  "font-size",
  "opacity",
  "transform",
  "margin",
  "padding",
];

export const getDomTreeSummaryTool = (_: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const discovery = buildDiscoverySnapshot(context.getState().layoutMode);
  context.dispatch({ type: "SET_DISCOVERY", payload: discovery });

  return {
    ok: true,
    tool: "getDOMTreeSummary",
    data: discovery,
  };
};

export const listComponentsTool = (_: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const discovery = context.getState().discovery ?? buildDiscoverySnapshot(context.getState().layoutMode);
  context.dispatch({ type: "SET_DISCOVERY", payload: discovery });
  return {
    ok: true,
    tool: "listComponents",
    data: discovery.components,
  };
};

export const getThemeTool = (_: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return {
    ok: true,
    tool: "getTheme",
    data: context.getState().theme,
  };
};

export const getLayoutModeTool = (_: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return {
    ok: true,
    tool: "getLayoutMode",
    data: context.getState().layoutMode,
  };
};

export const getComputedStyleSummaryTool = (input: Record<string, unknown>): ToolResult => {
  const id = String(input.id);
  const target = getTargetById(id);
  if (!target) {
    return {
      ok: false,
      tool: "getComputedStyleSummary",
      error: "Unknown target id",
    };
  }

  const element = document.querySelector(target.selector);
  if (!element || !(element instanceof HTMLElement)) {
    return {
      ok: false,
      tool: "getComputedStyleSummary",
      error: "Target not found in DOM",
    };
  }

  const computedStyle = window.getComputedStyle(element);
  const styleSummary = styleProperties.reduce<Record<string, string>>((accumulator, property) => {
    accumulator[property] = computedStyle.getPropertyValue(property);
    return accumulator;
  }, {});

  return {
    ok: true,
    tool: "getComputedStyleSummary",
    data: styleSummary,
  };
};
