# V1 Validation Report

**Release candidate:** `phase-10-hardening`

**Started:** 2026-07-17

**Host:** macOS 26.3, Apple silicon

**Runtime:** Node 26.3.1, pnpm 10.33.2

This report records evidence for Phase 10. An unchecked checklist item means it has not
been proved in the required environment; it does not mean the implementation is known to
be broken.

## Automated Baseline

| Check                   | Result                 | Evidence                                                                                                        |
| ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| Frozen lockfile install | Pass                   | `pnpm install --frozen-lockfile` completed without lockfile drift                                               |
| Type and Svelte checks  | Pass                   | `pnpm check`; zero TypeScript or Svelte diagnostics                                                             |
| Unit/component tests    | Pass                   | `pnpm test`; 118 passed, 5 gated integration tests skipped                                                      |
| Workspace build         | Pass                   | `pnpm build`; web, Electron renderer/main/preload, and mobile web bundle compiled                               |
| Manifest validation     | Pass                   | `pnpm validate:manifest`; example and project manifests valid                                                   |
| Dependency audit        | Pass with low advisory | Electron high advisory removed; `pnpm audit --audit-level=high` reports one low advisory and exits successfully |
| Web E2E + axe           | Pass                   | Playwright 2/2 against local Convex; no serious or critical axe findings                                        |
| iOS simulator compile   | Pass                   | Xcode 26.4.1 no-signing Debug build; `** BUILD SUCCEEDED **`                                                    |
| Electron package        | Pass                   | macOS arm64 DMG and block map generated                                                                         |
| CLI cold generation     | Pass with warnings     | Install, workspace check/build, and doctor: 13 pass, 3 environment warnings                                     |
| npm package dry-run     | Pass                   | 216 files, 209 kB tarball; local Convex and Playwright state excluded                                           |

## Security Evidence

### Electron

- `BrowserWindow` sets `contextIsolation: true`, `nodeIntegration: false`, and
  `sandbox: true`.
- Preload exposes only platform identity, app version, and validated external-link
  opening.
- Main process accepts external links only when `URL.protocol` is `http:` or `https:`.
- Renderer CSP is present in `apps/desktop/index.html`.
- Electron 39.8.10 is installed. This is above patched floor 39.8.1 for
  `GHSA-532v-xpq5-8h95`.

### Backend

- Task creation and title updates use shared Zod validation on server.
- Protected mutations derive identity with `getAuthUserId`.
- Task changes use `requireOwnTask`; client-supplied ownership is never accepted.

### Capacitor

- Android declares only `android.permission.INTERNET`.
- No filesystem plugin or deep-link intent filter is configured.
- iOS `Info.plist` declares no privacy-sensitive capability.

## Available Native Toolchains

| Tool                    | Available      | Version / note                                           |
| ----------------------- | -------------- | -------------------------------------------------------- |
| Xcode                   | Yes            | 26.4.1                                                   |
| Java                    | Yes            | OpenJDK 17.0.18                                          |
| Android Debug Bridge    | Yes            | 37.0.0                                                   |
| Android SDK environment | Not configured | `ANDROID_HOME` and `ANDROID_SDK_ROOT` are empty          |
| GitHub CLI              | Yes            | 2.95.0; authentication not yet used for release mutation |
| npm authentication      | No             | `npm whoami` returns `E401 Unauthorized`                 |

## External or Manual Gates Still Open

- Clean-machine web setup timing.
- Windows validation.
- Linux validation.
- Android SDK compile, emulator launch, login, and task smoke test.
- iOS simulator/device launch and task smoke test.
- Real Cloudflare deployment.
- Chrome DevTools performance trace and Lighthouse score; connector unavailable in this
  session.
- npm publication and published-package smoke test.
- Git tag and GitHub release.
- Forty-eight-hour post-release monitoring.

## Evidence Log

### 2026-07-17 — Baseline and Electron security update

1. `pnpm install --frozen-lockfile` passed.
2. Initial `pnpm audit --audit-level=high` found Electron 38.8.6 affected by
   `GHSA-532v-xpq5-8h95`.
3. Catalog floor moved to Electron 39.8.10 and lockfile refreshed.
4. Follow-up audit removed all high and moderate findings; one low advisory remains.
5. `pnpm --filter desktop check`, `pnpm --filter desktop build`, and `pnpm test` passed.

### 2026-07-17 — Security, retry, and accessibility hardening

1. `pnpm audit:v1` passed all 15 source/configuration security invariants.
2. Web production build passed with SvelteKit CSP enabled.
3. Task-create mutation failures now retain normalized input and render `ErrorState` with
   retry on web, desktop, and mobile.
4. App-core retry tests cover validation, success, mutation failure, and retry success.
5. Dialog component test verifies focus entry, Escape close, and trigger-focus restoration.
6. Axe found and drove fixes for toaster ARIA semantics and neutral badge contrast.
7. Live Playwright golden path passed 2/2 tests against local Convex on port 3210 using
   `E2E_PORT=5195`; axe found zero serious or critical violations after fixes.

### 2026-07-17 — Native, package, and cold-generation checks

1. Xcode compiled the Capacitor iOS app for the iOS 26.4 simulator SDK without signing.
2. Electron Builder produced a macOS arm64 DMG; code signing remains intentionally
   disabled for the template.
3. The CLI integration test generated a temporary project, installed 634 packages, ran
   all workspace checks and builds, and completed doctor with 13 pass, 3 warn, 0 fail.
4. The first npm dry-run exposed local Convex database/storage and Playwright artifacts
   in the template. Regression assertions and exclusions reduced the tarball from 4.5 MB
   to 209 kB.
5. All public documentation local links resolve. Historical implementation-plan snippets
   are not treated as public guide links.

### 2026-07-17 — Final local release gate

`PUBLIC_CONVEX_URL=http://127.0.0.1:3210 RUN_E2E=1 E2E_PORT=5197 pnpm validate:v1`
completed successfully. The validator performed a frozen install, manifest validation,
checks, lint, tests, workspace builds, doctor, and live Playwright E2E. Final doctor
result was 15 pass, 1 Android SDK warning, 0 fail; Playwright completed 2/2 tests.

## Retrospective

- Native toolchain availability, live E2E port isolation, and package-content inspection
  took longer than unit-level hardening.
- The original phase checklist did not explicitly require inspecting the npm tarball for
  generated local state; Phase 10 now records that verification.
- Accessibility automation found two issues manual review missed: prohibited toaster ARIA
  and insufficient neutral-badge contrast.
- Release publication remains intentionally separate from local readiness because npm
  authentication, a Git tag, and external release mutations require an authorized release
  step.
