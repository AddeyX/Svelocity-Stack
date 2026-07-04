# ADR 0003 — Monorepo Package Boundaries

**Status:** Accepted
**Date:** 2026-07-04

## Context

Three app shells must share UI, logic, auth, and config without circular dependencies
or logic leaking into shells.

## Decision

Six packages with a strict one-way dependency direction:

```text
config   — tsconfig/eslint/prettier/vite presets (leaf)
theme    — CSS tokens + platform overrides (leaf)
env      — zod env schemas (leaf)
ui       — Bits UI wrappers; depends on theme only
app-core — domain types, validation, Convex function refs, stores
auth     — Convex Auth client helpers, guards
apps/*   — compose everything; contain no business logic
```

Rules:

1. Packages never import from apps.
2. `ui` never imports `app-core` — presentation stays logic-free.
3. Cross-package imports use package names (`@svelocity/x`), never relative paths.
4. Deferred: `platform`, standalone `testing`, `assets` (inlined into theme/ui).

## Rationale

- Boundary per concern keeps the Electron/Capacitor shells thin and provably
  swappable — the demo lives once in `app-core` + `ui`.
- Leaf packages (`config`, `theme`, `env`) have no internal deps, so build order is
  trivial and circularity is structurally unlikely.

## Consequences

- Some ceremony (six package.json files) accepted for clear ownership.
- A `platform` abstraction package is intentionally absent in v1; platform detection
  is a tiny helper in `app-core`.
