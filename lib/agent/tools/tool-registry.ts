import { Dispatch } from "react";
import { MUTATION_TOOLS } from "../core/constants";
import { AgentMutation, AgentState, MutationKind, ToolCall, ToolName, ToolResult } from "../core/types";
import { AgentAction } from "../state/agent-reducer";
import {
  getComputedStyleSummaryTool,
  getDomTreeSummaryTool,
  getLayoutModeTool,
  getThemeTool,
  listComponentsTool,
} from "./tool-impl-discovery";
import { addClassTool, animateTool, changeThemeTool, removeClassTool, updateCssTool } from "./tool-impl-visual";
import { changeLayoutTool, reorderSectionsTool, toggleSectionTool } from "./tool-impl-layout";
import { replaceWithComponentTool, updateTextTool } from "./tool-impl-content";
import { animateTrafficTool, changeCameraModeTool, clearCanvasTool, drawDiagramTool } from "./tool-impl-canvas";
import { restoreStateSnapshotTool, saveStateSnapshotTool } from "./tool-impl-state";

export interface ToolExecutionContext {
  getState: () => AgentState;
  dispatch: Dispatch<AgentAction>;
  enqueueMutation: (
    targetId: string,
    kind: MutationKind,
    payload: Record<string, unknown>,
    snapshotId?: string
  ) => AgentMutation;
}

export type ToolHandler = (
  input: Record<string, unknown>,
  context: ToolExecutionContext
) => Promise<ToolResult> | ToolResult;

export const TOOL_REGISTRY: Record<ToolName, ToolHandler> = {
  getDOMTreeSummary: getDomTreeSummaryTool,
  getComputedStyleSummary: getComputedStyleSummaryTool,
  listComponents: listComponentsTool,
  getTheme: getThemeTool,
  getLayoutMode: getLayoutModeTool,
  updateCSS: updateCssTool,
  addClass: addClassTool,
  removeClass: removeClassTool,
  animate: animateTool,
  changeTheme: changeThemeTool,
  toggleSection: toggleSectionTool,
  reorderSections: reorderSectionsTool,
  changeLayout: changeLayoutTool,
  updateText: updateTextTool,
  replaceWithComponent: replaceWithComponentTool,
  drawDiagram: drawDiagramTool,
  clearCanvas: clearCanvasTool,
  animateTraffic: animateTrafficTool,
  changeCameraMode: changeCameraModeTool,
  saveStateSnapshot: saveStateSnapshotTool,
  restoreStateSnapshot: restoreStateSnapshotTool,
};

export const isMutationTool = (toolName: ToolCall["name"]) => MUTATION_TOOLS.includes(toolName);
