# Deploy to Cloudflare

Shipping `apps/web` with `@sveltejs/adapter-cloudflare`. Two supported routes:
**Workers via `wrangler`** (recommended, config in the repo) or **Cloudflare Pages
Git integration** (dashboard-driven).

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine)
- A **production Convex deployment** — `npx convex deploy` from `packages/backend`,
  with auth env set on it ([authentication guide](authentication.md)). Don't point
  production at your dev deployment.

## Build settings

The adapter is already configured (`apps/web/svelte.config.js`).
`pnpm --filter web build` emits everything Cloudflare needs into
`apps/web/.svelte-kit/cloudflare/`.

| Setting                | Value                                         |
| ---------------------- | --------------------------------------------- |
| Build command          | `pnpm --filter web build`                     |
| Output directory       | `apps/web/.svelte-kit/cloudflare`             |
| Root directory (Pages) | repo root (pnpm workspace needs the lockfile) |

## Environment variables

The app reads `PUBLIC_CONVEX_URL` via `$env/dynamic/public`, i.e. **at runtime on
the server** — set it as a plain-text variable (not a secret; it's public by
definition) on the Worker/Pages project:

- Dashboard: project → Settings → Variables → add `PUBLIC_CONVEX_URL` =
  `https://<your-prod-deployment>.convex.cloud`
- Or in `wrangler.jsonc` under `vars` (fine to commit — the value is public).

Also set `SITE_URL` **on the Convex deployment** to your deployed origin:

```bash
cd packages/backend
npx convex env set SITE_URL https://<your-app>.workers.dev   # or your custom domain
```

## Option A — Workers via wrangler

Create `apps/web/wrangler.jsonc`:

```jsonc
{
	"name": "my-app-web",
	"main": ".svelte-kit/cloudflare/_worker.js",
	"compatibility_date": "2026-07-01",
	"assets": {
		"binding": "ASSETS",
		"directory": ".svelte-kit/cloudflare"
	},
	"vars": {
		"PUBLIC_CONVEX_URL": "https://<your-prod-deployment>.convex.cloud"
	}
}
```

Then:

```bash
pnpm --filter web build
cd apps/web
pnpm dlx wrangler deploy      # first run opens a browser to log in
```

**You should see:** wrangler print a `https://my-app-web.<account>.workers.dev` URL.

## Option B — Cloudflare Pages (Git integration)

1. Dashboard → Workers & Pages → Create → Pages → connect the Git repo.
2. Framework preset **SvelteKit**; set the build command/output/root from the table
   above; add `PUBLIC_CONVEX_URL`.
3. Every push to the production branch deploys; every PR gets a **preview
   deployment** at its own URL automatically.

> Preview deployments talk to whatever `PUBLIC_CONVEX_URL` says — point previews at a
> dev Convex deployment (Pages lets you set preview-scoped variables) so experiments
> never touch production data.

## Custom domain

Workers: project → Settings → Domains & Routes → add your domain (must be on
Cloudflare DNS). Pages: Custom domains tab. Then update `SITE_URL` on the Convex
deployment to the final origin.

## Post-deploy verification

- [ ] Deployed URL loads and redirects `/` → `/login`
- [ ] Sign-up creates an account (proves the Convex WebSocket + auth env are right)
- [ ] Create a task; open the site in a second tab — it syncs live
- [ ] Response headers include `X-Content-Type-Options: nosniff` and
      `Strict-Transport-Security` (from `hooks.server.ts`)
- [ ] Browser console free of CSP/connection errors

## Common failures

| Symptom                                          | Cause → fix                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `[svelocity/env] Invalid environment` at runtime | `PUBLIC_CONVEX_URL` not set on the Worker/Pages project → add the variable and redeploy                         |
| Login just spins / `InvalidSecret` errors        | Auth env missing on the **production** Convex deployment → run `npx @convex-dev/auth` against it                |
| Auth works but redirects look wrong              | `SITE_URL` on the Convex deployment still points at localhost → set it to the deployed origin                   |
| Build OK locally, fails on Cloudflare            | Node-only API in server code (workerd runtime) or wrong root directory (pnpm can't find the workspace lockfile) |
| Assets 404 under a custom domain                 | Domain added but DNS not proxied through Cloudflare → check the DNS tab                                         |
