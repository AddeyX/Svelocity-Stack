# Svelocity Stack — Manual Testing Guide

Step-by-step guide to test the current implementation (phases 0–6).
As of 2026-07-04: tests/check/build all green; only Prettier formatting is off in 2 files.

Two independent things you can test:

1. **The monorepo apps** — web, desktop, mobile running off the shared core + Convex backend.
2. **The CLI** — `create-svelocity` (scaffold a new project) and `svelocity doctor`/`info`.

---

## 0. Prerequisites

```bash
node --version   # need >= 22
pnpm --version   # need >= 10
```

From the repo root:

```bash
cd /Users/emmanueladdey/Documents/Addey-The-Dev/Svelocity-Stack
pnpm install     # if node_modules is stale
```

---

## 1. Repo-wide gates (fastest confidence check)

Run all four from the repo root. Expected results in parentheses.

```bash
pnpm -r test     # 81 pass, 8 skipped
pnpm -r check    # 0 type errors across 9 packages + 3 apps
pnpm build       # all packages/apps build; web -> Cloudflare adapter
pnpm lint        # eslint clean; Prettier flags 2 files (see below)
```

### Known lint nit

`pnpm lint` currently fails only on formatting:

- `packages/create-svelocity/src/commands/doctor/checks.spec.ts`
- `packages/create-svelocity/src/create.ts`

Clear it with:

```bash
pnpm format      # runs prettier --write
pnpm lint        # now clean
```

---

## 2. Test the full app (web + Convex backend)

The web app talks to a **local anonymous Convex backend** on `http://127.0.0.1:3210`.
`apps/web/.env.local` is already set to that URL — no edit needed.

### 2a. Start the backend (terminal 1)

```bash
CONVEX_AGENT_MODE=anonymous pnpm --filter @svelocity/backend dev
```

Leave it running. It serves the Convex functions + auth. URL: `http://127.0.0.1:3210`.

### 2b. Start the web app (terminal 2)

```bash
pnpm dev
```

Open **http://localhost:5173**.

### 2c. What to click through

- **Sign in** with the demo user:
  - Email: `demo@svelocity.dev`
  - Password: `svelocity-demo-1234`
- Land on the **tasks** page.
- **Create a task** → confirm it appears live (Convex reactive query).
- **Toggle / complete** a task → confirm state persists.
- **Refresh** the page → data still there (backend, not local state).
- **Sign out** → returns to signed-out view.

### 2d. Verify token auth (ADR 0002)

Auth is client-side localStorage tokens.

- Open DevTools → Application → Local Storage → `http://localhost:5173`.
- Confirm a token key exists after sign-in, and is cleared on sign-out.

---

## 3. Test the desktop app (Electron)

Backend from step 2a should still be running.

```bash
pnpm dev:desktop
```

- Electron window opens (renderer served from Vite on port 5174).
- Same sign-in + tasks flow as web.
- Confirm the window is a native shell, not a browser tab.

---

## 4. Test the mobile app

### 4a. Web preview (fastest)

```bash
pnpm dev:mobile
```

Open **http://localhost:5175** — the mobile shell in the browser. Run the same flow.

### 4b. iOS (native, verified path)

```bash
pnpm --filter mobile sync        # build + cap sync
pnpm --filter mobile open:ios    # opens Xcode
```

Then run on a simulator from Xcode, or:

```bash
pnpm --filter mobile run:ios
```

### 4c. Android — SKIP

Android SDK is not installed on this machine. Android compile is deliberately untested.
`open:android` / `run:android` will fail until an SDK is set up.

---

## 5. Test the CLI

The CLI is built to `packages/create-svelocity/dist/`. Rebuild if you changed its source:

```bash
pnpm --filter create-svelocity build
```

### 5a. `svelocity doctor` / `info` on THIS repo

```bash
node packages/create-svelocity/dist/cli.js --help
node packages/create-svelocity/dist/cli.js doctor
node packages/create-svelocity/dist/cli.js info
```

`doctor` runs static health checks (env, workspace, manifest, Convex, auth targets, native).
`info` prints what was generated (manifest + stack).

### 5b. Scaffold a fresh project (golden path)

Do this in a scratch dir OUTSIDE the repo so you don't pollute it:

```bash
cd /tmp
node /Users/emmanueladdey/Documents/Addey-The-Dev/Svelocity-Stack/packages/create-svelocity/dist/create.js
```

Follow the prompts (project name, flags). Then inside the generated project:

```bash
cd <your-new-project>
pnpm install
node_modules/.bin/svelocity doctor   # expect 0 failures
```

Expected: doctor reports **0 fail** on a freshly generated project (this is the gated e2e assertion — 52/52).

---

## 6. Teardown

- Stop web/desktop/mobile dev servers: `Ctrl+C` in each terminal.
- Stop the Convex backend: `Ctrl+C` in terminal 1.
- Delete any scratch project created in `/tmp`.

---

## Reference — ports & credentials

| Thing            | Value                        |
|------------------|------------------------------|
| Web app          | http://localhost:5173        |
| Desktop renderer | http://localhost:5174        |
| Mobile shell     | http://localhost:5175        |
| Convex backend   | http://127.0.0.1:3210        |
| Demo user        | demo@svelocity.dev           |
| Demo password    | svelocity-demo-1234          |

## Scope note

Phases 0–6 are built and merged. Phases 7–10 (AI skills + AGENTS.md, doctor/CI extras,
in-repo docs/guides, hardening + release) are NOT built yet. The stack works end-to-end
locally but is not release-hardened.
