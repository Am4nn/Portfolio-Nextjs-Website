import { AgentDiscoverySnapshot, ToolCall } from "../core/types";

const hasKeyword = (value: string, keywords: string[]) => {
  const normalized = value.toLowerCase();
  return keywords.some(keyword => normalized.includes(keyword));
};

export const createLocalPlan = (
  goal: string,
  discovery: AgentDiscoverySnapshot | null
): { plan: ToolCall[]; rationale: string; confidence: number } => {
  const plan: ToolCall[] = [
    { name: "getDOMTreeSummary" },
    { name: "listComponents" },
  ];

  if (hasKeyword(goal, ["restore", "undo", "revert"])) {
    plan.push({ name: "restoreStateSnapshot", input: {} });
    return {
      plan,
      rationale: "Goal references restore semantics; restoring last snapshot",
      confidence: 0.93,
    };
  }

  if (hasKeyword(goal, ["light"])) {
    plan.push({ name: "changeTheme", input: { themeName: "light" } });
  } else if (hasKeyword(goal, ["dark", "cyberpunk", "hacker"])) {
    plan.push({ name: "changeTheme", input: { themeName: "dark" } });
  }

  if (hasKeyword(goal, ["hide about"])) {
    if (discovery?.components.find(component => component.id === "about" && component.visible)) {
      plan.push({ name: "toggleSection", input: { id: "about" } });
    }
  }

  if (hasKeyword(goal, ["show about"])) {
    if (discovery?.components.find(component => component.id === "about" && !component.visible)) {
      plan.push({ name: "toggleSection", input: { id: "about" } });
    }
  }

  if (hasKeyword(goal, ["reorder", "recruiter", "portfolio order"])) {
    plan.push({ name: "reorderSections", input: { orderArray: ["intro", "about", "footer"] } });
  }

  if (hasKeyword(goal, ["impressive", "animate", "motion"])) {
    plan.push({ name: "animate", input: { id: "intro", animationType: "pulse" } });
  }

  if (hasKeyword(goal, ["canvas", "diagram", "traffic"])) {
    plan.push({ name: "drawDiagram", input: { type: "system" } });
  }

  if (plan.length <= 2) {
    plan.push({ name: "getTheme" });
  }

  return {
    plan,
    rationale: "Local deterministic planner based on explicit goal keywords",
    confidence: 0.68,
  };
};
