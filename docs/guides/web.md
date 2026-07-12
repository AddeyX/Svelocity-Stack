# Web (SvelteKit)

The web shell: SvelteKit 2 + Svelte 5 (runes), deployed to Cloudflare via
`@sveltejs/adapter-cloudflare`. Like every shell, it's routing + composition only —
logic, UI, auth, and backend come from the shared packages.

## Commands

| Command                      | Does                                          |
| ---------------------------- | --------------------------------------------- |
| `pnpm dev` (root)            | Vite dev server on `http://localhost:5173`    |
| `pnpm --filter web build`    | Production build for the Cloudflare adapter   |
| `pnpm --filter web preview`  | Serve the production build locally            |
| `pnpm --filter web check`    | `svelte-kit sync` + `svelte-check`            |
| `pnpm --filter web test:e2e` | Playwright golden path (needs a live backend) |

The Convex backend must be running (`pnpm dev:backend`) and
`apps/web/.env.local` must set `PUBLIC_CONVEX_URL` — see
[first-project](first-project.md) steps 2–4.

## Routing structure

```text
apps/web/src/routes/
  +layout.svelte      env parse, Convex client, auth state, route guard, Toaster
  +page.svelte        / — redirects via the guard
  +error.svelte       error boundary
  login/+page.svelte
  register/+page.svelte
  tasks/+page.svelte  the Shared Tasks demo
apps/web/src/
  hooks.server.ts     security headers on every response
  lib/components/     app-specific composition (TaskForm, TaskItem, AuthForm, …)
```

The root layout is the integration point — it does the three shell jobs
(env → Convex client → auth + guard) and nothing else. See
[authentication](authentication.md) for the guard details.

## Adapter: Cloudflare

`svelte.config.js` uses `@sveltejs/adapter-cloudflare` with defaults. `pnpm --filter
web build` emits a Cloudflare-ready bundle under `.svelte-kit/cloudflare/`. Deploy
steps live in [deploy-cloudflare](deploy-cloudflare.md).

Note for server code: routes run on Cloudflare's workerd runtime, not Node — avoid
Node-only APIs in `+page.server.ts`/`hooks.server.ts` (v1 ships none beyond headers).

## Environment variables

`apps/web/.env.example` documents the full set (v1: just `PUBLIC_CONVEX_URL`).
SvelteKit exposes it via `$env/dynamic/public`; the layout validates it with
`parseClientEnv` from `@svelocity/env` so a bad value fails at startup with a
readable message.

## Adding a page/route

1. Create `apps/web/src/routes/<path>/+page.svelte`.
2. Decide visibility: routes are protected by default (the layout guard sends
   unauthenticated users to `/login`); to make a route public, include it in the
   `isAuthRoute` check in `+layout.svelte`.
3. Compose from `@svelocity/ui` components + `@svelocity/app-core` logic; subscribe
   to data with `useQuery(api..., ...)` ([Convex guide](convex.md)).
4. App-specific pieces go in `apps/web/src/lib/components/` — promote to
   `packages/ui` the moment a second shell needs them.

## E2E notes

- The Playwright spec waits for `body[data-hydrated]` (stamped by the root layout)
  before interacting — clicking pre-hydration triggers native form navigation.
- `E2E_PORT` overrides the default 5173 if something else squats on it.
- CI runs the suite against a local anonymous Convex backend
  (`.github/workflows/e2e.yml`); see [docs/TESTING-GUIDE.md](../TESTING-GUIDE.md).
