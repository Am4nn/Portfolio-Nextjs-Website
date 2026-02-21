import { AGENT_LOG_LIMIT } from "../core/constants";
import { AgentDiscoverySnapshot, AgentLogEntry, AgentMutation, AgentSnapshot, AgentState, AgentTargetBaseline, AgentTheme } from "../core/types";
import { SECTION_KEYS } from "../registry";

export type AgentAction =
  | { type: "HYDRATE_SESSION"; payload: Partial<AgentState> }
  | { type: "START_RUN"; payload: { goal: string } }
  | { type: "STOP_REQUESTED" }
  | { type: "STOPPED" }
  | { type: "SET_STATUS"; payload: AgentState["status"] }
  | { type: "SET_DISCOVERY"; payload: AgentDiscoverySnapshot }
  | { type: "SET_THEME"; payload: AgentTheme; source?: "agent" | "external" }
  | { type: "SET_LAYOUT_MODE"; payload: string }
  | { type: "SET_SECTION_ORDER"; payload: string[] }
  | { type: "SET_SECTION_VISIBILITY"; payload: { sectionId: string; visible: boolean } }
  | { type: "ENQUEUE_MUTATION"; payload: AgentMutation }
  | { type: "MARK_MUTATION_APPLIED"; payload: { mutationId: string } }
  | { type: "ADD_BASELINE"; payload: AgentTargetBaseline }
  | { type: "SAVE_SNAPSHOT"; payload: AgentSnapshot }
  | { type: "REQUEST_RESTORE"; payload: { snapshotId: string; reason: string } }
  | { type: "APPLY_RESTORED_SNAPSHOT"; payload: AgentSnapshot }
  | { type: "COMPLETE_RESTORE" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "INCREMENT_ITERATION" }
  | { type: "ADD_REFLECTION"; payload: string }
  | { type: "ADD_LOG"; payload: AgentLogEntry }
  | { type: "CLEAR_PENDING_MUTATIONS" };

const trimLogs = (logs: AgentLogEntry[]) => {
  if (logs.length <= AGENT_LOG_LIMIT) {
    return logs;
  }
  return logs.slice(logs.length - AGENT_LOG_LIMIT);
};

const hasStrictSectionOrder = (order: string[]) => {
  if (order.length !== SECTION_KEYS.length) {
    return false;
  }

  const set = new Set(order);
  if (set.size !== SECTION_KEYS.length) {
    return false;
  }

  return SECTION_KEYS.every(section => set.has(section));
};

const isKnownSectionId = (value: string) => SECTION_KEYS.includes(value);

const normalizeVisibleSections = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const uniqueVisibleSections: string[] = [];
  value.forEach(item => {
    if (typeof item !== "string") {
      return;
    }
    if (!isKnownSectionId(item)) {
      return;
    }
    if (!uniqueVisibleSections.includes(item)) {
      uniqueVisibleSections.push(item);
    }
  });

  return uniqueVisibleSections;
};

const resolveHydratedTheme = (state: AgentState, theme: unknown) => {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return state.theme;
};

const resolveHydratedLayoutMode = (state: AgentState, layoutMode: unknown) => {
  if (typeof layoutMode === "string") {
    return layoutMode;
  }
  return state.layoutMode;
};

const resolveHydratedSectionOrder = (state: AgentState, sectionOrder: unknown) => {
  if (!Array.isArray(sectionOrder)) {
    return [...state.sectionOrder];
  }

  const parsed = sectionOrder.filter((section): section is string => typeof section === "string");
  if (!hasStrictSectionOrder(parsed)) {
    return [...state.sectionOrder];
  }

  return [...parsed];
};

const resolveHydratedVisibleSections = (state: AgentState, visibleSections: unknown) => {
  const parsed = normalizeVisibleSections(visibleSections);
  if (!parsed) {
    return [...state.visibleSections];
  }
  return [...parsed];
};

