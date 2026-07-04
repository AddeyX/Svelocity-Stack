# ADR 0002 — Convex Auth over Better Auth for V1

**Status:** Accepted
**Date:** 2026-07-04

## Context

The stack's backend is Convex (locked). Auth options: `@convex-dev/auth` (Convex Auth)
or Better Auth with a Convex adapter.

## Decision

V1 uses **Convex Auth** (`@convex-dev/auth`) with the **Password** provider only.

## Rationale

- Zero extra infrastructure: auth state lives in the same Convex deployment as data;
  no separate auth server, database, or session store.
- One reactive client (`convex-svelte` + auth) across all three platforms; the token
  flow works in browser, Electron renderer, and Capacitor WebView the same way
  (proven in maintainer's Cairno app).
- Better Auth is more flexible but adds a second system to configure inside the
  30-minute golden-path budget.
- Password provider (email/password) avoids OAuth app registration — the single
  slowest, most error-prone step for a fresh user.

## Consequences

- OAuth (Google/GitHub) deferred to v1.1 (documented in backlog).
- Migrating to Better Auth later is contained: `packages/auth` is the only package
  that touches auth APIs; apps consume its wrappers.
