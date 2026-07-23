# Svelocity Stack

[![CI](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/ci.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/ci.yml)
[![CLI golden path](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/cli.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/cli.yml)
[![E2E](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/e2e.yml/badge.svg)](https://github.com/AddeyX/Svelocity-Stack/actions/workflows/e2e.yml)
[![node >=22.18](https://img.shields.io/badge/node-%3E%3D22.18-brightgreen)](docs/COMPATIBILITY.md)
[![pnpm >=10](https://img.shields.io/badge/pnpm-%3E%3D10-f69220)](docs/COMPATIBILITY.md)

**Opinionated, AI-ready Svelte monorepo template — one shared core, shipped to web, desktop, and mobile.**

Svelocity Stack is a golden path for building the same Svelte app on three platforms from one pnpm monorepo. Domain logic, UI components, auth, and the Convex backend live in shared packages; each platform is a thin shell. A working demo — **Shared Tasks** (auth + CRUD + real-time sync) — runs on all three platforms out of the box.

## The Stack

| Layer      | Choice                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| Web        | [SvelteKit](https://svelte.dev/docs/kit) + Cloudflare adapter           |
| Desktop    | [Electron](https://www.electronjs.org/) wrapping a Vite + Svelte SPA    |
| Mobile     | [Capacitor](https://capacitorjs.com/) wrapping a Vite + Svelte SPA      |
| Backend    | [Convex](https://www.convex.dev/) — database, functions, real-time sync |
| Auth       | [Convex Auth](https://labs.convex.dev/auth)                             |
| Components | [Bits UI](https://bits-ui.com/) headless primitives                     |
| Styling    | Vanilla CSS with `--sv-*` design tokens                                 |

## Prerequisites

- [Node](https://nodejs.org/en/download) >= 22.18
- [pnpm](https://pnpm.io/installation) >= 10
- [Git](https://git-scm.com/downloads)

## Quick Start

```bash
pnpm create svelocity my-app   # until published: pnpm dlx ./packages/create-svelocity my-app
cd my-app
pnpm install
```

Then run the backend and the web app in two terminals:

```bash
pnpm --filter web convex:dev   # terminal 1 — Convex dev backend
pnpm --filter web dev          # terminal 2 — web app at http://localhost:5173
```

`pnpm dev:desktop` and `pnpm dev:mobile` start the other shells. Full walkthrough: [your first project](docs/guides/first-project.md).

## Repo Structure

```text
apps/
  web/                 SvelteKit + Convex + adapter-cloudflare
  desktop/             Vite + Svelte SPA in a secure Electron shell
  mobile/              Vite + Svelte SPA in a Capacitor shell
packages/
  config/              tsconfig, eslint, prettier, vite presets
  theme/               --sv-* design tokens + platform overrides
  ui/                  shared components (Bits UI wrappers + state components)
  app-core/            domain types, validation, Convex wrappers, stores
  auth/                Convex Auth client helpers + guards
  env/                 typed env parsing (zod)
  backend/             shared Convex backend (schema, functions, generated API)
  create-svelocity/    CLI — scaffolding + svelocity doctor/info
.agents/               AI skills + agent docs (.claude/skills mirrors via symlink)
.svelocity/            manifest + schema (what the CLI generated)
docs/                  guides, ADRs, phase plan
```

## Guides

| Guide                                                    | Covers                                           |
| -------------------------------------------------------- | ------------------------------------------------ |
| [First project](docs/guides/first-project.md)            | Zero to Shared Tasks running on all platforms    |
| [Architecture](docs/guides/architecture.md)              | Monorepo layout, dependency direction, data flow |
| [Convex](docs/guides/convex.md)                          | Schema, functions, codegen, deployments          |
| [Authentication](docs/guides/authentication.md)          | Convex Auth setup and the shared token flow      |
| [UI](docs/guides/ui.md)                                  | Design tokens, theming, Bits UI wrappers         |
| [Web](docs/guides/web.md)                                | SvelteKit shell                                  |
| [Desktop](docs/guides/desktop.md)                        | Electron shell and packaging                     |
| [Mobile](docs/guides/mobile.md)                          | Capacitor shell, Android/iOS                     |
| [Deploy to Cloudflare](docs/guides/deploy-cloudflare.md) | Shipping the web app                             |
| [AI workflow](docs/guides/ai-workflow.md)                | AGENTS.md, bundled skills, agent setup           |
| [Troubleshooting](docs/guides/troubleshooting.md)        | Common errors and fixes                          |

## Scripts

| Command                  | Does                                               |
| ------------------------ | -------------------------------------------------- |
| `pnpm dev`               | Web dev server (port 5173)                         |
| `pnpm dev:desktop`       | Electron shell (Vite on 5174 + Electron)           |
| `pnpm dev:mobile`        | Capacitor dev server (port 5175)                   |
| `pnpm dev:backend`       | Convex dev backend                                 |
| `pnpm build`             | Build every workspace                              |
| `pnpm check`             | Typecheck every workspace                          |
| `pnpm test`              | Vitest across workspaces                           |
| `pnpm lint`              | ESLint + Prettier check                            |
| `pnpm format`            | Prettier write                                     |
| `pnpm clean`             | Remove build artifacts                             |
| `pnpm doctor`            | Static health checks (env, versions, manifest)     |
| `pnpm audit:v1`          | Audit security and platform configuration          |
| `pnpm validate:manifest` | Validate `.svelocity/` manifest against schema     |
| `pnpm validate:v1`       | Pre-release gauntlet (`RUN_E2E=1` adds Playwright) |

## Release Information

- [Changelog](CHANGELOG.md)
- [Known limitations](docs/KNOWN-LIMITATIONS.md)
- [Compatibility matrix](docs/COMPATIBILITY.md)
- [V1.1 backlog](docs/V1.1-BACKLOG.md)

## Contributing

Working on the stack itself (not a generated project)? Start with
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
