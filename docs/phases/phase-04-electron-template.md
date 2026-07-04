# Phase 4 — Electron Desktop Template

**Goal:** Add a secure Electron app that runs the same Shared Tasks demo using shared UI and app-core.  
**Prerequisites:** Phase 3 complete (web demo + app-core working)  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [ ] `pnpm --filter desktop dev` opens Electron window with Shared Tasks
- [ ] Auth and task CRUD work against same Convex backend as web
- [ ] Shared UI renders correctly in Electron renderer
- [ ] Security baseline met: context isolation, no nodeIntegration in renderer
- [ ] `pnpm --filter desktop build` produces packaged output (at least one OS)
- [ ] Desktop smoke test passes

---

## 4.1 — Electron App Scaffold

- [ ] Initialize `apps/desktop` with Vite + Svelte (not SvelteKit — SPA shell)
- [ ] Add Electron dependencies via pnpm catalog
- [ ] Structure:
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
- [ ] Wire `@svelocity/config` tooling
- [ ] Import `@svelocity/theme/tokens.css`

## 4.2 — Electron Main Process

- [ ] Create `main.ts` with BrowserWindow setup
- [ ] Enable `contextIsolation: true`
- [ ] Disable `nodeIntegration` in renderer
- [ ] Load preload script
- [ ] Handle dev vs production URL/file loading
- [ ] Set minimum window size
- [ ] Set app name and icon placeholder
- [ ] Handle macOS `activate` and Windows/Linux `window-all-closed`

## 4.3 — Preload Script

- [ ] Create `preload.ts` with `contextBridge`
- [ ] Expose minimal safe API:
  - [ ] `platform: 'desktop'`
  - [ ] `appVersion`
  - [ ] `openExternal(url)` — validated URLs only
- [ ] Do NOT expose filesystem, shell, or raw ipcRenderer
- [ ] Document IPC surface in comments

## 4.4 — IPC Layer (Minimal)

- [ ] Create typed IPC channel definitions
- [ ] Validate all IPC messages in main process
- [ ] v1 IPC needs: platform info only (no file operations yet)
- [ ] Add IPC types shared via `packages/app-core` or local types

## 4.5 — Renderer App (Svelte SPA)

- [ ] Reuse auth + task logic from `@svelocity/app-core`
- [ ] Reuse `@svelocity/auth` client helpers
- [ ] Reuse `@svelocity/ui` components
- [ ] Build equivalent views:
  - [ ] Login view
  - [ ] Tasks view (main demo)
- [ ] Simple client-side routing (svelte-spa-router or manual)
- [ ] Connect to same Convex deployment as web

## 4.6 — Desktop-Specific UI

- [ ] `DesktopShell.svelte` — window chrome, title bar area
- [ ] Desktop navigation pattern (sidebar or top nav)
- [ ] Show platform badge ("Desktop") in demo header
- [ ] Apply `packages/theme/platform/desktop.css` overrides
- [ ] Handle window resize gracefully
- [ ] No mobile safe-area concerns; enable hover states

## 4.7 — Convex Client in Electron

- [ ] Configure Convex client for renderer context
- [ ] Use same `PUBLIC_CONVEX_URL` env pattern
- [ ] Verify auth session works in Electron (cookie/storage considerations)
- [ ] Test real-time sync between Electron and browser simultaneously
- [ ] Document any Electron-specific auth storage needs

## 4.8 — Environment and Config

- [ ] `apps/desktop/.env.example`
- [ ] Load env in Vite for renderer
- [ ] Main process env if needed (separate from renderer)
- [ ] Use `@svelocity/env` for validation

## 4.9 — Dev Experience

- [ ] `pnpm --filter desktop dev` starts Vite + Electron concurrently
- [ ] Hot reload works in renderer
- [ ] Electron restarts or reloads on main process changes
- [ ] Clear console output distinguishing Vite vs Electron logs

## 4.10 — Packaging

- [ ] Add electron-builder or equivalent
- [ ] Configure build for at least one target:
  - [ ] macOS (primary dev machine), OR
  - [ ] Windows, OR
  - [ ] Linux
- [ ] Bundle app icon placeholder
- [ ] `pnpm --filter desktop build` produces artifact
- [ ] `pnpm --filter desktop package` creates installer/dmg/appimage
- [ ] Document signing as manual step (Phase 9 guide)

## 4.11 — Security Checklist

- [ ] `contextIsolation: true` verified
- [ ] `nodeIntegration: false` verified
- [ ] `sandbox: true` if compatible with preload needs
- [ ] Preload exposes minimal API only
- [ ] No `eval` or remote content loading
- [ ] External links open via `shell.openExternal`, not in-app
- [ ] Content Security Policy considered for renderer
- [ ] Run through Electron security checklist doc

## 4.12 — Testing

- [ ] Smoke test: app launches without crash
- [ ] Smoke test: login flow works
- [ ] Smoke test: create task works
- [ ] Verify shared UI components render same as web (visual check)
- [ ] Optional: Playwright for Electron or manual test checklist

## 4.13 — Manifest Update

- [ ] Add `desktop` to `.svelocity/manifest.json` targets

## 4.14 — Documentation Stubs

- [ ] `apps/desktop/README.md` — dev, build, package commands
- [ ] Note platform-specific prerequisites
- [ ] List known Electron + Convex auth caveats

## 4.15 — Verification

- [ ] Desktop app runs Shared Tasks end-to-end
- [ ] Same Convex backend as web — tasks sync across platforms
- [ ] No duplicated business logic — all from `app-core`
- [ ] Security checklist all green
- [ ] `pnpm --filter desktop check && pnpm --filter desktop build` passes
- [ ] Phase 5 (Capacitor) todo reviewed and unblocked
