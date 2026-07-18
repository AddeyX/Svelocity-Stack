# Phase 10 Hardening and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove Svelocity Stack's V1 golden path, close locally actionable hardening gaps,
and prepare truthful v1.0.0 release artifacts.

**Architecture:** Keep business and retry state in `packages/app-core`, presentation in
`packages/ui`, and platform integration in thin app shells. Automate repeatable security,
accessibility, generation, and build checks; record hardware, cloud, and publication steps
as external gates until evidence exists.

**Tech Stack:** SvelteKit 2, Svelte 5 runes, Convex Auth, Electron, Capacitor, Playwright,
Vitest, pnpm workspaces.

## Global Constraints

- Apps import packages only; packages never import apps.
- Shared business logic belongs in `packages/app-core`.
- Shared UI belongs in `packages/ui` and uses `@svelocity/theme` tokens.
- Electron keeps `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- Client bundles contain only `PUBLIC_CONVEX_URL`; no secrets.
- Every change must pass `pnpm check` and `pnpm test`.
- Commits use Conventional Commits.
- npm publication, Git tag creation, GitHub release creation, and post-release monitoring
  require separate evidence and credentials.

---

### Task 1: Capture baseline and close stale platform checklist items

**Files:**

- Modify: `docs/phases/phase-04-electron-template.md`
- Modify: `docs/phases/phase-10-hardening-release.md`
- Create: `docs/V1-VALIDATION-REPORT.md`

**Interfaces:**

- Consumes: current source, phase checklists, local command output
- Produces: evidence-backed checklist state and explicit external blockers

- [x] **Step 1: Verify existing Electron lifecycle and renderer security**

Run:

```bash
rg -n "contextIsolation|nodeIntegration|sandbox|activate|window-all-closed|Content-Security-Policy" \
  apps/desktop
```

Expected: secure BrowserWindow preferences, macOS activation handler, non-macOS quit
handler, renderer CSP.

- [x] **Step 2: Run dependency and lockfile checks**

Run:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
```

Expected: frozen install succeeds; audit contains no unmitigated critical vulnerability.

- [x] **Step 3: Record only verified items**

Create `docs/V1-VALIDATION-REPORT.md` with command, environment, result, and date. Check
only source-verifiable items in phase documents. Leave Windows, Linux, emulator, real
deploy, and publication items unchecked until executed.

- [x] **Step 4: Verify documentation formatting**

Run:

```bash
pnpm exec prettier --check docs/V1-VALIDATION-REPORT.md docs/phases
```

Expected: exit 0.

### Task 2: Harden web policy and automate security invariants

**Files:**

- Modify: `apps/web/svelte.config.js`
- Modify: `apps/web/src/app.html`
- Modify: `packages/theme/src/tokens.css`
- Create: `scripts/audit-v1.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: SvelteKit CSP configuration and current platform source
- Produces: `pnpm audit:v1`, a deterministic local security/configuration gate

- [x] **Step 1: Write failing invariant audit**

Audit must fail when any invariant is absent:

```text
Convex functions authenticate and enforce ownership
Electron enables contextIsolation and sandbox, disables nodeIntegration
Electron external URLs allow only http/https
Android requests only INTERNET
Web defines CSP, HSTS, nosniff, referrer, and permissions policies
No tracked .env.local or credential-like private environment file
```

Run:

```bash
node scripts/audit-v1.mjs
```

Expected before CSP implementation: non-zero exit naming missing web CSP.

- [x] **Step 2: Configure SvelteKit CSP**

Use `kit.csp` with:

```js
{
  mode: 'auto',
  directives: {
    'default-src': ['self'],
    'base-uri': ['none'],
    'object-src': ['none'],
    'frame-ancestors': ['none'],
    'img-src': ['self', 'data:'],
    'connect-src': ['self', 'https:', 'wss:']
  }
}
```

Remove inline `style` from `app.html`; add equivalent token-backed global class in
`packages/theme/src/tokens.css`.

- [x] **Step 3: Add root audit command**

Add:

```json
"audit:v1": "node scripts/audit-v1.mjs"
```

- [x] **Step 4: Verify audit and production build**

Run:

```bash
pnpm audit:v1
pnpm --filter web build
pnpm check
pnpm test
```

Expected: all exit 0 and built responses include CSP configuration.

### Task 3: Add retryable task-create failure state across shells

**Files:**

- Create: `packages/app-core/src/task-creation.ts`
- Create: `packages/app-core/src/task-creation.spec.ts`
- Modify: `packages/app-core/src/index.ts`
- Modify: `apps/web/src/lib/components/TaskForm.svelte`
- Modify: `apps/web/src/routes/tasks/+page.svelte`
- Modify: `apps/desktop/src/views/TasksView.svelte`
- Modify: `apps/mobile/src/views/TasksView.svelte`

**Interfaces:**

- Consumes: `validateTaskTitle(raw)` and injected mutation callback
- Produces: `attemptTaskCreation(raw, mutate)` returning success or a validation/mutation
  failure with retained normalized title

- [x] **Step 1: Write failing controller tests**

Cover:

```text
invalid input never calls mutation
successful input trims title and clears pending state
failed mutation retains normalized title and exposes friendly error
retry reuses retained title and clears error after success
```

Run:

```bash
pnpm --filter @svelocity/app-core test
```

Expected: fail because controller does not exist.

- [x] **Step 2: Implement minimal task-creation helper**

Helper owns validation, normalized retry title, and friendly generic mutation error. It
receives mutation callback so no app or Convex imports enter `app-core`; shells retain
only reactive presentation state.

- [x] **Step 3: Wire all three shells**

Forms retain text after failure and render shared `ErrorState` with retry. Successful
create clears text. Toasts remain for toggle/delete feedback.

- [x] **Step 4: Validate every changed Svelte component**

Run each changed component through official Svelte autofixer, then:

```bash
pnpm check
pnpm test
```

Expected: autofixer reports no remaining issue; commands exit 0.

### Task 4: Add automated accessibility coverage

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `apps/web/package.json`
- Modify: `apps/web/e2e/tasks.spec.ts`
- Modify: `packages/ui/src/components/Dialog.spec.ts`
- Modify: `packages/ui/src/states/states.spec.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: live Convex E2E flow and Bits UI dialog behavior
- Produces: axe scans for auth/tasks/dialog views and keyboard regression coverage

