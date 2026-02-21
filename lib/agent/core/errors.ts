export class AgentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentValidationError";
  }
}

export class AgentPlannerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentPlannerError";
  }
}

export class AgentRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentRuntimeError";
  }
}
