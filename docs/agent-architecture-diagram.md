# Agent Runtime Architecture (Connected View)

This document shows how the Agent Runtime modules connect end to end in the React app.

## 1) App-Level Integration

```mermaid
flowchart TD
    A[app/layout.tsx] --> B[ThemeProvider]
    B --> C[AgentProvider]
    C --> D[NextUIProvider]
    D --> E[Navbar / NavIcons / QueryProvider / UIHelpers]
    D --> F[Page Content]
    D --> G[AgentPanel]

    C --> H[AgentRuntimeProvider]
    H --> I[AgentRuntimeBridge]
    I --> J[MutationEngine]
```

## 2) Runtime Execution Loop

```mermaid
flowchart LR
    A[AgentPanel runGoal] --> B[runAgentRuntime]
    B --> C[Discovery: buildDiscoverySnapshot]
    C --> D[Planner Client /api/agent]
    D --> E[Plan Tool Calls]
    E --> F[Tool Dispatcher]
    F --> G[Tool Handlers]
    G --> H[Reducer State Updates + Pending Mutations]
    H --> I[MutationEngine Applies DOM Mutations]
    I --> J[Layout Health Check]
    J -->|healthy| K[Reflector]
    J -->|failed| L[Request Restore]
    L --> M[Apply Snapshot Baselines]
    M --> N[Idle]
    K -->|goal achieved| N
    K -->|not achieved + reflection enabled| C
```

## 3) Server Planner Path (Hybrid)

```mermaid
sequenceDiagram
    participant R as runAgentRuntime (client)
    participant P as planner-client.ts
    participant API as POST /api/agent
    participant OAI as OpenAI Responses API
    participant LP as local-planner.ts

    R->>P: requestPlannerPlan(goal, iteration, discovery, reflections)
    P->>API: JSON request
    API->>OAI: responses.create(tool schema)
    OAI-->>API: tool output / text output
    API->>API: normalize + parseToolPlan
    alt Valid OpenAI payload
        API-->>P: { source: "openai", plan }
    else Upstream/parse failure
        API->>LP: createLocalPlan(...)
        API-->>P: { source: "fallback", plan }
    end
    P-->>R: PlannerApiResponse
```

## 4) Tool Dispatch + Transaction Safety

```mermaid
flowchart TD
    A[ToolCall] --> B[ensureDiscoveryFirst]
    B --> C[validateToolCall]
    C --> D{isMutationTool?}
    D -- no --> E[Execute Tool Handler]
    D -- yes --> F[Capture Missing Baselines]
    F --> G[createSnapshot pre mutation]
    G --> H[SAVE_SNAPSHOT]
    H --> E
    E --> I{Result ok?}
    I -- yes --> J[Return ToolResult ok]
    I -- no --> K[REQUEST_RESTORE snapshotId]
```

## 5) State and DOM Mutation Interaction

```mermaid
flowchart LR
    A[Tool Handler] --> B[dispatch AgentAction]
    B --> C[agent-reducer.ts]
    C --> D[AgentState]

    D --> E[pendingMutations]
    E --> F[MutationEngine]
    F --> G[query target via registry selector]
    G --> H[applyMutationToElement]
    H --> I[runLayoutHealthCheck]
    I -->|fail| J[restoreRequest]
    J --> K[Apply snapshot baselines]
    I -->|pass| L[MARK_MUTATION_APPLIED]
```

## 6) Registry-Driven Discovery and Targeting

```mermaid
flowchart TD
    A[sectionRegistry.ts] --> C[registry/index.ts]
    B[targetRegistry.ts] --> C
    C --> D[discovery-engine.ts]
    C --> E[mutation-validator.ts]
    C --> F[tools/dispatcher.ts]
    C --> G[dom/mutation-engine.tsx]
    C --> H[dom/layout-health.ts]
```

## 7) Agent Feature Flags

```mermaid
flowchart TD
    A[NEXT_PUBLIC_AGENT_ENABLED] --> B[core/config.ts AGENT_ENABLED]
    B --> C[AgentProvider gate]
    B --> D[AgentRuntimeBridge gate]
    B --> E[AgentPanel gate]

    F[NEXT_PUBLIC_AGENT_REFLECTION_ENABLED] --> G[reflectionEnabled in state]
    G --> H[runAgentRuntime loop count]
```

## 8) React Rendering Control (Section Order + Visibility)

```mermaid
flowchart TD
    A[tool-impl-layout.ts reorder/toggle] --> B[dispatch SET_SECTION_ORDER / SET_SECTION_VISIBILITY]
    B --> C[agent-reducer strict invariants]
    C --> D[state.sectionOrder + state.visibleSections]
    D --> E[app/page.tsx maps render order]
    E --> F[React renders sections]
```

## 9) Module Map

- UI + integration: `app/layout.tsx`, `app/page.tsx`, `lib/agent/components/AgentPanel.tsx`
- Provider + state: `lib/agent/components/AgentProvider.tsx`, `lib/agent/state/agent-context.tsx`, `lib/agent/state/agent-reducer.ts`
- Runtime: `lib/agent/runtime/agent-runtime.ts`, `lib/agent/runtime/reflector.ts`
- Planning: `lib/agent/runtime/planner-client.ts`, `app/api/agent/route.ts`, `lib/agent/runtime/local-planner.ts`, `lib/agent/runtime/planner-schema.ts`
- Discovery + registry: `lib/agent/discovery/discovery-engine.ts`, `lib/agent/registry/*`
- Validation + tools: `lib/agent/validation/mutation-validator.ts`, `lib/agent/tools/*`
- DOM + snapshots: `lib/agent/dom/mutation-engine.tsx`, `lib/agent/dom/layout-health.ts`, `lib/agent/snapshots/snapshot-manager.ts`
- Config: `lib/agent/core/config.ts`, `lib/agent/core/constants.ts`
