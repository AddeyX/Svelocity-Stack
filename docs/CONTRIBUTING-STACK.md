# Contributing to Svelocity Stack (stack developers)

Instructions for working on the **stack itself** — the reference monorepo that
`create-svelocity` snapshots into a template. Generated projects never see this
file. Agent instructions for both audiences live in `AGENTS.md`.

## Phase workflow

Development follows `docs/phases/` (phase docs are stack-only, excluded from the
template). Do not mark a phase done until its Exit Criteria pass. Scope changes go
through `docs/V1-SCOPE.md` first; new ideas go to `docs/V1.1-BACKLOG.md`.

## The repo is the template

`packages/create-svelocity/scripts/build-template.mjs` snapshots the repo root into
`packages/create-svelocity/template/`, excluding stack-only paths (`EXCLUDE_PATHS`,
`EXCLUDE_DIR_NAMES`) and injecting `{{TOKENS}}`. Consequences:

- Anything you add at repo root ships to generated projects unless excluded
- AGENTS.md must only reference paths that survive the snapshot
- After changing template-relevant files, run
  `pnpm --filter create-svelocity test` (template spec verifies excludes/tokens)

## Gates

- `pnpm check && pnpm test && pnpm build && pnpm lint` — repo-wide, must stay green
- `CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts`
  — gated e2e: scaffold → install → check → build → doctor (slow, ~10–20 min)
- `pnpm validate:v1` — pre-release gauntlet (`scripts/validate-v1.sh`): frozen install,
  manifest, check, lint, test, build, doctor; add `RUN_E2E=1` to include Playwright

## Lockfile policy

- `pnpm-lock.yaml` is committed. Never gitignore it.
- CI installs with `pnpm install --frozen-lockfile` — a `package.json` or catalog
  change without the regenerated lockfile fails the install step, on purpose.
- Update process: edit `package.json` (or the catalog) → `pnpm install` → commit
  the manifest **and** `pnpm-lock.yaml` together.
- Version pins live in the catalog in `pnpm-workspace.yaml`; rationale and tested
  targets in `docs/COMPATIBILITY.md`.

## Native packaging is not in CI (v1)

CI builds the Vite bundles for web, desktop, and mobile — that catches template
rot. Native packaging (electron-builder installers, Xcode/Gradle compiles) is
deliberately excluded:

| Reason           | Detail                                                    |
| ---------------- | --------------------------------------------------------- |
| Signing secrets  | Code-signing certs and keystores don't belong in v1 CI    |
| Platform runners | iOS needs macOS runners; Android needs SDK-image runners  |
| Toolchain weight | Xcode + Android SDK add tens of minutes for little signal |

Native packaging is validated manually per
`docs/phases/phase-04-electron-template.md` and
`docs/phases/phase-05-capacitor-template.md`.

## Release process

Update catalog pins in `pnpm-workspace.yaml` → `pnpm install` → CI green → tag.
See `docs/phases/phase-10-hardening-release.md` for the v1.0.0 checklist.
