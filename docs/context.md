# Portfolio Project Context (Non-Agent)

This document describes the current portfolio application architecture and technical context.

## 1) Project Overview

- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode)
- Runtime: React 18
- Styling: Tailwind CSS + CSS Modules + NextUI components
- Motion/UI polish: Framer Motion
- 3D visuals: Three.js + `@react-three/fiber` + `@react-three/drei`
- Theme system: `next-themes` (class-based, default dark)
- Data utilities: React Query provider is wired globally
- Deployment target: Vercel (as indicated by analytics/speed-insights usage)

Core purpose:

- Serve a personal portfolio site with animated intro, about section, navigation, themed UI, and supporting visual effects.

## 2) High-Level App Structure

Key app entry files:

- `app/layout.tsx`: global providers, navbar, nav icons, toaster, shared wrappers.
- `app/page.tsx`: homepage composition and section rendering.
- `app/globals.css`: global styles/tokens.
- Error/loading routes:
- `app/error.tsx`
- `app/global-error.tsx`
- `app/loading.tsx`
- `app/not-found.tsx`

Main homepage sections currently rendered:

- Intro (`app/sections/Intro/Intro.tsx`)
- About (`app/sections/About/About.tsx`)
- Footer (`components/ui/Footer/Footer.tsx`)

## 3) Rendering and Composition Flow

`app/layout.tsx` composes:

1. `ErrorBoundary`
2. `ThemeProvider` (`components/providers/ThemeProvider.tsx`)
3. `NextUIProvider`
4. Global UI:
    - `Navbar`
    - `NavIcons`
    - `UIHelpers`
    - `Toaster`
5. `QueryProvider` wrapping page content

`app/page.tsx` composes homepage content:

1. Theme-aware 3D sphere background (`DisplacementSphere`, client-only dynamic import).
2. Grid background wrapper (`GridBackgroudLayout`).
3. Main content wrapper (`MainComponent`) with section sequence:

- Intro + scroll-down cue
- About
- Footer

## 4) UI System and Styling

Styling layers:

- Tailwind utilities (`tailwind.config.ts`, `app/globals.css`).
- Component-scoped CSS Modules (e.g. `About.module.css`, `Footer.module.css`).
- Targeted plain CSS files for specific effects (`Intro.css`, `ScramblingText.css`).

Tailwind configuration:

- Dark mode via class strategy.
- NextUI plugin enabled.
- `tailwindcss-animate` enabled.
- Custom background utility generators (`bg-grid`, `bg-grid-small`, `bg-dot`).
- Root color CSS variables auto-generated via plugin helper.

Reusable UI components include:

- `StyledButton`, `StyledLink`, `SectionHeading`, `ThemeSwitch`, `ScrollDown`, `ScrollIndicator`, icon set components, etc.

## 5) Motion and Visual Effects

Animation stack:

- Framer Motion used in multiple UI areas (example: navbar entrance animation).
- Intro text effects:
- Decoder text (`components/ui/DecoderText`)
- Scrambling text (`components/ui/ScramblingText`)
- Scroll cues and transitions (`ScrollDown`, `ScrollUpButton`, indicators)

3D/WebGL stack:

- `components/ui/DisplacementSphere/DisplacementSphere.tsx`
- Wrapped under `WebGLWrapper` and error-boundary protection.
- Theme-aware rerender HOC: `components/hoc/withThemeRerender.tsx`.

## 6) Content and Configuration Sources

Primary content/config lives in:

- `utils/config.ts`

Contains:

- Navigation/hash route metadata
- Intro animated titles
- Profile texts (short/long descriptions)
- Social links
- Skills list
- Experience/project datasets (available for current/future section usage)

Other utility modules:

- `utils/timing.ts` for animation delays/durations.
- `utils/fonts.ts` for font definitions.
- `utils/cn.ts` for className merging.
- `utils/types.ts` shared type aliases.

## 7) State and Data Patterns

Current state patterns:

- Local component state for UI interactions (e.g., About section expand/collapse).
- Theme state via `next-themes`.
- React Query client is available app-wide through `QueryProvider`, even if currently lightly used.

No centralized Redux store is present for non-agent portfolio features.

## 8) API Surface

Current non-agent route:

- `app/api/route.ts`
- `GET` returns a simple health/status JSON payload.

This can be used as a baseline connectivity/health endpoint.

## 9) Tooling and Build Configuration

Build/dev scripts (`package.json`):

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

TypeScript (`tsconfig.json`):

- `strict: true`
- path alias `@/* -> ./*`
- `moduleResolution: bundler`
- Next.js plugin enabled

Next config:

- `next.config.mjs` currently minimal/default.

## 10) Directory Map (Portfolio-Relevant)

- `app/`: routes, layout, sections, global styles.
- `components/`:
- `ui/` visual and interactive components
- `wrapper/` structural wrappers (error boundary, layout wrappers, WebGL wrapper)
- `providers/` app-level providers
- `hoc/` cross-cutting component enhancers
- `utils/`: constants, timings, fonts, class and helper utilities.
- `public/`: static assets (images, icons, previews, documents).
- `docs/`: project documentation and plans.

## 11) Notes for Contributors

When extending portfolio UI:

1. Prefer additive section/component changes over broad refactors.
2. Keep styling consistent with existing Tailwind + CSS Module patterns.
3. Keep WebGL effects guarded by error boundaries and client-only rendering where needed.
4. Use `utils/config.ts` as the canonical content source for profile/metadata-driven UI.
5. Preserve accessibility labels and semantic structure present in existing components.
