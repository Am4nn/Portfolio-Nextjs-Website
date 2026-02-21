# 🧠 Portfolio AI Sandbox Agent – Architecture Context

## 🚀 Vision

We are building a **Level 3 Experimental Sandbox AI Agent** inside my Next.js portfolio.

This is NOT just a chatbot.

It is a browser-contained autonomous AI agent capable of:

Understand → Discover → Plan → Execute → Observe → Reflect → Repeat

The agent can mutate UI dynamically through a controlled tool system.

Goal:
Transform my portfolio into a conversational, interactive, evolving UI experience.

---

# 🏗 Current Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- API routes (serverless)
- Component-based architecture

---

# 🧠 Target System Design

We are building a mini AI runtime inside the browser.

High-Level Architecture:

User Input
    ↓
Agent Runtime
    ↓
Planner LLM
    ↓
Tool Dispatcher
    ↓
UI State Engine
    ↓
UI Mutation
    ↓
Observation Snapshot
    ↓
Reflection
    ↓
Repeat if needed

---

# 🧩 Core Design Principles

1. AI never directly manipulates DOM.
2. All mutations go through controlled tools.
3. UI state is centralized and observable.
4. Agent must discover environment before mutating.
5. Reflection loop allowed (max 3 iterations).
6. All changes must be reversible (snapshot system).

---

# 🔎 Agent Capabilities

The agent must be able to:

- Discover UI structure
- Query current theme
- Query component visibility
- Query styles of elements
- Modify styles (within whitelist)
- Toggle sections
- Reorder sections
- Replace content
- Animate components
- Control Three.js canvas
- Save and restore UI state
- Self-evaluate goal completion

---

# 🔧 Tool System (Dispatcher Layer)

All agent actions must use tools.

## 🔍 Discovery Tools

- getDOMTreeSummary()
- getComputedStyleSummary(id)
- listComponents()
- getTheme()
- getLayoutMode()

## 🎨 Visual Tools

- updateCSS(id, styleObject)
- addClass(id, className)
- removeClass(id, className)
- animate(id, animationType)
- changeTheme(themeName)

## 🧱 Layout Tools

- toggleSection(id)
- reorderSections(orderArray)
- changeLayout(mode)

## 📝 Content Tools

- updateText(id, content)
- replaceWithComponent(id, componentName)

## 🎮 Canvas Tools (Three.js)

- drawDiagram(type)
- clearCanvas()
- animateTraffic()
- changeCameraMode(mode)

## 🧠 State Control

- saveStateSnapshot()
- restoreStateSnapshot(snapshotId)

---

# 🛡 Guardrails

- No raw innerHTML injection
- No raw JS execution
- CSS whitelist:
  - color
  - background
  - font-size
  - spacing
  - transform
  - opacity
- Max 3 reflection loops
- Mutation validation layer required
- Auto-restore if layout breaks

---

# 🧠 Agent Internal Roles

We use multi-stage reasoning.

## 1️⃣ Planner

- Interprets user intent
- Breaks into steps
- Chooses tools
- Estimates risk

## 2️⃣ Executor

- Converts steps into tool calls
- Dispatches actions

## 3️⃣ Reflector

- Receives updated UI snapshot
- Checks if goal achieved
- Refines plan if needed

---

# 🧩 UI State Engine

We must introduce centralized UI state.

Suggested:
- Zustand or Reducer-based store

Example UI State:

{
  theme: "light",
  layoutMode: "default",
  visibleSections: ["hero", "projects"],
  sectionOrder: [],
  animations: [],
  canvasMode: null
}

UI reacts to state.
Agent modifies state via dispatcher.

---

# 🔥 Experimental Modes

Examples we want to support:

- "Make it cyberpunk"
- "Optimize for recruiter"
- "Break and rebuild layout"
- "Make experience more impressive"
- "Enter hacker mode"
- "Show only backend projects"
- "Turn this into AI dashboard"

---

# 🧠 Discovery Layer Design

Agent must first call discovery tools before mutating.

We will provide structured UI metadata like:

{
  components: [
    { id: "hero", type: "section", visible: true },
    { id: "experience", type: "section", visible: true },
    { id: "projects", type: "section", visible: true }
  ],
  theme: "light",
  layoutMode: "default"
}

Agent reasons from structured data, not raw DOM.

---

# 📦 Required New System Modules

We must implement:

1. AgentRuntime
2. ToolRegistry
3. Dispatcher
4. MutationValidator
5. SnapshotManager
6. UIStateStore
7. AgentPanel (optional thought display)

---

# 🎯 Implementation Plan (Phased)

## Phase 1 – Foundation

- Add centralized UI state
- Add tool registry
- Add dispatcher
- Add snapshot system
- Add basic theme & section tools

## Phase 2 – Agent Loop

- Add Planner
- Add Executor
- Add Reflection logic
- Add iteration control

## Phase 3 – Advanced Sandbox

- Canvas control
- Layout mutations
- Autonomous theme generation
- Risk scoring
- Self-healing system

---

# ❓ Open Questions To Resolve

1. Should the agent run fully client-side or hybrid?
2. Where should the agent runtime live?
   - /lib/agent
   - /core/agent
3. Should tool execution be optimistic or transactional?
4. Should mutations be animated by default?
5. Should we expose agent thoughts to user?
6. Do we persist session state across reload?

---

# 🧠 Target Outcome

We are not building a chatbot.

We are building:

A browser-contained AI agent capable of safely mutating and evolving the UI in real time.

If executed correctly, this will demonstrate:

- Advanced AI integration
- Tool orchestration
- Frontend system design
- Safe mutation architecture
- Autonomous planning loops
- Product-level thinking

# Special Notes

The system uses strict server–client separation.
Use OpenAI Agent
