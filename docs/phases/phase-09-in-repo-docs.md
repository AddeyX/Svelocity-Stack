# Phase 9 — In-Repo Documentation

**Goal:** Write the guides a solo developer needs to go from zero to running apps to deploying web — all inside the repo.  
**Prerequisites:** Phases 3–8 complete (real commands and flows to document)  
**Estimated effort:** 3–4 days

---

## Exit Criteria

- [ ] New user can complete web setup using README + guides only
- [x] Each platform has a dev/build/run guide
- [ ] Cloudflare deploy guide verified end-to-end
- [x] Common errors have dedicated troubleshooting entries
- [x] No dependency on external docs site

> The two unticked criteria require a clean machine and a real Cloudflare account;
> they are covered by Phase 10 §10.1–10.2 (validation gauntlet + smoke tests) and
> the deploy-cloudflare guide's post-deploy checklist.

---

## 9.1 — Root README.md

- [x] Project title and one-line description
- [x] What Svelocity Stack is (2–3 sentences)
- [x] Golden-path stack summary table
- [x] Prerequisites: Node, pnpm, Git versions with links
- [x] Quick start:
  ```bash
  pnpm create svelocity my-app
  cd my-app
  pnpm install
  pnpm --filter web convex:dev   # separate terminal
  pnpm --filter web dev
  ```
- [x] Repository structure diagram (text tree)
- [x] Links to all guides in `docs/guides/`
- [x] Scripts reference table
- [x] Contributing link
- [x] License

## 9.2 — Guide: First Project

File: `docs/guides/first-project.md`

- [x] Prerequisites checklist
- [x] Step-by-step: create project with CLI
- [x] Step-by-step: Convex account and init
- [x] Step-by-step: environment variables
- [x] Step-by-step: run web demo
- [x] Step-by-step: run desktop demo
- [x] Step-by-step: build and sync mobile
- [x] Expected outcome at each step
- [x] "You should see..." confirmation points
- [x] Total time estimate (~30 min web, +15–30 mobile/desktop)

## 9.3 — Guide: Repository Architecture

File: `docs/guides/architecture.md`

- [x] Monorepo diagram (apps vs packages)
- [x] Package dependency graph
- [x] What goes where (decision table)
- [x] Shared UI consumption pattern
- [x] app-core ownership rules
- [x] Platform shell responsibilities
- [x] `.svelocity/manifest.json` explained
- [x] How to add a shared component (recipe)
- [x] How to add a Convex function (recipe)

## 9.4 — Guide: Convex Setup

File: `docs/guides/convex.md`

- [x] Create Convex account
- [x] `npx convex dev` first run
- [x] Project structure: `convex/` directory
- [x] Schema definition patterns
- [x] Query/mutation patterns
- [x] Real-time subscriptions in Svelte
- [x] Environment variables
- [x] Deployment to Convex cloud
- [x] Link to `svelocity-convex` skill

## 9.5 — Guide: Authentication

File: `docs/guides/authentication.md`

- [x] Convex Auth overview in Svelocity
- [x] Supported auth methods in v1
- [x] Environment variables for auth
- [x] How route protection works (web)
- [x] How auth works in desktop/mobile shells
- [x] Adding a new OAuth provider (outline)
- [x] Security checklist
- [x] Link to `svelocity-auth` skill

## 9.6 — Guide: Shared UI (Bits UI)

File: `docs/guides/ui.md`

- [x] Bits UI + Svelocity theme architecture
- [x] Available components list
- [x] How to use a component (import, props)
- [x] How to add a new component (wrap Bits primitive)
- [x] Application state components usage
- [x] Platform override CSS
- [x] Accessibility expectations
- [x] Do's and don'ts (no business logic in UI)

## 9.7 — Guide: Web (SvelteKit)

File: `docs/guides/web.md`

- [x] Dev: `pnpm --filter web dev`
- [x] Build: `pnpm --filter web build`
- [x] Preview: `pnpm --filter web preview`
- [x] Routing structure
- [x] Adapter: Cloudflare
- [x] Environment variables
- [x] Adding a new page/route

## 9.8 — Guide: Desktop (Electron)

File: `docs/guides/desktop.md`

- [x] Prerequisites (none beyond Node for dev)
- [x] Dev: `pnpm --filter desktop dev`
- [x] Build: `pnpm --filter desktop build`
- [x] Package: `pnpm --filter desktop package`
- [x] Main/preload/renderer explained
- [x] Security rules (non-negotiable)
- [x] IPC surface documentation
- [x] Packaging output locations
- [x] Signing and notarization (manual steps, links to Apple/Microsoft docs)

## 9.9 — Guide: Mobile (Capacitor)

File: `docs/guides/mobile.md`

- [x] Prerequisites: Android Studio, Xcode, SDKs
- [x] Dev: `pnpm --filter mobile dev`
- [x] Build + sync: `pnpm --filter mobile build && pnpm --filter mobile sync`
- [x] Run Android: `pnpm --filter mobile open:android`
- [x] Run iOS: `pnpm --filter mobile open:ios`
- [x] Capacitor config explained
- [x] Safe areas and mobile UI notes
- [x] Adding a Capacitor plugin (outline)
- [x] Release signing (manual steps, links to Google/Apple docs)

## 9.10 — Guide: Cloudflare Deployment

File: `docs/guides/deploy-cloudflare.md`

- [x] Prerequisites: Cloudflare account, Convex deployed
- [x] Build settings for SvelteKit adapter-cloudflare
- [x] Environment variables in Cloudflare dashboard
- [x] Deploy via `wrangler` or Cloudflare Pages
- [x] Preview deployments
- [x] Custom domain setup
- [x] Post-deploy verification checklist
- [x] Common failures and fixes

## 9.11 — Guide: AI Workflow

File: `docs/guides/ai-workflow.md`

- [x] How to use `AGENTS.md` with any agent
- [x] Cursor rules setup
- [x] Available skills and when to use each
- [x] How to invoke a skill in Cursor
- [x] Architecture boundaries agents must respect
- [x] What to do when agent suggests wrong pattern

## 9.12 — Guide: Troubleshooting

File: `docs/guides/troubleshooting.md`

- [x] `pnpm install` failures
- [x] Wrong Node/pnpm version
- [x] Convex connection errors
- [x] Auth session not persisting
- [x] Electron blank window
- [x] Capacitor sync failures
- [x] Android Gradle errors
- [x] iOS CocoaPods errors
- [x] Build passes locally but fails in CI
- [x] Real-time sync not working
- [x] Each entry: symptom → cause → fix

## 9.13 — V1 Scope and Compatibility

- [x] `docs/V1-SCOPE.md` — locked decisions (from Phase 0)
- [x] `docs/COMPATIBILITY.md` — version matrix
- [x] `docs/V1.1-BACKLOG.md` — deferred features

## 9.14 — Per-App READMEs

- [x] `apps/web/README.md` — dev, build, env, deploy link
- [x] `apps/desktop/README.md` — dev, build, package
- [x] `apps/mobile/README.md` — dev, sync, run
- [x] Each package README updated with real usage

## 9.15 — Documentation Quality

- [x] All commands are copy-pasteable and tested
- [x] No references to unimplemented features without "v1.1" label
- [x] Links between related guides work
- [x] Diagrams where helpful (architecture, auth flow)
- [x] Consistent terminology throughout

## 9.16 — Verification

- [ ] Walk through first-project guide on clean machine — succeeds
- [ ] Cloudflare deploy guide verified with real deploy
- [x] Troubleshooting entries match real errors encountered in Phases 3–5
- [x] Phase 10 todo reviewed and unblocked
