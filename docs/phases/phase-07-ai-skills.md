# Phase 7 — AI Skills + Agent Instructions

**Goal:** Make the repository safe and productive for AI coding agents via `AGENTS.md`, Cursor rules, and official skills.  
**Prerequisites:** Phases 2–5 complete (real code to document); Phase 6 in progress or complete  
**Priority:** High — parallel with CLI once app templates exist  
**Estimated effort:** 4–6 days

---

## Exit Criteria

- [ ] `AGENTS.md` accurately describes repo structure and boundaries
- [ ] Cursor rules enforce architecture guardrails
- [ ] 3 official skills exist and are installable in generated projects
- [ ] An AI agent can configure auth using `svelocity-auth` skill
- [ ] An AI agent can add a Convex query using `svelocity-convex` skill
- [ ] Skills versioned and tied to `stackVersion` in manifest

---

## 7.1 — AGENTS.md (Root)

- [ ] Write comprehensive `AGENTS.md` covering:

### Repository overview

- [ ] What Svelocity Stack is
- [ ] Golden-path decisions (Bits UI, Convex Auth, three platforms)
- [ ] Package manager: pnpm, workspace protocol

### Directory map

- [ ] `apps/web` — SvelteKit, owns web routing and Cloudflare deploy
- [ ] `apps/desktop` — Electron SPA shell
- [ ] `apps/mobile` — Capacitor SPA shell
- [ ] `packages/ui` — shared Svelte components only
- [ ] `packages/theme` — tokens only
- [ ] `packages/app-core` — business logic, Convex wrappers
- [ ] `packages/auth` — auth helpers and types
- [ ] `packages/env` — env parsing
- [ ] `packages/config` — shared tooling configs
- [ ] `convex/` — backend schema and functions
- [ ] `.svelocity/` — manifest and stack metadata

### Architecture rules

- [ ] Business logic goes in `app-core`, not apps
- [ ] UI components go in `packages/ui`, not duplicated per app
- [ ] Apps are thin platform shells
- [ ] No cross-app imports — apps import packages only
- [ ] No packages importing from apps

### Code conventions

- [ ] Svelte 5 runes
- [ ] TypeScript strict
- [ ] Bits UI wrapping pattern
- [ ] File naming conventions

### Common workflows

- [ ] Add a new shared component
- [ ] Add a new Convex table/query/mutation
- [ ] Add a new route to web app
- [ ] Run dev/build/check commands per target

### Prohibited shortcuts

- [ ] No `any` types without comment
- [ ] No business logic in UI components
- [ ] No bypassing auth guards
- [ ] No secrets in client bundles
- [ ] No disabling Electron context isolation

## 7.2 — Cursor Rules

- [ ] Create `.cursor/rules/svelocity-architecture.mdc`
  - [ ] Package boundary enforcement
  - [ ] Import direction rules
- [ ] Create `.cursor/rules/svelocity-svelte.mdc`
  - [ ] Svelte 5 patterns
  - [ ] Bits UI usage
  - [ ] Component file structure
- [ ] Create `.cursor/rules/svelocity-convex.mdc`
  - [ ] Schema patterns
  - [ ] Query/mutation conventions
  - [ ] Auth integration rules
- [ ] Create `.cursor/rules/svelocity-platforms.mdc`
  - [ ] Web vs desktop vs mobile concerns
  - [ ] What stays in app vs package
- [ ] Rules reference `AGENTS.md` for full context

## 7.3 — Skill: `svelocity-convex`

Location: `skills/svelocity-convex/SKILL.md`

- [ ] **Purpose:** Guide Convex setup, schema, queries, mutations in Svelocity repos
- [ ] **Prerequisites:** Convex initialized, env vars set
- [ ] **Steps:**
  - [ ] Define schema in `convex/schema.ts`
  - [ ] Create query/mutation files
  - [ ] Add indexes
  - [ ] Wire client in `packages/app-core`
  - [ ] Use reactive queries in Svelte components
  - [ ] Validate with `npx convex dev`
