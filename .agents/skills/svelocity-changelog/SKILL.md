---
name: svelocity-changelog
description: >
  Create or update the public-facing CHANGELOG.md and bump the root package.json
  version in a Svelocity Stack project. Collects conventional commits since the
  last release tag and writes customer-friendly release notes — no internal
  implementation detail. Use when the user asks to update the changelog, cut a
  release, bump the version, or document what shipped.
disable-model-invocation: true
argument-hint: '[patch|minor|major] [optional release date YYYY-MM-DD]'
compatibleStackVersion: 0.1.x
---

# Svelocity Changelog

Release-notes workflow for the project root.

**Outputs:**

- `CHANGELOG.md` at repo root (create from
  [changelog-template.md](changelog-template.md) if missing)
- Root `package.json` `"version"` bumped to match

## Before you start

1. Confirm git history is available: `git log --oneline -5`
2. If the user passed `patch`, `minor`, or `major`, use that bump. Otherwise
   infer from the change mix (see [reference.md](reference.md))

## Workflow

Copy this checklist and track progress:

```text
- [ ] Step 1 — Locate or create CHANGELOG.md
- [ ] Step 2 — Find the last release (newest version heading, or last git tag)
- [ ] Step 3 — Collect commits since then: git log <last>..HEAD --oneline
- [ ] Step 4 — Draft public-facing notes (mapping rules in reference.md)
- [ ] Step 5 — Bump version in root package.json
- [ ] Step 6 — Write CHANGELOG.md
- [ ] Step 7 — Sanity checks
```

### Sanity checks (Step 7)

- Version heading, date, and `package.json` version all agree
- No internal-only entries (refactors, CI, test-only changes)
- `pnpm lint` passes (prettier checks CHANGELOG.md)
- Show the user the diff before committing — commit only with permission
