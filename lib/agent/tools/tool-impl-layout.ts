import { ToolResult } from "../core/types";
import { ToolExecutionContext } from "./tool-registry";

export const toggleSectionTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const sectionId = String(input.id);
  const currentlyVisible = context.getState().visibleSections.includes(sectionId);
  const nextVisible = !currentlyVisible;

  context.dispatch({
    type: "SET_SECTION_VISIBILITY",
    payload: {
      sectionId,
      visible: nextVisible,
    },
  });

  return {
    ok: true,
    tool: "toggleSection",
    data: {
      sectionId,
      visible: nextVisible,
    },
  };
};

export const reorderSectionsTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const orderArray = input.orderArray as string[];
  const finalOrder = [...orderArray];

  context.dispatch({
    type: "SET_SECTION_ORDER",
    payload: finalOrder,
  });

  return {
    ok: true,
    tool: "reorderSections",
    data: { order: finalOrder },
  };
};

export const changeLayoutTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const mode = String(input.mode);
  context.dispatch({ type: "SET_LAYOUT_MODE", payload: mode });

  return {
    ok: true,
    tool: "changeLayout",
    data: { mode },
  };
};
