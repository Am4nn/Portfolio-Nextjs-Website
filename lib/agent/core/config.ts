import { MAX_REFLECTION_LOOPS } from "./constants";

export const AGENT_ENABLED =
  process.env.NEXT_PUBLIC_AGENT_ENABLED === "true";

export const AGENT_REFLECTION_ENABLED =
  process.env.NEXT_PUBLIC_AGENT_REFLECTION_ENABLED !== "false";

export const AGENT_DEFAULT_LAYOUT_MODE = "default";
export const AGENT_DEFAULT_THEME = "dark";
export const AGENT_MAX_ITERATIONS = MAX_REFLECTION_LOOPS;
