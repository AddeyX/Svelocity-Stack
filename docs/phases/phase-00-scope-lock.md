# Phase 0 — Scope Lock

**Goal:** Freeze V1 boundaries, naming, and golden-path decisions before writing application code.  
**Prerequisites:** None  
**Estimated effort:** 1–2 days

---

## Exit Criteria

- [x] V1 scope document approved and committed
- [x] Golden-path stack locked (Bits UI, Convex Auth, all three platforms)
- [x] Package naming and workspace layout agreed
- [x] Demo app spec (Shared Tasks) written
- [x] Phase 1 can start without open architecture questions

---

## 0.1 — V1 Scope Document

- [x] Write `docs/V1-SCOPE.md` with locked decisions table
- [x] Document explicit non-goals (shadcn, Better Auth, full CLI, docs site, upgrade system)
- [x] Define v1.1 backlog items separately so they do not creep into v1
- [x] Align Section 30 success criteria in `Svelocity-Stack-PR.md` with Option B
- [x] Get maintainer sign-off on scope

## 0.2 — Golden Path Definition

- [x] Lock default project shape: `apps/web`, `apps/desktop`, `apps/mobile`
- [x] Lock UI: Bits UI primitives + Svelocity theme tokens
- [x] Lock auth: Convex Auth only
- [x] Lock backend: Convex (queries, mutations, real-time)
- [x] Lock package manager: pnpm with workspace protocol
- [x] Lock deployment target for web: Cloudflare
- [x] Lock AI targets for v1: `AGENTS.md` + Cursor rules

## 0.3 — Naming Conventions

- [x] Decide npm scope: `@svelocity/*` for internal packages
- [x] Decide CLI package name: `create-svelocity`
- [x] Decide manifest location: `.svelocity/manifest.json`
- [x] Decide stack version scheme: semver `1.0.0` for v1 launch
- [x] Document file naming: kebab-case dirs, PascalCase Svelte components
- [x] Document import alias conventions per app

## 0.4 — Repository Layout

- [x] Approve monorepo tree (apps + packages + skills + docs)
- [x] List v1 packages: `config`, `theme`, `ui`, `app-core`, `auth`, `env`
- [x] List deferred packages: `platform`, `testing` (standalone), `assets` (merge into theme/ui for v1)
- [x] Define what lives in `apps/*` vs `packages/*`
- [x] Define `.svelocity/` contents: manifest, state (no migrations in v1)

## 0.5 — Demo Application Spec

- [x] Name demo: **Shared Tasks**
- [x] Define features: login, logout, task CRUD, real-time sync
- [x] Define UI states: loading, empty, error, unauthorized
- [x] Define shared vs platform-specific UI boundaries
- [x] Define Convex schema: users, tasks (fields, indexes)
- [x] Define auth flows: email/password or OAuth (pick one for v1)
- [x] Write acceptance criteria for demo on each platform

## 0.6 — Compatibility Matrix (V1)

- [x] Pin target Node version (e.g. Node 22 LTS or 24)
- [x] Pin pnpm version (e.g. pnpm 10+)
- [x] Pin Svelte 5.x
- [x] Pin Vite version
- [x] Pin Convex SDK tested range
- [x] Pin Electron version
- [x] Pin Capacitor version
- [x] Document in `docs/COMPATIBILITY.md`

## 0.7 — Architecture Decision Records

- [x] ADR: Why Bits UI over shadcn for v1
- [x] ADR: Why Convex Auth over Better Auth for v1
- [x] ADR: Monorepo package boundaries
- [x] ADR: Shared UI consumption across web/desktop/mobile
- [x] ADR: Thin CLI scope (create/doctor/info only)
- [x] ADR: AI instructions as versioned product assets

## 0.8 — Licensing and Contribution

- [x] Choose open source license (MIT recommended for ecosystem adoption)
- [x] Add `LICENSE` file placeholder decision
- [x] Draft contribution expectations (PR size, conventional commits)
- [x] Decide CODEOWNERS areas if applicable

## 0.9 — Risk Register

- [x] Document scope explosion mitigations
- [x] Document template rot mitigations (CI golden path)
- [x] Document native tooling friction plan (doctor checks, docs)
- [x] Document cross-platform abstraction boundaries
- [x] Assign owner for each risk

## 0.10 — Phase Handoff

- [x] Phase 1 todo list reviewed and unblocked
- [x] No open questions on package names, demo spec, or tooling versions
- [x] Create GitHub project board or equivalent with Phase 1 tasks
