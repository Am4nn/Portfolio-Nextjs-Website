import { ToolResult } from "../core/types";
import { ToolExecutionContext } from "./tool-registry";

export const updateCssTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const styleObject = (input.styleObject ?? {}) as Record<string, unknown>;

  context.enqueueMutation(targetId, "update_style", {
    styleObject,
  });

  return {
    ok: true,
    tool: "updateCSS",
    data: { targetId, styleObject },
  };
};

export const addClassTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const className = String(input.className);
  context.enqueueMutation(targetId, "add_class", { className });

  return {
    ok: true,
    tool: "addClass",
    data: { targetId, className },
  };
};

export const removeClassTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const className = String(input.className);
  context.enqueueMutation(targetId, "remove_class", { className });

  return {
    ok: true,
    tool: "removeClass",
    data: { targetId, className },
  };
};

export const animateTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const animationType = String(input.animationType);
  context.enqueueMutation(targetId, "animate", { animationType });

  return {
    ok: true,
    tool: "animate",
    data: { targetId, animationType },
  };
};

export const changeThemeTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const themeName = input.themeName as "light" | "dark";
  context.dispatch({ type: "SET_THEME", payload: themeName, source: "agent" });

  return {
    ok: true,
    tool: "changeTheme",
    data: { theme: themeName },
  };
};
