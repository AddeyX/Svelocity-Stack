# Svelocity Stack

[![CI](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/ci.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/ci.yml)
[![CLI golden path](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/cli.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/cli.yml)
[![E2E](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/e2e.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/e2e.yml)
[![node >=22](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](docs/COMPATIBILITY.md)
[![pnpm >=10](https://img.shields.io/badge/pnpm-%3E%3D10-f69220)](docs/COMPATIBILITY.md)

**Opinionated, AI-ready Svelte monorepo template.** One shared core — web (SvelteKit +
Cloudflare), desktop (Electron), and mobile (Capacitor) — connected by Convex with
real-time sync and Convex Auth.

> Status: pre-1.0, built phase by phase. See [docs/phases](docs/phases/README.md) for
> the plan and current progress.

## Create a New Project

```bash
pnpm create svelocity    # until published: pnpm dlx ./packages/create-svelocity
```

## The Golden Path

```bash
pnpm install
pnpm dev            # web app (SvelteKit)
pnpm dev:desktop    # Electron shell
pnpm dev:mobile     # Capacitor dev server
```

One demo — **Shared Tasks** (auth + CRUD + real-time) — runs on all three platforms
from the same `packages/app-core` logic and `packages/ui` components.

## Layout

```text
apps/
  web/        SvelteKit + Convex + adapter-cloudflare
  desktop/    Vite + Svelte SPA in a secure Electron shell
  mobile/     Vite + Svelte SPA in a Capacitor shell
packages/
  config/     tsconfig, eslint, prettier, vite/vitest presets
  theme/      design tokens (CSS custom properties) + platform overrides
  ui/         shared components (Bits UI + tokens)
  app-core/   business logic, validation, Convex wrappers
  auth/       Convex Auth client helpers + guards
  env/        typed env parsing (zod)
.svelocity/   manifest + schema (what the CLI generated)
docs/         scope, phases, ADRs, guides
```

## Commands

| Command                  | Does                                           |
| ------------------------ | ---------------------------------------------- |
| `pnpm check`             | Typecheck every workspace                      |
| `pnpm lint`              | ESLint + Prettier check                        |
| `pnpm test`              | Vitest across workspaces                       |
| `pnpm build`             | Build every workspace                          |
| `pnpm clean`             | Remove build artifacts                         |
| `pnpm validate:manifest` | Validate `.svelocity/` manifest against schema |

## Docs

- [V1 scope](docs/V1-SCOPE.md) — what's in, what's explicitly out
- [Phase plan](docs/phases/README.md) — build order + exit criteria
- [Compatibility](docs/COMPATIBILITY.md) — tested versions
- [Conventions](docs/CONVENTIONS.md) — naming, layout, dependency direction
- [Demo spec](docs/DEMO-SPEC.md) — Shared Tasks acceptance criteria
- [ADRs](docs/adr/) — why Bits UI, Convex Auth, source packages, thin CLI

## Versions

Pinned in the [pnpm catalog](pnpm-workspace.yaml). Bump deliberately; CI must stay
green. Release process: update catalog → `pnpm install` → CI green → tag.

## License

[MIT](LICENSE)