- [ ] **File locations:** Document exact paths
- [ ] **Validation:** Schema deploys, query returns data
- [ ] **Rollback:** How to revert schema changes
- [ ] **Risks:** Breaking schema migrations, missing auth checks
- [ ] **Checklist:** Pre/post completion items

## 7.4 — Skill: `svelocity-auth`

Location: `skills/svelocity-auth/SKILL.md`

- [ ] **Purpose:** Configure and extend Convex Auth in Svelocity repos
- [ ] **Prerequisites:** Convex running, `packages/auth` exists
- [ ] **Steps:**
  - [ ] Verify Convex Auth config in `convex/auth.ts`
  - [ ] Configure auth provider (email/OAuth)
  - [ ] Set environment variables
  - [ ] Wire `packages/auth` client helpers
  - [ ] Add route guards in web app
  - [ ] Add auth checks in desktop/mobile shells
  - [ ] Test login/logout/register flows
- [ ] **File locations:** Document exact paths
- [ ] **Validation:** Protected routes work, session persists
- [ ] **Security checks:** No tokens in client storage insecurely
- [ ] **Checklist:** Pre/post completion items

## 7.5 — Skill: `svelocity-add-platform`

Location: `skills/svelocity-add-platform/SKILL.md`

- [ ] **Purpose:** Manual guide for adding a platform to existing Svelocity repo (v1 — no CLI `add` command)
- [ ] **Prerequisites:** At least one platform working, shared packages exist
- [ ] **Steps for adding desktop:**
  - [ ] Copy `apps/desktop` structure from reference
  - [ ] Wire workspace deps
  - [ ] Configure Electron main/preload
  - [ ] Connect app-core and auth
  - [ ] Update manifest targets
  - [ ] Verify build
- [ ] **Steps for adding mobile:** (similar for Capacitor)
- [ ] **Steps for adding web:** (similar for SvelteKit)
- [ ] **Validation:** `pnpm --filter <target> dev` works
- [ ] **Note:** v1.1 will automate via `svelocity add`

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

- [ ] Each skill is self-contained markdown
- [ ] Each skill lists compatible `stackVersion` range
- [ ] Skills included in CLI template output
- [ ] Manifest `skills` array lists installed skills

## 7.7 — Deferred Skills (Document in v1.1 Backlog)

Do not write full skills yet — stub references only:

- [ ] `svelocity-electron` — packaging, signing, IPC hardening
- [ ] `svelocity-capacitor` — native plugins, permissions, release
- [ ] `svelocity-deploy` — Cloudflare, store submission
- [ ] `svelocity-upgrade` — dependency and stack migrations
- [ ] `svelocity-production-audit` — security and readiness checks

## 7.8 — Sub-Agents (Deferred)

V1 uses `AGENTS.md` sections instead of separate sub-agent files.

- [ ] Add "Architecture Review" section to AGENTS.md (replaces architecture-agent)
- [ ] Add "Auth Review" section (replaces auth-agent)
- [ ] Defer `agents/` directory to v1.1

## 7.9 — Skill Testing

- [ ] Manual test: follow `svelocity-convex` to add a new table — works
- [ ] Manual test: follow `svelocity-auth` to add OAuth provider — works
- [ ] Manual test: follow `svelocity-add-platform` to understand desktop add — clear
- [ ] Verify skills work when copied into fresh generated project

## 7.10 — CLI Integration

- [ ] Template includes `AGENTS.md`, `.cursor/rules/`, `skills/`
- [ ] Manifest records `aiTargets: ["cursor", "agents"]`
- [ ] Manifest records `skills: ["svelocity-convex", "svelocity-auth", "svelocity-add-platform"]`
- [ ] `svelocity info` lists installed skills

## 7.11 — Verification

- [ ] AGENTS.md matches actual repo structure (no stale paths)
- [ ] Cursor rules don't contradict AGENTS.md
- [ ] All 3 skills have complete checklists
- [ ] Skills version metadata present
- [ ] Phase 8 todo reviewed and unblocked
