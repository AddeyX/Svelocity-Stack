# Phase 10 — Hardening + V1.0.0 Release

**Goal:** Prove reliability, fix remaining issues, and publish Svelocity Stack v1.0.0.  
**Prerequisites:** Phases 0–9 complete  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [ ] All V1 success criteria from `docs/V1-SCOPE.md` pass
- [ ] Fresh user completes web setup in under 30 minutes
- [ ] All three platform builds compile
- [x] Security and accessibility baselines met
- [x] Known limitations documented
- [ ] `v1.0.0` tagged and published (CLI + template)

---

## 10.1 — End-to-End Validation

- [ ] Run full validation script on clean machine (macOS) — `pnpm validate:v1`
      (`scripts/validate-v1.sh`, Phase 8 §8.11; add `RUN_E2E=1` for Playwright)
- [ ] Run on Windows (if available)
- [ ] Run on Linux (if available)
- [ ] Record actual setup times:
  - [ ] Web only: ___ minutes
  - [ ] + Desktop: ___ minutes
  - [ ] + Mobile: ___ minutes
- [ ] Fix any step that exceeds 30 min for web path

## 10.2 — Golden Path Smoke Tests

- [ ] `pnpm create svelocity` → install → web dev → login → create task
- [ ] Same project: desktop dev → login → see same tasks
- [ ] Same project: mobile build + sync → login → see same tasks
- [ ] Real-time: create task on web, appears on desktop without refresh
- [ ] Logout on one platform, session handled correctly on others

## 10.3 — Security Audit

### Web

- [x] Auth cookies not used; V1 token storage follows ADR 0002
- [x] No secrets in client bundle (automated source audit + production build inspection)
- [x] Server input validated in Convex mutations
- [x] Auth checks on all protected Convex functions
- [x] Environment separation (typed public env + untracked local env)
- [x] No open redirects in auth flow

### Electron

- [x] `contextIsolation: true` confirmed
- [x] `nodeIntegration: false` confirmed
- [x] Preload API surface minimal
- [x] No remote module usage
- [x] CSP considered

### Capacitor

- [x] No unnecessary permissions in manifests
- [x] WebView does not expose file system
- [x] Deep link handling safe (not configured)

### Dependencies

- [x] `pnpm audit` reviewed — no critical unmitigated vulnerabilities
- [x] Lockfile integrity verified

## 10.4 — Accessibility Audit

- [x] Keyboard interaction works on login/tasks controls and dialogs
- [x] Focus visible on all interactive elements
- [x] Form fields have associated labels
- [x] Error messages announced or visible
- [x] Color contrast meets WCAG AA for tested views
- [x] Dialog traps focus, closes with Escape, and restores trigger focus
- [x] Axe scans pass on register, tasks, and delete dialog views

## 10.5 — Performance Baseline

- [ ] Web: Lighthouse performance score > 80 on demo page
- [ ] Web: first load time acceptable on throttled network
- [ ] Desktop: app launches in < 5 seconds
- [ ] Mobile: app loads in < 3 seconds on emulator
- [x] No unnecessary large dependencies in shared packages
- [x] Document any known performance limitations

## 10.6 — Error State Coverage

- [x] Network failure during task create → ErrorState with retained-title retry
- [x] Invalid login credentials → clear friendly error message
- [x] Convex down → graceful task query/create degradation
- [x] Empty task list → EmptyState with create prompt
- [x] Loading auth → LoadingState, no flash of wrong content

## 10.7 — Dark Mode (If Structured in Phase 2)

- [ ] If dark tokens exist: basic dark mode toggle works on web
- [x] If not ready: document as v1.1 item, ensure no broken styles

## 10.8 — Known Limitations Document

File: `docs/KNOWN-LIMITATIONS.md`

- [x] shadcn-svelte not available in v1
- [x] Better Auth not available in v1
- [x] `svelocity add` not available — use skill guide
- [x] `svelocity upgrade` not available — manual dep updates
- [x] Store submission not automated
- [x] Electron auto-updater not configured
- [x] iOS build requires macOS
- [x] Offline sync not implemented
- [x] Observability not included

## 10.9 — v1.1 Backlog Document

File: `docs/V1.1-BACKLOG.md`

- [x] shadcn-svelte option
- [x] Better Auth option
- [x] `svelocity add` command
- [x] `svelocity upgrade` + migrations
- [x] Additional skills (deploy, electron, capacitor, production-audit)
- [x] Sub-agents directory
- [x] Documentation website
- [x] Renovate preset
- [x] `packages/platform` abstraction
- [x] Dark mode polish
- [x] Observability setup

## 10.10 — Release Preparation

- [ ] All phase todo lists reviewed — critical items complete
- [x] CHANGELOG.md written for v1.0.0
- [x] Version bumped to `1.0.0` in manifest schema example
- [x] `create-svelocity` package version `1.0.0`
- [x] Final `pnpm -r check && pnpm -r test && pnpm -r build` green
- [ ] `svelocity doctor` all PASS on reference project (13 pass, 3 environment warnings)
- [x] CLI generation integration test green

## 10.11 — Publishing

- [ ] Publish `create-svelocity` to npm (or confirm `pnpm create` flow)
- [ ] Tag git release: `v1.0.0`
- [ ] GitHub release with changelog
- [ ] Verify `pnpm create svelocity@1.0.0` works from npm

## 10.12 — Launch Checklist

- [x] README is polished and accurate
- [x] All public guides linked and tested
- [ ] CI badges green
- [x] LICENSE file present
- [x] CONTRIBUTING.md present
- [ ] Issue templates (bug, feature request) — optional
- [ ] Announcement draft — optional

## 10.13 — Post-Release Monitoring

- [ ] Watch for install failures in first 48 hours
- [ ] Triage issues with "v1.0.0" label
- [ ] Plan v1.0.1 for critical fixes if needed
- [ ] Begin v1.1 backlog prioritization based on user feedback

## 10.14 — Retrospective

- [x] What took longer than estimated?
- [x] Which phase todos were missing items?
- [x] Update phase docs with lessons learned
- [x] Update `Svelocity-Stack-PR.md` Section 30 to match shipped reality

## 10.15 — Final Verification

- [ ] V1 success criteria — all checked
- [ ] Non-goals — none accidentally shipped
- [ ] Golden path — fully functional
- [ ] AI instructions — accurate and helpful
- [ ] Ready for public use
