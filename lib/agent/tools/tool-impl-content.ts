import { ToolResult } from "../core/types";
import { ToolExecutionContext } from "./tool-registry";

export const updateTextTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const content = String(input.content);

  context.enqueueMutation(targetId, "set_text", { content });

  return {
    ok: true,
    tool: "updateText",
    data: { targetId },
  };
};

export const replaceWithComponentTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const targetId = String(input.id);
  const componentName = typeof input.componentName === "string"
    ? input.componentName
    : (typeof input.name === "string" ? input.name : "");

  if (!componentName) {
    return {
      ok: false,
      tool: "replaceWithComponent",
      error: "componentName must be a non-empty string",
    };
  }

  context.enqueueMutation(targetId, "replace_component", { componentName });

  return {
    ok: true,
    tool: "replaceWithComponent",
    data: { targetId, componentName },
  };
};
