# Agent Sandbox Runtime -- Review & Improvements

This document reviews the current Codex-generated implementation and
highlights architectural risks, improvements, and recommended
refinements.

------------------------------------------------------------------------

# ✅ What Is Good

-   Clean separation under `lib/agent/`
-   Registry-driven discovery (no uncontrolled DOM crawling)
-   Transactional snapshot before mutation
-   Reflection loop cap
-   Planner schema validation
-   Layout health check
-   Tool dispatcher abstraction
-   Session persistence
-   Fallback planner
-   Strict CSS whitelist

This is already well above typical portfolio AI integrations.

------------------------------------------------------------------------

# ⚠️ Critical Improvements Required

## 1️⃣ Snapshot Strategy Is Not Fully Transactional

### Problem

Snapshots are created before mutation tools, but:

-   Snapshot baselines are shallow-copied (`{ ...state.baselines }`)
-   No deep cloning
-   UI + baseline state can drift
-   Nested object mutation risk exists

### Fix

Use `structuredClone` or deep clone for:

-   baselines\
-   sectionOrder\
-   visibleSections

Snapshot must be immutable and isolated.

------------------------------------------------------------------------

## 2️⃣ Baseline Capture Timing Issue

Baseline is captured on first mutation of target.

### Problem

If multiple mutations occur quickly before baseline commit,\
baseline may reflect already-mutated DOM.

### Fix

Baseline must be captured from pre-transaction snapshot, not live DOM
state after mutation enqueue.

Better approach:

Capture baseline during snapshot creation, not inside `MutationEngine`.

------------------------------------------------------------------------

## 3️⃣ Section Order Logic Risk in page.tsx

``` ts
const orderedSectionKeys = Array.from(new Set([...]))
```

This silently allows:

-   Partial order arrays\
-   Unexpected fallback ordering\
-   Implicit deduplication

### Better Approach

Validate order in reducer before committing.

Reducer should enforce:

-   Every `SECTION_KEYS` appears exactly once\
-   No unknown IDs\
-   No silent fallback logic

Move strict validation to reducer layer.

------------------------------------------------------------------------

## 4️⃣ Layout Health Check Is Too Minimal

Currently checks:

-   `#portfolio-main` exists\
-   At least one visible section

### Missing

-   Zero height layout collapse detection\
-   Canvas overlay dominance\
-   Detached navbar/footer\
-   DOM detach anomalies

Add stronger structural health rules.

------------------------------------------------------------------------

## 5️⃣ Planner API Uses Chat Completion Instead of Agents API

Currently using:

``` ts
client.chat.completions.create()
```

This does NOT use OpenAI Agent capabilities.

If you want:

-   Planning\
-   Structured tool chaining\
-   Full agent reasoning\
-   Long-term memory potential

You should use:

``` ts
client.responses.create()
```

Or OpenAI Agents SDK features.

Current implementation is function-calling LLM, not agent runtime.

------------------------------------------------------------------------

## 6️⃣ Reflection Logic Is Too Naive

`reflectGoalCompletion` is keyword-based.

This:

-   Does not reflect actual planner result\
-   Does not compare pre/post mutation diff\
-   Always returns true in fallback case

### Better Approach

Compare discovery snapshots structurally:

-   Theme change verified\
-   Section visibility changed\
-   Order changed

Reflection should inspect real structural diff.

------------------------------------------------------------------------

## 7️⃣ Duplicate State Mutation Logic

Section visibility is:

-   Updated in reducer\
-   Also mutated via `MutationEngine`

This dual mutation source can drift.

### Better Approach

State drives DOM.\
`MutationEngine` should not infer visibility logic.\
It should only apply what reducer says.

Single source of truth.

------------------------------------------------------------------------

## 8️⃣ Snapshot Restore Does Not Clear Mutations Queue Properly

After restore:

    pendingMutations: []
    appliedMutationIds: []

But:

-   Logs not cleared\
-   Reflections not reset\
-   Stop flags may persist

Restore should reset runtime execution state cleanly.

------------------------------------------------------------------------

## 9️⃣ Session Persistence Stores Too Much

Currently persisting:

-   baselines\
-   snapshots\
-   logs\
-   discovery

This can:

-   Blow sessionStorage size\
-   Create stale DOM references\
-   Restore invalid snapshot across layout changes

### Better Approach

Persist only:

-   theme\
-   layoutMode\
-   sectionOrder\
-   visibleSections

Snapshots should be runtime-only.

------------------------------------------------------------------------

## 🔟 Missing Strict Tool Execution Budget

Currently:

-   Planner can return many steps\
-   No max tool call limit per iteration

Add:

    MAX_TOOL_CALLS_PER_ITERATION = 10

Guard inside runtime loop.

------------------------------------------------------------------------

# 🧠 Architectural Improvement Suggestions

## 🔹 Use OpenAI SDK Properly

Switch to:

``` ts
client.responses.create({
  model,
  input,
  tools,
})
```

Or Agents SDK for structured orchestration.

------------------------------------------------------------------------

## 🔹 Add Risk Scoring Layer

Before executing mutation:

-   Evaluate risk level\
-   High risk → require confirmation\
-   Low risk → auto execute

This upgrades sandbox intelligence.

------------------------------------------------------------------------

## 🔹 Separate Runtime Modes

Add:

``` ts
mode: "safe" | "experimental"
```

Safe Mode:

-   No layout mutations\
-   No reorder\
-   No text override

Experimental Mode:

-   Full sandbox

------------------------------------------------------------------------

## 🔹 Add Diff Engine for Reflection

Instead of keyword matching:

-   Compare discovery snapshot before and after\
-   Detect structural change\
-   Mark goal achieved only if delta exists

------------------------------------------------------------------------

## 🔹 Improve Mutation Queueing

Right now mutations execute immediately.

Better:

-   Batch mutations\
-   Apply inside single `requestAnimationFrame`\
-   Avoid layout thrashing

------------------------------------------------------------------------

# 🟡 Minor Improvements

-   Add debounce for planner call\
-   Add execution timeout guard\
-   Add concurrency lock for tool dispatcher\
-   Add tool execution tracing ID\
-   Add error boundary around MutationEngine

------------------------------------------------------------------------

# 🔒 Security Observations

### Good

-   CSS whitelist enforced\
-   innerHTML blocked\
-   Script injection blocked\
-   Registry-only target control

### Needs Improvement

-   `updateText` still allows HTML entities injection if someone
    bypasses tool validation\
-   Sanitize text more strictly

------------------------------------------------------------------------

# 🏁 Final Evaluation

This is:

**8.5 / 10 sandbox architecture**

It is far above average AI integration.

But still:

-   Not fully transactional\
-   Not true OpenAI Agent usage\
-   Reflection too weak\
-   Snapshot isolation not perfect\
-   Persistence too aggressive

------------------------------------------------------------------------

# 📌 Recommended Priority Fix Order

1.  Fix snapshot immutability\
2.  Strengthen reducer validation\
3.  Improve reflection logic\
4.  Switch to OpenAI responses/agents API\
5.  Reduce session persistence\
6.  Add execution guardrails
