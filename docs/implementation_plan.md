# Web Agent Monorepo — Full Refactoring Plan

Build a god-mode AI chatbot as a standalone plugin library, replacing the existing over-abstracted, OpenAI-based, React-coupled agent with a powerful Anthropic-powered web agent that directly manipulates the DOM.

## User Review Required

> [!IMPORTANT]
> **API Key**: The current [.env.local](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/.env.local) has an OpenAI key. You'll need to add `ANTHROPIC_API_KEY` for the Anthropic SDK. The API calls will be proxied through a Next.js API route (server-side only, key never exposed to client).

> [!WARNING]
> **Breaking changes**: The entire `lib/agent/` directory (39 files), `components/AgentLoader.tsx`, and `app/api/agent/route.ts` will be deleted and replaced with the new system. The existing agent UI, tools, state management, and planner are all being discarded.

> [!CAUTION]
> **No guardrails by design**: The new agent will have unrestricted DOM manipulation. It can inject arbitrary HTML, modify any element, fill forms, click buttons, and generate full components. This is intentional per requirements.

---

## Proposed Changes

### Monorepo Structure

```
portfolio-next/
├── pnpm-workspace.yaml
├── package.json              (root workspace config)
├── packages/
│   ├── web-agent/            (framework-agnostic TS library)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── agent.ts           (createWebAgent factory)
│   │       ├── context.ts         (browser context reader)
│   │       ├── tools/
│   │       │   ├── definitions.ts (Anthropic tool schemas)
│   │       │   └── executors.ts   (DOM manipulation executors)
│   │       ├── bridge.ts          (WebAgentBridge interface)
│   │       └── system-prompt.ts
│   └── chatbot-ui/           (React chat component)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── WebAgentChat.tsx
│           ├── WebAgentChat.module.css
│           ├── MessageList.tsx
│           ├── ActionLog.tsx
│           └── hooks.ts
└── apps/
    └── next-demo/            (existing portfolio, refactored)
        ├── (all existing app/, components/, hooks/, etc.)
        ├── app/api/agent/chat/route.ts  (NEW — Anthropic proxy)
        └── lib/web-agent-bridge.ts      (NEW — bridge setup)
```

---

### Package: `web-agent` (Core Library)

#### [NEW] [package.json](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/package.json)
- Name: `@anthropic-ai/web-agent` (or scoped to your org)
- TypeScript, `"type": "module"`, exports `./src/index.ts`
- Dependency: `@anthropic-ai/sdk`

#### [NEW] [types.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/types.ts)
- `WebAgentConfig`, `BrowserContext`, `AgentChunk`, `AgentAction`, `ToolName`
- `WebAgentBridge` interface (getState, setState, getComponents, triggerAction)

#### [NEW] [context.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/context.ts)
- `getBrowserContext()` — reads full DOM snapshot, URL, title, viewport, scroll position, forms, buttons, meta tags, `data-*` attributes
- `getPageData()` — structured extraction of headings, tables, lists
- `getStorageData()` — localStorage, sessionStorage, cookies

#### [NEW] [tools/definitions.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/tools/definitions.ts)
All 16 tools as Anthropic `tool_use` schemas:
| Tool | Purpose |
|------|---------|
| `read_dom` | Full/partial DOM snapshot |
| `query_element` | querySelector with context |
| `mutate_element` | Change text, classes, styles, attributes |
| `inject_html` | Inject arbitrary HTML at selector |
| `generate_and_inject` | AI generates component code + injects it |
| `navigate` | Change route/URL |
| `click_element` | Programmatic click |
| `fill_form` | Fill inputs by label/placeholder/selector |
| `get_storage` | Read localStorage/sessionStorage |
| `set_storage` | Write to storage |
| `get_page_data` | Structured data extraction |
| `apply_theme` | Bulk CSS variable / class changes |
| `highlight_element` | Visually highlight elements |
| `scroll_to` | Scroll to selector or position |
| `emit_event` | Dispatch custom DOM events |
| `execute_bridge` | Call bridge methods (React state) |

#### [NEW] [tools/executors.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/tools/executors.ts)
- Direct DOM manipulation — `querySelector`, `innerHTML`, `style`, `classList`, `click()`, form field value setting
- No CSS whitelist, no target validation guardrails
- HTML injection via `insertAdjacentHTML` / creating elements
- Theme application via CSS custom properties on `:root`
- Element highlighting via overlay divs with transitions
- Smooth scrolling via `scrollIntoView`

