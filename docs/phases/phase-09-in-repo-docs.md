# Phase 9 — In-Repo Documentation

**Goal:** Write the guides a solo developer needs to go from zero to running apps to deploying web — all inside the repo.  
**Prerequisites:** Phases 3–8 complete (real commands and flows to document)  
**Estimated effort:** 3–4 days

---

## Exit Criteria

- [ ] New user can complete web setup using README + guides only
- [ ] Each platform has a dev/build/run guide
- [ ] Cloudflare deploy guide verified end-to-end
- [ ] Common errors have dedicated troubleshooting entries
- [ ] No dependency on external docs site

---

## 9.1 — Root README.md

- [ ] Project title and one-line description
- [ ] What Svelocity Stack is (2–3 sentences)
- [ ] Golden-path stack summary table
- [ ] Prerequisites: Node, pnpm, Git versions with links
- [ ] Quick start:
  ```bash
  pnpm create svelocity my-app
  cd my-app
  pnpm install
  pnpm --filter web convex:dev   # separate terminal
  pnpm --filter web dev
  ```
- [ ] Repository structure diagram (text tree)
- [ ] Links to all guides in `docs/guides/`
- [ ] Scripts reference table
- [ ] Contributing link
- [ ] License

## 9.2 — Guide: First Project

File: `docs/guides/first-project.md`

- [ ] Prerequisites checklist
- [ ] Step-by-step: create project with CLI
- [ ] Step-by-step: Convex account and init
- [ ] Step-by-step: environment variables
- [ ] Step-by-step: run web demo
- [ ] Step-by-step: run desktop demo
- [ ] Step-by-step: build and sync mobile
- [ ] Expected outcome at each step
- [ ] "You should see..." confirmation points
- [ ] Total time estimate (~30 min web, +15–30 mobile/desktop)

## 9.3 — Guide: Repository Architecture

File: `docs/guides/architecture.md`

- [ ] Monorepo diagram (apps vs packages)
- [ ] Package dependency graph
- [ ] What goes where (decision table)
- [ ] Shared UI consumption pattern
- [ ] app-core ownership rules
- [ ] Platform shell responsibilities
- [ ] `.svelocity/manifest.json` explained
- [ ] How to add a shared component (recipe)
- [ ] How to add a Convex function (recipe)

## 9.4 — Guide: Convex Setup

File: `docs/guides/convex.md`

- [ ] Create Convex account
- [ ] `npx convex dev` first run
- [ ] Project structure: `convex/` directory
- [ ] Schema definition patterns
- [ ] Query/mutation patterns
- [ ] Real-time subscriptions in Svelte
- [ ] Environment variables
- [ ] Deployment to Convex cloud
- [ ] Link to `svelocity-convex` skill

## 9.5 — Guide: Authentication

File: `docs/guides/authentication.md`

- [ ] Convex Auth overview in Svelocity
- [ ] Supported auth methods in v1
- [ ] Environment variables for auth
- [ ] How route protection works (web)
- [ ] How auth works in desktop/mobile shells
- [ ] Adding a new OAuth provider (outline)
- [ ] Security checklist
- [ ] Link to `svelocity-auth` skill

## 9.6 — Guide: Shared UI (Bits UI)

File: `docs/guides/ui.md`

- [ ] Bits UI + Svelocity theme architecture
- [ ] Available components list
- [ ] How to use a component (import, props)
- [ ] How to add a new component (wrap Bits primitive)
- [ ] Application state components usage
- [ ] Platform override CSS
- [ ] Accessibility expectations
- [ ] Do's and don'ts (no business logic in UI)

## 9.7 — Guide: Web (SvelteKit)

File: `docs/guides/web.md`

- [ ] Dev: `pnpm --filter web dev`
- [ ] Build: `pnpm --filter web build`
- [ ] Preview: `pnpm --filter web preview`
- [ ] Routing structure
- [ ] Adapter: Cloudflare
- [ ] Environment variables
- [ ] Adding a new page/route

## 9.8 — Guide: Desktop (Electron)

File: `docs/guides/desktop.md`

- [ ] Prerequisites (none beyond Node for dev)
- [ ] Dev: `pnpm --filter desktop dev`
- [ ] Build: `pnpm --filter desktop build`
- [ ] Package: `pnpm --filter desktop package`
- [ ] Main/preload/renderer explained
- [ ] Security rules (non-negotiable)
- [ ] IPC surface documentation
- [ ] Packaging output locations
- [ ] Signing and notarization (manual steps, links to Apple/Microsoft docs)

## 9.9 — Guide: Mobile (Capacitor)

File: `docs/guides/mobile.md`

- [ ] Prerequisites: Android Studio, Xcode, SDKs
- [ ] Dev: `pnpm --filter mobile dev`
- [ ] Build + sync: `pnpm --filter mobile build && pnpm --filter mobile sync`
- [ ] Run Android: `pnpm --filter mobile open:android`
- [ ] Run iOS: `pnpm --filter mobile open:ios`
- [ ] Capacitor config explained
- [ ] Safe areas and mobile UI notes
- [ ] Adding a Capacitor plugin (outline)
- [ ] Release signing (manual steps, links to Google/Apple docs)

## 9.10 — Guide: Cloudflare Deployment

File: `docs/guides/deploy-cloudflare.md`

- [ ] Prerequisites: Cloudflare account, Convex deployed
- [ ] Build settings for SvelteKit adapter-cloudflare
- [ ] Environment variables in Cloudflare dashboard
- [ ] Deploy via `wrangler` or Cloudflare Pages
- [ ] Preview deployments
- [ ] Custom domain setup
- [ ] Post-deploy verification checklist
- [ ] Common failures and fixes

## 9.11 — Guide: AI Workflow

File: `docs/guides/ai-workflow.md`

- [ ] How to use `AGENTS.md` with any agent
- [ ] Cursor rules setup
- [ ] Available skills and when to use each
- [ ] How to invoke a skill in Cursor
- [ ] Architecture boundaries agents must respect
- [ ] What to do when agent suggests wrong pattern

## 9.12 — Guide: Troubleshooting

File: `docs/guides/troubleshooting.md`

- [ ] `pnpm install` failures
- [ ] Wrong Node/pnpm version
- [ ] Convex connection errors
- [ ] Auth session not persisting
- [ ] Electron blank window
- [ ] Capacitor sync failures
- [ ] Android Gradle errors
- [ ] iOS CocoaPods errors
- [ ] Build passes locally but fails in CI
- [ ] Real-time sync not working
- [ ] Each entry: symptom → cause → fix

## 9.13 — V1 Scope and Compatibility

- [ ] `docs/V1-SCOPE.md` — locked decisions (from Phase 0)
- [ ] `docs/COMPATIBILITY.md` — version matrix
- [ ] `docs/V1.1-BACKLOG.md` — deferred features

## 9.14 — Per-App READMEs

- [ ] `apps/web/README.md` — dev, build, env, deploy link
- [ ] `apps/desktop/README.md` — dev, build, package
- [ ] `apps/mobile/README.md` — dev, sync, run
- [ ] Each package README updated with real usage

## 9.15 — Documentation Quality

- [ ] All commands are copy-pasteable and tested
- [ ] No references to unimplemented features without "v1.1" label
- [ ] Links between related guides work
- [ ] Diagrams where helpful (architecture, auth flow)
- [ ] Consistent terminology throughout

## 9.16 — Verification

- [ ] Walk through first-project guide on clean machine — succeeds
- [ ] Cloudflare deploy guide verified with real deploy
- [ ] Troubleshooting entries match real errors encountered in Phases 3–5
- [ ] Phase 10 todo reviewed and unblocked
