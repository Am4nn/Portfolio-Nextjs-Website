import OpenAI from "openai";
import { buildPlannerPrompt, parsePlannerRequestBody, parseToolPlan, PLANNER_ALLOWED_TOOLS } from "@/lib/agent/runtime/planner-schema";
import { createLocalPlan } from "@/lib/agent/runtime/local-planner";
import { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses.mjs";

const PLAN_TOOL_NAME = "submit_plan";
const PLAN_INPUT_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    componentName: { type: "string" },
    name: { type: "string" },
    className: { type: "string" },
    animationType: { type: "string" },
    themeName: { type: "string", enum: ["light", "dark"] },
    mode: { type: "string" },
    content: { type: "string" },
    snapshotId: { type: "string" },
    description: { type: "string" },
    orderArray: {
      type: "array",
      items: { type: "string" },
    },
    type: { type: "string" },
    styleObject: {
      type: "object",
      properties: {
        color: { type: "string" },
        background: { type: "string" },
        "background-color": { type: "string" },
        "font-size": { type: "string" },
        opacity: { type: "string" },
        transform: { type: "string" },
        margin: { type: "string" },
        "margin-top": { type: "string" },
        "margin-right": { type: "string" },
        "margin-bottom": { type: "string" },
        "margin-left": { type: "string" },
        padding: { type: "string" },
        "padding-top": { type: "string" },
        "padding-right": { type: "string" },
        "padding-bottom": { type: "string" },
        "padding-left": { type: "string" },
        gap: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const tryParseJson = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const stripCodeFences = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const withoutOpening = trimmed.replace(/^```(?:json)?\s*/i, "");
  return withoutOpening.replace(/\s*```$/, "").trim();
};

const parseJsonLoose = (value: string) => {
  const direct = tryParseJson(value);
  if (direct !== null) {
    return direct;
  }

  const noFence = stripCodeFences(value);
  const fromFence = tryParseJson(noFence);
  if (fromFence !== null) {
    return fromFence;
  }

  const objectStart = noFence.indexOf("{");
  const objectEnd = noFence.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    const fromObjectSlice = tryParseJson(noFence.slice(objectStart, objectEnd + 1));
    if (fromObjectSlice !== null) {
      return fromObjectSlice;
    }
  }

  const arrayStart = noFence.indexOf("[");
  const arrayEnd = noFence.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const fromArraySlice = tryParseJson(noFence.slice(arrayStart, arrayEnd + 1));
    if (fromArraySlice !== null) {
      return fromArraySlice;
    }
  }

  return null;
};

const normalizePlanStep = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  const stepName = typeof value.name === "string"
    ? value.name
    : (typeof value.tool === "string" ? value.tool : null);

  if (!stepName) {
    return null;
  }

  const rawInput = value.input ?? value.args ?? value.arguments;
  let normalizedInput: Record<string, unknown> = {};

  if (isRecord(rawInput)) {
    normalizedInput = rawInput;
  } else if (typeof rawInput === "string") {
    const parsedInput = parseJsonLoose(rawInput);
    if (isRecord(parsedInput)) {
      normalizedInput = parsedInput;
    }
  }

  return {
    name: stepName,
    input: normalizedInput,
  };
};

const normalizePlan = (value: unknown) => {
  const source = Array.isArray(value) ? value : [value];
  const normalized = source
    .map(step => normalizePlanStep(step))
    .filter((step): step is { name: string; input: Record<string, unknown> } => Boolean(step));

  if (normalized.length === 0) {
    return null;
  }

  return normalized;
};

