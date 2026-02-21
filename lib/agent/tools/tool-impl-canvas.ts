import { ToolResult } from "../core/types";
import { ToolExecutionContext } from "./tool-registry";

const enqueueCanvasMutation = (
  command: string,
  input: Record<string, unknown>,
  context: ToolExecutionContext,
  tool: ToolResult["tool"]
): ToolResult => {
  context.enqueueMutation("hero-canvas", "canvas_command", {
    command,
    payload: input,
  });

  return {
    ok: true,
    tool,
    data: { command },
    warnings: ["Canvas command queued; behavior is best-effort based on WebGL availability"],
  };
};

export const drawDiagramTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return enqueueCanvasMutation("drawDiagram", input, context, "drawDiagram");
};

export const clearCanvasTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return enqueueCanvasMutation("clearCanvas", input, context, "clearCanvas");
};

export const animateTrafficTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return enqueueCanvasMutation("animateTraffic", input, context, "animateTraffic");
};

export const changeCameraModeTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  return enqueueCanvasMutation("changeCameraMode", input, context, "changeCameraMode");
};
