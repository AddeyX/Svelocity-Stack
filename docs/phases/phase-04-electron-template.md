# Phase 4 — Electron Desktop Template

**Goal:** Add a secure Electron app that runs the same Shared Tasks demo using shared UI and app-core.  
**Prerequisites:** Phase 3 complete (web demo + app-core working)  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [x] `pnpm --filter desktop dev` opens Electron window with Shared Tasks
- [x] Auth and task CRUD work against same Convex backend as web
- [x] Shared UI renders correctly in Electron renderer
- [x] Security baseline met: context isolation, no nodeIntegration in renderer
- [x] `pnpm --filter desktop build` produces packaged output (at least one OS)
- [x] Desktop smoke test passes

---

## 4.1 — Electron App Scaffold

- [x] Initialize `apps/desktop` with Vite + Svelte (not SvelteKit — SPA shell)
- [x] Add Electron dependencies via pnpm catalog
- [x] Structure:
  ```text
  apps/desktop/
  ├── electron/
  │   ├── main.ts
  │   ├── preload.ts
  │   └── ipc.ts
  ├── src/
  │   ├── App.svelte
  │   ├── main.ts
  │   └── routes/ (or pages/)
  └── package.json
  ```
- [x] Wire `@svelocity/config` tooling
- [x] Import `@svelocity/theme/tokens.css`

## 4.2 — Electron Main Process

- [x] Create `main.ts` with BrowserWindow setup
- [x] Enable `contextIsolation: true`
- [x] Disable `nodeIntegration` in renderer
- [x] Load preload script
- [x] Handle dev vs production URL/file loading
- [x] Set minimum window size
- [x] Set app name and icon placeholder
- [ ] Handle macOS `activate` and Windows/Linux `window-all-closed`

## 4.3 — Preload Script

- [x] Create `preload.ts` with `contextBridge`
- [x] Expose minimal safe API:
  - [x] `platform: 'desktop'`
  - [x] `appVersion`
  - [x] `openExternal(url)` — validated URLs only
- [x] Do NOT expose filesystem, shell, or raw ipcRenderer
- [x] Document IPC surface in comments

## 4.4 — IPC Layer (Minimal)

- [x] Create typed IPC channel definitions
- [x] Validate all IPC messages in main process
- [x] v1 IPC needs: platform info only (no file operations yet)
- [x] Add IPC types shared via `packages/app-core` or local types

## 4.5 — Renderer App (Svelte SPA)

- [x] Reuse auth + task logic from `@svelocity/app-core`
- [x] Reuse `@svelocity/auth` client helpers
- [x] Reuse `@svelocity/ui` components
- [x] Build equivalent views:
  - [x] Login view
  - [x] Tasks view (main demo)
- [x] Simple client-side routing (svelte-spa-router or manual)
- [x] Connect to same Convex deployment as web

## 4.6 — Desktop-Specific UI

- [x] `DesktopShell.svelte` — window chrome, title bar area
- [x] Desktop navigation pattern (sidebar or top nav)
- [x] Show platform badge ("Desktop") in demo header
- [x] Apply `packages/theme/platform/desktop.css` overrides
- [x] Handle window resize gracefully
- [x] No mobile safe-area concerns; enable hover states

## 4.7 — Convex Client in Electron

- [x] Configure Convex client for renderer context
- [x] Use same `PUBLIC_CONVEX_URL` env pattern
- [x] Verify auth session works in Electron (cookie/storage considerations)
- [x] Test real-time sync between Electron and browser simultaneously
- [x] Document any Electron-specific auth storage needs

## 4.8 — Environment and Config

- [x] `apps/desktop/.env.example`
- [x] Load env in Vite for renderer
- [x] Main process env if needed (separate from renderer)
- [x] Use `@svelocity/env` for validation

## 4.9 — Dev Experience

- [x] `pnpm --filter desktop dev` starts Vite + Electron concurrently
- [x] Hot reload works in renderer
- [x] Electron restarts or reloads on main process changes
- [x] Clear console output distinguishing Vite vs Electron logs

## 4.10 — Packaging

- [x] Add electron-builder or equivalent
- [x] Configure build for at least one target:
  - [x] macOS (primary dev machine), OR
  - [ ] Windows, OR
  - [ ] Linux
- [x] Bundle app icon placeholder
- [x] `pnpm --filter desktop build` produces artifact
- [x] `pnpm --filter desktop package` creates installer/dmg/appimage
- [x] Document signing as manual step (Phase 9 guide)

## 4.11 — Security Checklist

- [x] `contextIsolation: true` verified
- [x] `nodeIntegration: false` verified
- [x] `sandbox: true` if compatible with preload needs
- [x] Preload exposes minimal API only
- [x] No `eval` or remote content loading
- [x] External links open via `shell.openExternal`, not in-app
- [x] Content Security Policy considered for renderer
- [x] Run through Electron security checklist doc

## 4.12 — Testing

- [x] Smoke test: app launches without crash
- [x] Smoke test: login flow works
- [x] Smoke test: create task works
- [x] Verify shared UI components render same as web (visual check)
- [ ] Optional: Playwright for Electron or manual test checklist

## 4.13 — Manifest Update

- [x] Add `desktop` to `.svelocity/manifest.json` targets

## 4.14 — Documentation Stubs

- [x] `apps/desktop/README.md` — dev, build, package commands
- [x] Note platform-specific prerequisites
- [x] List known Electron + Convex auth caveats

## 4.15 — Verification

- [x] Desktop app runs Shared Tasks end-to-end
- [x] Same Convex backend as web — tasks sync across platforms
- [x] No duplicated business logic — all from `app-core`
- [x] Security checklist all green
- [x] `pnpm --filter desktop check && pnpm --filter desktop build` passes
- [x] Phase 5 (Capacitor) todo reviewed and unblocked
