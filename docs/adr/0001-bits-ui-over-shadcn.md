# ADR 0001 — Bits UI over shadcn-svelte for V1

**Status:** Accepted
**Date:** 2026-07-04

## Context

The shared UI package needs accessible primitives consumable identically by web
(SvelteKit), desktop (Electron renderer), and mobile (Capacitor WebView). Candidates:
Bits UI (headless primitives) and shadcn-svelte (copy-in styled components built on
Bits UI).

## Decision

V1 ships `@svelocity/ui` built directly on **Bits UI** primitives with Svelocity theme
tokens.

## Rationale

- shadcn-svelte is a copy-into-your-app workflow — it fights the "one shared package,
  three consumers" model. Bits UI is a normal dependency.
- Wrapping Bits directly gives one styling layer (semantic tokens) instead of two
  (tokens + tailwind utility soup baked into copied components).
- Bits UI is the foundation shadcn-svelte uses anyway; we keep the option to add a
  shadcn-svelte path in v1.1 without rework.
- Maintainer has production experience with Bits UI (Cairno, Jaut Desktop).

## Consequences

- We own component APIs and styling (more upfront work, ~20 components).
- Users who want shadcn-svelte must wait for v1.1 or wire it themselves.

## Styling approach (sub-decision)

Vanilla CSS with scoped Svelte styles + CSS custom properties from `@svelocity/theme`.
No Tailwind dependency inside `@svelocity/ui`: keeps the package portable, avoids
forcing a Tailwind version on all three app shells, and keeps generated CSS deduped.
Apps may add Tailwind locally without conflict (tokens are plain custom properties).
