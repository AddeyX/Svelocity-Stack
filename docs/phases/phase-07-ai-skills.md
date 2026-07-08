# Phase 7 — AI Skills + Agent Instructions

**Goal:** Make the repository safe and productive for AI coding agents via `AGENTS.md`, Cursor rules, and official skills.  
**Prerequisites:** Phases 2–5 complete (real code to document); Phase 6 in progress or complete  
**Priority:** High — parallel with CLI once app templates exist  
**Estimated effort:** 4–6 days

---

## Exit Criteria

- [x] `AGENTS.md` accurately describes repo structure and boundaries — enforced by the `AGENTS.md only references paths that exist in the template` test (`packages/create-svelocity/tests/build-template.spec.ts`)
- [x] Cursor rules enforce architecture guardrails — shipped as one `alwaysApply` pointer file, `.cursor/rules/svelocity.mdc`, instead of four separate rule files; `AGENTS.md` is the single source (design decision, `docs/superpowers/specs/2026-07-07-phase-07-ai-skills-design.md`)
- [x] 3 official skills exist and are installable in generated projects — five shipped: the original three plus `svelocity-alignment-audit` and `svelocity-changelog` (spec decision #3)
- [ ] An AI agent can configure auth using `svelocity-auth` skill — not manually walked in Phase 7; lands with Phase 9/10 verification
- [ ] An AI agent can add a Convex query using `svelocity-convex` skill — not manually walked in Phase 7; lands with Phase 9/10 verification
- [x] Skills versioned and tied to `stackVersion` in manifest — every `SKILL.md` carries `compatibleStackVersion: 0.1.x` frontmatter

---

## 7.1 — AGENTS.md (Root)

- [x] Write comprehensive `AGENTS.md` covering:

### Repository overview

- [x] What Svelocity Stack is
- [x] Golden-path decisions (Bits UI, Convex Auth, three platforms)
- [x] Package manager: pnpm, workspace protocol

### Directory map

- [x] `apps/web` — SvelteKit, owns web routing and Cloudflare deploy
- [x] `apps/desktop` — Electron SPA shell
- [x] `apps/mobile` — Capacitor SPA shell
- [x] `packages/ui` — shared Svelte components only
- [x] `packages/theme` — tokens only
- [x] `packages/app-core` — business logic, Convex wrappers
- [x] `packages/auth` — auth helpers and types
- [x] `packages/env` — env parsing
- [x] `packages/config` — shared tooling configs
- [x] `convex/` — backend schema and functions — actual path is `packages/backend/convex/`, not a root `convex/` dir; matches this repo's package layout from earlier phases, not a Phase 7 decision
- [x] `.svelocity/` — manifest and stack metadata

### Architecture rules

- [x] Business logic goes in `app-core`, not apps
- [x] UI components go in `packages/ui`, not duplicated per app
- [x] Apps are thin platform shells
- [x] No cross-app imports — apps import packages only
- [x] No packages importing from apps

### Code conventions

- [x] Svelte 5 runes — Foundational Stack table ("Svelte 5 (runes only)")
- [x] TypeScript strict — Foundational Stack table
- [x] Bits UI wrapping pattern — Foundational Stack table + directory map
- [x] File naming conventions — delegated via the "Before You Start" pointer to `docs/CONVENTIONS.md` rather than duplicated inline

### Common workflows

- [x] Add a new shared component — covered by `packages/ui/README.md`, linked from `AGENTS.md` step 3
- [x] Add a new Convex table/query/mutation — covered by the `svelocity-convex` skill rather than an inline workflow list
- [x] Add a new route to web app — covered by root `README.md` + the `svelocity-add-platform` skill for shell-level wiring
- [x] Run dev/build/check commands per target — root `README.md` "Commands" table; `AGENTS.md` "After Every Change" points at `pnpm check`/`pnpm test`

### Prohibited shortcuts

- [x] No `any` types without comment
- [x] No business logic in UI components
- [x] No bypassing auth guards
- [x] No secrets in client bundles
- [x] No disabling Electron context isolation

## 7.2 — Cursor Rules

- [x] Create `.cursor/rules/svelocity-architecture.mdc` — shipped as one `alwaysApply` pointer file, `.cursor/rules/svelocity.mdc`, instead of four separate `.mdc` files; `AGENTS.md` is the single source (design decision, spec 2026-07-07)
  - [x] Package boundary enforcement
  - [x] Import direction rules
- [x] Create `.cursor/rules/svelocity-svelte.mdc` — consolidated into `svelocity.mdc`
  - [x] Svelte 5 patterns — "Svelte 5 runes only" bullet
  - [ ] Bits UI usage — not ported; the single-file design defers implementation detail to `AGENTS.md`/skills instead of duplicating it in Cursor rules
  - [ ] Component file structure — same, not ported
- [x] Create `.cursor/rules/svelocity-convex.mdc` — consolidated into `svelocity.mdc`
  - [ ] Schema patterns — not ported; lives in the `svelocity-convex` skill
  - [ ] Query/mutation conventions — not ported; lives in the `svelocity-convex` skill
  - [ ] Auth integration rules — not ported; lives in the `svelocity-auth` skill + `AGENTS.md` "Auth Review" section
- [x] Create `.cursor/rules/svelocity-platforms.mdc` — consolidated into `svelocity.mdc`
  - [x] Web vs desktop vs mobile concerns — "Apps are thin platform shells" bullet
  - [x] What stays in app vs package — "Business logic lives in packages/app-core" bullet
- [x] Rules reference `AGENTS.md` for full context — first line of `svelocity.mdc`

## 7.3 — Skill: `svelocity-convex`

Location: `.agents/skills/svelocity-convex/SKILL.md` — not `skills/svelocity-convex/SKILL.md` (layout deviation, see 7.6)

- [x] **Purpose:** Guide Convex setup, schema, queries, mutations in Svelocity repos
- [x] **Prerequisites:** Convex initialized, env vars set — "Before you start" section
- [x] **Steps:**
  - [x] Define schema in `convex/schema.ts` — actual path `packages/backend/convex/schema.ts`
  - [x] Create query/mutation files
  - [x] Add indexes
  - [x] Wire client in `packages/app-core`
  - [x] Use reactive queries in Svelte components
  - [x] Validate with `npx convex dev` — actual command is `pnpm --filter @svelocity/backend dev` (wraps `convex dev` for this monorepo)
- [x] **File locations:** Document exact paths
- [x] **Validation:** Schema deploys, query returns data
- [x] **Rollback:** How to revert schema changes
- [x] **Risks:** Breaking schema migrations, missing auth checks
- [x] **Checklist:** Pre/post completion items — the copyable 5-step workflow checklist in the skill body

## 7.4 — Skill: `svelocity-auth`

Location: `.agents/skills/svelocity-auth/SKILL.md` — not `skills/svelocity-auth/SKILL.md` (layout deviation, see 7.6)

- [x] **Purpose:** Configure and extend Convex Auth in Svelocity repos
- [x] **Prerequisites:** Convex running, `packages/auth` exists — implied by the "File map" + workflow intro rather than a labeled "Prerequisites" heading
- [x] **Steps:**
  - [x] Verify Convex Auth config in `convex/auth.ts` — actual path `packages/backend/convex/auth.ts`
  - [x] Configure auth provider (email/OAuth)
  - [x] Set environment variables
  - [x] Wire `packages/auth` client helpers
  - [x] Add route guards in web app
  - [x] Add auth checks in desktop/mobile shells
  - [x] Test login/logout/register flows
- [x] **File locations:** Document exact paths — "File map" table
- [x] **Validation:** Protected routes work, session persists
- [x] **Security checks:** No tokens in client storage insecurely — "Security checklist" section
- [x] **Checklist:** Pre/post completion items — the copyable 5-step workflow checklist in the skill body

## 7.5 — Skill: `svelocity-add-platform`

Location: `.agents/skills/svelocity-add-platform/SKILL.md` — not `skills/svelocity-add-platform/SKILL.md` (layout deviation, see 7.6)

- [x] **Purpose:** Manual guide for adding a platform to existing Svelocity repo (v1 — no CLI `add` command)
- [x] **Prerequisites:** At least one platform working, shared packages exist — implied by the intro paragraph
- [x] **Steps for adding desktop:**
  - [x] Copy `apps/desktop` structure from reference
  - [x] Wire workspace deps
  - [x] Configure Electron main/preload
  - [x] Connect app-core and auth
  - [x] Update manifest targets
  - [x] Verify build
- [x] **Steps for adding mobile:** (similar for Capacitor)
- [x] **Steps for adding web:** (similar for SvelteKit)
- [x] **Validation:** `pnpm --filter <target> dev` works
- [x] **Note:** v1.1 will automate via `svelocity add`

## 7.6 — Skills Directory Structure

```text
skills/
├── svelocity-convex/
│   └── SKILL.md
├── svelocity-auth/
│   └── SKILL.md
└── svelocity-add-platform/
    └── SKILL.md
```

Deviation: shipped as `.agents/skills/` (canonical), not root `skills/`, with
`.claude/skills/<name>` symlinks generated at `create` time for Claude Code discovery
(copy fallback if `symlink()` throws). Two more skills ship beyond this original
three — `svelocity-alignment-audit/` and `svelocity-changelog/`, each with sibling
`reference.md`/template files — see `.agents/README.md` for the full bundled-skills
table (design decision #1 and #3).

- [x] Each skill is self-contained markdown — folder-scoped, with sibling reference/template files where a skill exceeds ~150 lines
- [x] Each skill lists compatible `stackVersion` range — `compatibleStackVersion: 0.1.x` frontmatter
- [x] Skills included in CLI template output — `build-template.spec.ts` asserts all five `SKILL.md` files ship
- [x] Manifest `skills` array lists installed skills — `.svelocity/manifest.schema.json` + e2e assertion

## 7.7 — Deferred Skills (Document in v1.1 Backlog)

Do not write full skills yet — stub references only:

- [x] `svelocity-electron` — packaging, signing, IPC hardening
- [x] `svelocity-capacitor` — native plugins, permissions, release
- [x] `svelocity-deploy` — Cloudflare, store submission
- [x] `svelocity-upgrade` — dependency and stack migrations
- [x] `svelocity-production-audit` — security and readiness checks

Documented-only, as planned — all five are recorded under "Skills" in
`docs/V1.1-BACKLOG.md`; none are implemented in v1.

## 7.8 — Sub-Agents (Deferred)

V1 uses `AGENTS.md` sections instead of separate sub-agent files.

- [x] Add "Architecture Review" section to AGENTS.md (replaces architecture-agent)
- [x] Add "Auth Review" section (replaces auth-agent)
- [x] Defer `agents/` directory to v1.1 — recorded under "Sub-Agents" in `docs/V1.1-BACKLOG.md`

## 7.9 — Skill Testing

- [ ] Manual test: follow `svelocity-convex` to add a new table — works — not executed in Phase 7; lands with Phase 9/10 verification
- [ ] Manual test: follow `svelocity-auth` to add OAuth provider — works — not executed in Phase 7; lands with Phase 9/10 verification
- [ ] Manual test: follow `svelocity-add-platform` to understand desktop add — clear — not executed in Phase 7; lands with Phase 9/10 verification
- [x] Verify skills work when copied into fresh generated project — covered by automated evidence, not a live agent walkthrough: the gated e2e test (`ships AI assets`, `packages/create-svelocity/tests/integration.spec.ts`, `CLI_INTEGRATION=1`) asserts all five `.agents/skills/<name>/SKILL.md` files exist in a freshly generated project, `.claude/skills/<name>` symlinks resolve and contain the skill name, and `AGENTS.md` is fully tokenized with no `{{` residue

## 7.10 — CLI Integration

- [x] Template includes `AGENTS.md`, `.cursor/rules/`, `skills/` — skills ship at `.agents/skills/`, not root `skills/` (see 7.6)
- [x] Manifest records `aiTargets: ["cursor", "agents"]` — actual values are `["agents-md", "cursor-rules"]` (`.svelocity/manifest.schema.json`)
- [x] Manifest records `skills: ["svelocity-convex", "svelocity-auth", "svelocity-add-platform"]` — actual array has all five: adds `svelocity-alignment-audit`, `svelocity-changelog`
- [x] `svelocity info` lists installed skills — `packages/create-svelocity/src/commands/info/info.ts` renders `ai targets` and `skills` rows

## 7.11 — Verification

- [x] AGENTS.md matches actual repo structure (no stale paths) — enforced by the `AGENTS.md only references paths that exist in the template` test (`build-template.spec.ts`)
- [x] Cursor rules don't contradict AGENTS.md — `svelocity.mdc`'s rule bullets are verbatim subset of `AGENTS.md`'s Architecture Rules + Prohibited Shortcuts
- [x] All 3 skills have complete checklists — all five skills have complete Purpose/Steps/Validation/Risks sections (see 7.3–7.6)
- [x] Skills version metadata present — `compatibleStackVersion` frontmatter on every skill
- [x] Phase 8 todo reviewed and unblocked — `docs/phases/phase-08-doctor-ci.md` lists "Phases 3–7 complete" as its prerequisite; Phase 7 exit criteria above are satisfied (manual skill walkthroughs excepted, tracked for Phase 9/10)
