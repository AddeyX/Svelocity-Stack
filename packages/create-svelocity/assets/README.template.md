# {{DISPLAY_NAME}}

Built with the [Svelocity Stack](https://github.com/AddeyX/Svelocity-Stack) - SvelteKit web, Electron desktop, and Capacitor mobile apps sharing one core, backed by Convex.

## Getting Started

```bash
pnpm install

# 1. Set up the Convex backend (creates your deployment, fills env):
pnpm --filter @svelocity/backend dev

# 2. One-time, on that deployment (dev and, later, prod). These are Convex
#    env vars — not GitHub secrets, and not committed:
cd packages/backend
npx @convex-dev/auth --web-server-url http://localhost:5173
#    sets JWT_PRIVATE_KEY, JWKS, and SITE_URL (frontend origin, not *.convex.site)
cd ../..

# 3. Point the web app at it:
cp apps/web/.env.example apps/web/.env.local   # then set PUBLIC_CONVEX_URL

# 4. Run the apps:
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
pnpm doctor   # static checks: env, versions, workspace, manifest
```

## Layout

- `apps/` - web, desktop, mobile shells
- `packages/` - shared theme, ui, app-core, auth, env, config, backend (Convex)
- `docs/` - conventions, compatibility matrix, ADRs
- `.svelocity/manifest.json` - what the CLI generated (read by `svelocity doctor` / `info`)
