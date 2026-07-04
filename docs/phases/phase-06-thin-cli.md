# Phase 6 — Thin CLI

**Goal:** Wrap the proven reference monorepo in a guided `create-svelocity` CLI with `doctor` and `info` commands.  
**Prerequisites:** Phases 2–5 complete (golden-path template exists and works manually)  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [x] `pnpm create svelocity` generates a working golden-path project (local `pnpm dlx ./packages/create-svelocity` verified; published alias lands in Phase 10)
- [x] Generated project passes `pnpm install && pnpm -r check && pnpm -r build`
- [x] `svelocity doctor` reports actionable pass/warn/fail
- [x] `svelocity info` reads and displays manifest
- [x] Setup completes in under 30 minutes on prepared machine (web path)
- [x] CLI tested in CI with dry-run or temp directory generation

---

## 6.1 — CLI Package Setup

- [x] Create `packages/create-svelocity/` (or `packages/cli/`)
- [x] Configure as executable npm package: `bin` field
- [x] Use TypeScript compiled to dist, or `tsx` for dev
- [x] Dependencies:
  - [x] `commander` or `cac` for arg parsing
  - [x] `prompts` or `@clack/prompts` for interactive UI
  - [x] `picocolors` for terminal styling
  - [x] `fs-extra` or node fs for file operations
  - [x] `validate-npm-package-name`
- [x] Publish name: `create-svelocity`

## 6.2 — Template Source

- [x] Extract golden-path repo into `templates/golden/` (or use repo root as template) — implemented as build-time repo snapshot to `packages/create-svelocity/template/`
- [x] Template includes:
  - [x] All three apps (web, desktop, mobile)
  - [x] All packages (theme, ui, app-core, auth, env, config)
  - [ ] Skills directory (stubs or full from Phase 7) — deferred to Phase 7; snapshot will include `skills/` automatically once present
  - [x] `.svelocity/manifest.json` template — generated at create time; schema/example ship in template
  - [ ] `AGENTS.md` template — deferred to Phase 7
- [x] Exclude from template: `node_modules`, `.git`, `dist`, `.env`, lockfile (or include lockfile — decided: lockfile is included)
- [x] Token replacement system for project name, app ID, etc.

## 6.3 — `create` Command — Prompts

V1 golden path — minimal meaningful choices:

- [x] Project name (validated)
- [x] Confirm golden-path stack (no UI/auth toggles in v1 — show what's included):
  - [x] Bits UI
  - [x] Convex Auth
  - [x] Convex backend
  - [x] Web + Desktop + Mobile
- [x] Convex setup:
  - [x] "I'll set up Convex later" option
  - [x] "Guide me through Convex init" option
- [x] Git init: yes/no
- [x] Install dependencies: yes/no (default yes)

**Deferred prompts (do not add in v1):**

- UI system selection
- Auth provider selection
- Platform subset selection
- Testing level
- Demo data toggle

## 6.4 — `create` Command — Execution Flow

- [x] Validate Node and pnpm versions
- [x] Validate target directory is empty or confirm overwrite
- [x] Copy template files with token replacement
- [x] Generate `.svelocity/manifest.json` with selections
- [x] Run `git init` if selected
- [x] Run `pnpm install`
- [x] Print next steps:
  ```text
  cd <project>
  # Set up Convex
  pnpm --filter @svelocity/backend dev
  # Start web app
  pnpm dev
  # Start desktop
  pnpm dev:desktop
  # Generate native mobile projects
  pnpm --filter mobile exec cap add ios
  pnpm --filter mobile exec cap add android
  ```
- [x] Run post-install health check (optional quick validation) — automatic run skipped; final output prints `pnpm exec svelocity doctor`

## 6.5 — `create` Command — UX

- [x] Bold, clear welcome banner
- [x] Progress spinner or step indicator
- [x] Brief explanation per prompt (one line, not walls of text)
- [x] Color-coded success/failure output
- [x] Actionable error messages:
  - [x] Wrong Node version → show required version
  - [x] Missing pnpm → show install command
  - [x] Directory not empty → suggest fix
- [x] Total output should feel fast and confident

## 6.6 — `doctor` Command

- [x] Detect if running inside a Svelocity project (manifest exists)
- [x] Check categories with PASS / WARN / FAIL:

### Environment

- [x] Node version matches compatibility matrix
- [x] pnpm version matches compatibility matrix

### Workspace

- [x] `pnpm-workspace.yaml` exists
- [x] All workspace packages installable — validated by e2e/CI; doctor remains static
- [x] No dependency conflicts — validated by e2e/CI; doctor remains static

### Manifest

- [x] `.svelocity/manifest.json` valid against schema
- [x] `stackVersion` recognized

### Convex

- [x] `convex/` directory exists
- [x] `CONVEX_URL` or equivalent env set
- [x] Convex CLI available

### Auth

- [x] Convex Auth configured in convex/
- [x] Auth env vars present

### Targets

- [x] For each target in manifest:
  - [x] Web: `apps/web` builds — build covered by e2e/CI; doctor checks target presence
  - [x] Desktop: Electron deps present
  - [x] Mobile: Capacitor config valid, native dirs exist

### Native tooling (WARN, not FAIL)

- [x] Android SDK detected (for mobile)
- [x] Xcode detected (for iOS, macOS only)

- [x] Print summary table at end
- [x] Exit code non-zero on any FAIL

## 6.7 — `info` Command

- [x] Read `.svelocity/manifest.json`
- [x] Display:
  - [x] Stack version
  - [x] Created with
  - [x] Targets
  - [x] UI, auth, backend choices
  - [x] Installed skills
  - [x] AI targets
- [x] Display compatibility matrix row for current stack version — displays stack/package pins and points to `docs/COMPATIBILITY.md`
- [x] Suggest `svelocity doctor` if manifest missing or invalid

## 6.8 — CLI Distribution

- [x] `pnpm create svelocity` works via npm/pnpm dlx — local `pnpm dlx ./packages/create-svelocity` verified; npm publishing lands in Phase 10
- [x] Local dev: `pnpm --filter create-svelocity start`
- [x] Build step produces `dist/` for publishing
- [x] `package.json` `files` field includes template + dist
- [x] Test with `pnpm dlx ./packages/create-svelocity` locally

## 6.9 — CLI Testing

- [x] Unit tests for token replacement
- [x] Unit tests for manifest generation
- [x] Integration test: create project in temp dir
- [x] Integration test: `install && check` in generated project
- [x] Integration test: doctor runs without crash
- [x] CI job: generate + validate golden path

## 6.10 — Deferred Commands (Document Only)

Document these for v1.1 — do not implement:

- [x] `svelocity add` — add platform to existing project
- [x] `svelocity upgrade` — stack version migrations
- [x] `svelocity sync` — sync skills/manifest
- [x] `svelocity generate` — scaffold components/routes
- [x] `svelocity audit` — production audit

## 6.11 — Verification

- [x] Fresh `pnpm create svelocity` on clean machine works — local temp-dir `pnpm dlx ./packages/create-svelocity` path verified; npm registry path lands in Phase 10
- [ ] Generated project runs web demo after Convex setup — manual Convex deployment smoke remains for Phase 9/10 docs + release hardening
- [x] Doctor catches missing env vars
- [x] Info displays correct manifest
- [x] CLI help text is clear (`--help` on all commands)
- [x] Phase 7 (skills) todo reviewed and unblocked
