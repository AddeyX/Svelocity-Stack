# Repository Architecture

How the monorepo is laid out, which package owns what, and the recipes for extending
it without breaking the boundaries.

## The shape

Three thin platform shells consume one shared core:

```text
apps/                          ── thin shells: routing + composition only
  web/        SvelteKit + adapter-cloudflare
  desktop/    Electron (main/preload) + Vite Svelte SPA renderer
  mobile/     Capacitor (iOS/Android) + Vite Svelte SPA

packages/                      ── the shared core
  backend/    Convex schema, functions, generated api    (@svelocity/backend)
  app-core/   domain types, validation, pure logic       (@svelocity/app-core)
  auth/       Convex Auth client state + route guards    (@svelocity/auth)
  ui/         shared components (Bits UI wrappers)       (@svelocity/ui)
  theme/      --sv-* design tokens + platform overrides  (@svelocity/theme)
  env/        typed env parsing (zod)                    (@svelocity/env)
  config/     tsconfig / eslint / prettier / vite presets(@svelocity/config)
  create-svelocity/  the CLI (create / doctor / info)
```

## Dependency direction

Dependencies point one way — apps import packages, never the reverse, and apps never
import each other:

```text
apps/web ─┐
apps/desktop ─┼──▶ ui ──▶ theme
apps/mobile ─┘    │
      │           └──▶ app-core
      ├──▶ auth ──▶ backend (generated api types)
      ├──▶ backend
      ├──▶ env
      └──▶ theme

backend ──▶ app-core   (shared validation, e.g. taskTitleSchema)
```

Rules (enforced by review + the `svelocity-alignment-audit` skill):

1. Business logic lives in `packages/app-core`, never in apps.
2. Shared UI lives in `packages/ui` — never duplicated per app.
3. Apps are thin shells: routing, platform APIs, composition.
4. No cross-app imports; no package imports from apps.

## What goes where

| You're adding…                              | It goes in…                                      |
| ------------------------------------------- | ------------------------------------------------ |
| A database table, query, or mutation        | `packages/backend/convex/`                       |
| Validation, domain types, pure functions    | `packages/app-core/src/`                         |
| A reusable component                        | `packages/ui/src/components/`                    |
| A color, spacing, or typography value       | `packages/theme/src/tokens.css`                  |
| A new client env variable                   | `packages/env/src/index.ts` + app `.env.example` |
| A page/route (web)                          | `apps/web/src/routes/`                           |
| A view (desktop/mobile SPA)                 | `apps/<shell>/src/views/`                        |
| Anything Electron-privileged (fs, shell, …) | `apps/desktop/electron/` via audited IPC         |
| A native mobile capability                  | Capacitor plugin in `apps/mobile`                |

When in doubt: logic goes to `app-core`.

## Shared UI consumption

`@svelocity/ui` and the other Svelte packages are consumed as **source packages**
(ADR [0004](../adr/0004-shared-ui-consumption.md)): the app's own Vite pipeline
compiles the `.svelte` files, so there is no build step, no versioning drift, and
HMR works across package boundaries. The cost: every app needs
`@sveltejs/vite-plugin-svelte`, which they all get from `@svelocity/config` presets.

Each shell imports the base tokens plus exactly one platform override in its root
layout/entry:

```ts
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/web.css'; // or desktop.css / mobile.css
```

## app-core ownership

`@svelocity/app-core` is framework-free TypeScript: no Svelte imports, no SvelteKit,
no DOM. It owns the task domain (`taskTitleSchema`, `validateTaskTitle`, `sortTasks`,
`openCount`) and the `Platform` type. The backend imports the same schemas so client
and server enforce identical rules — one source of truth for "what is a valid task
title".

## Platform shell responsibilities

| Shell   | Owns                                                                     |
| ------- | ------------------------------------------------------------------------ |
| web     | SvelteKit routing, `hooks.server.ts` security headers, Cloudflare deploy |
| desktop | Electron main/preload, IPC surface, window security, packaging           |
| mobile  | Capacitor config, safe areas, Android back button, native plugin wiring  |

All three do the same three jobs in their root layout/App: parse env
(`parseClientEnv`), set up the Convex client (`setupConvex`), and create auth state
(`createAuthState` + route guards). Everything else comes from packages.

## `.svelocity/manifest.json`

The manifest records what the CLI generated — stack version, targets, UI/auth/backend
choices, and bundled skills:

```json
{
	"stackVersion": "0.1.0",
	"targets": ["web", "desktop", "mobile"],
	"ui": "bits-ui",
	"auth": "convex-auth",
	"backend": "convex",
	"aiTargets": ["agents-md", "cursor-rules"],
	"skills": ["svelocity-convex", "svelocity-auth", "..."]
}
```

Tools read it instead of guessing: `svelocity doctor`/`info` use it to know which
targets to check, and agent skills use it to know what exists. Keep it in sync when
you add/remove a platform (`pnpm validate:manifest` checks it against the schema in
`.svelocity/manifest.schema.json`).

## Recipe: add a shared component

1. Create `packages/ui/src/components/<Name>.svelte` — wrap the Bits UI primitive,
   style with `var(--sv-*)` semantic tokens only (no hex, no palette primitives).
2. Export it from `packages/ui/src/index.ts`.
3. Add a spec file next to it and register it in the preview sandbox
   (`pnpm --filter @svelocity/ui dev` on :5199).
4. Consume from any app: `import { Name } from '@svelocity/ui'`.

Details and conventions: [UI guide](ui.md) and `packages/ui/README.md`.

## Recipe: add a Convex function

1. Define/extend the table in `packages/backend/convex/schema.ts` (add indexes for
   every access path).
2. Add the query/mutation in a `packages/backend/convex/<domain>.ts` file — derive
   the user with `getAuthUserId`, validate with schemas from `@svelocity/app-core`.
3. `pnpm --filter @svelocity/backend gen` to refresh `convex/_generated` (committed).
4. Call it from any shell via the generated api:
   `useQuery(api.<domain>.<fn>, () => ({...}))` or `client.mutation(...)`.

Details: [Convex guide](convex.md) or the `svelocity-convex` skill.

## Related

- ADRs: [Bits UI](../adr/0001-bits-ui-over-shadcn.md) ·
  [Convex Auth](../adr/0002-convex-auth-over-better-auth.md) ·
  [package boundaries](../adr/0003-monorepo-package-boundaries.md) ·
  [UI consumption](../adr/0004-shared-ui-consumption.md) ·
  [thin CLI](../adr/0005-thin-cli-scope.md) ·
  [AI assets](../adr/0006-ai-instructions-as-assets.md)
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — naming, file layout, import aliases
