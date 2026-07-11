# Phase 8 — Doctor, Info, CI

**Goal:** Harden diagnostics, finalize `doctor`/`info` commands, and establish golden-path CI that prevents template rot.  
**Prerequisites:** Phases 3–7 complete  
**Estimated effort:** 3–5 days

---

## Exit Criteria

- [x] `svelocity doctor` catches all common misconfiguration cases
- [x] CI generates or validates golden-path project on every PR
- [x] Full workspace `check`, `test`, `build` runs in CI
- [ ] Playwright e2e runs in CI for web auth + tasks flow _(workflow landed; ticks after first green run on main)_
- [x] Compatibility matrix enforced in doctor and CI

---

## 8.1 — Doctor Command Hardening

- [x] Review all checks from Phase 6 — ensure implemented, not stubbed
- [x] Add fix suggestions for every FAIL:
  - [x] "Node 18 detected. Svelocity 1.x requires Node 22+. Install: ..."
  - [x] "CONVEX_URL missing. Copy .env.example and run convex dev."
  - [x] "apps/desktop missing electron dep. Run pnpm install."
- [x] Add `--json` output flag for machine-readable results
- [x] Add `--fix` flag for auto-fixable issues (e.g. copy .env.example) — optional
- [x] Test doctor on:
  - [x] Healthy project → all PASS
  - [x] Missing env → FAIL with message _(WARN by design — env is a setup step, not corruption)_
  - [x] Wrong Node → FAIL _(via engines override tests; process.version never mocked)_
  - [x] Missing manifest → FAIL
  - [x] No Convex dir → WARN or FAIL

## 8.2 — Info Command Hardening

- [x] Pretty-print manifest fields
- [x] Show installed stack version vs latest (if registry known) _(n/a — CLI unpublished; catalog/COMPATIBILITY pointer shown instead)_
- [x] List all targets with status (dir exists, build script present)
- [x] List skills with file-exists check
- [x] Show relevant dev commands per target

## 8.3 — CI Pipeline — Workspace

- [x] Job: **check** — `pnpm -r check` (TypeScript)
- [x] Job: **lint** — `pnpm -r lint`
- [x] Job: **unit test** — `pnpm -r test`
- [x] Job: **build** — `pnpm -r build`
      _(all four run as steps of the single `golden-path` job in `ci.yml`)_
- [x] All jobs use `pnpm install --frozen-lockfile`
- [x] Cache pnpm store between runs
- [x] Run on PR and main branch

## 8.4 — CI Pipeline — E2E

- [x] Job: **e2e web** — Playwright against web app (`e2e.yml`)
  - [x] Start Convex dev or use test deployment _(anonymous local backend, readiness-gated)_
  - [x] Run auth + create task flow
  - [x] Upload trace on failure
- [x] Configure CI secrets for Convex test env (if needed) _(none needed — auth keys generated per-run and set on the local deployment)_
- [x] Timeout appropriate for e2e (10–15 min)

## 8.5 — CI Pipeline — CLI Generation

- [x] Job: **cli generate** — run `create-svelocity` in temp directory
  - [x] `pnpm install`
  - [x] `pnpm -r check`
  - [x] `pnpm -r build` (web at minimum)
- [x] Catches template rot when source changes but template doesn't
- [x] Run on every PR touching template or packages _(runs on every PR, full stop)_

## 8.6 — CI Pipeline — Doctor

- [x] Job: **doctor** — run `svelocity doctor` on reference repo (`ci.yml`)
  - [x] Expect all PASS (or only native WARNs)
  - [x] Run on generated project too _(covered by the gated CLI integration test)_

## 8.7 — Compatibility Matrix Enforcement

- [x] `docs/COMPATIBILITY.md` lists pinned versions
- [x] Doctor reads matrix and compares runtime versions _(reads project `package.json` `engines` — the field COMPATIBILITY.md mirrors — with stack-default fallback)_
- [x] CI Node version matches matrix
- [x] Root `package.json` `engines` field enforces Node/pnpm

## 8.8 — Lockfile Policy

- [x] `pnpm-lock.yaml` committed
- [x] CI uses `--frozen-lockfile`
- [x] PR that changes package.json without lockfile fails
- [x] Document lockfile update process _(docs/CONTRIBUTING-STACK.md)_

## 8.9 — Build Targets in CI

| Target   | CI requirement                                         |
| -------- | ------------------------------------------------------ |
| Web      | `build` required, must pass                            |
| Desktop  | `build` required, must pass                            |
| Mobile   | `build` required (web assets), native compile optional |
| Packages | `check` + `test` required                              |

- [x] Web production build passes
- [x] Desktop Vite build passes
- [x] Mobile Vite build passes
- [x] Native mobile/Electron packaging optional in CI (document why) _(docs/CONTRIBUTING-STACK.md)_

## 8.10 — Status Badges

- [x] Add CI status badge to root README
- [x] Add Node/pnpm version badges

## 8.11 — Pre-Release Validation Script

- [x] Create `scripts/validate-v1.sh` (or node script):
  ```bash
  pnpm install --frozen-lockfile
  pnpm -r check
  pnpm -r lint
  pnpm -r test
  pnpm -r build
  svelocity doctor
  # optional: e2e
  ```
- [x] Runnable locally before release (`pnpm validate:v1`, `RUN_E2E=1` for e2e)
- [x] Document in Phase 10 release checklist

## 8.12 — Verification

- [ ] CI green on main
- [x] Intentionally break env → doctor catches it _(scratch project: 5 FAILs, each with a fix hint, exit 1; `--fix` copies the env example and reports honestly)_
- [x] Intentionally break template → generation CI catches it _(cli.yml golden-path generation runs scaffold → install → check → build → doctor on every PR)_
- [ ] E2E catches auth regression _(anti-silent-skip guard fails the job if 0 tests execute; ticks after first green run)_
- [ ] Phase 9 todo reviewed and unblocked _(docs-only, prerequisites = Phases 3–8; ticks when CI is green on main)_
