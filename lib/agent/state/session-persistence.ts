import { AGENT_SESSION_STORAGE_KEY } from "../core/constants";
import { AgentState } from "../core/types";

export type PersistedAgentState = Pick<
  AgentState,
  | "theme"
  | "layoutMode"
  | "sectionOrder"
  | "visibleSections"
>;

const isBrowser = () => typeof window !== "undefined";

export const loadPersistedAgentState = (): Partial<AgentState> | null => {
  if (!isBrowser()) {
    return null;
  }
  const raw = window.sessionStorage.getItem(AGENT_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedAgentState;
    return parsed;
  } catch {
    return null;
  }
};

export const persistAgentState = (state: AgentState) => {
  if (!isBrowser()) {
    return;
  }
  const persistedState: PersistedAgentState = {
    theme: state.theme,
    layoutMode: state.layoutMode,
    sectionOrder: state.sectionOrder,
    visibleSections: state.visibleSections,
  };

  window.sessionStorage.setItem(AGENT_SESSION_STORAGE_KEY, JSON.stringify(persistedState));
};
