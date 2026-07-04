# Phase 6 — Thin CLI: Design

**Date:** 2026-07-04
**Status:** Approved for planning
**Phase plan:** [docs/phases/phase-06-thin-cli.md](../../phases/phase-06-thin-cli.md)

## Summary

A single npm package, `create-svelocity`, that ships two bins:

- `create-svelocity` — scaffolds a new golden-path project (`pnpm create svelocity`)
- `svelocity` — project tooling: `svelocity doctor`, `svelocity info`

The reference monorepo (this repo) remains the single source of truth. A build
script snapshots the repo root into the package's `template/` directory at
publish/test time. No separately maintained template copy.

## Decisions (resolved during brainstorming)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Template source | Repo root snapshotted by build script into `template/` | Single source of truth; no drift between reference repo and template |
| Package shape | One package (`create-svelocity`), two bins (`create-svelocity`, `svelocity`) | One version/publish; matches ecosystem pattern (`create-vite`/`vite`, `create-astro`/`astro`) |
| Brand token | `svelocity` (lowercase) for commands; "Svelocity Stack" is display name only | Short CLI ergonomics; both `svelocity` and `create-svelocity` confirmed free on npm (404 as of 2026-07-04) |
| Lockfile | `pnpm-lock.yaml` included in template | Generated projects install the exact proven version set; matches the pinned-versions philosophy |
| Toolchain | citty (args) + @clack/prompts (UI) + picocolors + tsdown (build) + vitest (tests) | ESM-native, modern, minimal; matches repo `type: module` |
| Doctor depth | Static checks only (no builds, no network) | Fast (<2s), deterministic, matches phase-plan checklist; smoke builds live in CI, not doctor |
| Convex setup during create | Print instructions only; never spawn the Convex CLI | Create cannot hang on interactive login/network; both prompt paths end in printed next steps |
| Package scope in output | Generated projects keep `@svelocity/*` internal package names | Imports stay stable; skills/docs reference them; scope rename deferred to v1.1 |
| Docs in output | Trim to user-facing: keep README (tokenized), CONVENTIONS, COMPATIBILITY, `adr/`; exclude `docs/phases`, `docs/superpowers`, V1-SCOPE, V1.1-BACKLOG, RISKS, PR doc | Generated project reads like a product, not the stack's build log |

## Architecture

```
packages/create-svelocity/
├── package.json            # name: create-svelocity; bin: { create-svelocity, svelocity }
├── src/
│   ├── create.ts           # create-svelocity entry (citty defineCommand)
│   ├── cli.ts              # svelocity entry (citty subcommands: doctor, info)
│   ├── commands/
│   │   ├── create/         # prompts.ts, scaffold.ts (copy+tokens), manifest.ts, git.ts, install.ts, next-steps.ts
│   │   ├── doctor/         # runner.ts + checks/ (env, workspace, manifest, convex, auth, targets, native)
│   │   └── info/           # info.ts
│   └── lib/                # manifest.ts (read/validate), versions.ts, proc.ts, output.ts
├── scripts/
│   └── build-template.mjs  # snapshot repo root → template/ (exclude list + token pass)
├── template/               # generated artifact — gitignored; built before publish and before integration tests
└── tests/                  # vitest unit + integration
```

- `files`: `["dist", "template"]`. `prepublishOnly`: build-template + tsdown.
- The package excludes itself from the snapshot (no CLI package inside generated projects).
- tsdown bundles both entries into `dist/`; bins point at dist files with shebangs.

## Template pipeline (`scripts/build-template.mjs`)

**Excludes:** `node_modules`, `.git`, `dist`, `build`, `.svelte-kit`, `.wrangler`,
`.env*`, `packages/create-svelocity`, `docs/phases`, `docs/superpowers`,
`docs/V1-SCOPE.md`, `docs/V1.1-BACKLOG.md`, `docs/RISKS.md`,
`docs/Svelocity-Stack-PR.md`, native build artifacts (iOS `DerivedData`/`Pods`,
Android `build/`), `.claude`.

**Includes explicitly:** `pnpm-lock.yaml`, `convex/_generated`,
`.svelocity/manifest.schema.json`, `.svelocity/manifest.example.json`.

**Token pass:** rewrites literal strings to placeholders while snapshotting:

