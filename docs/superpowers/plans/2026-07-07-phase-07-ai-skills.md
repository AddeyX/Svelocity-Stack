# Phase 7 — AI Skills + Agent Instructions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship AGENTS.md, one Cursor rule, and five bundled skills (`.agents/skills/` canonical + `.claude/skills/` symlinks), wired into the template snapshot, manifest, and `create` CLI.

**Architecture:** Content first (AGENTS.md, .mdc, .agents/README.md, five skills — all plain markdown authored at repo root, since the repo IS the template), then template mechanics (snapshot excludes/tokenize), then manifest population, then scaffold-time symlink generation, then e2e assertions. Spec: `docs/superpowers/specs/2026-07-07-phase-07-ai-skills-design.md`.

**Tech Stack:** Markdown (AGENTS.md, SKILL.md files), TypeScript (ESM, tsdown-bundled CLI), vitest, Node >=22, pnpm >=10.

## Global Constraints

- Node `>=22`, pnpm `>=10` (from `packages/create-svelocity/src/lib/versions.ts`).
- No new runtime dependencies in `create-svelocity` — all deps stay dev, tsdown bundles (`noExternal: [/.*/]`).
- Code style: tabs, single quotes, semicolons. Markdown must pass `prettier --check .` — run `pnpm format` before every commit that adds markdown.
- Manifest enum values are LOCKED by `.svelocity/manifest.schema.json`: `aiTargets` items ∈ `["agents-md", "cursor-rules"]`; `skills` items match `^[a-z0-9-]+$`.
- The five skill names, everywhere they appear: `svelocity-convex`, `svelocity-auth`, `svelocity-add-platform`, `svelocity-alignment-audit`, `svelocity-changelog`.
- Token syntax is `{{TOKEN}}`; tokens available: `PROJECT_NAME`, `DISPLAY_NAME`, `APP_ID`. Scaffold (`src/commands/create/scaffold.ts`) replaces tokens in `.md` files; `.mdc` is NOT in `TEXT_EXTENSIONS` so never put tokens in the Cursor rule.
- Unit specs colocated `src/**/*.spec.ts`; template specs in `tests/build-template.spec.ts`; e2e gated behind `CLI_INTEGRATION=1` in `tests/integration.spec.ts`.
- Commands from repo root: `pnpm --filter create-svelocity test|check|build`, repo-wide `pnpm check && pnpm test && pnpm lint`.
- Conventional commits. Commit only after its task's verification step passes.
- AGENTS.md may only reference paths that exist in the TEMPLATE output (e.g. never `docs/phases/`, `docs/V1-SCOPE.md`, `packages/theme/README.md` — the last one does not exist at all). Template-excluded paths live in `packages/create-svelocity/scripts/build-template.mjs` `EXCLUDE_PATHS`/`EXCLUDE_DIR_NAMES`.
- Skill frontmatter pattern (Cairno-derived): `name`, multi-line `description` with concrete trigger phrases, optional `disable-model-invocation: true`, optional `argument-hint`, and `compatibleStackVersion: 0.1.x`.

---

### Task 1: AGENTS.md + docs/CONTRIBUTING-STACK.md

**Files:**

- Create: `AGENTS.md` (repo root)
- Create: `docs/CONTRIBUTING-STACK.md`

**Interfaces:**

- Produces: `AGENTS.md` containing the exact heading `# Svelocity Stack — Agent Guide` (Task 8's tokenize pair matches this string verbatim) and a skills table listing the five skill names (Task 9's accuracy test greps paths from this file).
- Produces: `docs/CONTRIBUTING-STACK.md` (Task 8 adds it to `EXCLUDE_PATHS`).

- [ ] **Step 1: Write AGENTS.md**

Create `AGENTS.md` at repo root with exactly this content:

````markdown
# Svelocity Stack — Agent Guide

> None of these steps are optional. Complete them in the exact order they are specified in.

One shared core, three platform shells: web (SvelteKit + Cloudflare), desktop (Electron), mobile (Capacitor), connected by Convex with real-time sync and Convex Auth.

---

## Before You Start Any Task

1. Read `docs/CONVENTIONS.md` — naming, file layout, import aliases, dependency direction
2. Read `docs/DEMO-SPEC.md` if the task touches the Shared Tasks demo (acceptance criteria live there)
3. UI work → read `packages/ui/README.md` (components, tokens, consumption pattern)
4. Ask **intent questions** if the task is vague — before writing any code

---

## After Every Change

1. Run `pnpm check` and `pnpm test` before declaring a task complete
2. Commit only with user permission, using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

---

## Foundational Stack

| Area            | Choice                                                    |
| --------------- | --------------------------------------------------------- |
| Framework       | SvelteKit 2 + Svelte 5 (runes only)                       |
| UI primitives   | Bits UI (headless) styled with `@svelocity/theme` tokens  |
| Language        | TypeScript (strict)                                       |
| Package manager | pnpm workspaces — versions pinned in the catalog          |
| Backend         | Convex (`packages/backend`)                               |
| Auth            | Convex Auth (`packages/auth` client helpers)              |
| Web deploy      | Cloudflare via `@sveltejs/adapter-cloudflare`             |
| Desktop         | Electron shell (`apps/desktop`)                           |
| Mobile          | Capacitor shell (`apps/mobile`)                           |

---

## Directory Map

| Path                | Owns                                                        |
| ------------------- | ----------------------------------------------------------- |
| `apps/web`          | SvelteKit routing, Cloudflare deploy — thin shell           |
| `apps/desktop`      | Electron main/preload + SPA renderer — thin shell           |
| `apps/mobile`       | Capacitor config + SPA shell — thin shell                   |
| `packages/app-core` | Business logic, validation, Convex client wrappers          |
| `packages/ui`       | Shared Svelte components (Bits UI wrappers) — UI only       |
| `packages/theme`    | Design tokens (CSS custom properties) + platform overrides  |
| `packages/auth`     | Convex Auth client helpers, session state, route guards     |
| `packages/backend`  | Convex schema, functions, generated API                     |
| `packages/env`      | Typed env parsing (zod)                                     |
| `packages/config`   | Shared tsconfig/eslint/prettier/vite presets                |
| `.svelocity/`       | Manifest + schema — what the CLI generated                  |
| `.agents/skills/`   | Bundled agent skills (see `.agents/README.md`)              |

