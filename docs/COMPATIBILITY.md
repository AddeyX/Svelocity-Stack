# Svelocity Stack — Compatibility Matrix (V1)

**Status:** Locked for v1.0.0
**Last updated:** 2026-07-04

Exact versions live in the pnpm catalog (`pnpm-workspace.yaml`). This document records
the tested targets and the rationale. Pins mirror versions proven in production in the
maintainer's Cairno, Jaut Desktop, and EZ Money apps.

---

## Runtime Targets

| Tool | Minimum | Tested | Notes                                                                       |
| ---- | ------- | ------ | --------------------------------------------------------------------------- |
| Node | 22.18+  | 22.23  | `engines.node: ">=22.18"` in stack and generated-project package.json files |
| pnpm | 10      | 10.x   | Workspace protocol + catalogs require pnpm 9.5+; we target 10               |

## Core Framework

| Package                        | Catalog pin         | Notes                        |
| ------------------------------ | ------------------- | ---------------------------- |
| `svelte`                       | 5.x (latest stable) | Runes mode everywhere        |
| `@sveltejs/kit`                | 2.x (latest stable) | Web app only                 |
| `@sveltejs/vite-plugin-svelte` | latest stable       |                              |
| `vite`                         | latest stable       | Shared across all three apps |
| `typescript`                   | latest stable       | Strict mode                  |
| `svelte-check`                 | 4.x                 | Powers `pnpm -r check`       |

## Backend + Auth

| Package            | Catalog pin                        | Notes                                     |
| ------------------ | ---------------------------------- | ----------------------------------------- |
| `convex`           | 1.x (latest tested)                | Single deployment shared by all platforms |
| `convex-svelte`    | 0.x (latest tested)                | `setupConvex` / `setupAuth` / `useQuery`  |
| `@convex-dev/auth` | 0.0.x (latest tested)              | Password provider for v1                  |
| `@auth/core`       | peer-matched to `@convex-dev/auth` | Required peer dependency                  |

## UI

| Package          | Catalog pin   | Notes                                          |
| ---------------- | ------------- | ---------------------------------------------- |
| `bits-ui`        | 2.x           | Headless primitives wrapped by `@svelocity/ui` |
| `@lucide/svelte` | latest stable | Icon set re-exported from `@svelocity/ui`      |

## Desktop (Electron)

| Package                                | Catalog pin | Notes                                     |
| -------------------------------------- | ----------- | ----------------------------------------- |
| `electron`                             | 39.8.10+    | Security-patched catalog floor            |
| `electron-builder`                     | 26.x        | Packaging; signing is a manual step in v1 |
| `concurrently`, `wait-on`, `cross-env` | latest      | Dev orchestration                         |

## Mobile (Capacitor)

| Package                                                               | Catalog pin | Notes                             |
| --------------------------------------------------------------------- | ----------- | --------------------------------- |
| `@capacitor/core`, `@capacitor/cli`                                   | 8.x         | Catalog group `catalog:capacitor` |
| `@capacitor/android`, `@capacitor/ios`                                | 8.x         |                                   |
| `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen` | 8.x         | Only plugins shipped in v1        |

## Deployment (Web)

| Package                        | Catalog pin   | Notes             |
| ------------------------------ | ------------- | ----------------- |
| `@sveltejs/adapter-cloudflare` | latest stable | Web deploy target |
| `wrangler`                     | 4.x           | Deploy tooling    |

## Testing

| Package                   | Catalog pin | Notes                                       |
| ------------------------- | ----------- | ------------------------------------------- |
| `vitest`                  | 4.x         | Unit + component tests                      |
| `@testing-library/svelte` | latest      | UI package component tests                  |
| `playwright`              | latest      | Golden-path + axe E2E, gated on live Convex |
| `@axe-core/playwright`    | latest      | WCAG A/AA browser audit                     |

## Native Toolchain Prerequisites (documented, not bundled)

| Platform | Requirement                     |
| -------- | ------------------------------- |
| Android  | Android Studio, SDK 35+, JDK 21 |
| iOS      | macOS, Xcode 16+, CocoaPods     |

---

## Update Policy (V1)

- Versions are pinned in the pnpm catalog; apps and packages reference `catalog:` entries.
- No Renovate preset in v1 — bump the catalog deliberately, run the golden-path CI, commit.
- A version bump that breaks `pnpm -r check && pnpm -r build` reverts until fixed.
