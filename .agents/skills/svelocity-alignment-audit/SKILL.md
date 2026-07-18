---
name: svelocity-alignment-audit
description: >
  Read-only audit comparing a Svelocity Stack project's docs and manifest to the
  actual codebase. Verifies .svelocity/manifest.json, AGENTS.md, docs/CONVENTIONS.md,
  and docs/DEMO-SPEC.md claims against the workspace, schema, and apps, then produces
  a scored alignment report. Use when the user asks for an alignment report, docs vs
  codebase audit, manifest reconciliation, or whether docs match implementation.
  Requires explicit user confirmation before running — never start without it.
disable-model-invocation: true
argument-hint: '[full|quick] [optional output path]'
compatibleStackVersion: 1.0.x
---

# Svelocity Alignment Audit

Read-only docs ↔ manifest ↔ codebase alignment audit.

## Gate — user confirmation required

**Do not read source docs beyond this skill, grep the codebase, or write a report
until the user explicitly confirms.**

When this skill is invoked:

1. **Stop.** Do not start the audit yet.
2. **Present the confirmation prompt** (structure below; fill in today's date).
3. **Wait** for explicit approval (`yes`, `run it`, `go`, or equivalent).
4. If the user declines or asks questions, answer only — do not audit.
5. If the user picks a mode (`full` / `quick`), use that. Default: **full**.

### Confirmation prompt template

```markdown
## Svelocity alignment audit — confirm before run

**Mode:** [full | quick — one-line scope]
**Output:** `docs/audits/alignment-report-YYYY-MM-DD.md` (or chat-only)
**Read-only:** no code edits, no commits

**Source docs:** `.svelocity/manifest.json`, `AGENTS.md`, `docs/CONVENTIONS.md`,
`docs/DEMO-SPEC.md`, `.agents/README.md`

**Verified against:** `pnpm-workspace.yaml`, `apps/*`, `packages/*`,
`packages/backend/convex/schema.ts`, `.agents/skills/*`

Reply **yes** to start, **quick** for the short scope, or **chat** for a
chat-only report.
```

Only after confirmation → follow [reference.md](reference.md) and write output
using [report-template.md](report-template.md).

## Modes

| Mode      | Scope                                                          |
| --------- | -------------------------------------------------------------- |
| **full**  | All buckets in reference.md                                    |
| **quick** | Buckets 1–3 only (manifest, AGENTS.md paths, skills) — ~15 min |

## Conflict priority (when sources disagree)

`code (workspace, schema, apps)` > `.svelocity/manifest.json` > `AGENTS.md` / docs

## Status labels

| Status          | Meaning                             |
| --------------- | ----------------------------------- |
| ✅ Aligned      | Code matches claim                  |
| 🟡 Partial      | Exists but incomplete vs claim      |
| 🔴 Missing      | Doc/manifest says yes, code says no |
| 📄 Doc stale    | Code ahead of doc                   |
| ❓ Unverifiable | Needs runtime/manual test           |
