# Web Agent Monorepo Refactoring

## Phase 1: Project Setup
- [x] Set up pnpm workspace monorepo structure (used npm workspaces — pnpm not installed)
- [x] Create `packages/web-agent/` package scaffolding
- [x] Create `packages/chatbot-ui/` package scaffolding
- [x] Configure `tsconfig.json` files (strict mode)
- [x] Install dependencies: `@anthropic-ai/sdk`, remove `openai`

## Phase 2: `@anthropic-ai/sdk` web-agent Library
- [x] Core types & config (`types.ts`)
- [x] Browser context reader (`context.ts`) — DOM snapshot, URL, storage, viewport
- [x] Tool definitions for Anthropic `tool_use` (16 tools)
- [x] Tool executors — direct DOM manipulation (no guardrails)
- [x] `createWebAgent()` factory function with streaming chat via Anthropic
- [x] Agent system prompt (powerful, unrestricted)
- [x] `WebAgentBridge` interface for React/Next.js bridge
- [x] Package entry point (`index.ts`)

## Phase 3: `chatbot-ui` React Component
- [x] `<WebAgentChat>` component with floating bubble / panel mode
- [x] Streaming message display (character by character)
- [x] Action log / transparency panel (collapsible)
- [x] Markdown rendering in responses
- [x] Dark/light mode support
- [x] CSS Module styling (premium glassmorphism look)
- [x] Package entry point (`index.ts`)

## Phase 4: Next.js App Integration
- [x] Create API proxy route for Anthropic calls (`/api/agent/chat`)
- [x] Wire up `window.__webAgentBridge` with React state hooks
- [x] Install `<WebAgentChat>` in layout via `WebAgentProvider`
- [x] Delete old agent code (`lib/agent/`, `components/AgentLoader.tsx`, `app/api/agent/route.ts`)
- [x] Update `.env.local` for Anthropic key

## Phase 5: Verification
- [x] Build all packages successfully (✅ Compiled successfully)
- [ ] Start dev server and verify chatbot loads
- [ ] Browser test: "change the background to red"
- [ ] Browser test: "what's on this page"
