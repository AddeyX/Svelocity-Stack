# web — Svelocity Web Shell

SvelteKit + Convex + Convex Auth running the Shared Tasks demo. Deploys to
Cloudflare via `@sveltejs/adapter-cloudflare`.

## First run

```bash
# 1. Start the backend (from repo root). First run offers a local
#    anonymous deployment — no account needed.
pnpm --filter @svelocity/backend dev

# 2. Point the app at it
cp apps/web/.env.example apps/web/.env.local
# local anonymous backend: PUBLIC_CONVEX_URL=http://127.0.0.1:3210

# 3. One-time auth setup on the deployment (JWT keys + site url):
#    npx @convex-dev/auth  (run in packages/backend)
#    or set JWT_PRIVATE_KEY / JWKS / SITE_URL manually via `convex env set`.

# 4. Run the app
pnpm --filter web dev
```

## Scripts

| Script                       | Does                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm --filter web dev`      | Vite dev server on :5173                                                                |
| `pnpm --filter web build`    | Production build (Cloudflare)                                                           |
| `pnpm --filter web preview`  | Serve the production build                                                              |
| `pnpm --filter web check`    | svelte-check                                                                            |
| `pnpm --filter web test:e2e` | Playwright golden-path e2e (needs live backend; self-skips without `PUBLIC_CONVEX_URL`) |

## Architecture notes

- **Auth is client-side.** Tokens live in localStorage (works identically in
  Electron/Capacitor WebViews), so route guards run in the browser
  ([+layout.svelte](src/routes/+layout.svelte)) — there are no server-side
  session cookies in v1.
- **No business logic here.** Task types/validation come from
  `@svelocity/app-core`, auth helpers from `@svelocity/auth`, UI from
  `@svelocity/ui`, backend API from `@svelocity/backend`. This app is routing +
  composition only.
- **Deploy:** `wrangler` guide lands in Phase 9 (`docs/guides/deploy-cloudflare.md`).