#### [NEW] [agent.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/agent.ts)
- `createWebAgent(config)` — returns `WebAgent` object
- **Chat flow**: sends user message + browser context to server endpoint, receives streaming response with tool_use blocks
- Tool execution happens client-side in the browser
- Agentic loop: message → tool_use → execute tool → tool_result → continue until done
- `agent.chat()` returns `AsyncIterable<AgentChunk>` for streaming
- `agent.execute()` for direct action execution
- `agent.getContext()` for current browser state
- `agent.on('action', cb)` for action events
- `agent.destroy()` cleanup

#### [NEW] [system-prompt.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/web-agent/src/system-prompt.ts)
The unrestricted system prompt, emphasizing capability and directness.

---

### Package: `chatbot-ui` (React Component)

#### [NEW] [WebAgentChat.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/WebAgentChat.tsx)
- Floating bubble (bottom-right default) or embedded panel mode
- Click bubble → expands to chat panel with message input
- Renders streaming responses character by character
- Shows action indicators ("Changing header color...", "Reading page...", "Generating calculator widget...", "Injecting into hero section...")
- Markdown rendering for AI responses
- Dark/light mode via CSS variables
- Collapsible action log panel

#### [NEW] [WebAgentChat.module.css](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/packages/chatbot-ui/src/WebAgentChat.module.css)
- Premium glassmorphism design, smooth animations
- Chat bubble with pulse animation
- Message bubbles with proper styling

---

### App: `next-demo` (Refactored Portfolio)

#### [NEW] [route.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/apps/next-demo/app/api/agent/chat/route.ts)
- Anthropic API proxy (POST endpoint)
- Receives messages + tool results from client
- Streams Anthropic response back to client
- Uses `ANTHROPIC_API_KEY` from server env (never exposed)

#### [NEW] [web-agent-bridge.ts](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/apps/next-demo/lib/web-agent-bridge.ts)
- Sets up `window.__webAgentBridge`
- Registers controllable React state (theme, section order, visibility)
- Exposes `getState`, `setState`, `getComponents`, `triggerAction`

#### [MODIFY] [layout.tsx](file:///c:/Aman/Coding-Bamzii/Web%20Development/portfolio-next/apps/next-demo/app/layout.tsx)
- Remove `AgentLoader` import
- Add `<WebAgentChat agent={agent} />` component
- Add bridge initialization

#### [DELETE] Existing agent code
| Path | Reason |
|------|--------|
| `lib/agent/` (entire directory, 39 files) | Over-abstracted, React-coupled, OpenAI-based |
| `components/AgentLoader.tsx` | Replaced by direct `<WebAgentChat>` usage |
| `app/api/agent/route.ts` | Replaced by new Anthropic proxy route |

---

## Architecture Key Decisions

1. **Client-side tool execution**: The Anthropic API is called server-side (for key security), but tool execution happens in the browser. The flow:
   - Client sends message → API proxy → Anthropic → streaming response with tool_use
   - Client receives tool_use, executes it in DOM, sends tool_result back
   - Loop continues until Anthropic sends a final text response

2. **No monorepo migration of existing files**: The existing portfolio code stays in place. We create `packages/` alongside it and update `package.json` to a workspace root. The demo app IS the existing app — we don't move files, just add the new packages and wire them in.

3. **Framework-agnostic core**: `web-agent` has zero React dependency. It works with vanilla DOM APIs. The bridge (`window.__webAgentBridge`) is the optional hook for React apps.

---

## Verification Plan

### Build Verification
```bash
cd c:\Aman\Coding-Bamzii\Web Development\portfolio-next
pnpm install
pnpm -r build   # builds all packages
pnpm dev         # starts next-demo dev server
```

### Browser Tests (using browser tool)
1. **Load page**: Navigate to `localhost:3000`, verify chatbot bubble appears in bottom-right
2. **Open chat**: Click bubble, verify chat panel opens with input field
3. **DOM reading test**: Type "what's on this page" → verify AI responds with actual page content
4. **DOM mutation test**: Type "change the background to red" → verify `document.body` background changes
5. **HTML injection test**: Type "add a calculator in the center" → verify a working calculator widget is injected into the DOM

### Manual Verification (User)
1. After dev server starts, verify the chatbot bubble is visible on the portfolio site
2. Try typing various commands and confirm the agent executes them
3. Verify streaming works (characters appear one by one, not all at once)
4. Verify action log shows what tools the agent is using
