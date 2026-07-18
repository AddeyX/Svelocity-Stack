---
name: svelocity-convex
description: >
  Add or change Convex backend features in a Svelocity Stack monorepo — new tables,
  fields, queries, mutations, indexes — and wire them through packages/app-core into
  the Svelte apps. Use when the user asks to add a table, store new data, expose a
  query or mutation, or subscribe to live data on web/desktop/mobile. This skill is
  Svelocity-specific wiring only, not a Convex tutorial — for generic Convex
  patterns install the upstream skills (see .agents/README.md).
compatibleStackVersion: 1.0.x
---

# Svelocity Convex

Backend features flow one way: **schema → Convex function → app-core wrapper →
component**. Never import `convex/_generated` directly from an app.

## Before you start

1. Read `packages/backend/convex/schema.ts` — existing tables and index naming
2. Read `packages/backend/convex/tasks.ts` — the reference function file (auth
   check pattern, validator usage)
3. Read `packages/app-core/src/tasks.ts` — the reference app-core wrapper
4. Confirm the backend dev server runs: `pnpm --filter @svelocity/backend dev`
   (regenerates `packages/backend/convex/_generated` on change)

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — Define or extend the table in schema.ts
- [ ] Step 2 — Write the Convex function(s)
- [ ] Step 3 — Wrap in packages/app-core
- [ ] Step 4 — Consume from the app(s)
- [ ] Step 5 — Validate
```

### Step 1 — Schema

Edit `packages/backend/convex/schema.ts`. Every field gets a validator
(`v.string()`, `v.id('tasks')`, …). Indexes are named `by_<field>` (e.g.
`by_user`). Prefer adding optional fields over breaking existing documents.

### Step 2 — Convex function

Add to an existing file in `packages/backend/convex/` or create a new one per
table (`tasks.ts` pattern). Rules:

- **Every protected function checks identity first** — copy the auth-check
  pattern from `packages/backend/convex/tasks.ts` verbatim
- Args and return values use validators, never bare `any`
- Queries stay read-only; writes go in mutations

### Step 3 — app-core wrapper

Expose the function through `packages/app-core` (see `src/tasks.ts`): a typed
wrapper around the generated API reference, exported from
`packages/app-core/src/index.ts`. Apps depend on `@svelocity/app-core`, not on
the backend package.

### Step 4 — Consume

- **Web:** reactive query in a route/component under `apps/web/src` — follow the
  existing pattern in `apps/web/src/routes/tasks/+page.svelte`
- **Desktop / Mobile:** same shared logic; views live in
  `apps/desktop/src/views/` and `apps/mobile/src/views/`

### Step 5 — Validate

```bash
pnpm --filter @svelocity/backend dev   # codegen must succeed
pnpm check                             # 0 type errors
pnpm test
```

## Rollback

Schema changes deploy with the dev server. To revert: restore the previous
`schema.ts` + function file from git, let codegen rerun, then `pnpm check`.

## Risks

- Removing or renaming a field breaks existing documents — migrate, don't mutate
- Skipping the identity check exposes data — the Auth Review section of
  `AGENTS.md` treats this as a blocker
