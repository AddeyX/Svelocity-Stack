# ADR 0005 — Thin CLI Scope (create / doctor / info)

**Status:** Accepted
**Date:** 2026-07-04

## Context

Full stack CLIs (add/upgrade/sync/generate/audit) are a product in themselves. V1 must
ship a working template, not a package manager.

## Decision

V1 CLI is `create-svelocity` with exactly three commands:

| Command            | Does                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `create` (default) | Copies the golden-path template, writes `.svelocity/manifest.json`, prints next steps         |
| `doctor`           | Checks Node/pnpm versions, env files, Convex config, native toolchains; prints pass/warn/fail |
| `info`             | Prints manifest contents, stack version, enabled targets                                      |

Everything else (`add`, `upgrade`, `sync`, `generate`, `audit`) is v1.1 backlog.

## Rationale

- `create` is the only command required for the 30-minute golden path.
- `doctor` de-risks the #1 support burden (native toolchain friction) cheaply.
- `info` costs almost nothing once the manifest exists.
- Upgrade/add machinery requires a migration system and template diffing — deferred
  scope that historically kills template projects (risk register #1).

## Consequences

- Adding a platform after create is a documented manual guide
  (`skills/svelocity-add-platform`) rather than automation.
- The manifest schema is designed now so v1.1 tooling can rely on it.
