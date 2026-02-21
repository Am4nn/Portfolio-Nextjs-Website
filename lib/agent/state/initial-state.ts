import { AGENT_DEFAULT_LAYOUT_MODE, AGENT_DEFAULT_THEME, AGENT_MAX_ITERATIONS, AGENT_REFLECTION_ENABLED } from "../core/config";
import { AgentState } from "../core/types";
import { SECTION_KEYS } from "../registry";

export const createInitialAgentState = (): AgentState => ({
  status: "idle",
  currentGoal: "",
  iteration: 0,
  reflectionEnabled: AGENT_REFLECTION_ENABLED,
  maxIterations: AGENT_MAX_ITERATIONS,
  theme: AGENT_DEFAULT_THEME,
  themeSyncNonce: 0,
  layoutMode: AGENT_DEFAULT_LAYOUT_MODE,
  sectionOrder: [...SECTION_KEYS],
  visibleSections: [...SECTION_KEYS],
  pendingMutations: [],
  appliedMutationIds: [],
  baselines: {},
  snapshots: {},
  snapshotOrder: [],
  discovery: null,
  logs: [],
  reflections: [],
  lastError: null,
  stopRequested: false,
  restoreRequest: null,
});
