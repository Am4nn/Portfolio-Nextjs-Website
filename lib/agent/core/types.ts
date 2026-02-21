export type AgentTheme = "light" | "dark";

export type AgentStatus =
  | "idle"
  | "discovering"
  | "planning"
  | "executing"
  | "reflecting"
  | "stopped"
  | "error";

export type AgentLogLevel = "info" | "warn" | "error";

export interface AgentLogEntry {
  id: string;
  level: AgentLogLevel;
  message: string;
  createdAt: number;
}

export interface AgentComponentMeta {
  id: string;
  selector: string;
  type: "section" | "component" | "canvas" | "layout";
  visible: boolean;
}

export interface AgentDiscoverySnapshot {
  components: AgentComponentMeta[];
  theme: AgentTheme;
  layoutMode: string;
  createdAt: number;
}

export type ToolName =
  | "getDOMTreeSummary"
  | "getComputedStyleSummary"
  | "listComponents"
  | "getTheme"
  | "getLayoutMode"
  | "updateCSS"
  | "addClass"
  | "removeClass"
  | "animate"
  | "changeTheme"
  | "toggleSection"
  | "reorderSections"
  | "changeLayout"
  | "updateText"
  | "replaceWithComponent"
  | "drawDiagram"
  | "clearCanvas"
  | "animateTraffic"
  | "changeCameraMode"
  | "saveStateSnapshot"
  | "restoreStateSnapshot";

export interface ToolCall {
  name: ToolName;
  input?: Record<string, unknown>;
}

export interface ToolResult {
  ok: boolean;
  tool: ToolName;
  data?: unknown;
  error?: string;
  warnings?: string[];
}

export type MutationKind =
  | "update_style"
  | "add_class"
  | "remove_class"
  | "set_visibility"
  | "set_text"
  | "replace_component"
  | "animate"
  | "canvas_command";

export interface AgentMutation {
  id: string;
  targetId: string;
  kind: MutationKind;
  payload: Record<string, unknown>;
  createdAt: number;
  snapshotId?: string;
}

export interface AgentTargetBaseline {
  targetId: string;
  className: string;
  style: Record<string, string>;
  textContent: string | null;
  restoreText: boolean;
  hidden: boolean;
  display: string;
  order: string;
}

export interface AgentSnapshot {
  id: string;
  createdAt: number;
  description: string;
  baselines: Record<string, AgentTargetBaseline>;
  ui: {
    theme: AgentTheme;
    layoutMode: string;
    sectionOrder: string[];
    visibleSections: string[];
  };
}

export interface AgentRestoreRequest {
  snapshotId: string;
  reason: string;
  requestedAt: number;
}

export interface AgentState {
  status: AgentStatus;
  currentGoal: string;
  iteration: number;
  reflectionEnabled: boolean;
  maxIterations: number;
  theme: AgentTheme;
  themeSyncNonce: number;
  layoutMode: string;
  sectionOrder: string[];
  visibleSections: string[];
  pendingMutations: AgentMutation[];
  appliedMutationIds: string[];
  baselines: Record<string, AgentTargetBaseline>;
  snapshots: Record<string, AgentSnapshot>;
  snapshotOrder: string[];
  discovery: AgentDiscoverySnapshot | null;
  logs: AgentLogEntry[];
  reflections: string[];
  lastError: string | null;
  stopRequested: boolean;
  restoreRequest: AgentRestoreRequest | null;
}

export interface PlannerApiRequest {
  goal: string;
  iteration: number;
  discovery: AgentDiscoverySnapshot | null;
  previousReflections: string[];
}

export interface PlannerApiResponse {
  source: "openai" | "fallback";
  plan: ToolCall[];
  rationale?: string;
  confidence?: number;
}

export interface ReflectorResult {
  goalAchieved: boolean;
  summary: string;
}

export interface AgentTarget {
  id: string;
  selector: string;
  type: "section" | "component" | "canvas" | "layout";
}

export interface AgentSection {
  id: string;
  selector: string;
}
