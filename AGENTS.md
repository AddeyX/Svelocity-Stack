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

| Area            | Choice                                                   |
| --------------- | -------------------------------------------------------- |
| Framework       | SvelteKit 2 + Svelte 5 (runes only)                      |
| UI primitives   | Bits UI (headless) styled with `@svelocity/theme` tokens |
| Language        | TypeScript (strict)                                      |
| Package manager | pnpm workspaces — versions pinned in the catalog         |
| Backend         | Convex (`packages/backend`)                              |
| Auth            | Convex Auth (`packages/auth` client helpers)             |
| Web deploy      | Cloudflare via `@sveltejs/adapter-cloudflare`            |
| Desktop         | Electron shell (`apps/desktop`)                          |
| Mobile          | Capacitor shell (`apps/mobile`)                          |

---

## Directory Map

| Path                | Owns                                                       |
| ------------------- | ---------------------------------------------------------- |
| `apps/web`          | SvelteKit routing, Cloudflare deploy — thin shell          |
| `apps/desktop`      | Electron main/preload + SPA renderer — thin shell          |
| `apps/mobile`       | Capacitor config + SPA shell — thin shell                  |
| `packages/app-core` | Business logic, validation, Convex client wrappers         |
| `packages/ui`       | Shared Svelte components (Bits UI wrappers) — UI only      |
| `packages/theme`    | Design tokens (CSS custom properties) + platform overrides |
| `packages/auth`     | Convex Auth client helpers, session state, route guards    |
| `packages/backend`  | Convex schema, functions, generated API                    |
| `packages/env`      | Typed env parsing (zod)                                    |
| `packages/config`   | Shared tsconfig/eslint/prettier/vite presets               |
| `.svelocity/`       | Manifest + schema — what the CLI generated                 |
| `.agents/skills/`   | Bundled agent skills (see `.agents/README.md`)             |

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

| Skill                       | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `svelocity-convex`          | Add tables/queries/mutations and wire them through app-core       |
| `svelocity-auth`            | Configure and extend Convex Auth across the three shells          |
| `svelocity-add-platform`    | Manual guide to add a platform shell (until `svelocity add`)      |
| `svelocity-alignment-audit` | Read-only docs ↔ manifest ↔ codebase alignment report             |
| `svelocity-changelog`       | Public CHANGELOG.md + root version bump from conventional commits |

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