- [x] **Step 1: Pin and install `@axe-core/playwright`**

Add exact catalog version, reference it from web dev dependencies, update lockfile with
pnpm.

- [x] **Step 2: Add axe assertions**

Scan register, authenticated tasks, and open delete dialog. Fail on serious or critical
violations and print violation IDs and affected selectors.

- [x] **Step 3: Add dialog keyboard test**

Verify trigger opens dialog, focus enters dialog, Escape closes it, and focus returns to
trigger.

- [x] **Step 4: Run component and live E2E tests**

Run:

```bash
pnpm --filter @svelocity/ui test
PUBLIC_CONVEX_URL=http://127.0.0.1:3210 RUN_E2E=1 pnpm validate:v1
```

Expected: no skipped E2E test and no serious/critical axe violation.

### Task 5: Complete release documentation and version alignment

**Files:**

- Create: `docs/KNOWN-LIMITATIONS.md`
- Create: `CHANGELOG.md`
- Create: `CONTRIBUTING.md`
- Modify: `README.md`
- Modify: `docs/V1.1-BACKLOG.md`
- Modify: `docs/COMPATIBILITY.md`
- Modify: `docs/Svelocity-Stack-PR.md`
- Modify: `docs/phases/phase-10-hardening-release.md`
- Modify: `package.json`
- Modify: `packages/create-svelocity/package.json`
- Modify: `.svelocity/manifest.json`
- Modify: `.svelocity/manifest.example.json`
- Modify: `.svelocity/manifest.schema.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: conventional commit history and validated limitations
- Produces: aligned v1.0.0 package/template/docs state

- [x] **Step 1: Write known limitations**

Document every V1 non-goal from `docs/V1-SCOPE.md`, platform prerequisites, no
auto-updater/store automation, online-only behavior, and no observability.

- [x] **Step 2: Verify backlog coverage**

Ensure every Phase 10 §10.9 item has a concrete entry in `docs/V1.1-BACKLOG.md`.

- [x] **Step 3: Generate changelog using `svelocity-changelog`**

Summarize public changes from repository history without exposing internal phase noise.

- [x] **Step 4: Add root contributor entry point and README links**

Root `CONTRIBUTING.md` points contributors to `docs/CONTRIBUTING-STACK.md`; README links
changelog, limitations, compatibility, and contribution guide.

- [x] **Step 5: Align release versions**

Set stack, root, CLI, manifest, example, and schema default/example versions to `1.0.0`.
Update lockfile using pnpm.

- [x] **Step 6: Rebuild generated template**

Run:

```bash
pnpm --filter create-svelocity build:template
pnpm validate:manifest
pnpm lint
pnpm check
pnpm test
```

Expected: all exit 0.

### Task 6: Run local release gates and record evidence

**Files:**

- Modify: `docs/V1-VALIDATION-REPORT.md`
- Modify: `docs/phases/phase-10-hardening-release.md`

**Interfaces:**

- Consumes: release candidate working tree
- Produces: reproducible validation record and truthful checklist

- [x] **Step 1: Run full local gate**

Run:

```bash
pnpm install --frozen-lockfile
pnpm validate:manifest
pnpm audit:v1
pnpm lint
pnpm check
pnpm test
pnpm build
pnpm validate:v1
```

Expected: all exit 0.

- [x] **Step 2: Build native projects available on macOS**

Run Android Gradle compile when Java/Android SDK exists and iOS `xcodebuild` when Xcode
exists. Record exact skip reason when toolchain is absent; never mark skipped work done.

- [x] **Step 3: Generate and validate reference project**

Use built local CLI in a temporary directory, install frozen dependencies, run manifest
validation, doctor, check, test, and build. Record elapsed setup time.

- [x] **Step 4: Run live Convex golden path**

Start anonymous local Convex, run E2E with `RUN_E2E=1`, and confirm Playwright report has
zero skipped tests.

- [x] **Step 5: Review checklist line by line**

Check only items supported by command, source, or manual evidence. Keep Windows, Linux,
emulator/device launch, Cloudflare deployment, npm publication, GitHub release, and
post-release monitoring unchecked when not executed.

### Task 7: Commit local release candidate and stop at external release boundary

**Files:**

- All Phase 10 local changes from Tasks 1–6

**Interfaces:**

- Consumes: verified release candidate
- Produces: Conventional Commit on `phase-10-hardening`

- [ ] **Step 1: Verify clean diff and complete gates**

Run:

```bash
git diff --check
pnpm check
pnpm test
git status --short
```

Expected: no whitespace error, checks/tests exit 0, status contains only intended files.

- [ ] **Step 2: Commit release candidate**

Commit message:

```text
chore(release): prepare v1.0.0
```

- [ ] **Step 3: Report external gates**

Do not publish npm package, create `v1.0.0` tag, create GitHub release, claim real
Cloudflare deployment, or mark 48-hour monitoring complete without direct evidence and
required credentials.
