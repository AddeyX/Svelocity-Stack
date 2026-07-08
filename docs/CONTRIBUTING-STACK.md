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

## Release process

Update catalog pins in `pnpm-workspace.yaml` → `pnpm install` → CI green → tag.
See `docs/phases/phase-10-hardening-release.md` for the v1.0.0 checklist.
