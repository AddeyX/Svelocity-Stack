# Phase 10 — Hardening + V1.0.0 Release

**Goal:** Prove reliability, fix remaining issues, and publish Svelocity Stack v1.0.0.  
**Prerequisites:** Phases 0–9 complete  
**Estimated effort:** 5–7 days

---

## Exit Criteria

- [ ] All V1 success criteria from `docs/V1-SCOPE.md` pass
- [ ] Fresh user completes web setup in under 30 minutes
- [ ] All three platform builds compile
- [ ] Security and accessibility baselines met
- [ ] Known limitations documented
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

- [ ] Auth cookies configured securely
- [ ] No secrets in client bundle (inspect build output)
- [ ] Server input validated in Convex mutations
- [ ] Auth checks on all protected Convex functions
- [ ] Environment separation (dev vs prod)
- [ ] No open redirects in auth flow

### Electron

- [ ] `contextIsolation: true` confirmed
- [ ] `nodeIntegration: false` confirmed
- [ ] Preload API surface minimal
- [ ] No remote module usage
- [ ] CSP considered

### Capacitor

- [ ] No unnecessary permissions in manifests
- [ ] WebView does not expose file system
- [ ] Deep link handling safe (if configured)

### Dependencies

- [ ] `pnpm audit` reviewed — no critical unmitigated vulnerabilities
- [ ] Lockfile integrity verified

## 10.4 — Accessibility Audit

- [ ] Keyboard navigation works on login and tasks pages
- [ ] Focus visible on all interactive elements
- [ ] Form fields have associated labels
- [ ] Error messages announced or visible
- [ ] Color contrast meets WCAG AA for text
- [ ] Dialog traps focus and closes with Escape
- [ ] Run axe or similar on web app — fix critical issues

## 10.5 — Performance Baseline

- [ ] Web: Lighthouse performance score > 80 on demo page
- [ ] Web: first load time acceptable on throttled network
- [ ] Desktop: app launches in < 5 seconds
- [ ] Mobile: app loads in < 3 seconds on emulator
- [ ] No unnecessary large dependencies in shared packages
- [ ] Document any known performance limitations

## 10.6 — Error State Coverage

- [ ] Network failure during task create → ErrorState with retry
- [ ] Invalid login credentials → clear error message
- [ ] Convex down → graceful degradation message
- [ ] Empty task list → EmptyState with create prompt
- [ ] Loading auth → LoadingState, no flash of wrong content

## 10.7 — Dark Mode (If Structured in Phase 2)

- [ ] If dark tokens exist: basic dark mode toggle works on web
- [ ] If not ready: document as v1.1 item, ensure no broken styles

## 10.8 — Known Limitations Document

File: `docs/KNOWN-LIMITATIONS.md`

- [ ] shadcn-svelte not available in v1
- [ ] Better Auth not available in v1
- [ ] `svelocity add` not available — use skill guide
- [ ] `svelocity upgrade` not available — manual dep updates
- [ ] Store submission not automated
- [ ] Electron auto-updater not configured
- [ ] iOS build requires macOS
- [ ] Offline sync not implemented
- [ ] Observability not included

## 10.9 — v1.1 Backlog Document

File: `docs/V1.1-BACKLOG.md`

- [ ] shadcn-svelte option
- [ ] Better Auth option
- [ ] `svelocity add` command
- [ ] `svelocity upgrade` + migrations
- [ ] Additional skills (deploy, electron, capacitor, production-audit)
- [ ] Sub-agents directory
- [ ] Documentation website
- [ ] Renovate preset
- [ ] `packages/platform` abstraction
- [ ] Dark mode polish
- [ ] Observability setup

## 10.10 — Release Preparation

- [ ] All phase todo lists reviewed — critical items complete
- [ ] CHANGELOG.md written for v1.0.0
- [ ] Version bumped to `1.0.0` in manifest schema example
- [ ] `create-svelocity` package version `1.0.0`
- [ ] Final `pnpm -r check && pnpm -r test && pnpm -r build` green
- [ ] `svelocity doctor` all PASS on reference project
- [ ] CLI generation CI green

## 10.11 — Publishing

- [ ] Publish `create-svelocity` to npm (or confirm `pnpm create` flow)
- [ ] Tag git release: `v1.0.0`
- [ ] GitHub release with changelog
- [ ] Verify `pnpm create svelocity@1.0.0` works from npm

## 10.12 — Launch Checklist

- [ ] README is polished and accurate
- [ ] All guides linked and tested
- [ ] CI badges green
- [ ] LICENSE file present
- [ ] CONTRIBUTING.md present
- [ ] Issue templates (bug, feature request) — optional
- [ ] Announcement draft — optional

## 10.13 — Post-Release Monitoring

- [ ] Watch for install failures in first 48 hours
- [ ] Triage issues with "v1.0.0" label
- [ ] Plan v1.0.1 for critical fixes if needed
- [ ] Begin v1.1 backlog prioritization based on user feedback

## 10.14 — Retrospective

- [ ] What took longer than estimated?
- [ ] Which phase todos were missing items?
- [ ] Update phase docs with lessons learned
- [ ] Update `Svelocity-Stack-PR.md` Section 30 to match shipped reality

## 10.15 — Final Verification

- [ ] V1 success criteria — all checked
- [ ] Non-goals — none accidentally shipped
- [ ] Golden path — fully functional
- [ ] AI instructions — accurate and helpful
- [ ] Ready for public use
