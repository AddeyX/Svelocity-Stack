# Phase 8 — Doctor, Info, CI

**Goal:** Harden diagnostics, finalize `doctor`/`info` commands, and establish golden-path CI that prevents template rot.  
**Prerequisites:** Phases 3–7 complete  
**Estimated effort:** 3–5 days

---

## Exit Criteria

- [ ] `svelocity doctor` catches all common misconfiguration cases
- [ ] CI generates or validates golden-path project on every PR
- [ ] Full workspace `check`, `test`, `build` runs in CI
- [ ] Playwright e2e runs in CI for web auth + tasks flow
- [ ] Compatibility matrix enforced in doctor and CI

---

## 8.1 — Doctor Command Hardening

- [ ] Review all checks from Phase 6 — ensure implemented, not stubbed
- [ ] Add fix suggestions for every FAIL:
  - [ ] "Node 18 detected. Svelocity 1.x requires Node 22+. Install: ..."
  - [ ] "CONVEX_URL missing. Copy .env.example and run convex dev."
  - [ ] "apps/desktop missing electron dep. Run pnpm install."
- [ ] Add `--json` output flag for machine-readable results
- [ ] Add `--fix` flag for auto-fixable issues (e.g. copy .env.example) — optional
- [ ] Test doctor on:
  - [ ] Healthy project → all PASS
  - [ ] Missing env → FAIL with message
  - [ ] Wrong Node → FAIL
  - [ ] Missing manifest → FAIL
  - [ ] No Convex dir → WARN or FAIL

## 8.2 — Info Command Hardening

- [ ] Pretty-print manifest fields
- [ ] Show installed stack version vs latest (if registry known)
- [ ] List all targets with status (dir exists, build script present)
- [ ] List skills with file-exists check
- [ ] Show relevant dev commands per target

## 8.3 — CI Pipeline — Workspace

- [ ] Job: **check** — `pnpm -r check` (TypeScript)
- [ ] Job: **lint** — `pnpm -r lint`
- [ ] Job: **unit test** — `pnpm -r test`
- [ ] Job: **build** — `pnpm -r build`
- [ ] All jobs use `pnpm install --frozen-lockfile`
- [ ] Cache pnpm store between runs
- [ ] Run on PR and main branch

## 8.4 — CI Pipeline — E2E

- [ ] Job: **e2e web** — Playwright against web app
  - [ ] Start Convex dev or use test deployment
  - [ ] Run auth + create task flow
  - [ ] Upload trace on failure
- [ ] Configure CI secrets for Convex test env (if needed)
- [ ] Timeout appropriate for e2e (10–15 min)

## 8.5 — CI Pipeline — CLI Generation

- [ ] Job: **cli generate** — run `create-svelocity` in temp directory
  - [ ] `pnpm install`
  - [ ] `pnpm -r check`
  - [ ] `pnpm -r build` (web at minimum)
- [ ] Catches template rot when source changes but template doesn't
- [ ] Run on every PR touching template or packages

## 8.6 — CI Pipeline — Doctor

- [ ] Job: **doctor** — run `svelocity doctor` on reference repo
  - [ ] Expect all PASS (or only native WARNs)
  - [ ] Run on generated project too

## 8.7 — Compatibility Matrix Enforcement

- [ ] `docs/COMPATIBILITY.md` lists pinned versions
- [ ] Doctor reads matrix and compares runtime versions
- [ ] CI Node version matches matrix
- [ ] Root `package.json` `engines` field enforces Node/pnpm

## 8.8 — Lockfile Policy

- [ ] `pnpm-lock.yaml` committed
- [ ] CI uses `--frozen-lockfile`
- [ ] PR that changes package.json without lockfile fails
- [ ] Document lockfile update process

## 8.9 — Build Targets in CI

| Target   | CI requirement                                         |
| -------- | ------------------------------------------------------ |
| Web      | `build` required, must pass                            |
| Desktop  | `build` required, must pass                            |
| Mobile   | `build` required (web assets), native compile optional |
| Packages | `check` + `test` required                              |

- [ ] Web production build passes
- [ ] Desktop Vite build passes
- [ ] Mobile Vite build passes
- [ ] Native mobile/Electron packaging optional in CI (document why)

## 8.10 — Status Badges

- [ ] Add CI status badge to root README
- [ ] Add Node/pnpm version badges

## 8.11 — Pre-Release Validation Script

- [ ] Create `scripts/validate-v1.sh` (or node script):
  ```bash
  pnpm install --frozen-lockfile
  pnpm -r check
  pnpm -r lint
  pnpm -r test
  pnpm -r build
  svelocity doctor
  # optional: e2e
  ```
- [ ] Runnable locally before release
- [ ] Document in Phase 10 release checklist

## 8.12 — Verification

- [ ] CI green on main
- [ ] Intentionally break env → doctor catches it
- [ ] Intentionally break template → generation CI catches it
- [ ] E2E catches auth regression
- [ ] Phase 9 todo reviewed and unblocked
