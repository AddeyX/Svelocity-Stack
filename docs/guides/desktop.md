# Desktop (Electron)

The desktop shell: a Vite + Svelte SPA renderer inside a locked-down Electron window.
Same shared packages, same Convex deployment as web and mobile.

## Prerequisites

None beyond Node + pnpm — Electron installs with `pnpm install`. (Packaging for a
platform generally requires building **on** that platform.)

## Commands

| Command                         | Does                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `pnpm dev:desktop` (root)       | Vite on `:5174` + Electron window with hot renderer reload    |
| `pnpm --filter desktop build`   | Renderer + main + preload bundles (`dist/`, `dist-electron/`) |
| `pnpm --filter desktop start`   | Run the built app without packaging                           |
| `pnpm --filter desktop package` | `electron-builder` → installers in `apps/desktop/release/`    |
| `pnpm --filter desktop check`   | `svelte-check` (renderer) + `tsc` (electron/)                 |

Backend running + `apps/desktop/.env.local` with `PUBLIC_CONVEX_URL`, same as web.

## Main / preload / renderer

```text
apps/desktop/
  electron/
    main.ts        window creation, navigation policy, app lifecycle
    preload.ts     the ONLY bridge: window.svelocity = { platform, getVersion, openExternal }
    ipc.ts         main-process handlers — every channel validates its input
    url-safety.ts  http(s)-only allowlist for external links
  src/             the Svelte SPA (views, router) — ordinary web code
```

- **Main** (Node, privileged): creates the `BrowserWindow`, registers IPC handlers,
  enforces navigation rules. Dev loads `http://localhost:5174`; production loads the
  built `dist/index.html`.
- **Preload** (isolated): exposes a minimal typed API via `contextBridge`. No fs, no
  shell, no raw `ipcRenderer`.
- **Renderer** (sandboxed): the same kind of Svelte SPA as mobile — it talks to
  Convex over WebSocket directly and only reaches the OS through `window.svelocity`.

## Security rules (non-negotiable)

These are the Phase 4 baseline; `AGENTS.md` forbids agents from relaxing them:

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- Preload exposes exactly three audited methods — add new capabilities as individual
  audited methods, never by widening the object generically
- `openExternal` validates http(s)-only **in the main process** (renderer is untrusted)
- `setWindowOpenHandler` denies all new windows; safe external URLs open in the OS browser
- `will-navigate` blocks navigation away from the app
- CSP meta tag in `index.html`; `connect-src` allows only Convex ws/https
- Smoke-tested invariant: `process` and `require` are `undefined` in the renderer

## IPC surface (v1, complete list)

| Channel            | Renderer call                        | Validation                                     |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| `app:getVersion`   | `window.svelocity.getVersion()`      | none needed                                    |
| `app:openExternal` | `window.svelocity.openExternal(url)` | string + `isSafeExternalUrl` (http/https only) |

To add a channel: handler in `electron/ipc.ts` (validate input), method in
`electron/preload.ts`, and keep the two files mirrored.

## Packaging

```bash
pnpm --filter desktop package
```

Output in `apps/desktop/release/` per `electron-builder.json`: macOS `.dmg` (arm64),
Windows NSIS installer (x64), Linux AppImage (x64). Packaging is deliberately **not**
in CI (rationale: [CONTRIBUTING-STACK](https://github.com/AddeyX/Svelocity-Stack/blob/main/docs/CONTRIBUTING-STACK.md) in the stack repo).

### Signing and notarization (manual)

v1 ships unsigned (`"identity": null` for mac). For release builds:

- **macOS:** set a Developer ID `identity` in `electron-builder.json` and notarize —
  [electron-builder code signing](https://www.electron.build/code-signing) +
  [Apple notarization docs](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- **Windows:** a code-signing certificate wired via `win.certificateFile` /
  `certificateSubjectName` — [Microsoft signing docs](https://learn.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)

## Gotchas

- Packaged builds run the renderer from a `file://` origin — `localStorage` (and the
  auth session) is separate from your browser's.
- The app icon is Electron's default in v1; replace via `electron-builder.json`.
- Blank window on `pnpm dev:desktop`? See [troubleshooting](troubleshooting.md).
