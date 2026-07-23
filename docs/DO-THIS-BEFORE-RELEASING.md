# 🚨 DO THIS BEFORE RELEASING 🚨

**This is the manual pre-release runbook for v1.0.0.** Everything automated is already
done and merged. The items below require a human (you) at a keyboard. Work top to
bottom — each section gates the next. When every box is checked, tag and publish.

Source of truth for the full checklist: [`docs/phases/phase-10-hardening-release.md`](phases/phase-10-hardening-release.md).

---

## 1. Full validation on a clean machine (§10.1)

- [ ] On a machine (or fresh user account) without this repo's caches:

  ```bash
  pnpm validate:v1
  ```

- [ ] Run again with E2E included:

  ```bash
  RUN_E2E=1 pnpm validate:v1
  ```

- [ ] Record actual setup times in `docs/phases/phase-10-hardening-release.md` §10.1:
  - Web only: ___ minutes (**must be under 30**)
  - + Desktop: ___ minutes
  - + Mobile: ___ minutes
- [ ] If the web path exceeds 30 minutes, fix the slow step before continuing.
- Windows / Linux runs: optional, do them if a machine is available.

## 2. Golden path smoke test (§10.2)

Do this as a real user would, in a directory outside this repo:

- [ ] `pnpm create svelocity` → install → start web dev → register/login → create a task
- [ ] Same project: desktop dev (`electron`) → login → **same tasks appear**
- [ ] Same project: mobile build + `cap sync` → login → same tasks
      (iOS only on this machine — Android SDK not installed, that's a known/accepted gap)
- [ ] Real-time check: create a task on web → appears on desktop **without refresh**
- [ ] Logout on one platform → other platforms handle the session sanely

## 3. Performance baseline (§10.5)

- [ ] Web: Lighthouse performance score **> 80** on the demo page (production build, not dev)
- [ ] Web: first load acceptable on a throttled network (DevTools "Slow 4G")
- [ ] Desktop: app launches in **< 5 seconds**
- [ ] Mobile: app loads in **< 3 seconds** on the simulator
- [ ] Note any misses in `docs/KNOWN-LIMITATIONS.md` instead of blocking, unless egregious.

## 4. Dark mode sanity (§10.7)

- [ ] If dark tokens exist in `packages/ui` theme: verify the basic toggle works on web.
- [ ] If not: already documented as v1.1 — just confirm nothing looks broken in dark
      system theme (no unreadable text).

## 5. Doctor + known bin gap (§10.10) — ⚠️ do not skip

- [ ] **Known gap:** generated projects have no `svelocity` bin —
      `pnpm exec svelocity doctor` fails inside a generated project because the template
      `package.json` has no `create-svelocity` devDependency. This was deferred to
      "fix at publish time". **Fix or consciously accept it now**, before npm publish.
- [ ] Run `svelocity doctor` on the reference project — target: all PASS
      (last known: 13 pass, 3 environment warnings — decide if the warnings are acceptable).

## 6. Release prep sweep (§10.10)

- [ ] Skim every `docs/phases/phase-*.md` — confirm no unchecked **critical** items remain.
- [ ] Final green run:

  ```bash
  pnpm -r check && pnpm -r test && pnpm -r build
  ```

## 7. Publish (§10.11)

Only after everything above is green:

- [ ] `npm login` (or verify auth) as the account that owns `create-svelocity`
- [ ] Publish from the CLI package:

  ```bash
  pnpm --filter create-svelocity publish --access public
  ```

- [ ] Tag and push the release:

  ```bash
  git tag v1.0.0 && git push origin main --tags
  ```

- [ ] Create the GitHub release from the tag, paste `CHANGELOG.md` v1.0.0 section.
- [ ] Verify from npm, in a clean directory:

  ```bash
  pnpm create svelocity@1.0.0
  ```

## 8. Launch checklist (§10.12)

- [ ] CI badges on README are green (push triggers workflows — check Actions tab).
- [ ] Optional: issue templates (bug / feature request), announcement draft.

## 9. After release (§10.13)

- [ ] Watch for install failures in the first 48 hours.
- [ ] Label incoming issues `v1.0.0`; plan a v1.0.1 if anything critical lands.

---

**When done:** check off the remaining Exit Criteria boxes at the top of
`docs/phases/phase-10-hardening-release.md`, then delete this file or move it to
`docs/archive/` — its job is finished.
