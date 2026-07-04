# Phase 6 — Thin CLI

**Goal:** Wrap the proven reference monorepo in a guided `create-svelocity` CLI with `doctor` and `info` commands.  
**Prerequisites:** Phases 2–5 complete (golden-path template exists and works manually)  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [ ] `pnpm create svelocity` generates a working golden-path project
- [ ] Generated project passes `pnpm install && pnpm -r check && pnpm -r build`
- [ ] `svelocity doctor` reports actionable pass/warn/fail
- [ ] `svelocity info` reads and displays manifest
- [ ] Setup completes in under 30 minutes on prepared machine (web path)
- [ ] CLI tested in CI with dry-run or temp directory generation

---

## 6.1 — CLI Package Setup

- [ ] Create `packages/create-svelocity/` (or `packages/cli/`)
- [ ] Configure as executable npm package: `bin` field
- [ ] Use TypeScript compiled to dist, or `tsx` for dev
- [ ] Dependencies:
  - [ ] `commander` or `cac` for arg parsing
  - [ ] `prompts` or `@clack/prompts` for interactive UI
  - [ ] `picocolors` for terminal styling
  - [ ] `fs-extra` or node fs for file operations
  - [ ] `validate-npm-package-name`
- [ ] Publish name: `create-svelocity`

## 6.2 — Template Source

- [ ] Extract golden-path repo into `templates/golden/` (or use repo root as template)
- [ ] Template includes:
  - [ ] All three apps (web, desktop, mobile)
  - [ ] All packages (theme, ui, app-core, auth, env, config)
  - [ ] Skills directory (stubs or full from Phase 7)
  - [ ] `.svelocity/manifest.json` template
  - [ ] `AGENTS.md` template
- [ ] Exclude from template: `node_modules`, `.git`, `dist`, `.env`, lockfile (or include lockfile — decide)
- [ ] Token replacement system for project name, app ID, etc.

## 6.3 — `create` Command — Prompts

V1 golden path — minimal meaningful choices:

- [ ] Project name (validated)
- [ ] Confirm golden-path stack (no UI/auth toggles in v1 — show what's included):
  - [ ] Bits UI
  - [ ] Convex Auth
  - [ ] Convex backend
  - [ ] Web + Desktop + Mobile
- [ ] Convex setup:
  - [ ] "I'll set up Convex later" option
  - [ ] "Guide me through Convex init" option
- [ ] Git init: yes/no
- [ ] Install dependencies: yes/no (default yes)

**Deferred prompts (do not add in v1):**

- UI system selection
- Auth provider selection
- Platform subset selection
- Testing level
- Demo data toggle

## 6.4 — `create` Command — Execution Flow

- [ ] Validate Node and pnpm versions
- [ ] Validate target directory is empty or confirm overwrite
- [ ] Copy template files with token replacement
- [ ] Generate `.svelocity/manifest.json` with selections
- [ ] Run `git init` if selected
- [ ] Run `pnpm install`
- [ ] Print next steps:
  ```text
  cd <project>
  # Set up Convex
  pnpm --filter web convex:dev
  # Start web app
  pnpm --filter web dev
  # Start desktop
  pnpm --filter desktop dev
  # Build and sync mobile
  pnpm --filter mobile build && pnpm --filter mobile sync
  ```
- [ ] Run post-install health check (optional quick validation)

## 6.5 — `create` Command — UX

- [ ] Bold, clear welcome banner
- [ ] Progress spinner or step indicator
- [ ] Brief explanation per prompt (one line, not walls of text)
- [ ] Color-coded success/failure output
- [ ] Actionable error messages:
  - [ ] Wrong Node version → show required version
  - [ ] Missing pnpm → show install command
  - [ ] Directory not empty → suggest fix
- [ ] Total output should feel fast and confident

## 6.6 — `doctor` Command

- [ ] Detect if running inside a Svelocity project (manifest exists)
- [ ] Check categories with PASS / WARN / FAIL:

### Environment

- [ ] Node version matches compatibility matrix
- [ ] pnpm version matches compatibility matrix

### Workspace

- [ ] `pnpm-workspace.yaml` exists
- [ ] All workspace packages installable
- [ ] No dependency conflicts

### Manifest

- [ ] `.svelocity/manifest.json` valid against schema
- [ ] `stackVersion` recognized

### Convex

- [ ] `convex/` directory exists
- [ ] `CONVEX_URL` or equivalent env set
- [ ] Convex CLI available

### Auth

- [ ] Convex Auth configured in convex/
- [ ] Auth env vars present

### Targets

- [ ] For each target in manifest:
  - [ ] Web: `apps/web` builds
  - [ ] Desktop: Electron deps present
  - [ ] Mobile: Capacitor config valid, native dirs exist

### Native tooling (WARN, not FAIL)

- [ ] Android SDK detected (for mobile)
- [ ] Xcode detected (for iOS, macOS only)

- [ ] Print summary table at end
- [ ] Exit code non-zero on any FAIL

## 6.7 — `info` Command

- [ ] Read `.svelocity/manifest.json`
- [ ] Display:
  - [ ] Stack version
  - [ ] Created with
  - [ ] Targets
  - [ ] UI, auth, backend choices
  - [ ] Installed skills
  - [ ] AI targets
- [ ] Display compatibility matrix row for current stack version
- [ ] Suggest `svelocity doctor` if manifest missing or invalid

## 6.8 — CLI Distribution

- [ ] `pnpm create svelocity` works via npm/pnpm dlx
- [ ] Local dev: `pnpm --filter create-svelocity start`
- [ ] Build step produces `dist/` for publishing
- [ ] `package.json` `files` field includes template + dist
- [ ] Test with `pnpm dlx ./packages/create-svelocity` locally

## 6.9 — CLI Testing

- [ ] Unit tests for token replacement
- [ ] Unit tests for manifest generation
- [ ] Integration test: create project in temp dir
- [ ] Integration test: `install && check` in generated project
- [ ] Integration test: doctor runs without crash
- [ ] CI job: generate + validate golden path

## 6.10 — Deferred Commands (Document Only)

Document these for v1.1 — do not implement:

- [ ] `svelocity add` — add platform to existing project
- [ ] `svelocity upgrade` — stack version migrations
- [ ] `svelocity sync` — sync skills/manifest
- [ ] `svelocity generate` — scaffold components/routes
- [ ] `svelocity audit` — production audit

## 6.11 — Verification

- [ ] Fresh `pnpm create svelocity` on clean machine works
- [ ] Generated project runs web demo after Convex setup
- [ ] Doctor catches missing env vars
- [ ] Info displays correct manifest
- [ ] CLI help text is clear (`--help` on all commands)
- [ ] Phase 7 (skills) todo reviewed and unblocked
