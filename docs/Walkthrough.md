# Web Agent Refactoring — Walkthrough

## What was Done

Refactored the existing over-abstracted, OpenAI-based agent system into a powerful, framework-agnostic web agent monorepo with Anthropic-powered AI.

### Deleted (39+ files)
- Entire `lib/agent/` directory — discovery engine, mutation engine, validators, snapshot manager, tool implementations, React state management, planners, reflectors
- [components/AgentLoader.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/components/AgentLoader.tsx) — old dynamic agent loader
- [app/api/agent/route.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/app/api/agent/route.ts) — old OpenAI API route

### Created

#### `packages/web-agent/` (8 files) — Framework-Agnostic Agent Library
| File | Purpose |
|------|---------|
| [types.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/types.ts) | Core types: WebAgent, BrowserContext, AgentChunk, 16 ToolNames |
| [context.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/context.ts) | DOM snapshot reader, forms, meta tags, page data extraction |
| [system-prompt.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/system-prompt.ts) | Unrestricted system prompt grounded in live browser context |
| [tools/definitions.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/tools/definitions.ts) | 16 Anthropic tool_use schemas |
| [tools/executors.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/tools/executors.ts) | Direct DOM manipulation — no guardrails |
| [agent.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/agent.ts) | `createWebAgent()` factory with agentic loop + streaming |
| [bridge.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/bridge.ts) | `window.__webAgentBridge` setup utilities |
| [index.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/index.ts) | Package entry point |

#### `packages/chatbot-ui/` (4 files) — React Chat Component
| File | Purpose |
|------|---------|
| [WebAgentChat.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/WebAgentChat.tsx) | Floating bubble + chat panel with streaming, action log, markdown |
| [WebAgentChat.module.css](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/WebAgentChat.module.css) | Premium glassmorphism styling, dark/light themes |
| [css.d.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/css.d.ts) | CSS module type declarations |
| [index.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/index.ts) | Package entry point |

#### Next.js Integration (3 files)
| File | Purpose |
|------|---------|
| [app/api/agent/chat/route.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/app/api/agent/chat/route.ts) | Anthropic API proxy (server-side) |
| [lib/web-agent-bridge.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/lib/web-agent-bridge.ts) | React bridge hook for `window.__webAgentBridge` |
| [components/WebAgentProvider.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/components/WebAgentProvider.tsx) | Client component that creates agent + renders chatbot |

#### Modified Files
| File | Change |
|------|--------|
| [layout.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/app/layout.tsx) | Replaced `AgentLoader` with `WebAgentProvider` |
| [package.json](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/package.json) | Added workspaces, `@anthropic-ai/sdk`, removed `openai` |
| [.env.local](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/.env.local) | Swapped `OPENAI_API_KEY` for `ANTHROPIC_API_KEY` |

---

## 16 Agent Tools

| # | Tool | What it does |
|---|------|--------------|
| 1 | `read_dom` | Full/partial DOM snapshot |
| 2 | `query_element` | Element info with computed styles and rect |
| 3 | `mutate_element` | Change text, HTML, classes, styles, attributes, visibility |
| 4 | `inject_html` | Insert HTML at any position relative to any element |
| 5 | `generate_and_inject` | Generate full HTML/CSS/JS components and inject them |
| 6 | `navigate` | Change URL/route |
| 7 | `click_element` | Programmatic click |
| 8 | `fill_form` | Fill inputs with React-compatible value setters |
| 9 | `get_storage` | Read localStorage/sessionStorage |
| 10 | `set_storage` | Write to storage |
| 11 | `get_page_data` | Extract headings, links, buttons, images |
| 12 | `apply_theme` | Bulk CSS variable + class changes |
| 13 | `highlight_element` | Visual overlay highlight with auto-remove |
| 14 | `scroll_to` | Smooth scroll to element or position |
| 15 | `emit_event` | Custom DOM event dispatch |
| 16 | `execute_bridge` | React state get/set via framework bridge |

---

## Build Result

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (8/8)

Route (app)                        Size     First Load JS
┌ ○ /                              12.9 kB  285 kB
├ ○ /_not-found                    139 B    88 kB
├ λ /api                           0 B      0 B
├ λ /api/agent/chat                0 B      0 B
└ ○ /manifest.json                 0 B      0 B
```

## To test

1. Add your Anthropic API key to `.env.local`
2. Run `npm run dev`
3. Open `localhost:3000` — chatbot bubble appears bottom-right
4. Click the bubble, type commands like:
   - "what's on this page?"
   - "change the background to dark red"
   - "add a calculator in the center"
