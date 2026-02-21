import { PlannerApiRequest, PlannerApiResponse, ToolCall, ToolName } from "../core/types";

export const PLANNER_ALLOWED_TOOLS: ToolName[] = [
  "getDOMTreeSummary",
  "getComputedStyleSummary",
  "listComponents",
  "getTheme",
  "getLayoutMode",
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
  "saveStateSnapshot",
  "restoreStateSnapshot",
];

const PLANNER_ALLOWED_TOOL_SET = new Set<string>(PLANNER_ALLOWED_TOOLS);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const parseToolPlan = (value: unknown): ToolCall[] => {
  if (!Array.isArray(value)) {
    throw new Error("plan must be an array");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`plan[${index}] must be an object`);
    }

    const name = item.name;
    if (typeof name !== "string" || !PLANNER_ALLOWED_TOOL_SET.has(name)) {
      throw new Error(`plan[${index}].name is invalid`);
    }

    const input = item.input;
    if (input !== undefined && !isRecord(input)) {
      throw new Error(`plan[${index}].input must be an object`);
    }

    return {
      name: name as ToolName,
      input: (input as Record<string, unknown> | undefined) ?? {},
    };
  });
};

export const parsePlannerRequestBody = (body: unknown): PlannerApiRequest => {
  if (!isRecord(body)) {
    throw new Error("Request body must be an object");
  }

  if (typeof body.goal !== "string") {
    throw new Error("goal must be a string");
  }
  if (typeof body.iteration !== "number") {
    throw new Error("iteration must be a number");
  }
  if (!Array.isArray(body.previousReflections)) {
    throw new Error("previousReflections must be an array");
  }

  return {
    goal: body.goal,
    iteration: body.iteration,
    discovery: (body.discovery as PlannerApiRequest["discovery"]) ?? null,
    previousReflections: body.previousReflections.map(item => String(item)),
  };
};

export const parsePlannerResponsePayload = (payload: unknown): PlannerApiResponse => {
  if (!isRecord(payload)) {
    throw new Error("Planner response payload must be an object");
  }

  const parsedPlan = parseToolPlan(payload.plan);
  return {
    source: payload.source === "openai" ? "openai" : "fallback",
    plan: parsedPlan,
    rationale: typeof payload.rationale === "string" ? payload.rationale : undefined,
    confidence: typeof payload.confidence === "number" ? payload.confidence : undefined,
  };
};

export const buildPlannerPrompt = (request: PlannerApiRequest) => {
  return [
    "You are a planner for a safe UI mutation agent.",
    "Prioritize minimal and reversible changes.",
    "Use the tool schema strictly and avoid unsupported actions.",
    `Goal: ${request.goal}`,
    `Iteration: ${request.iteration}`,
    `Discovery: ${JSON.stringify(request.discovery)}`,
    `Previous reflections: ${JSON.stringify(request.previousReflections)}`,
  ].join("\n");
};
