# Svelocity Stack — Naming + Layout Conventions (V1)

**Status:** Locked for v1.0.0

---

## Names

| Thing             | Convention                           | Example                                        |
| ----------------- | ------------------------------------ | ---------------------------------------------- |
| npm scope         | `@svelocity/*` for internal packages | `@svelocity/ui`                                |
| CLI package       | `create-svelocity`                   | `pnpm create svelocity`                        |
| App package names | bare, unscoped                       | `web`, `desktop`, `mobile`                     |
| Manifest          | `.svelocity/manifest.json`           | validated by `.svelocity/manifest.schema.json` |
| Stack version     | semver, `1.0.0` at launch            | recorded in manifest `stackVersion`            |

## Files

| Kind              | Convention                                    | Example                                |
| ----------------- | --------------------------------------------- | -------------------------------------- |
| Directories       | kebab-case                                    | `app-core/`, `platform/`               |
| Svelte components | PascalCase                                    | `TaskList.svelte`, `EmptyState.svelte` |
| TS modules        | kebab-case                                    | `task-validation.ts`                   |
| Tests             | `<name>.spec.ts` next to source or in `test/` | `task-validation.spec.ts`              |
| CSS tokens        | `--sv-<category>-<name>`                      | `--sv-color-primary`, `--sv-space-4`   |

## Workspace Layout

```text
apps/
  web/        — SvelteKit + Convex + Cloudflare adapter
  desktop/    — Vite + Svelte SPA + Electron shell
  mobile/     — Vite + Svelte SPA + Capacitor shell
packages/
  config/     — tsconfig, eslint, prettier, vite presets
  theme/      — tokens.css, tokens.ts, platform overrides
  ui/         — Bits UI wrappers + state components
  app-core/   — domain types, validation, Convex wrappers, stores
  auth/       — Convex Auth client helpers, guards
  env/        — zod env schemas, parseEnv
skills/       — AI skills (Phase 7)
docs/         — phase plan, guides, ADRs
.svelocity/   — manifest + schema
```

## Import Aliases

| Context            | Alias        | Target                                                                        |
| ------------------ | ------------ | ----------------------------------------------------------------------------- |
| SvelteKit web      | `$lib`       | `apps/web/src/lib` (SvelteKit default)                                        |
| Desktop/mobile SPA | `$lib`       | `<app>/src/lib` (configured in vite.config.ts)                                |
| Cross-package      | package name | `@svelocity/ui`, `@svelocity/app-core` — never relative paths across packages |

## Dependency Direction

```text
apps/*  →  @svelocity/{ui, app-core, auth, env, theme, config}
ui      →  theme (tokens), bits-ui
app-core→  convex (types), zod
auth    →  convex, @convex-dev/auth
env     →  zod
config  →  (leaf; no internal deps)
```

Packages never import from apps. `ui` never imports `app-core` (presentation stays
logic-free). No circular edges — CI enforces via build order.

## Commits

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Reference phase in body when applicable: `Phase 2 §2.4`
