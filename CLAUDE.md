# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (extends next/core-web-vitals)
```

There are no test scripts in this project.

## Architecture Overview

This is a Next.js 14 (App Router) personal portfolio site with an integrated AI web agent.

### Key Architectural Patterns

**Section-driven page layout** — `app/page.tsx` renders sections from a config. `lib/sections.ts` defines `SECTION_KEYS` (`intro`, `about`, `footer`) and `DEFAULT_SECTION_CONFIG` with `sectionOrder` and `visibleSections`. To add a new section, register its key there and add it to the `sectionRenderMap` in `page.tsx`.

**Client-only dynamic imports** — WebGL (`DisplacementSphere`) and the web agent chat panel are loaded with `next/dynamic` and `ssr: false` to avoid server-side rendering issues. The `withThemeRerender` HOC force-remounts WebGL components on theme changes by using `resolvedTheme` as the React `key`.

**Web Agent system** — A multi-layer AI agent stack:
- `packages/web-agent/` — Local package (`@anthropic-ai/web-agent`): `createWebAgent()` runs an agentic loop (fetch → tool execution → loop) with tools defined in `src/tools/definitions.ts` and executed client-side in `src/tools/executors.ts`.
- `packages/chatbot-ui/` — Local package (`@anthropic-ai/chatbot-ui`): Renders `<WebAgentChat>` as a floating bubble/panel UI.
- `lib/web-agent-bridge.ts` — `useWebAgentBridge()` hook sets up `window.__webAgentBridge` exposing React state (theme, URL, registered components) to the agent.
- `components/WebAgentProvider.tsx` — Dynamically loaded in `app/layout.tsx` with `ssr: false`; wires the bridge and agent together.
- `app/api/agent/chat/route.ts` — Server-side proxy to Anthropic API. Requires `ANTHROPIC_API_KEY` env var.

**All portfolio content** lives in `utils/config.ts`: navigation routes, animated text, personal info, skills array, experiences, projects, and contact data.

**Fonts** — Custom local Gotham (book/medium) + Google Fonts (Inter, Montserrat, Raleway, Quantico, Tiro Devanagari Hindi) — all configured in `utils/fonts.ts`.

**Path alias** — `@/` maps to the project root (configured in tsconfig).

### Directory Structure

```
app/
  layout.tsx          # Root layout: providers, Navbar, NavIcons, WebAgentProvider
  page.tsx            # Home page; section ordering via DEFAULT_SECTION_CONFIG
  sections/           # Page sections (Intro, About) — co-located with their hooks/CSS
  api/agent/chat/     # Anthropic API proxy endpoint
components/
  ui/                 # Presentational components (DisplacementSphere, Navbar, etc.)
  wrapper/            # Layout wrappers (WebGLWrapper, MainComponent, ErrorBoundary)
  providers/          # Context providers (ThemeProvider, QueryProvider)
  hoc/                # Higher-order components (withThemeRerender)
lib/
  sections.ts         # Section config types and defaults
  web-agent-bridge.ts # React state bridge for the web agent
packages/
  web-agent/          # Local npm package: agent logic, tools, bridge
  chatbot-ui/         # Local npm package: WebAgentChat floating UI component
utils/
  config.ts           # All portfolio content/data
  fonts.ts            # Font definitions
  timing.ts           # Animation delay constants
  style.ts            # Media breakpoints
  cn.ts               # clsx + tailwind-merge utility
```

### npm Workspaces

`packages/web-agent` and `packages/chatbot-ui` are local workspace packages referenced as `"file:packages/..."` in `package.json`. They are consumed directly from TypeScript source (no build step required).

### Environment Variables

`ANTHROPIC_API_KEY` — Required for the agent chat endpoint at `/api/agent/chat`.
