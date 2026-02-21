import { AgentDiscoverySnapshot, ReflectorResult } from "../core/types";
import { SECTION_KEYS } from "../registry";

const includesWord = (goal: string, keywords: string[]) => {
  const normalized = goal.toLowerCase();
  return keywords.some(keyword => normalized.includes(keyword));
};

interface ReflectionStateSlice {
  theme: "light" | "dark";
  sectionOrder: string[];
  visibleSections: string[];
}

interface ReflectionInput {
  goal: string;
  beforeDiscovery: AgentDiscoverySnapshot | null;
  afterDiscovery: AgentDiscoverySnapshot | null;
  beforeState: ReflectionStateSlice;
  afterState: ReflectionStateSlice;
  executedMutationCount: number;
}

const areArraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
};

const haveSameSet = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }
  const rightSet = new Set(right);
  return left.every(value => rightSet.has(value));
};

const hasComponentVisibilityDiff = (
  beforeDiscovery: AgentDiscoverySnapshot | null,
  afterDiscovery: AgentDiscoverySnapshot | null
) => {
  if (!beforeDiscovery || !afterDiscovery) {
    return false;
  }

  const beforeVisibilityMap = new Map(beforeDiscovery.components.map(component => [component.id, component.visible]));
  const afterVisibilityMap = new Map(afterDiscovery.components.map(component => [component.id, component.visible]));
  const componentIds = new Set([...beforeVisibilityMap.keys(), ...afterVisibilityMap.keys()]);

  for (const componentId of componentIds) {
    if (beforeVisibilityMap.get(componentId) !== afterVisibilityMap.get(componentId)) {
      return true;
    }
  }

  return false;
};

export const reflectGoalCompletion = (
  input: ReflectionInput
): ReflectorResult => {
  const {
    goal,
    beforeDiscovery,
    afterDiscovery,
    beforeState,
    afterState,
    executedMutationCount,
  } = input;

  if (!afterDiscovery) {
    return {
      goalAchieved: false,
      summary: "No discovery snapshot available for reflection",
    };
  }

  const themeChanged = beforeState.theme !== afterState.theme;
  const orderChanged = !areArraysEqual(beforeState.sectionOrder, afterState.sectionOrder);
  const visibleSetChanged = !haveSameSet(beforeState.visibleSections, afterState.visibleSections);
  const componentVisibilityChanged = hasComponentVisibilityDiff(beforeDiscovery, afterDiscovery);
  const anyStructuralChange = themeChanged || orderChanged || visibleSetChanged || componentVisibilityChanged;

  if (includesWord(goal, ["light"])) {
    const isMatch = afterState.theme === "light";
    return {
      goalAchieved: isMatch,
      summary: isMatch ? "Theme is now light" : "Theme is not light yet",
    };
  }

  if (includesWord(goal, ["dark", "cyberpunk", "hacker"])) {
    const isMatch = afterState.theme === "dark";
    return {
      goalAchieved: isMatch,
      summary: isMatch ? "Theme is now dark" : "Theme is not dark yet",
    };
  }

  const normalizedGoal = goal.toLowerCase();
  const visibilityTarget = SECTION_KEYS.find(section => {
    return normalizedGoal.includes(`hide ${section}`) || normalizedGoal.includes(`show ${section}`);
  });

  if (visibilityTarget) {
    const shouldBeVisible = normalizedGoal.includes(`show ${visibilityTarget}`);
    const isVisible = afterState.visibleSections.includes(visibilityTarget);
    const isMatch = shouldBeVisible ? isVisible : !isVisible;

    return {
      goalAchieved: isMatch,
      summary: isMatch
        ? `${visibilityTarget} visibility updated`
        : `${visibilityTarget} visibility not updated yet`,
    };
  }

  if (includesWord(goal, ["reorder", "order", "sequence", "recruiter"])) {
    return {
      goalAchieved: orderChanged,
      summary: orderChanged ? "Section order changed" : "Section order unchanged",
    };
  }

  if (executedMutationCount === 0) {
    return {
      goalAchieved: true,
      summary: "No mutation tools executed; stopping reflection loop",
    };
  }

  return {
    goalAchieved: anyStructuralChange,
    summary: anyStructuralChange ? "Detected structural UI changes" : "No structural change detected yet",
  };
};