const toCandidatePayload = (value: unknown): Record<string, unknown> | null => {
  if (Array.isArray(value)) {
    return { plan: value };
  }

  if (typeof value === "string") {
    const parsed = parseJsonLoose(value);
    if (parsed === null) {
      return null;
    }
    return toCandidatePayload(parsed);
  }

  if (!isRecord(value)) {
    return null;
  }

  if (Array.isArray(value.plan)) {
    return {
      plan: value.plan,
      rationale: value.rationale,
      confidence: value.confidence,
    };
  }

  if (isRecord(value.plan)) {
    return {
      plan: [value.plan],
      rationale: value.rationale,
      confidence: value.confidence,
    };
  }

  if (typeof value.plan === "string") {
    const parsedPlan = parseJsonLoose(value.plan);
    if (Array.isArray(parsedPlan)) {
      return {
        plan: parsedPlan,
        rationale: value.rationale,
        confidence: value.confidence,
      };
    }
    if (isRecord(parsedPlan)) {
      return {
        plan: [parsedPlan],
        rationale: value.rationale,
        confidence: value.confidence,
      };
    }
  }

  if (Array.isArray(value.steps)) {
    return {
      plan: value.steps,
      rationale: value.rationale,
      confidence: value.confidence,
    };
  }

  if (isRecord(value.data) && Array.isArray(value.data.plan)) {
    return {
      plan: value.data.plan,
      rationale: value.data.rationale ?? value.rationale,
      confidence: value.data.confidence ?? value.confidence,
    };
  }

  if (isRecord(value.data) && isRecord(value.data.plan)) {
    return {
      plan: [value.data.plan],
      rationale: value.data.rationale ?? value.rationale,
      confidence: value.data.confidence ?? value.confidence,
    };
  }

  if (typeof value.name === "string" || typeof value.tool === "string") {
    return {
      plan: [value],
      rationale: value.rationale,
      confidence: value.confidence,
    };
  }

  return null;
};

const extractOpenAiPlanPayload = (response: Awaited<ReturnType<OpenAI["responses"]["create"]>>) => {
  const candidates: unknown[] = [];

  response.output.forEach(item => {
    if (item.type === "function_call" && item.name === PLAN_TOOL_NAME) {
      candidates.push(item.arguments);
    }

    if (item.type === "message") {
      item.content.forEach(contentItem => {
        if (contentItem.type === "output_text") {
          candidates.push(contentItem.text);
        }
      });
    }
  });

  if (response.output_text) {
    candidates.push(response.output_text);
  }

  for (const candidate of candidates) {
    const payload = toCandidatePayload(candidate);
    if (!payload) {
      continue;
    }

    const normalizedPlan = normalizePlan(payload.plan);
    if (!normalizedPlan) {
      continue;
    }

    try {
      const plan = parseToolPlan(normalizedPlan);
      return {
        plan,
        rationale: typeof payload.rationale === "string" ? payload.rationale : "Generated by OpenAI SDK planner",
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0.7,
      };
    } catch {
      continue;
    }
  }

  return null;
};

const buildFallbackResponse = (
  request: ReturnType<typeof parsePlannerRequestBody>,
  reason: string
) => {
  const fallback = createLocalPlan(request.goal, request.discovery);
  return Response.json({
    source: "fallback",
    plan: fallback.plan,
    rationale: `${fallback.rationale}. Reason: ${reason}`,
    confidence: fallback.confidence,
  });
};

const requestOpenAiPlan = async (request: ReturnType<typeof parsePlannerRequestBody>) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallbackResponse(request, "openai_not_configured");
  }

  const model = process.env.OPENAI_AGENT_MODEL ?? "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  try {
    const body: ResponseCreateParamsNonStreaming = {
      model,
      temperature: 0.2,
      instructions: "You are an agent planner. Use the provided tool to submit a reversible UI mutation plan.",
      input: buildPlannerPrompt(request),
      tools: [
        {
          type: "function",
          name: PLAN_TOOL_NAME,
          description: "Submit a structured tool execution plan for the UI agent runtime.",
          strict: false,
          parameters: {
            type: "object",
            properties: {
              plan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", enum: PLANNER_ALLOWED_TOOLS },
                    input: PLAN_INPUT_SCHEMA,
                  },
                  required: ["name", "input"],
                  additionalProperties: false,
                },
              },
              rationale: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["plan"],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: {
        type: "function",
        name: PLAN_TOOL_NAME,
      },
    }

    const response = await client.responses.create(body);


    const parsed = extractOpenAiPlanPayload(response);
    if (!parsed) {
      return buildFallbackResponse(request, "openai_invalid_payload");
    }

    return Response.json({
      source: "openai",
      plan: parsed.plan,
      rationale: parsed.rationale,
      confidence: parsed.confidence,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "openai_upstream_error";
    return buildFallbackResponse(request, message);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedRequest = parsePlannerRequestBody(body);
    return requestOpenAiPlan(parsedRequest);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    return Response.json(
      {
        error: message,
      },
      { status: 400 }
    );
  }
}
