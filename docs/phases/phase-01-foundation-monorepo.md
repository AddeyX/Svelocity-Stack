# Phase 1 — Foundation Monorepo

**Goal:** Create a stable pnpm workspace with shared tooling, empty package shells, and manifest schema.  
**Prerequisites:** Phase 0 complete  
**Estimated effort:** 3–5 days

---

## Exit Criteria

- [x] `pnpm install` succeeds from clean clone
- [x] `pnpm -r check` passes (TypeScript + lint)
- [x] Empty package shells exist with correct `workspace:*` wiring
- [x] `.svelocity/manifest.json` schema defined and validated
- [x] CI runs on pull requests
- [x] Phase 2 (shared UI) can start immediately

---

## 1.1 — Repository Bootstrap

- [x] Initialize git repository
- [x] Add root `package.json` with workspace scripts
- [x] Add `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- [x] Add `.gitignore` (node_modules, .env, dist, .svelte-kit, etc.)
- [x] Add `.npmrc` (shamefully-hoist settings if needed for tooling)
- [x] Add root `README.md` stub pointing to phase docs
- [x] Add `LICENSE` file

## 1.2 — pnpm Catalog

- [x] Create `pnpm-workspace.yaml` catalog for core deps:
  - [x] `svelte`
  - [x] `@sveltejs/kit`
  - [x] `vite`
  - [x] `typescript`
  - [x] `convex`
  - [x] `bits-ui` (or equivalent import path)
  - [x] `vitest`
  - [x] `eslint`, `prettier`
- [x] Create catalogs group for `electron` deps
- [x] Create catalogs group for `capacitor` deps
- [x] Document catalog usage in package README

## 1.3 — TypeScript Configuration

- [x] Create `packages/config/tsconfig.base.json`
- [x] Create `packages/config/tsconfig.svelte.json` for Svelte packages
- [x] Create `packages/config/tsconfig.node.json` for Node/CLI tooling
- [x] Export configs from `@svelocity/config` package
- [x] Verify `extends` works from app and package packages

## 1.4 — ESLint and Prettier

- [x] Create `@svelocity/config` ESLint flat config
- [x] Include Svelte plugin rules
- [x] Include TypeScript rules
- [x] Create shared Prettier config
- [x] Add `pnpm lint` and `pnpm format` root scripts
- [ ] Add `lint-staged` or pre-commit hook (optional for v1)

## 1.5 — Package Shells

### `packages/config`

- [x] Create `package.json` with `workspace:*` exports
- [x] Export tsconfig, eslint, prettier, vite presets

### `packages/theme`

- [x] Create `package.json`
- [x] Add `src/` placeholder
- [x] Add `tokens.css` stub
- [x] Configure package exports map

### `packages/ui`

- [x] Create `package.json`
- [x] Add `src/` with `index.ts` barrel stub
- [x] Declare peer deps: `svelte`, `bits-ui`
- [x] Configure `svelte-package` or equivalent build if needed

### `packages/app-core`

- [x] Create `package.json`
- [x] Add `src/` with types and utils stubs
- [x] Export validation helpers placeholder

### `packages/auth`

- [x] Create `package.json`
- [x] Add Convex Auth adapter stubs
- [x] Export session types placeholder

### `packages/env`

- [x] Create `package.json`
- [x] Add Zod or similar env schema stub
- [x] Export `parseEnv` placeholder

## 1.6 — App Shells (Empty)

- [x] Create `apps/web/` directory with placeholder `package.json`
- [x] Create `apps/desktop/` directory with placeholder `package.json`
- [x] Create `apps/mobile/` directory with placeholder `package.json`
- [x] Wire each app to `@svelocity/config` via `workspace:*`
- [x] Do not implement app logic yet — shells only

## 1.7 — Manifest Schema

- [x] Create `.svelocity/manifest.schema.json`
- [x] Define required fields:
  - [x] `stackVersion`
  - [x] `createdWith`
  - [x] `targets` (array: web, desktop, mobile)
  - [x] `ui` (enum: `bits-ui`)
  - [x] `auth` (enum: `convex-auth`)
  - [x] `backend` (enum: `convex`)
  - [x] `packageManager`
  - [x] `aiTargets`
  - [x] `skills` (array)
- [x] Add example manifest at `.svelocity/manifest.example.json`
- [x] Add JSON schema validation script

## 1.8 — Root Scripts

- [x] `pnpm dev` — delegate to web (placeholder)
- [x] `pnpm build` — `pnpm -r build`
- [x] `pnpm check` — `pnpm -r check`
- [x] `pnpm test` — `pnpm -r test`
- [x] `pnpm lint` — `pnpm -r lint`
- [x] `pnpm clean` — remove dist artifacts

## 1.9 — Testing Infrastructure

- [x] Add Vitest root config via `@svelocity/config`
- [x] Add sample unit test in `packages/app-core` that passes
- [ ] Add Playwright as dev dependency (config stub only)
- [x] Document test conventions in package README

## 1.10 — CI Pipeline

- [x] Add GitHub Actions workflow (or equivalent)
- [x] Steps: checkout, setup Node, setup pnpm, `pnpm install --frozen-lockfile`
- [x] Steps: `pnpm -r check`, `pnpm -r lint`, `pnpm -r test`
- [x] Cache pnpm store
- [x] Fail on lockfile drift

## 1.11 — Release Tooling (Minimal)

- [ ] Add Changesets config (optional but recommended)
- [x] Document version bump process for v1.0.0
- [x] Commit `pnpm-lock.yaml`

## 1.12 — Verification

- [ ] Fresh clone → install → check passes
- [x] Manifest schema validates example file
- [x] All workspace packages resolve via `workspace:*`
- [x] No circular dependencies between packages
- [x] Phase 2 todo reviewed and unblocked
