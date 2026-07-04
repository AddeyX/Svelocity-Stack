# {{DISPLAY_NAME}}

Built with the [Svelocity Stack](https://github.com/manny4u67/Svelocity-Stack) - SvelteKit web, Electron desktop, and Capacitor mobile apps sharing one core, backed by Convex.

## Getting Started

```bash
pnpm install

# 1. Set up the Convex backend (creates your deployment, fills env):
pnpm --filter @svelocity/backend dev

# 2. Point the web app at it:
cp apps/web/.env.example apps/web/.env.local   # then set PUBLIC_CONVEX_URL

# 3. Run the apps:
pnpm dev            # web (SvelteKit)
pnpm dev:desktop    # desktop (Electron)
pnpm dev:mobile     # mobile web shell (Capacitor)
```

## Mobile Native Projects

Native iOS/Android folders are not committed by the scaffolder. Generate them once:

```bash
pnpm --filter mobile exec cap add ios
pnpm --filter mobile exec cap add android
pnpm --filter mobile sync
```

## Health Check

```bash
pnpm dlx create-svelocity svelocity doctor   # or `svelocity doctor` if installed
```

## Layout

- `apps/` - web, desktop, mobile shells
- `packages/` - shared theme, ui, app-core, auth, env, config, backend (Convex)
- `docs/` - conventions, compatibility matrix, ADRs
- `.svelocity/manifest.json` - what the CLI generated (read by `svelocity doctor` / `info`)