---

## Architecture Rules

1. Business logic lives in `packages/app-core`, never in apps
2. Shared UI lives in `packages/ui` — components are never duplicated per app
3. Apps are thin platform shells
4. No cross-app imports — apps import packages only
5. No packages importing from apps

---

## Prohibited Shortcuts

- No `any` types without an explanatory comment
- No business logic in UI components
- No bypassing auth guards
- No secrets in client bundles
- No disabling Electron `contextIsolation` or enabling `nodeIntegration`

---

## Asking Intent Questions

Before implementing a feature, confirm intent using this format:

> "I want to make [feature]. It does [behavior]. It looks like [visual description]. Ask any questions you have to complete the task — reference `docs/CONVENTIONS.md` and `docs/DEMO-SPEC.md` as the foundation."

**Never** start building before understanding:

- What problem this feature solves for the user
- How it should look and behave
- Which package owns it (see Directory Map — when in doubt, logic goes to `app-core`)

---

## Skills

Bundled skills live in `.agents/skills/` (Claude Code loads them via `.claude/skills/` symlinks). See `.agents/README.md` for platform discovery and recommended external skills.

| Skill                       | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `svelocity-convex`          | Add tables/queries/mutations and wire them through app-core        |
| `svelocity-auth`            | Configure and extend Convex Auth across the three shells           |
| `svelocity-add-platform`    | Manual guide to add a platform shell (until `svelocity add`)       |
| `svelocity-alignment-audit` | Read-only docs ↔ manifest ↔ codebase alignment report              |
| `svelocity-changelog`       | Public CHANGELOG.md + root version bump from conventional commits  |

---

## Architecture Review

When asked to review architecture (or before merging structural changes), check:

1. Dependency direction holds: apps → packages → nothing (verify imports; `packages/*` must not import `apps/*`)
2. New business logic landed in `packages/app-core`, not in an app shell
3. New UI landed in `packages/ui` with theme tokens, not hard-coded styles
4. The manifest still validates: `pnpm validate:manifest`
5. `pnpm check && pnpm test && pnpm build` pass

## Auth Review

When asked to review auth (or before merging auth-touching changes), check:

1. Protected Convex functions verify identity server-side (see `packages/backend/convex/tasks.ts` for the pattern)
2. Route guards from `packages/auth` protect authenticated web routes
3. Tokens stay in the localStorage flow (ADR 0002) — no ad-hoc storage
4. No credentials or secrets committed; `.env.local` stays untracked

---

## Dev Login

Local demo user (anonymous local Convex backend):

- Email: `demo@svelocity.dev`
- Password: `svelocity-demo-1234`
````

- [ ] **Step 2: Write docs/CONTRIBUTING-STACK.md**

Create `docs/CONTRIBUTING-STACK.md` with exactly this content (stack-dev-only; Task 8 excludes it from the template):

````markdown
# Contributing to Svelocity Stack (stack developers)

Instructions for working on the **stack itself** — the reference monorepo that
`create-svelocity` snapshots into a template. Generated projects never see this
file. Agent instructions for both audiences live in `AGENTS.md`.

## Phase workflow

Development follows `docs/phases/` (phase docs are stack-only, excluded from the
template). Do not mark a phase done until its Exit Criteria pass. Scope changes go
through `docs/V1-SCOPE.md` first; new ideas go to `docs/V1.1-BACKLOG.md`.

## The repo is the template

`packages/create-svelocity/scripts/build-template.mjs` snapshots the repo root into
`packages/create-svelocity/template/`, excluding stack-only paths (`EXCLUDE_PATHS`,
`EXCLUDE_DIR_NAMES`) and injecting `{{TOKENS}}`. Consequences:

- Anything you add at repo root ships to generated projects unless excluded
- AGENTS.md must only reference paths that survive the snapshot
- After changing template-relevant files, run
  `pnpm --filter create-svelocity test` (template spec verifies excludes/tokens)

## Gates

- `pnpm check && pnpm test && pnpm build && pnpm lint` — repo-wide, must stay green
- `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts`
  — gated e2e: scaffold → install → check → build → doctor (slow, ~10–20 min)

## Release process

Update catalog pins in `pnpm-workspace.yaml` → `pnpm install` → CI green → tag.
See `docs/phases/phase-10-hardening-release.md` for the v1.0.0 checklist.
````

- [ ] **Step 3: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: prettier rewrites nothing further; eslint + prettier check pass.

Run: `pnpm check && pnpm test`
Expected: unchanged — both green (markdown-only change).

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md docs/CONTRIBUTING-STACK.md
git commit -m "docs: AGENTS.md agent protocol and stack-dev contributing guide"
```

---

### Task 2: Cursor rule + .agents/README.md

**Files:**

- Create: `.cursor/rules/svelocity.mdc`
- Create: `.agents/README.md`

**Interfaces:**

- Produces: `.cursor/rules/svelocity.mdc` (Task 8 asserts it ships in the template; no tokens allowed — `.mdc` is not tokenized by scaffold).
- Produces: `.agents/README.md` with the recommended-skills table (Tasks 3–7 create the directories it references).

- [ ] **Step 1: Write the Cursor rule**

Create `.cursor/rules/svelocity.mdc` with exactly this content:

```markdown
---
description: Svelocity architecture guardrails — always apply
alwaysApply: true
---

Read `AGENTS.md` at the repo root before starting any task. Non-negotiable rules:

- Business logic lives in `packages/app-core`, never in apps.
- Shared UI lives in `packages/ui` — never duplicated per app.
- Apps are thin platform shells: they import packages only, never other apps.
- Packages never import from apps.
- Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`) — no legacy Svelte 4 patterns.
- No secrets in client bundles. Never disable Electron `contextIsolation`.
```

- [ ] **Step 2: Write .agents/README.md**

Create `.agents/README.md` with exactly this content:

````markdown
# Agent skills

Canonical project skills live in **`.agents/skills/`**. Each skill is a folder with
a `SKILL.md` and optional reference or template files.

## Platform discovery

