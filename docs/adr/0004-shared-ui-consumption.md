# ADR 0004 — Shared UI Consumption Across Web/Desktop/Mobile

**Status:** Partially superseded by [ADR 0007](./0007-v2-defaults.md)
**Date:** 2026-07-04

> **2026-10-05:** [ADR 0007](./0007-v2-defaults.md) moved the token files from
> `@svelocity/theme` into `@svelocity/ui/tokens`. Source consumption is unchanged.
> The import paths below are the current ones.

## Context

`@svelocity/ui` must render identically from SvelteKit SSR, an Electron renderer, and
a Capacitor WebView, without per-app builds.

## Decision

Ship `@svelocity/ui` as a **source package** (raw `.svelte` + `.ts` + `.css`,
including `tokens/`), compiled by each consuming app's Vite/Svelte pipeline. No
prebuild, no `svelte-package` step in v1.

Platform differences are handled by **CSS override files**, not component forks:

```text
@svelocity/ui/tokens.css                     — base tokens (light + dark structure)
@svelocity/ui/tokens/platform/web.css        — hover states on
@svelocity/ui/tokens/platform/desktop.css    — window-chrome spacing, hover on
@svelocity/ui/tokens/platform/mobile.css     — safe-area insets, ≥44px targets, hover off
```

Each app imports base tokens plus exactly one platform file in its root layout/shell.

## Rationale

- Source consumption is the pnpm-workspace-native path: instant HMR across packages,
  no watch-rebuild loop, one compiler (the app's) per output.
- All three apps pin the same `svelte` catalog version, so compiler mismatch — the
  usual argument for prebuilt packages — doesn't apply inside the template.
- CSS-only platform variance keeps a single component tree testable once.

## Consequences

- `@svelocity/ui` requires consumers to have the Svelte Vite plugin (all templates do).
- If packages are ever published standalone to npm, a `svelte-package` build gets
  added then (v1.1+ concern).
