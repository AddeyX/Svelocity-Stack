# Phase 5 — Capacitor Mobile Template

**Goal:** Add a Capacitor mobile app (iOS + Android) running Shared Tasks with shared UI and app-core.  
**Prerequisites:** Phase 3 complete (Phase 4 optional but recommended first)  
**Estimated effort:** 5–8 days

---

## Exit Criteria

- [x] `pnpm --filter mobile dev` serves app for mobile testing
- [x] `pnpm --filter mobile sync` generates native projects
- [ ] Android project compiles locally
- [x] iOS project compiles on macOS (if available)
- [x] Shared Tasks demo works in simulator/emulator
- [x] Auth and Convex real-time work on mobile
- [x] Safe areas and touch targets meet mobile baseline

---

## 5.1 — Capacitor App Scaffold

- [x] Initialize `apps/mobile` with Vite + Svelte (SPA, same pattern as desktop)
- [x] Add Capacitor dependencies via pnpm catalog
- [x] Structure:
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
- [x] Wire `@svelocity/config` tooling
- [x] Import `@svelocity/theme/tokens.css`

## 5.2 — Capacitor Configuration

- [x] Create `capacitor.config.ts` with app ID, name, webDir
- [x] Set `appId`: e.g. `com.svelocity.tasks`
- [x] Set `appName`: "Shared Tasks" (or project name)
- [x] Configure `webDir` to Vite build output
- [x] Set `server.url` for live reload in dev (optional)
- [x] Add Android and iOS platforms: `npx cap add android`, `npx cap add ios`

## 5.3 — Renderer App (Svelte SPA)

- [x] Reuse `@svelocity/app-core` task logic
- [x] Reuse `@svelocity/auth` client helpers
- [x] Reuse `@svelocity/ui` components
- [x] Build views:
  - [x] Login view
  - [x] Tasks view
- [x] Client-side routing matching desktop pattern
- [x] Connect to same Convex deployment

## 5.4 — Mobile Shell UI

- [x] `MobileShell.svelte` — app shell with safe areas
- [x] Bottom navigation or mobile-appropriate nav pattern
- [x] Show platform badge ("Mobile") in demo header
- [x] Apply `packages/theme/platform/mobile.css` overrides:
  - [x] `env(safe-area-inset-*)`
  - [x] Minimum 44px touch targets
  - [x] Disable hover-dependent interactions
- [x] Responsive layout for phone screen sizes
- [x] Handle keyboard overlap on input fields

## 5.5 — Convex Client on Mobile

- [x] Configure Convex client for Capacitor WebView
- [x] Use same `PUBLIC_CONVEX_URL` env
- [x] Test auth session persistence in WebView
- [x] Test real-time sync: mobile + browser simultaneously
- [x] Handle app backgrounding/foregrounding (session refresh)

## 5.6 — Capacitor Plugins (Minimal)

- [x] `@capacitor/app` — app state, back button
- [x] `@capacitor/status-bar` — style status bar
- [x] `@capacitor/splash-screen` — splash on launch
- [x] Defer: camera, push, secure storage to v1.1
- [x] Document plugin policy: minimal for v1

## 5.7 — Android Setup

- [x] Generate `android/` project via Capacitor
- [ ] Verify Android Studio can open project
- [ ] Set minimum SDK version (document choice)
- [x] Configure app icon placeholder
- [x] Configure splash screen
- [ ] `npx cap run android` works on emulator or device
- [x] Document JDK and Android SDK prerequisites

## 5.8 — iOS Setup

- [x] Generate `ios/` project via Capacitor
- [x] Verify Xcode can open workspace
- [x] Set deployment target (document choice)
- [x] Configure app icon placeholder
- [x] Configure splash screen
- [x] `npx cap run ios` works on simulator (macOS required)
- [x] Document Xcode and CocoaPods prerequisites

## 5.9 — Environment and Config

- [x] `apps/mobile/.env.example`
- [x] Vite env for `PUBLIC_CONVEX_URL`
- [x] Use `@svelocity/env` for validation
- [x] Document that mobile uses same Convex deployment as web/desktop

## 5.10 — Dev Workflow

- [x] `pnpm --filter mobile dev` — Vite dev server
- [x] `pnpm --filter mobile build` — production web build
- [x] `pnpm --filter mobile sync` — `cap sync` after build
- [x] `pnpm --filter mobile open:android` — open Android Studio
- [x] `pnpm --filter mobile open:ios` — open Xcode
- [x] Document live reload setup for development

## 5.11 — Native Permissions (Minimal)

- [x] v1 demo should need no special permissions
- [x] Document how to add permissions when needed
- [x] Verify no unnecessary permissions in AndroidManifest or Info.plist

## 5.12 — Testing

- [ ] Smoke test on Android emulator: launch, login, create task
- [x] Smoke test on iOS simulator: launch, login, create task (if macOS)
- [x] Verify safe area padding on notched device profile
- [x] Verify touch targets are usable
- [x] Manual checklist for mobile-specific UX

## 5.13 — Build Verification

- [x] `pnpm --filter mobile build` succeeds
- [x] `cap sync` succeeds after build
- [ ] Android debug APK builds
- [x] iOS debug build compiles (macOS)
- [x] Document release signing as manual (Phase 9 guide)

## 5.14 — Manifest Update

- [x] Add `mobile` to `.svelocity/manifest.json` targets

## 5.15 — Documentation Stubs

- [x] `apps/mobile/README.md` — dev, sync, run commands
- [x] Prerequisites: Android Studio, Xcode, SDK versions
- [x] Common failures: CocoaPods, Gradle, WebView debugging

## 5.16 — Verification

- [x] Mobile app runs Shared Tasks end-to-end in emulator
- [x] Same Convex backend — tasks sync with web/desktop
- [x] No duplicated business logic
- [x] Safe areas and touch targets verified
- [x] `pnpm --filter mobile check && pnpm --filter mobile build` passes
- [x] Phase 6 (CLI) todo reviewed and unblocked
