import { AgentLogEntry, AgentLogLevel } from "./types";

export const createAgentLog = (message: string, level: AgentLogLevel = "info"): AgentLogEntry => {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    level,
    createdAt: Date.now(),
  };
};
