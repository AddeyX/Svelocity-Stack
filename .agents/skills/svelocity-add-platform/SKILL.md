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
