import { ToolName } from "./types";

export const MAX_REFLECTION_LOOPS = 3;
export const MAX_TOOL_CALLS_PER_ITERATION = 10;
export const AGENT_LOG_LIMIT = 80;
export const AGENT_SESSION_STORAGE_KEY = "portfolio.agent.state.v2";

export const ALLOWED_CSS_PROPERTIES = [
  "color",
  "background",
  "background-color",
  "font-size",
  "opacity",
  "transform",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "gap",
] as const;

export const MUTATION_TOOLS: ToolName[] = [
  "updateCSS",
  "addClass",
  "removeClass",
  "animate",
  "changeTheme",
  "toggleSection",
  "reorderSections",
  "changeLayout",
  "updateText",
  "replaceWithComponent",
  "drawDiagram",
  "clearCanvas",
  "animateTraffic",
  "changeCameraMode",
];
