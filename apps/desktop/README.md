# desktop — Svelocity Desktop Shell

Secure Electron app running the Shared Tasks demo from the same shared packages
and Convex deployment as web and mobile.

## Commands

| Command                         | Does                                              |
| ------------------------------- | ------------------------------------------------- |
| `pnpm --filter desktop dev`     | Vite (:5174) + Electron with hot renderer reload  |
| `pnpm --filter desktop build`   | Renderer + main + preload bundles                 |
| `pnpm --filter desktop start`   | Run the built app                                 |
| `pnpm --filter desktop package` | electron-builder → `release/` (dmg/nsis/AppImage) |
| `pnpm --filter desktop check`   | svelte-check (renderer) + tsc (electron/)         |

Backend must be running (`pnpm --filter @svelocity/backend dev`) and
`.env.local` needs `PUBLIC_CONVEX_URL` (copy `.env.example`).

## Security baseline (Phase 4 §4.11 — keep it green)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- Preload exposes exactly `window.svelocity = { platform, getVersion, openExternal }` —
  no fs, no shell, no raw ipcRenderer
- `openExternal` validates http(s)-only in the **main** process (renderer is untrusted)
- `setWindowOpenHandler` denies all new windows; external links go to the OS browser
- `will-navigate` blocks navigation away from the app
- CSP meta tag in `index.html` restricts sources; `connect-src` allows Convex ws/https
- Verified in smoke test: `process`/`require` are undefined in the renderer

## Auth + Convex caveats

- Tokens live in `localStorage` under the `file://` origin in production builds —
  sessions persist across app restarts but are separate from any browser session.
- Real-time sync verified: tasks created here appear live in the web app and
  vice versa (same deployment).

## Packaging notes

- macOS build is unsigned (`identity: null`) — signing/notarization is a manual
  release step ([docs/guides/desktop.md](../../docs/guides/desktop.md)).
- App icon is the Electron default in v1; replace via `electron-builder.json`.

## pnpm + electron-builder (why there are no `dependencies`)

Everything the app needs at runtime is bundled by Vite (renderer, main, and
preload all inline their imports; only `electron` and `node:` builtins stay
external). All packages therefore live in `devDependencies` **on purpose**:
electron-builder copies every production dependency into the app's asar, and
with pnpm's symlinked `node_modules` that used to fail outright and today
still drags ~60 MB of build-time tooling (workspace sources, prettier, esbuild)
into the shipped app. With zero production dependencies, electron-builder has
nothing to collect and pnpm's layout is irrelevant.

Rules of thumb:

- Adding a runtime package that Vite can bundle (pure JS)? Put it in
  `devDependencies` and import it normally — the bundle picks it up.
- Adding a **native module** (e.g. `better-sqlite3`)? That one must ship as a
  real production dependency: put it in `dependencies`, add it to
  `rollupOptions.external` in the relevant Vite config, and expect
  electron-builder to collect it (works on electron-builder ≥ 26.3.2 with
  pnpm; if collection misbehaves, `node-linker=hoisted` in the root `.npmrc`
  is the documented escape hatch).
- `.npmrc` already has `public-hoist-pattern[]=*electron*` so the `electron`
  and `electron-builder` binaries resolve from a flat `node_modules`.
