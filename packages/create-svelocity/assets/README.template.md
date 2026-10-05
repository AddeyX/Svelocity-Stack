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

## Deploy

`.github/workflows/validate.yml` checks pull requests (install, Wrangler types,
typecheck including desktop and mobile, test, web build). It does not deploy.

`.github/workflows/deploy.yml` runs on `main`. GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CONVEX_DEPLOY_KEY`
- `PUBLIC_CONVEX_URL` (the production Convex URL; public, but not committed)

`JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL` are Convex deployment env vars, not
those secrets. Set them once on the production deployment (`npx @convex-dev/auth --prod --web-server-url https://<your-frontend-origin>` from `packages/backend`) before the first deploy. The workflow lists env **names** only and fails if any of the three is missing. It never prints the keys.

## Health Check

```bash
pnpm doctor   # static checks: env, versions, workspace, manifest
```

## Layout

- `apps/` - web, desktop, mobile shells
- `packages/` - ui (components + tokens), app-core, auth, env, config, backend (Convex)
- `docs/` - conventions, compatibility matrix, ADRs
- `.svelocity/manifest.json` - what the CLI generated (read by `svelocity doctor` / `info`)
