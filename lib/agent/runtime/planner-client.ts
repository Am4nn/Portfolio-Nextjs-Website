"use client";

import { PlannerApiRequest, PlannerApiResponse } from "../core/types";
import { createLocalPlan } from "./local-planner";
import { parsePlannerResponsePayload } from "./planner-schema";

export const requestPlannerPlan = async (
  request: PlannerApiRequest
): Promise<PlannerApiResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Planner endpoint failed with ${response.status}`);
    }

    const payload = await response.json() as unknown;
    return parsePlannerResponsePayload(payload);
  } catch {
    const local = createLocalPlan(request.goal, request.discovery);
    return {
      source: "fallback",
      plan: local.plan,
      rationale: local.rationale,
      confidence: local.confidence,
    };
  } finally {
    clearTimeout(timeout);
  }
};
