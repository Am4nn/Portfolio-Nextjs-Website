# Portfolio-Next Project Memory

## Project Type
Next.js 14 (App Router) personal portfolio with an integrated AI web agent chatbot.

## Web Agent Architecture (Key Files)
- `packages/web-agent/src/agent.ts` — `createWebAgent()` factory, agentic loop (fetch→tool exec→loop), streaming via AsyncGenerator
- `packages/web-agent/src/tools/executors.ts` — 16 DOM manipulation tools, direct browser APIs, no guardrails
- `packages/web-agent/src/tools/definitions.ts` — Anthropic tool_use JSON schemas for all 16 tools
- `packages/web-agent/src/context.ts` — `getBrowserContext()` DOM snapshot for system prompt
- `packages/web-agent/src/system-prompt.ts` — Builds system prompt with injected browser context
- `packages/web-agent/src/types.ts` — Core TypeScript types
- `packages/web-agent/src/bridge.ts` — `window.__webAgentBridge` setup
- `packages/chatbot-ui/src/WebAgentChat.tsx` — Floating bubble + panel chat UI (321 lines)
- `packages/chatbot-ui/src/WebAgentChat.module.css` — Glassmorphism CSS (544 lines)
- `app/api/agent/chat/route.ts` — Anthropic API proxy (server-side, no streaming)
- `components/WebAgentProvider.tsx` — Client component initializing agent + chat UI
- `lib/web-agent-bridge.ts` — `useWebAgentBridge()` hook exposing React state to agent

## Key Known Issues
1. API route has no authentication or rate limiting (public endpoint)
2. Markdown rendering uses `dangerouslySetInnerHTML` without sanitization
3. CSS bug: top_left and top_right position variants use same inset values
4. API route is not streaming — returns full response, agent does character-by-character delay client-side
5. Model hardcoded in WebAgentProvider: 'claude-sonnet-4-20250514' (outdated ID)
6. No message persistence (chat history lost on reload)
7. No AbortController/cancellation for in-flight agentic loops

## Stack
- Next.js 14.2.15, React 18, TypeScript
- Anthropic SDK 0.39.0 (`@anthropic-ai/sdk`)
- npm workspaces (packages/web-agent, packages/chatbot-ui)
- Tailwind CSS + CSS Modules
- next-themes for dark/light mode

## User Preferences
- Wants to improve the existing agent implementation