| Platform        | How skills are loaded                                          |
| --------------- | -------------------------------------------------------------- |
| **Claude Code** | `/skill-name` or skill picker; `.claude/skills/` symlinks → `.agents/skills/` |
| **Cursor**      | `@skill-name` or skill picker; reads `.agents/skills/`         |
| **Codex**       | Project skills from `.agents/skills/`                          |

## Bundled skills

| Skill                       | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `svelocity-convex`          | Add tables/queries/mutations, wire through `packages/app-core`    |
| `svelocity-auth`            | Configure and extend Convex Auth across web/desktop/mobile        |
| `svelocity-add-platform`    | Manual platform-add guide (until `svelocity add` ships)           |
| `svelocity-alignment-audit` | Read-only docs ↔ manifest ↔ codebase alignment report             |
| `svelocity-changelog`       | Public CHANGELOG.md + root version bump                           |

## Recommended skills (not bundled)

Install these for a better agent workflow — each one line to integrate:

| Skill              | What it does                          | Install                                                                                          |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `caveman`          | Ultra-compressed agent responses      | Claude Code plugin marketplace: `/plugin install caveman`                                         |
| `impeccable`       | Production-grade frontend design      | Vendor-copy its folder into `.agents/skills/impeccable/`, then symlink into `.claude/skills/`     |
| Convex upstream    | Generic Convex patterns (6 skills)    | `npx convex ai-files install` (from [get-convex/agent-skills](https://github.com/get-convex/agent-skills)) |

## Adding a skill

1. Create it under `.agents/skills/<name>/` with a `SKILL.md`
2. Symlink for Claude Code: `ln -s ../../.agents/skills/<name> .claude/skills/<name>`
3. Add the name to `skills` in `.svelocity/manifest.json` (pattern `^[a-z0-9-]+$`)
````

- [ ] **Step 3: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add .cursor/rules/svelocity.mdc .agents/README.md
git commit -m "docs: cursor guardrail rule and .agents skills index"
```

---

### Task 3: Skill — svelocity-convex

**Files:**

- Create: `.agents/skills/svelocity-convex/SKILL.md`

**Interfaces:**

- Produces: directory name `svelocity-convex` (manifest value in Task 9, symlink name in Tasks 10–11).

- [ ] **Step 1: Write SKILL.md**

Create `.agents/skills/svelocity-convex/SKILL.md` with exactly this content:

````markdown
---
name: svelocity-convex
description: >
  Add or change Convex backend features in a Svelocity Stack monorepo — new tables,
  fields, queries, mutations, indexes — and wire them through packages/app-core into
  the Svelte apps. Use when the user asks to add a table, store new data, expose a
  query or mutation, or subscribe to live data on web/desktop/mobile. This skill is
  Svelocity-specific wiring only, not a Convex tutorial — for generic Convex
  patterns install the upstream skills (see .agents/README.md).
compatibleStackVersion: 0.1.x
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
````

- [ ] **Step 2: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/svelocity-convex
git commit -m "feat: svelocity-convex skill"
```

---

### Task 4: Skill — svelocity-auth

**Files:**

- Create: `.agents/skills/svelocity-auth/SKILL.md`

**Interfaces:**

- Produces: directory name `svelocity-auth`.

- [ ] **Step 1: Write SKILL.md**

Create `.agents/skills/svelocity-auth/SKILL.md` with exactly this content:

````markdown
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

| Concern                    | File                                             |
| -------------------------- | ------------------------------------------------ |
| Auth providers + config    | `packages/backend/convex/auth.ts`                |
| Auth HTTP routes           | `packages/backend/convex/http.ts`                |
| Deployment auth config     | `packages/backend/convex/auth.config.ts`         |
| Client session state       | `packages/auth/src/auth-state.svelte.ts`         |
| Svelte context plumbing    | `packages/auth/src/context.ts`                   |
| Route guards               | `packages/auth/src/guards.ts`                    |
| Web login/register routes  | `apps/web/src/routes/login`, `.../register`      |
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
````

- [ ] **Step 2: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/svelocity-auth
git commit -m "feat: svelocity-auth skill"
```

---

### Task 5: Skill — svelocity-add-platform

**Files:**

- Create: `.agents/skills/svelocity-add-platform/SKILL.md`

**Interfaces:**

- Produces: directory name `svelocity-add-platform`. Its final phase ("Update agent context") is the design's explicit requirement — keep all four sub-steps.

- [ ] **Step 1: Write SKILL.md**

Create `.agents/skills/svelocity-add-platform/SKILL.md` with exactly this content:

````markdown
---
name: svelocity-add-platform
description: >
  Manual guide for adding (or restoring) a platform shell — web, desktop, or
  mobile — to a Svelocity Stack project. Use when the user asks to add a platform,
  re-add a removed shell, or understand what a platform shell owns. v1 is a guided
  manual process; `svelocity add` automates this in v1.1.
compatibleStackVersion: 0.1.x
---

# Svelocity Add Platform

Every shell is thin: it renders shared components from `packages/ui`, calls logic
from `packages/app-core`, and authenticates via `packages/auth`. Adding a platform
is mostly wiring, not writing.

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — Copy the reference shell
- [ ] Step 2 — Wire workspace deps
- [ ] Step 3 — Platform-specific config
- [ ] Step 4 — Verify build + demo flow
- [ ] Step 5 — Update agent context
```

### Step 1 — Copy the reference shell

Use the matching app from a Svelocity Stack reference repo (same
`stackVersion` — check `.svelocity/manifest.json`):

- **Desktop:** `apps/desktop` — Vite + Svelte SPA in Electron (main, preload,
  renderer; `electron-builder.json` carries the app id)
- **Mobile:** `apps/mobile` — Vite + Svelte SPA in Capacitor
  (`capacitor.config.ts` carries the app id + display name)
- **Web:** `apps/web` — SvelteKit + adapter-cloudflare

### Step 2 — Wire workspace deps

The new app's `package.json` depends on `@svelocity/ui`, `@svelocity/app-core`,
`@svelocity/auth`, `@svelocity/theme`, `@svelocity/env`, `@svelocity/config`
via `workspace:*`, with versions from the pnpm catalog. Run `pnpm install` and
confirm the workspace picks the app up (it must live under `apps/`).

### Step 3 — Platform-specific config

- **Desktop:** set the app id in `electron-builder.json`; keep
  `contextIsolation: true`, `nodeIntegration: false`
- **Mobile:** set `appId` and `appName` in `capacitor.config.ts`; then
  `pnpm --filter mobile exec cap add ios` / `cap add android`
- **Web:** confirm `PUBLIC_CONVEX_URL` in `apps/web/.env.local`

### Step 4 — Verify

```bash
pnpm check && pnpm build
pnpm --filter <app> dev   # sign in with the dev login, run the demo flow
```

### Step 5 — Update agent context

The project's agent tooling must learn about the new platform — do all four:

1. Add the platform to `targets` in `.svelocity/manifest.json`
   (allowed values: `web`, `desktop`, `mobile`)
2. Update the **Foundational Stack** table and **Directory Map** in `AGENTS.md`
3. Update `.agents/README.md` if dev commands changed
4. Run `pnpm exec svelocity doctor` — manifest and target checks must pass

Skipping this step leaves future agent sessions blind to the new shell.
````

- [ ] **Step 2: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add .agents/skills/svelocity-add-platform
git commit -m "feat: svelocity-add-platform skill with agent-context update phase"
```

---

### Task 6: Skill — svelocity-alignment-audit

**Files:**

- Create: `.agents/skills/svelocity-alignment-audit/SKILL.md`
- Create: `.agents/skills/svelocity-alignment-audit/reference.md`
- Create: `.agents/skills/svelocity-alignment-audit/report-template.md`

**Interfaces:**

- Produces: directory name `svelocity-alignment-audit`. Confirm-gated: `disable-model-invocation: true` + explicit user confirmation before any audit work.

- [ ] **Step 1: Write SKILL.md**

Create `.agents/skills/svelocity-alignment-audit/SKILL.md` with exactly this content:

````markdown
---
name: svelocity-alignment-audit
description: >
  Read-only audit comparing a Svelocity Stack project's docs and manifest to the
  actual codebase. Verifies .svelocity/manifest.json, AGENTS.md, docs/CONVENTIONS.md,
  and docs/DEMO-SPEC.md claims against the workspace, schema, and apps, then produces
  a scored alignment report. Use when the user asks for an alignment report, docs vs
  codebase audit, manifest reconciliation, or whether docs match implementation.
  Requires explicit user confirmation before running — never start without it.
disable-model-invocation: true
argument-hint: '[full|quick] [optional output path]'
compatibleStackVersion: 0.1.x
---

# Svelocity Alignment Audit

Read-only docs ↔ manifest ↔ codebase alignment audit.

## Gate — user confirmation required

**Do not read source docs beyond this skill, grep the codebase, or write a report
until the user explicitly confirms.**

When this skill is invoked:

1. **Stop.** Do not start the audit yet.
2. **Present the confirmation prompt** (structure below; fill in today's date).
3. **Wait** for explicit approval (`yes`, `run it`, `go`, or equivalent).
4. If the user declines or asks questions, answer only — do not audit.
5. If the user picks a mode (`full` / `quick`), use that. Default: **full**.

### Confirmation prompt template

```markdown
## Svelocity alignment audit — confirm before run

**Mode:** [full | quick — one-line scope]
**Output:** `docs/audits/alignment-report-YYYY-MM-DD.md` (or chat-only)
**Read-only:** no code edits, no commits

**Source docs:** `.svelocity/manifest.json`, `AGENTS.md`, `docs/CONVENTIONS.md`,
`docs/DEMO-SPEC.md`, `.agents/README.md`

**Verified against:** `pnpm-workspace.yaml`, `apps/*`, `packages/*`,
`packages/backend/convex/schema.ts`, `.agents/skills/*`

Reply **yes** to start, **quick** for the short scope, or **chat** for a
chat-only report.
```

Only after confirmation → follow [reference.md](reference.md) and write output
using [report-template.md](report-template.md).

## Modes

| Mode      | Scope                                                             |
| --------- | ----------------------------------------------------------------- |
| **full**  | All buckets in reference.md                                       |
| **quick** | Buckets 1–3 only (manifest, AGENTS.md paths, skills) — ~15 min    |

## Conflict priority (when sources disagree)

`code (workspace, schema, apps)` > `.svelocity/manifest.json` > `AGENTS.md` / docs

## Status labels

| Status         | Meaning                                  |
| -------------- | ---------------------------------------- |
| ✅ Aligned     | Code matches claim                       |
| 🟡 Partial     | Exists but incomplete vs claim           |
| 🔴 Missing     | Doc/manifest says yes, code says no      |
| 📄 Doc stale   | Code ahead of doc                        |
| ❓ Unverifiable | Needs runtime/manual test                |
````

- [ ] **Step 2: Write reference.md**

Create `.agents/skills/svelocity-alignment-audit/reference.md` with exactly this content:

````markdown
# Alignment audit — buckets

Work through each bucket. Every finding gets a status label and file evidence
(path, line where useful). No edits — read-only.

## Bucket 1 — Manifest ↔ workspace

- Each `targets[]` entry has a matching `apps/<target>` directory with a
  `package.json` and `build` script
- `ui`, `auth`, `backend` values match reality: `bits-ui` in
  `packages/ui/package.json` deps; `@convex-dev/auth` present;
  `packages/backend/convex/` exists
- `packageManager` matches root `package.json`
- `stackVersion` matches root `package.json` `version`
- Manifest validates: `pnpm validate:manifest` (or
  `pnpm exec svelocity doctor` in a generated project)

## Bucket 2 — AGENTS.md paths and claims

- Every path referenced in AGENTS.md exists
- The Foundational Stack table matches installed deps (spot-check
  `pnpm-workspace.yaml` catalog)
- The Directory Map lists every `apps/*` and `packages/*` directory — flag
  missing or extra rows
- Dev login works only if the seeded demo user exists in the backend — mark
  ❓ Unverifiable unless the user confirms a running backend

## Bucket 3 — Skills ↔ manifest ↔ disk

- Every `skills[]` entry in the manifest has `.agents/skills/<name>/SKILL.md`
- Every `.agents/skills/*` directory is listed in the manifest
- `.claude/skills/<name>` resolves (symlink or copied dir) for each skill
- Skill tables in `AGENTS.md` and `.agents/README.md` list the same set

## Bucket 4 — Conventions ↔ code (full mode)

- Dependency direction: grep app imports in `packages/*/src` — zero hits
  expected (`grep -rn "apps/" packages/*/src` modulo comments)
- Import aliases used per `docs/CONVENTIONS.md`
- File naming spot-check: components PascalCase, modules kebab/camel per
  conventions

## Bucket 5 — Demo spec ↔ implementation (full mode)

- Each `docs/DEMO-SPEC.md` acceptance criterion maps to implemented code
  (schema table, route, view) — label each
- Auth flow criteria: login/register routes exist on web; LoginView on
  desktop/mobile

## Scoring

Report `aligned / total` per bucket and overall. Anything 🔴 gets a one-line
suggested fix in the report.
````

- [ ] **Step 3: Write report-template.md**

Create `.agents/skills/svelocity-alignment-audit/report-template.md` with exactly this content:

````markdown
# Alignment report — YYYY-MM-DD

**Mode:** full | quick
**Scope:** docs ↔ manifest ↔ codebase
**Overall:** N aligned / M checked

## Scorecard

| Bucket                    | Aligned | Checked | Notes |
| ------------------------- | ------- | ------- | ----- |
| 1 Manifest ↔ workspace    |         |         |       |
| 2 AGENTS.md paths/claims  |         |         |       |
| 3 Skills ↔ manifest       |         |         |       |
| 4 Conventions ↔ code      |         |         |       |
| 5 Demo spec ↔ impl        |         |         |       |

## Findings

### Bucket 1 — Manifest ↔ workspace

| Status | Claim | Evidence | Suggested fix |
| ------ | ----- | -------- | ------------- |

(repeat per bucket)

## Unverifiable items

| Item | Why | How to verify manually |
| ---- | --- | ---------------------- |
````

- [ ] **Step 4: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/svelocity-alignment-audit
git commit -m "feat: svelocity-alignment-audit skill"
```

---

### Task 7: Skill — svelocity-changelog

**Files:**

- Create: `.agents/skills/svelocity-changelog/SKILL.md`
- Create: `.agents/skills/svelocity-changelog/reference.md`
- Create: `.agents/skills/svelocity-changelog/changelog-template.md`

**Interfaces:**

- Produces: directory name `svelocity-changelog`.

- [ ] **Step 1: Write SKILL.md**

Create `.agents/skills/svelocity-changelog/SKILL.md` with exactly this content:

````markdown
---
name: svelocity-changelog
description: >
  Create or update the public-facing CHANGELOG.md and bump the root package.json
  version in a Svelocity Stack project. Collects conventional commits since the
  last release tag and writes customer-friendly release notes — no internal
  implementation detail. Use when the user asks to update the changelog, cut a
  release, bump the version, or document what shipped.
disable-model-invocation: true
argument-hint: '[patch|minor|major] [optional release date YYYY-MM-DD]'
compatibleStackVersion: 0.1.x
---

# Svelocity Changelog

Release-notes workflow for the project root.

**Outputs:**

- `CHANGELOG.md` at repo root (create from
  [changelog-template.md](changelog-template.md) if missing)
- Root `package.json` `"version"` bumped to match

## Before you start

1. Confirm git history is available: `git log --oneline -5`
2. If the user passed `patch`, `minor`, or `major`, use that bump. Otherwise
   infer from the change mix (see [reference.md](reference.md))

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — Locate or create CHANGELOG.md
- [ ] Step 2 — Find the last release (newest version heading, or last git tag)
- [ ] Step 3 — Collect commits since then: git log <last>..HEAD --oneline
- [ ] Step 4 — Draft public-facing notes (mapping rules in reference.md)
- [ ] Step 5 — Bump version in root package.json
- [ ] Step 6 — Write CHANGELOG.md
- [ ] Step 7 — Sanity checks
```

### Sanity checks (Step 7)

- Version heading, date, and `package.json` version all agree
- No internal-only entries (refactors, CI, test-only changes)
- `pnpm lint` passes (prettier checks CHANGELOG.md)
- Show the user the diff before committing — commit only with permission
````

- [ ] **Step 2: Write reference.md**

Create `.agents/skills/svelocity-changelog/reference.md` with exactly this content:

````markdown
# Changelog reference

## Commit type → section mapping

| Conventional type            | Changelog section | Include?               |
| ---------------------------- | ----------------- | ---------------------- |
| `feat`                       | Added             | yes                    |
| `fix`                        | Fixed             | yes                    |
| `perf`                       | Changed           | yes                    |
| `feat!` / `BREAKING CHANGE`  | Changed (breaking) | yes, flag breaking    |
| `docs` (user-facing guides)  | Changed           | only if users see it   |
| `refactor`, `chore`, `ci`, `test`, `style` | —   | no                     |

## Bump inference (when the user gives no bump)

- Any breaking change → **major** (pre-1.0: minor)
- Any `feat` → **minor** (pre-1.0: patch is acceptable; ask if unsure)
- Only `fix`/`perf` → **patch**

## Writing rules

- Entries describe what the USER can now do or what stopped being broken —
  never file paths, package names, or internal jargon
- One line per change, imperative mood: "Add dark-mode toggle to settings"
- Group under `### Added` / `### Changed` / `### Fixed` / `### Removed`
- Omit empty sections
````

- [ ] **Step 3: Write changelog-template.md**

Create `.agents/skills/svelocity-changelog/changelog-template.md` with exactly this content:

````markdown
# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[semver](https://semver.org/).

## [Unreleased]

## [0.1.0] - YYYY-MM-DD

### Added

- Initial release
````

- [ ] **Step 4: Format and verify**

Run: `pnpm format && pnpm lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/svelocity-changelog
git commit -m "feat: svelocity-changelog skill"
```

---

### Task 8: Local .claude/skills symlinks + template snapshot wiring

**Files:**

- Create: `.claude/skills/<name>` symlinks (5) in the stack repo
- Modify: `packages/create-svelocity/scripts/build-template.mjs` (EXCLUDE_PATHS, TOKENIZE)
- Modify: `.prettierignore` (add `.claude/`) — create the file if it does not exist
- Test: `packages/create-svelocity/tests/build-template.spec.ts`

**Interfaces:**

- Consumes: `AGENTS.md` heading `# Svelocity Stack — Agent Guide` (Task 1), `.agents/skills/*` (Tasks 3–7), `.cursor/rules/svelocity.mdc` (Task 2).
- Produces: template output containing tokenized `AGENTS.md`, `.agents/`, `.cursor/`; excluding `docs/CONTRIBUTING-STACK.md` and `.claude/`.

- [ ] **Step 1: Check .gitignore does not swallow the symlinks**

Run: `grep -n "claude" .gitignore`
Expected: no line ignoring `.claude` or `.claude/` wholesale. If a line ignores the whole directory, narrow it to the specific files (e.g. `.claude/settings.local.json`) so `.claude/skills/` stays trackable.

- [ ] **Step 2: Create the symlinks**

```bash
mkdir -p .claude/skills
for s in svelocity-convex svelocity-auth svelocity-add-platform svelocity-alignment-audit svelocity-changelog; do
  ln -s ../../.agents/skills/$s .claude/skills/$s
done
ls -la .claude/skills   # five symlinks, each -> ../../.agents/skills/<name>
```

- [ ] **Step 3: Keep prettier out of .claude**

Add `.claude/` on its own line to `.prettierignore` (create the file with that single line if missing). Rationale: the symlinked content is already formatted at its canonical path; some tools traverse symlinks and double-report.

- [ ] **Step 4: Write the failing template tests**

In `packages/create-svelocity/tests/build-template.spec.ts`, extend the existing suites:

Add to the exclusion list in `it('excludes heavy and stack-only paths', ...)`:

```ts
'docs/CONTRIBUTING-STACK.md',
'.claude'
```

Add to the inclusion list in `it('includes lockfile, workspace config, backend, schema', ...)`:

```ts
'AGENTS.md',
'.cursor/rules/svelocity.mdc',
'.agents/README.md',
'.agents/skills/svelocity-convex/SKILL.md',
'.agents/skills/svelocity-auth/SKILL.md',
'.agents/skills/svelocity-add-platform/SKILL.md',
'.agents/skills/svelocity-alignment-audit/SKILL.md',
'.agents/skills/svelocity-changelog/SKILL.md'
```

Add to `it('tokenizes the right files', ...)`:

```ts
expect(readFileSync(join(out, 'AGENTS.md'), 'utf8')).toContain('# {{DISPLAY_NAME}} — Agent Guide');
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `pnpm --filter create-svelocity test -- tests/build-template.spec.ts`
Expected: FAIL — `docs/CONTRIBUTING-STACK.md should be excluded` and the AGENTS.md tokenize assertion.

- [ ] **Step 6: Modify build-template.mjs**

In `packages/create-svelocity/scripts/build-template.mjs`:

Add to `EXCLUDE_PATHS` (after `'docs/Svelocity-Stack-PR.md'`):

```js
	'docs/CONTRIBUTING-STACK.md',
```

Add to `TOKENIZE` (after the electron-builder entry):

```js
	['AGENTS.md', [['# Svelocity Stack — Agent Guide', '# {{DISPLAY_NAME}} — Agent Guide']]]
```

(`.claude` is already in `EXCLUDE_DIR_NAMES` — no change needed there.)

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm --filter create-svelocity test -- tests/build-template.spec.ts`
Expected: PASS — all template assertions green.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills .prettierignore packages/create-svelocity/scripts/build-template.mjs packages/create-svelocity/tests/build-template.spec.ts .gitignore
git commit -m "feat: skills symlinks and template snapshot wiring for AI assets"
```

---

### Task 9: Manifest — populate aiTargets + skills

**Files:**

- Modify: `packages/create-svelocity/src/commands/create/manifest.ts`
- Modify: `packages/create-svelocity/src/commands/create/manifest.spec.ts`
- Modify: `.svelocity/manifest.schema.json` (description only)
- Modify: `.svelocity/manifest.json` (stack repo's own)
- Modify: `.svelocity/manifest.example.json`

**Interfaces:**

- Consumes: `Manifest` type from `src/lib/manifest.ts` (unchanged).
- Produces: `buildManifest()` returning `aiTargets: ['agents-md', 'cursor-rules']` and `skills: [the five names]`. Task 11's e2e asserts these exact values.

- [ ] **Step 1: Write the failing test**

In `packages/create-svelocity/src/commands/create/manifest.spec.ts`, update/add the expectation on `buildManifest` output (match the existing spec style in that file):

```ts
it('records ai targets and bundled skills', () => {
	const manifest = buildManifest({
		cliVersion: '0.1.0',
		stackVersion: '0.1.0',
		packageManager: 'pnpm@10.33.2'
	});
	expect(manifest.aiTargets).toEqual(['agents-md', 'cursor-rules']);
	expect(manifest.skills).toEqual([
		'svelocity-convex',
		'svelocity-auth',
		'svelocity-add-platform',
		'svelocity-alignment-audit',
		'svelocity-changelog'
	]);
});
```

If an existing test asserts `aiTargets: []` or `skills: []`, update it to the new values instead of adding a duplicate test.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/commands/create/manifest.spec.ts`
Expected: FAIL — arrays empty.

- [ ] **Step 3: Implement**

In `packages/create-svelocity/src/commands/create/manifest.ts`, replace:

```ts
		aiTargets: [],
		skills: []
```

with:

```ts
		aiTargets: ['agents-md', 'cursor-rules'],
		skills: [
			'svelocity-convex',
			'svelocity-auth',
			'svelocity-add-platform',
			'svelocity-alignment-audit',
			'svelocity-changelog'
		]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter create-svelocity test -- src/commands/create/manifest.spec.ts`
Expected: PASS.

- [ ] **Step 5: Update schema description + repo manifests**

In `.svelocity/manifest.schema.json`, change the `skills` description from `"Skill directories shipped under skills/."` to `"Skill directories shipped under .agents/skills/."` (no structural change — enum/pattern stay as-is).

In `.svelocity/manifest.json` AND `.svelocity/manifest.example.json`, set:

```json
	"aiTargets": ["agents-md", "cursor-rules"],
	"skills": [
		"svelocity-convex",
		"svelocity-auth",
		"svelocity-add-platform",
		"svelocity-alignment-audit",
		"svelocity-changelog"
	]
```

(keep each file's other fields untouched).

- [ ] **Step 6: Verify repo-wide**

Run: `pnpm validate:manifest && pnpm --filter create-svelocity test && pnpm --filter create-svelocity check`
Expected: manifest valid; all unit tests pass (if `info.spec.ts` or `checks.spec.ts` asserted empty skills/aiTargets, update those fixtures to the populated arrays).

- [ ] **Step 7: Commit**

```bash
git add packages/create-svelocity/src/commands/create/manifest.ts packages/create-svelocity/src/commands/create/manifest.spec.ts .svelocity/
git commit -m "feat: manifest records agents-md + cursor-rules targets and bundled skills"
```

---

### Task 10: create — generate .claude/skills symlinks post-scaffold

**Files:**

- Create: `packages/create-svelocity/src/commands/create/link-skills.ts`
- Create: `packages/create-svelocity/src/commands/create/link-skills.spec.ts`
- Modify: `packages/create-svelocity/src/create.ts`

**Interfaces:**

- Produces: `linkSkills(projectRoot: string): { linked: string[]; copied: string[] }` — creates `.claude/skills/<name>` for every directory in `.agents/skills/`; symlink preferred, recursive copy on symlink failure; idempotent (existing targets skipped); returns names sorted.
- Consumes: scaffolded project layout with `.agents/skills/*` (Task 8's template output).

- [ ] **Step 1: Write the failing test**

Create `packages/create-svelocity/src/commands/create/link-skills.spec.ts`:

```ts
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { linkSkills } from './link-skills.js';

function makeProject(skills: string[]): string {
	const root = mkdtempSync(join(tmpdir(), 'sv-link-'));
	for (const name of skills) {
		mkdirSync(join(root, '.agents/skills', name), { recursive: true });
		writeFileSync(join(root, '.agents/skills', name, 'SKILL.md'), `# ${name}\n`);
	}
	return root;
}

describe('linkSkills', () => {
	it('links every skill into .claude/skills', () => {
		const root = makeProject(['svelocity-convex', 'svelocity-auth']);
		const result = linkSkills(root);
		expect(result.linked.concat(result.copied).sort()).toEqual([
			'svelocity-auth',
			'svelocity-convex'
		]);
		for (const name of ['svelocity-convex', 'svelocity-auth']) {
			const content = readFileSync(join(root, '.claude/skills', name, 'SKILL.md'), 'utf8');
			expect(content).toContain(name);
		}
	});

	it('prefers symlinks where the platform allows', () => {
		const root = makeProject(['svelocity-convex']);
		const result = linkSkills(root);
		if (result.linked.length === 1) {
			expect(lstatSync(join(root, '.claude/skills/svelocity-convex')).isSymbolicLink()).toBe(true);
		} else {
			expect(result.copied).toEqual(['svelocity-convex']);
		}
	});

	it('is idempotent and no-ops without .agents/skills', () => {
		const root = makeProject(['svelocity-convex']);
		linkSkills(root);
		expect(linkSkills(root)).toEqual({ linked: [], copied: [] });
		const empty = mkdtempSync(join(tmpdir(), 'sv-link-empty-'));
		expect(linkSkills(empty)).toEqual({ linked: [], copied: [] });
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter create-svelocity test -- src/commands/create/link-skills.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement link-skills.ts**

Create `packages/create-svelocity/src/commands/create/link-skills.ts`:

```ts
import { cpSync, existsSync, mkdirSync, readdirSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

export interface LinkSkillsResult {
	linked: string[];
	copied: string[];
}

/**
 * Mirror .agents/skills/<name> into .claude/skills/<name> so Claude Code
 * discovers the bundled skills. Symlink preferred; falls back to a recursive
 * copy where symlinks are unavailable (e.g. Windows without developer mode).
 */
export function linkSkills(projectRoot: string): LinkSkillsResult {
	const result: LinkSkillsResult = { linked: [], copied: [] };
	const skillsDir = join(projectRoot, '.agents/skills');
	if (!existsSync(skillsDir)) return result;
	const claudeSkills = join(projectRoot, '.claude/skills');
	mkdirSync(claudeSkills, { recursive: true });
	for (const name of readdirSync(skillsDir).sort()) {
		const target = join(claudeSkills, name);
		if (existsSync(target)) continue;
		try {
			symlinkSync(join('..', '..', '.agents', 'skills', name), target, 'dir');
			result.linked.push(name);
		} catch {
			cpSync(join(skillsDir, name), target, { recursive: true });
			result.copied.push(name);
		}
	}
	return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter create-svelocity test -- src/commands/create/link-skills.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire into create.ts**

In `packages/create-svelocity/src/create.ts`:

Add the import next to the other `./commands/create/` imports:

```ts
import { linkSkills } from './commands/create/link-skills.js';
```

Call it after `writeProjectManifest(...)` and before `s.stop('Template copied');`:

```ts
		const skillLinks = linkSkills(targetDir);
		s.stop('Template copied');
		if (skillLinks.copied.length > 0) {
			console.log(
				`${glyph('warn')} symlinks unavailable - copied skills into .claude/skills: ${skillLinks.copied.join(', ')}`
			);
		}
```

(replacing the existing bare `s.stop('Template copied');` line).

- [ ] **Step 6: Verify package-wide**

Run: `pnpm --filter create-svelocity check && pnpm --filter create-svelocity test`
Expected: 0 type errors; all unit + template suites pass.

- [ ] **Step 7: Commit**

```bash
git add packages/create-svelocity/src/commands/create/link-skills.ts packages/create-svelocity/src/commands/create/link-skills.spec.ts packages/create-svelocity/src/create.ts
git commit -m "feat: create links bundled skills into .claude/skills with copy fallback"
```

---

### Task 11: E2e — AI assets in the generated project

**Files:**

- Modify: `packages/create-svelocity/tests/integration.spec.ts`

**Interfaces:**

- Consumes: everything — template content (Tasks 1–8), manifest values (Task 9), symlink generation (Task 10).

- [ ] **Step 1: Add the e2e test**

The e2e project is named `e2e-app`; `toDisplayName` in `packages/create-svelocity/src/lib/tokens.ts` splits on `-`/`_` and capitalizes each word, so `toDisplayName('e2e-app')` → `'E2e App'`.

In `packages/create-svelocity/tests/integration.spec.ts`, after the `'generated a schema-valid project'` test, add:

```ts
	it('ships AI assets', () => {
		const agents = readFileSync(join(project, 'AGENTS.md'), 'utf8');
		expect(agents).toContain('# E2e App — Agent Guide');
		expect(agents).not.toContain('{{');
		const skills = [
			'svelocity-convex',
			'svelocity-auth',
			'svelocity-add-platform',
			'svelocity-alignment-audit',
			'svelocity-changelog'
		];
		for (const name of skills) {
			expect(existsSync(join(project, `.agents/skills/${name}/SKILL.md`))).toBe(true);
			expect(readFileSync(join(project, `.claude/skills/${name}/SKILL.md`), 'utf8')).toContain(
				name
			);
		}
		expect(existsSync(join(project, '.cursor/rules/svelocity.mdc'))).toBe(true);
		expect(existsSync(join(project, 'docs/CONTRIBUTING-STACK.md'))).toBe(false);
		const manifest = JSON.parse(
			readFileSync(join(project, '.svelocity/manifest.json'), 'utf8')
		) as { aiTargets: string[]; skills: string[] };
		expect(manifest.aiTargets).toEqual(['agents-md', 'cursor-rules']);
		expect(manifest.skills).toEqual(skills);
	});
```

- [ ] **Step 2: Run the gated e2e (slow, ~10–20 min)**

Run: `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts`
Expected: PASS — 5 tests including `ships AI assets`; doctor still exits 0.

- [ ] **Step 3: Commit**

```bash
git add packages/create-svelocity/tests/integration.spec.ts
git commit -m "test: e2e asserts AI assets ship in generated projects"
```

---

### Task 12: AGENTS.md path-accuracy test

**Files:**

- Modify: `packages/create-svelocity/tests/build-template.spec.ts`

**Interfaces:**

- Consumes: template output (`out`) from the existing `beforeAll`; AGENTS.md content (Task 1).

- [ ] **Step 1: Write the failing (or passing) accuracy test**

Add to `packages/create-svelocity/tests/build-template.spec.ts`:

```ts
	it('AGENTS.md only references paths that exist in the template', () => {
		const agents = readFileSync(join(out, 'AGENTS.md'), 'utf8');
		const refs = [
			...new Set(
				[...agents.matchAll(/`((?:docs|packages|apps|\.agents|\.svelocity)\/[A-Za-z0-9._/-]+)`/g)].map(
					(m) => m[1]
				)
			)
		];
		expect(refs.length).toBeGreaterThan(0);
		for (const ref of refs) {
			expect(existsSync(join(out, ref)), `AGENTS.md references missing path: ${ref}`).toBe(true);
		}
	});
```

- [ ] **Step 2: Run it**

Run: `pnpm --filter create-svelocity test -- tests/build-template.spec.ts`
Expected: PASS. If any path fails, fix AGENTS.md (the doc is wrong, not the test) — e.g. a reference to a template-excluded file must be reworded or the file un-excluded, per the Global Constraints.

Note: `.env.local` under `apps/web` is NOT in the template (env files are excluded) — AGENTS.md as written in Task 1 references only `docs/adr/...`, `docs/CONVENTIONS.md`, `docs/DEMO-SPEC.md`, `packages/*`, `apps/*` code paths, and `.agents/README.md`, all of which ship. The skills reference `apps/web/.env.local` inside `.agents/skills/` files, which this test intentionally does not scan (runtime-created paths are legitimate in skill instructions).

- [ ] **Step 3: Commit**

```bash
git add packages/create-svelocity/tests/build-template.spec.ts
git commit -m "test: AGENTS.md references only template-real paths"
```

---

### Task 13: Phase doc reconciliation + final verification

**Files:**

- Modify: `docs/phases/phase-07-ai-skills.md`

**Interfaces:** none new.

- [ ] **Step 1: Update the phase doc**

In `docs/phases/phase-07-ai-skills.md`:

- Check off every completed item (`- [ ]` → `- [x]`)
- Annotate deviations inline, matching the style used in `docs/phases/phase-06-thin-cli.md` (em-dash notes):
  - 7.2 Cursor Rules: one `alwaysApply` pointer file (`.cursor/rules/svelocity.mdc`) instead of four — AGENTS.md is the single source (design decision, spec 2026-07-07)
  - 7.6 layout: `.agents/skills/` + `.claude/skills/` symlinks instead of root `skills/`
  - Skill list: five bundled (adds `svelocity-alignment-audit`, `svelocity-changelog`)
  - Manifest values: `aiTargets: ["agents-md", "cursor-rules"]`
  - 7.9 manual skill tests: mark which were executed; leave unexecuted ones unchecked with a note that they land with Phase 9/10 verification
- Leave 7.7 (deferred skills) and 7.8 (sub-agents deferral) as documented-only items and check them off — `docs/V1.1-BACKLOG.md` already records them

- [ ] **Step 2: Full-gate verification**

```bash
pnpm check && pnpm test && pnpm build && pnpm lint
pnpm validate:manifest
pnpm --filter create-svelocity build && node packages/create-svelocity/dist/cli.js info
```

Expected: all green; `info` lists the five skills and both ai targets.

- [ ] **Step 3: Commit**

```bash
git add docs/phases/phase-07-ai-skills.md
git commit -m "docs: reconcile phase 7 checklist with shipped AI assets"
```

---

## Final Verification

- [ ] `pnpm check && pnpm test && pnpm build && pnpm lint` — repo-wide green
- [ ] `pnpm validate:manifest` — repo manifest valid with populated arrays
- [ ] `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts` — e2e incl. `ships AI assets` passes (if not already run in Task 11)
- [ ] `node packages/create-svelocity/dist/cli.js info` — lists 5 skills + 2 ai targets
- [ ] Manual spot-check: `/svelocity-convex` visible in Claude Code's skill picker in this repo (symlinks work)
