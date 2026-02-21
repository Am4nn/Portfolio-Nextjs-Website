# Agent Sandbox Runtime v1 Architecture

This document explains the current end-to-end architecture of the AI Agent runtime and how it integrates into the React app.

## 1) Purpose and Scope

The agent runtime allows safe, reversible UI mutations on the portfolio page through a planner-executor loop.

Design goals:
- Additive integration with existing portfolio UI.
- Strictly validated tool execution.
- Transactional safety with snapshot restore.
- Hybrid planning: OpenAI planner first, deterministic local fallback.
- React-safe rendering for section order/visibility.

Primary implementation lives in `lib/agent/**`.

## 2) React Integration Points

### Root integration
- `app/layout.tsx`
  - Wraps app tree with `AgentProvider`.
  - Mounts global `AgentPanel`.

### Homepage render integration
- `app/page.tsx`
  - Reads agent state via `useAgent()`.
  - Renders sections from `state.sectionOrder`.
  - Filters by `state.visibleSections`.
  - Reordering is render-driven (React state), not DOM re-parenting.

### Planner API integration
- `app/api/agent/route.ts`
  - Receives planner request from client runtime.
  - Uses OpenAI Responses API with function tool output.
  - Validates/normalizes payload into internal `ToolCall[]`.
  - Falls back to local planner on upstream/parse failures.

## 3) Runtime Lifecycle (Client)

Core entry:
- `lib/agent/runtime/agent-runtime.ts`

Lifecycle steps per run:
1. `START_RUN` with goal.
2. Discovery snapshot build (`discovering`).
3. Planner request (`planning`).
4. Execute tools via dispatcher (`executing`).
5. Optional reflection loop (`reflecting`) up to max iterations.
6. End in `idle`, `stopped`, or `error`.

Important controls:
- Reflection loop toggle from env config.
- Tool execution budget per iteration (`MAX_TOOL_CALLS_PER_ITERATION`).
- Stop signal via reducer flag (`stopRequested`).

## 4) State Management

Provider and hooks:
- `lib/agent/state/agent-context.tsx`
  - `AgentRuntimeProvider`
  - `useAgentRuntimeContext()`
  - `useAgent()`

Reducer:
- `lib/agent/state/agent-reducer.ts`

State includes:
- Runtime status and iteration metadata.
- Goal, logs, reflections, errors.
- Discovery snapshot.
- Mutable UI state: theme/layout/order/visibility.
- Mutation queue and applied IDs.
- Immutable per-target baselines.
- Snapshot store and restore request channel.

Session persistence:
- `lib/agent/state/session-persistence.ts`
  - Persists only durable UI state:
  - `theme`, `layoutMode`, `sectionOrder`, `visibleSections`.

## 5) Discovery and Registry Model

Discovery source is registry-driven, not broad DOM traversal.

Registry:
- `lib/agent/registry/sectionRegistry.ts`
- `lib/agent/registry/targetRegistry.ts`

Discovery engine:
- `lib/agent/discovery/discovery-engine.ts`
  - Resolves only known registry selectors.
  - Captures component visibility, theme, layout mode.

## 6) Tooling and Validation Pipeline

Dispatcher:
- `lib/agent/tools/dispatcher.ts`
  - Enforces discovery gate for mutation tools.
  - Validates each call using mutation validator.
  - Captures missing baselines before mutation transaction.
  - Creates transaction snapshot.
  - Executes tool handler and requests rollback on failure.

Tool registry and implementations:
- `lib/agent/tools/tool-registry.ts`
- `lib/agent/tools/tool-impl-*.ts`

Validation:
- `lib/agent/validation/mutation-validator.ts`
  - Target ID validation against registry.
  - CSS whitelist enforcement for `updateCSS`.
  - Strict reorder validation (`orderArray` full exact section set).
  - Input safety checks for text/component tools.

## 7) Mutation and Restore Engine

Mutation engine:
- `lib/agent/dom/mutation-engine.tsx`
  - Applies queued DOM mutations to known targets.
  - Runs layout health check after apply.
  - Requests snapshot restore if health fails.

Layout health:
- `lib/agent/dom/layout-health.ts`
  - Verifies `#portfolio-main` exists and is connected.
  - Detects collapsed main layout.
  - Verifies required targets (`navbar`, `footer`) when present.
  - Detects detached controlled targets.
  - Detects unsafe canvas overlay dominance.

