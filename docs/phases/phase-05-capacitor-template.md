# Phase 5 — Capacitor Mobile Template

**Goal:** Add a Capacitor mobile app (iOS + Android) running Shared Tasks with shared UI and app-core.  
**Prerequisites:** Phase 3 complete (Phase 4 optional but recommended first)  
**Estimated effort:** 5–8 days

---

## Exit Criteria

- [ ] `pnpm --filter mobile dev` serves app for mobile testing
- [ ] `pnpm --filter mobile sync` generates native projects
- [ ] Android project compiles locally
- [ ] iOS project compiles on macOS (if available)
- [ ] Shared Tasks demo works in simulator/emulator
- [ ] Auth and Convex real-time work on mobile
- [ ] Safe areas and touch targets meet mobile baseline

---

## 5.1 — Capacitor App Scaffold

- [ ] Initialize `apps/mobile` with Vite + Svelte (SPA, same pattern as desktop)
- [ ] Add Capacitor dependencies via pnpm catalog
- [ ] Structure:
  ```text
  apps/mobile/
  ├── capacitor.config.ts
  ├── android/
  ├── ios/
  ├── src/
  │   ├── App.svelte
  │   └── main.ts
  └── package.json
  ```
- [ ] Wire `@svelocity/config` tooling
- [ ] Import `@svelocity/theme/tokens.css`

## 5.2 — Capacitor Configuration

- [ ] Create `capacitor.config.ts` with app ID, name, webDir
- [ ] Set `appId`: e.g. `com.svelocity.tasks`
- [ ] Set `appName`: "Shared Tasks" (or project name)
- [ ] Configure `webDir` to Vite build output
- [ ] Set `server.url` for live reload in dev (optional)
- [ ] Add Android and iOS platforms: `npx cap add android`, `npx cap add ios`

## 5.3 — Renderer App (Svelte SPA)

- [ ] Reuse `@svelocity/app-core` task logic
- [ ] Reuse `@svelocity/auth` client helpers
- [ ] Reuse `@svelocity/ui` components
- [ ] Build views:
  - [ ] Login view
  - [ ] Tasks view
- [ ] Client-side routing matching desktop pattern
- [ ] Connect to same Convex deployment

## 5.4 — Mobile Shell UI

- [ ] `MobileShell.svelte` — app shell with safe areas
- [ ] Bottom navigation or mobile-appropriate nav pattern
- [ ] Show platform badge ("Mobile") in demo header
- [ ] Apply `packages/theme/platform/mobile.css` overrides:
  - [ ] `env(safe-area-inset-*)`
  - [ ] Minimum 44px touch targets
  - [ ] Disable hover-dependent interactions
- [ ] Responsive layout for phone screen sizes
- [ ] Handle keyboard overlap on input fields

## 5.5 — Convex Client on Mobile

- [ ] Configure Convex client for Capacitor WebView
- [ ] Use same `PUBLIC_CONVEX_URL` env
- [ ] Test auth session persistence in WebView
- [ ] Test real-time sync: mobile + browser simultaneously
- [ ] Handle app backgrounding/foregrounding (session refresh)

## 5.6 — Capacitor Plugins (Minimal)

- [ ] `@capacitor/app` — app state, back button
- [ ] `@capacitor/status-bar` — style status bar
- [ ] `@capacitor/splash-screen` — splash on launch
- [ ] Defer: camera, push, secure storage to v1.1
- [ ] Document plugin policy: minimal for v1

## 5.7 — Android Setup

- [ ] Generate `android/` project via Capacitor
- [ ] Verify Android Studio can open project
- [ ] Set minimum SDK version (document choice)
- [ ] Configure app icon placeholder
- [ ] Configure splash screen
- [ ] `npx cap run android` works on emulator or device
- [ ] Document JDK and Android SDK prerequisites

## 5.8 — iOS Setup

- [ ] Generate `ios/` project via Capacitor
- [ ] Verify Xcode can open workspace
- [ ] Set deployment target (document choice)
- [ ] Configure app icon placeholder
- [ ] Configure splash screen
- [ ] `npx cap run ios` works on simulator (macOS required)
- [ ] Document Xcode and CocoaPods prerequisites

## 5.9 — Environment and Config

- [ ] `apps/mobile/.env.example`
- [ ] Vite env for `PUBLIC_CONVEX_URL`
- [ ] Use `@svelocity/env` for validation
- [ ] Document that mobile uses same Convex deployment as web/desktop

## 5.10 — Dev Workflow

- [ ] `pnpm --filter mobile dev` — Vite dev server
- [ ] `pnpm --filter mobile build` — production web build
- [ ] `pnpm --filter mobile sync` — `cap sync` after build
- [ ] `pnpm --filter mobile open:android` — open Android Studio
- [ ] `pnpm --filter mobile open:ios` — open Xcode
- [ ] Document live reload setup for development

## 5.11 — Native Permissions (Minimal)

- [ ] v1 demo should need no special permissions
- [ ] Document how to add permissions when needed
- [ ] Verify no unnecessary permissions in AndroidManifest or Info.plist

## 5.12 — Testing

- [ ] Smoke test on Android emulator: launch, login, create task
- [ ] Smoke test on iOS simulator: launch, login, create task (if macOS)
- [ ] Verify safe area padding on notched device profile
- [ ] Verify touch targets are usable
- [ ] Manual checklist for mobile-specific UX

## 5.13 — Build Verification

- [ ] `pnpm --filter mobile build` succeeds
- [ ] `cap sync` succeeds after build
- [ ] Android debug APK builds
- [ ] iOS debug build compiles (macOS)
- [ ] Document release signing as manual (Phase 9 guide)

## 5.14 — Manifest Update

- [ ] Add `mobile` to `.svelocity/manifest.json` targets

## 5.15 — Documentation Stubs

- [ ] `apps/mobile/README.md` — dev, sync, run commands
- [ ] Prerequisites: Android Studio, Xcode, SDK versions
- [ ] Common failures: CocoaPods, Gradle, WebView debugging

## 5.16 — Verification

- [ ] Mobile app runs Shared Tasks end-to-end in emulator
- [ ] Same Convex backend — tasks sync with web/desktop
- [ ] No duplicated business logic
- [ ] Safe areas and touch targets verified
- [ ] `pnpm --filter mobile check && pnpm --filter mobile build` passes
- [ ] Phase 6 (CLI) todo reviewed and unblocked
