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