Snapshot manager:
- `lib/agent/snapshots/snapshot-manager.ts`
  - Baseline capture from live element.
  - Deep-cloned snapshot creation (immutable transactional history).
  - Baseline application for restore.

## 8) Planner Contract (Server + Client)

Client planner call:
- `lib/agent/runtime/planner-client.ts`
  - POST to `/api/agent` with timeout.
  - Parses server response to strict `PlannerApiResponse`.
  - Uses local fallback plan if request fails.

Planner schema helpers:
- `lib/agent/runtime/planner-schema.ts`
  - Request parsing (`goal`, `iteration`, discovery, reflections).
  - Response parsing and strict plan validation.
  - Allowed tool list.

API response contract:
- `source: "openai" | "fallback"`
- `plan: ToolCall[]`
- `rationale?: string`
- `confidence?: number`

## 9) Reflection Logic

Reflector:
- `lib/agent/runtime/reflector.ts`

Completion checks are structural:
- Theme delta.
- Section order delta.
- Visibility set delta.
- Discovery visibility delta.
- Goal-intent specific checks (theme/visibility/order phrases).

No-change loops do not incorrectly report success unless explicitly intended (for zero executed mutation case).

## 10) Feature Flags and Environment

Config:
- `lib/agent/core/config.ts`

Flags:
- `NEXT_PUBLIC_AGENT_ENABLED`
  - `false` disables agent provider/runtime/panel completely.
  - Any other value (or unset) keeps agent enabled.
- `NEXT_PUBLIC_AGENT_REFLECTION_ENABLED`
  - `false` disables iterative reflection loop.

Other env:
- `OPENAI_API_KEY`
- `OPENAI_AGENT_MODEL` (defaults to `gpt-4o-mini`)

## 11) Public Surface

Exports:
- `lib/agent/index.ts`
  - `AgentProvider`
  - `AgentPanel`
  - `useAgent`

Runtime commands from `useAgent()`:
- `runGoal(goal: string)`
- `stopRun()`
- `restoreSnapshot(snapshotId?: string)`

## 12) Safety Invariants

Must always hold:
1. Mutation tools cannot run before discovery.
2. Unknown targets/tools are rejected.
3. CSS writes are property-whitelisted.
4. Baseline capture is first-time only per target.
5. Every mutation transaction has snapshot rollback path.
6. Section reorder must contain exact known section set.
7. Restore resets runtime to a clean idle state.
8. Session persistence excludes snapshots/baselines/runtime transient flags.
9. Per-iteration tool execution is capped.

## 13) Operational Debug Checklist

If runtime behaves unexpectedly:
1. Check env flags in `.env.local` (`NEXT_PUBLIC_AGENT_ENABLED`, reflection flag).
2. Inspect `state.logs` from panel activity.
3. Confirm discovery components and section IDs are registry-aligned.
4. Verify planner response has valid `plan[]` shape.
5. Verify target selectors still match rendered DOM.
6. Trigger restore and confirm UI/state returns to snapshot baseline.

## 14) File Map (Quick Reference)

- Entry/API: `app/api/agent/route.ts`
- React wiring: `app/layout.tsx`, `app/page.tsx`
- Provider/hooks: `lib/agent/state/agent-context.tsx`
- Reducer/state: `lib/agent/state/agent-reducer.ts`
- Runtime loop: `lib/agent/runtime/agent-runtime.ts`
- Planner client/schema: `lib/agent/runtime/planner-client.ts`, `lib/agent/runtime/planner-schema.ts`
- Reflection: `lib/agent/runtime/reflector.ts`
- Dispatcher/tools: `lib/agent/tools/dispatcher.ts`, `lib/agent/tools/tool-registry.ts`
- Validation: `lib/agent/validation/mutation-validator.ts`
- Discovery/registry: `lib/agent/discovery/discovery-engine.ts`, `lib/agent/registry/*`
- Mutation/health: `lib/agent/dom/mutation-engine.tsx`, `lib/agent/dom/layout-health.ts`
- Snapshots: `lib/agent/snapshots/snapshot-manager.ts`
- UI panel: `lib/agent/components/AgentPanel.tsx`
