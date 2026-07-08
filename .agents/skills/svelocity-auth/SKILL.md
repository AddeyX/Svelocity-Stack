---
name: svelocity-auth
description: >
  Configure, extend, or debug Convex Auth in a Svelocity Stack monorepo — sign-in,
  sign-up, sign-out, route guards, session state, and the token flow shared by the
  web, Electron, and Capacitor shells. Use when the user asks to protect a route,
  add an auth provider, fix login/logout, or reason about where tokens live.
compatibleStackVersion: 0.1.x
---

# Svelocity Auth

Convex Auth with client-side token storage (localStorage flow — decision recorded
in `docs/adr/0002-convex-auth-over-better-auth.md`). One backend serves all three
shells; auth state logic is shared, not per-app.

## File map

| Concern                    | File                                               |
| -------------------------- | -------------------------------------------------- |
| Auth providers + config    | `packages/backend/convex/auth.ts`                  |
| Auth HTTP routes           | `packages/backend/convex/http.ts`                  |
| Deployment auth config     | `packages/backend/convex/auth.config.ts`           |
| Client session state       | `packages/auth/src/auth-state.svelte.ts`           |
| Svelte context plumbing    | `packages/auth/src/context.ts`                     |
| Route guards               | `packages/auth/src/guards.ts`                      |
| Web login/register routes  | `apps/web/src/routes/login`, `.../register`        |
| Desktop/mobile login views | `apps/{desktop,mobile}/src/views/LoginView.svelte` |

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — Reproduce or define the auth change
- [ ] Step 2 — Backend: providers and config
- [ ] Step 3 — Client: packages/auth helpers
- [ ] Step 4 — Shells: guards and views
- [ ] Step 5 — Validate the full flow
```

### Step 1 — Define the change

Adding a provider? Protecting a route? Fixing session persistence? Name the
target shell(s) — web only, or all three.

### Step 2 — Backend

Providers are configured in `packages/backend/convex/auth.ts`. Environment
expectations live in `apps/web/.env.example` (`PUBLIC_CONVEX_URL` must be set and
uncommented — `svelocity doctor` checks this).

### Step 3 — Client helpers

Session state is a rune-based store in `packages/auth/src/auth-state.svelte.ts`,
provided via `context.ts`. Extend here — never fork auth state into an app.

### Step 4 — Shells

- **Web:** guard protected routes with `packages/auth/src/guards.ts` (see
  `apps/web/src/routes/tasks/+page.svelte` for the guarded pattern)
- **Desktop/Mobile:** the SPA shells gate views on the same auth state — follow
  `apps/desktop/src/views/LoginView.svelte`

### Step 5 — Validate

```bash
pnpm check && pnpm test
```

Then manually: sign in with the dev login (see `AGENTS.md`), confirm the token
key appears in localStorage, refresh (session persists), sign out (token
cleared, protected route redirects).

## Security checklist

- Protected Convex functions check identity server-side — guards are UX, not
  security
- No tokens in URLs, logs, or committed files
- `.env.local` stays untracked; only `.env.example` is committed
- Electron: `contextIsolation` stays on; no auth logic in the main process
