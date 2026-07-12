# Authentication

How auth works across all three shells: [Convex Auth](https://labs.convex.dev/auth)
on the server, one shared client state (`@svelocity/auth`) everywhere else.

> Working with an AI agent? The bundled `svelocity-auth` skill covers extending or
> debugging auth (route guards, providers, token flow).

## The model in one paragraph

Sign-in/sign-up/sign-out are **Convex actions** (`api.auth.signIn` / `api.auth.signOut`)
— there are no HTTP auth endpoints or server-side session cookies. The client receives
a JWT + refresh token and stores both in `localStorage`, which works identically in the
browser, the Electron renderer, and the Capacitor WebView (ADR
[0002](../adr/0002-convex-auth-over-better-auth.md)). Route guards therefore run
**client-side** — the server never knows who you are until the Convex WebSocket
authenticates.

## Supported methods in v1

Email + password only (`Password` provider in `packages/backend/convex/auth.ts`).
OAuth is deliberately v1.1 — but the client plumbing for it already exists
(`handleOAuthCallback` in `@svelocity/auth`), so adding a provider later is small.

## Environment variables

One-time setup **per deployment** (dev, prod, CI each need it):

```bash
cd packages/backend
npx @convex-dev/auth                                 # generates + sets JWT_PRIVATE_KEY and JWKS
npx convex env set SITE_URL http://localhost:5173    # the FRONTEND origin
```

| Variable          | Lives on the Convex deployment | Purpose                                                                                                       |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `JWT_PRIVATE_KEY` | yes (`convex env set`)         | Signs access tokens (RS256)                                                                                   |
| `JWKS`            | yes                            | Public keys served at `/.well-known/`                                                                         |
| `SITE_URL`        | yes                            | Frontend origin — `http://localhost:5173` in dev, your deployed URL in prod. **Not** the `*.convex.site` URL. |

Nothing auth-related goes in app `.env.local` files — clients only need
`PUBLIC_CONVEX_URL`.

## How route protection works (web)

`@svelocity/auth` keeps the guard logic pure so all shells share it:

```ts
// guardDecision({ isLoading, isAuthenticated, isAuthRoute }) → 'stay' | 'toLogin' | 'toApp'
```

`apps/web/src/routes/+layout.svelte` applies it in an `$effect`: unauthenticated
visitors on app routes go to `/login`; authenticated visitors on `/login` or
`/register` go to `/tasks`. The same layout wires the token into the Convex client:

```ts
const auth = setAuthState(
	createAuthState(client, { signIn: api.auth.signIn, signOut: api.auth.signOut })
);

$effect(() => {
	if (auth.isAuthenticated) client.setAuth(auth.fetchAccessToken);
	else if (!auth.isLoading) client.setAuth(async () => null);
});
```

Because tokens live in `localStorage`, `hooks.server.ts` cannot make auth decisions —
it only sets security headers. Server-side sessions are out of scope for v1.

## Desktop and mobile shells

Identical: each SPA's `App.svelte` calls the same `createAuthState` +
`guardDecision`, just with its own router instead of SvelteKit's `goto`. Notes:

- **Desktop:** in packaged builds the renderer runs on a `file://` origin, so its
  `localStorage` (and session) is separate from any browser session.
- **Mobile:** the Capacitor WebView has its own origin/storage too. Sessions persist
  across app restarts on both.

All shells hit the **same deployment**, so one account works everywhere and task
changes sync live between platforms.

## Adding an OAuth provider (outline — v1.1)

1. Add the provider in `packages/backend/convex/auth.ts`
   (e.g. `providers: [Password, GitHub]`) and set its client ID/secret via
   `npx convex env set`.
2. `auth.addHttpRoutes(http)` in `convex/http.ts` already mounts the callback routes.
3. Add a "Sign in with …" button that calls
   `client.action(api.auth.signIn, { provider: 'github' })` and redirects.
4. On return, the existing `auth.handleOAuthCallback()` exchanges the `?code=`
   for tokens (it already strips the code from the URL before awaiting so refresh
   can't replay it).

## Security checklist

- [ ] `SITE_URL` on every deployment matches the real frontend origin
- [ ] Server functions derive the user via `getAuthUserId` — never trust a client-sent user ID
- [ ] Mutations enforce ownership (see `requireOwnTask` in `packages/backend/convex/tasks.ts`)
- [ ] Auth forms are `method="post"` (prevents credentials leaking into the URL if
      JS hasn't hydrated yet)
- [ ] Friendly error mapping only — never surface raw server auth errors
      (`toFriendlyAuthError` handles the known cases)
- [ ] No secrets in client bundles; clients only ever see `PUBLIC_CONVEX_URL`

## Related

- [Convex guide](convex.md) — deployment + env plumbing
- [Troubleshooting](troubleshooting.md) — "auth session not persisting" and friends