export const agentReducer = (state: AgentState, action: AgentAction): AgentState => {
  switch (action.type) {
    case "HYDRATE_SESSION":
      return {
        ...state,
        theme: resolveHydratedTheme(state, action.payload.theme),
        layoutMode: resolveHydratedLayoutMode(state, action.payload.layoutMode),
        sectionOrder: resolveHydratedSectionOrder(state, action.payload.sectionOrder),
        visibleSections: resolveHydratedVisibleSections(state, action.payload.visibleSections),
        status: "idle",
        currentGoal: "",
        iteration: 0,
        pendingMutations: [],
        appliedMutationIds: [],
        reflections: [],
        lastError: null,
        stopRequested: false,
        restoreRequest: null,
      };
    case "START_RUN":
      return {
        ...state,
        status: "discovering",
        currentGoal: action.payload.goal,
        iteration: 0,
        reflections: [],
        lastError: null,
        stopRequested: false,
      };
    case "STOP_REQUESTED":
      return {
        ...state,
        stopRequested: true,
      };
    case "STOPPED":
      return {
        ...state,
        status: "stopped",
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
      };
    case "SET_DISCOVERY":
      return {
        ...state,
        discovery: action.payload,
      };
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
        themeSyncNonce: action.source === "agent" ? state.themeSyncNonce + 1 : state.themeSyncNonce,
      };
    case "SET_LAYOUT_MODE":
      return {
        ...state,
        layoutMode: action.payload,
      };
    case "SET_SECTION_ORDER":
      if (!hasStrictSectionOrder(action.payload)) {
        return state;
      }
      return {
        ...state,
        sectionOrder: [...action.payload],
      };
    case "SET_SECTION_VISIBILITY": {
      if (!isKnownSectionId(action.payload.sectionId)) {
        return state;
      }
      const alreadyVisible = state.visibleSections.includes(action.payload.sectionId);
      if (action.payload.visible && !alreadyVisible) {
        return {
          ...state,
          visibleSections: [...state.visibleSections, action.payload.sectionId],
        };
      }
      if (!action.payload.visible && alreadyVisible) {
        return {
          ...state,
          visibleSections: state.visibleSections.filter(section => section !== action.payload.sectionId),
        };
      }
      return state;
    }
    case "ENQUEUE_MUTATION":
      return {
        ...state,
        pendingMutations: [...state.pendingMutations, action.payload],
      };
    case "MARK_MUTATION_APPLIED":
      return {
        ...state,
        pendingMutations: state.pendingMutations.filter(mutation => mutation.id !== action.payload.mutationId),
        appliedMutationIds: [...state.appliedMutationIds, action.payload.mutationId],
      };
    case "ADD_BASELINE":
      if (state.baselines[action.payload.targetId]) {
        return state;
      }
      return {
        ...state,
        baselines: {
          ...state.baselines,
          [action.payload.targetId]: action.payload,
        },
      };
    case "SAVE_SNAPSHOT":
      return {
        ...state,
        snapshots: {
          ...state.snapshots,
          [action.payload.id]: action.payload,
        },
        snapshotOrder: [...state.snapshotOrder, action.payload.id],
      };
    case "REQUEST_RESTORE":
      return {
        ...state,
        restoreRequest: {
          snapshotId: action.payload.snapshotId,
          reason: action.payload.reason,
          requestedAt: Date.now(),
        },
      };
    case "APPLY_RESTORED_SNAPSHOT":
      return {
        ...state,
        status: "idle",
        currentGoal: "",
        iteration: 0,
        theme: action.payload.ui.theme,
        layoutMode: action.payload.ui.layoutMode,
        sectionOrder: [...action.payload.ui.sectionOrder],
        visibleSections: [...action.payload.ui.visibleSections],
        baselines: {
          ...action.payload.baselines,
        },
        pendingMutations: [],
        appliedMutationIds: [],
        discovery: null,
        logs: [],
        reflections: [],
        lastError: null,
        stopRequested: false,
      };
    case "COMPLETE_RESTORE":
      return {
        ...state,
        restoreRequest: null,
        status: "idle",
        stopRequested: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        status: "error",
        lastError: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        lastError: null,
      };
    case "INCREMENT_ITERATION":
      return {
        ...state,
        iteration: state.iteration + 1,
      };
    case "ADD_REFLECTION":
      return {
        ...state,
        reflections: [...state.reflections, action.payload],
      };
    case "ADD_LOG":
      return {
        ...state,
        logs: trimLogs([...state.logs, action.payload]),
      };
    case "CLEAR_PENDING_MUTATIONS":
      return {
        ...state,
        pendingMutations: [],
      };
    default:
      return state;
  }
};