| Token | Replaces | Appears in |
| --- | --- | --- |
| `{{PROJECT_NAME}}` | `svelocity-stack` (root package name), README title | root package.json, README |
| `{{DISPLAY_NAME}}` | human-readable app name | Electron/Capacitor configs, web app shell |
| `{{APP_ID}}` | reverse-DNS bundle/app id | capacitor.config, Electron builder config, native project files |

`@svelocity/*` workspace package names are NOT tokenized.

**Dotfile handling:** npm strips `.gitignore` from published packages — store as
`_gitignore` in `template/`, rename back during scaffold.

## `create` command flow

1. Banner; validate Node ≥22 and pnpm ≥10 — fail fast with the required version
   and install command.
2. Prompts (clack, each with one-line explanation; all cancellable):
   - Project name — validate-npm-package-name + target dir empty/absent check
   - Golden-path stack summary (Bits UI, Convex, Convex Auth, web+desktop+mobile) — confirm, no toggles in v1
   - Convex setup: "guide me now" vs "later" — both print instructions; "now" prints the `npx convex dev` walkthrough inline in next steps
   - Git init (default yes)
   - Install dependencies (default yes)
3. Copy `template/` → target; rename `_gitignore` → `.gitignore`; apply token
   replacements to file contents (and file names if any contain tokens).
4. Write `.svelocity/manifest.json` — schema-valid, `stackVersion` from the
   stack, `createdWith: create-svelocity@<pkg version>`, `packageManager` pinned.
5. `git init` + initial commit (if selected), then `pnpm install` with spinner —
   stream output on failure.
6. Print next-steps block (cd, Convex setup, per-app dev commands).

**Non-interactive mode** for CI/tests: `--name <n> --yes --no-git --no-install`.

**Error UX:** wrong Node → required version shown; missing pnpm → corepack/install
command shown; dir not empty → suggest new name or empty dir. Non-zero exit codes.

## `doctor` command

Static checks only. Runs from any subdirectory of a project (walks up to find
`.svelocity/manifest.json`; errors with guidance if absent).

| Category | Checks | Severity |
| --- | --- | --- |
| Environment | Node/pnpm versions vs compatibility matrix | FAIL |
| Workspace | `pnpm-workspace.yaml` exists; workspace package dirs present | FAIL |
| Manifest | valid vs bundled schema; `stackVersion` recognized | FAIL |
| Convex | `packages/backend/convex/` exists; `CONVEX_URL`/`PUBLIC_CONVEX_URL` env set; convex CLI resolvable | FAIL (env: WARN) |
| Auth | Convex Auth config present in backend; auth env vars (JWT_PRIVATE_KEY etc.) | WARN |
| Targets | per manifest target: `apps/web`, `apps/desktop` (Electron deps), `apps/mobile` (capacitor config + native dirs) | FAIL |
| Native tooling | Android SDK detected; Xcode detected (macOS only) | WARN only |

Summary table at end (PASS/WARN/FAIL counts). Exit 1 if any FAIL, else 0.

## `info` command

Reads and validates the manifest, displays: stack version, createdWith, targets,
ui/auth/backend, package manager, skills, AI targets, plus the compatibility
matrix row for the current stack version. Missing/invalid manifest → suggest
`svelocity doctor`.

## Testing

- **Unit (vitest):** token replacement, manifest generation/validation, project
  name validation, individual doctor checks against mocked fs/env.
- **Integration (temp dir):** run build-template → scaffold non-interactively →
  assert file presence, token substitution, `_gitignore` rename, manifest
  schema-validity → `pnpm install && pnpm -r check` in the generated project.
- **Doctor smoke:** run `svelocity doctor` inside the generated project —
  expect zero FAILs (native tooling may WARN; Android SDK absent on dev machine).
- **CI:** job that generates the golden path in a temp dir and validates it
  (install + check). Local equivalent: `pnpm dlx ./packages/create-svelocity`.

## Out of scope (v1.1+, document only)

`svelocity add | upgrade | sync | generate | audit`; UI/auth/platform selection
prompts; `@svelocity/*` scope renaming; demo-data toggle; testing-level prompt.

## Exit criteria (from phase plan)

- `pnpm create svelocity` generates a working golden-path project
- Generated project passes `pnpm install && pnpm -r check && pnpm -r build`
- `svelocity doctor` reports actionable PASS/WARN/FAIL; non-zero exit on FAIL
- `svelocity info` reads and displays the manifest
- Web-path setup under 30 minutes on a prepared machine
- CLI tested in CI via temp-directory generation
