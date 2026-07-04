# ADR 0006 — AI Instructions as Versioned Product Assets

**Status:** Accepted
**Date:** 2026-07-04

## Context

The template's users work with AI coding agents. Repo rules (dependency direction,
package boundaries, where logic lives) are exactly the constraints agents violate
without explicit instruction.

## Decision

Ship AI instructions as first-class, versioned template files:

```text
AGENTS.md                      — repo map, boundaries, conventions, commands
.cursor/rules/                 — Cursor-format rules mirroring AGENTS.md
skills/svelocity-convex/       — how to add Convex tables/functions correctly
skills/svelocity-auth/         — how to extend auth without breaking guards
skills/svelocity-add-platform/ — manual platform-add guide
```

`AGENTS.md` is the single source of truth; other formats derive from it. The manifest
records `aiTargets` and `skills` so tooling knows what shipped.

## Rationale

- The stack's promise is "AI-ready": that's only real if boundary rules travel with
  the code and update with the template version.
- AGENTS.md is the emerging cross-tool convention (works for Claude Code, Codex,
  Cursor reads it too); Cursor rules cover the largest editor-specific audience.
- Skills encode multi-step procedures a single instructions file can't hold.

## Consequences

- Claude/Codex-specific files and sub-agent directories wait for v1.1.
- Docs drift risk: Phase 8 CI includes a check that AGENTS.md references real paths.
