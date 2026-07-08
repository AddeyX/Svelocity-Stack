# Alignment audit — buckets

Work through each bucket. Every finding gets a status label and file evidence
(path, line where useful). No edits — read-only.

## Bucket 1 — Manifest ↔ workspace

- Each `targets[]` entry has a matching `apps/<target>` directory with a
  `package.json` and `build` script
- `ui`, `auth`, `backend` values match reality: `bits-ui` in
  `packages/ui/package.json` deps; `@convex-dev/auth` present;
  `packages/backend/convex/` exists
- `packageManager` matches root `package.json`
- `stackVersion` matches root `package.json` `version`
- Manifest validates: `pnpm validate:manifest` (or
  `pnpm exec svelocity doctor` in a generated project)

## Bucket 2 — AGENTS.md paths and claims

- Every path referenced in AGENTS.md exists
- The Foundational Stack table matches installed deps (spot-check
  `pnpm-workspace.yaml` catalog)
- The Directory Map lists every `apps/*` and `packages/*` directory — flag
  missing or extra rows
- Dev login works only if the seeded demo user exists in the backend — mark
  ❓ Unverifiable unless the user confirms a running backend

## Bucket 3 — Skills ↔ manifest ↔ disk

- Every `skills[]` entry in the manifest has `.agents/skills/<name>/SKILL.md`
- Every `.agents/skills/*` directory is listed in the manifest
- `.claude/skills/<name>` resolves (symlink or copied dir) for each skill
- Skill tables in `AGENTS.md` and `.agents/README.md` list the same set

## Bucket 4 — Conventions ↔ code (full mode)

- Dependency direction: grep app imports in `packages/*/src` — zero hits
  expected (`grep -rn "apps/" packages/*/src` modulo comments)
- Import aliases used per `docs/CONVENTIONS.md`
- File naming spot-check: components PascalCase, modules kebab/camel per
  conventions

## Bucket 5 — Demo spec ↔ implementation (full mode)

- Each `docs/DEMO-SPEC.md` acceptance criterion maps to implemented code
  (schema table, route, view) — label each
- Auth flow criteria: login/register routes exist on web; LoginView on
  desktop/mobile

## Scoring

Report `aligned / total` per bucket and overall. Anything 🔴 gets a one-line
suggested fix in the report.
