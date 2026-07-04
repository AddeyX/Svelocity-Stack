# @svelocity/config

Shared tooling presets for every Svelocity workspace.

## Exports

| Import                              | What                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `@svelocity/config/tsconfig/base`   | Strict TS base (extend in `tsconfig.json`)           |
| `@svelocity/config/tsconfig/svelte` | Base + DOM libs + svelte types                       |
| `@svelocity/config/tsconfig/node`   | Base + node types (CLI/tooling)                      |
| `@svelocity/config/eslint`          | Flat ESLint config (TS + Svelte + prettier-compat)   |
| `@svelocity/config/prettier`        | Prettier config (tabs, single quotes, svelte plugin) |
| `@svelocity/config/vitest`          | `nodeTest` / `componentTest` presets                 |
| `@svelocity/config/vite`            | Dev ports + SPA base config helper                   |

## Catalog usage

All versions live in the root `pnpm-workspace.yaml` catalog. In any workspace
package.json, reference `"catalog:"` (core), `"catalog:electron"`, or
`"catalog:capacitor"` instead of a version. To bump the stack, edit the catalog once
and run `pnpm install` — CI's frozen-lockfile install catches drift.

## Test conventions

- Unit tests: `<name>.spec.ts` next to the source file.
- Pure TS packages use `nodeTest`; component packages use `componentTest` (jsdom +
  @testing-library/svelte).
- Run one package: `pnpm --filter @svelocity/app-core test`; everything: `pnpm test`.
