# Convex

The backend for all three shells: database, server functions, and real-time sync in
one deployment. This guide covers setup, the patterns used in `packages/backend`, and
deploying to Convex cloud.

> Working with an AI agent? The bundled `svelocity-convex` skill walks an agent
> through adding tables/functions and wiring them into the apps.

## Setup

### Local, no account

```bash
pnpm dev:backend
```

Choose the **local anonymous deployment** when `convex dev` asks. It runs at
`http://127.0.0.1:3210` and stores data on your machine. Good for development;
you can link it to an account later.

### Cloud account

Run the same command and choose to sign in (GitHub). Convex creates a free dev
deployment; its URL (`https://<name>.convex.cloud`) and admin dashboard come from
[dashboard.convex.dev](https://dashboard.convex.dev). Credentials are written to
`packages/backend/.env.local` (`CONVEX_DEPLOYMENT`).

Either way, leave `convex dev` running while you develop — it watches
`packages/backend/convex/`, pushes function changes instantly, and regenerates types.

## Project structure

The backend lives in `packages/backend` (not inside an app) because all three shells
import the same generated `api`:

```text
packages/backend/convex/
  schema.ts        — table definitions + indexes
  auth.ts          — Convex Auth providers (Password in v1)
  auth.config.ts   — JWT issuer config
  http.ts          — OIDC discovery routes
  tasks.ts         — task queries/mutations
  users.ts         — current-user query
  _generated/      — typed api + dataModel (committed; refresh with `pnpm --filter @svelocity/backend gen`)
```

## Schema

`schema.ts` defines tables with validators and indexes:

```ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
	...authTables, // users, authSessions, authRefreshTokens, …

	tasks: defineTable({
		userId: v.id('users'),
		title: v.string(),
		completed: v.boolean(),
		updatedAt: v.number() // _creationTime covers createdAt
	}).index('by_user', ['userId'])
});
```

Pattern rules:

- Add an index for every access path you query (`withIndex`, never `filter` over a
  full scan).
- `_id` and `_creationTime` are automatic — don't duplicate them.
- Schema changes push live from `convex dev`; existing documents must satisfy the new
  validators or the push fails.

## Queries and mutations

Every function derives the caller server-side and validates input with the same zod
schema the clients use (from `@svelocity/app-core`):

```ts
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { taskTitleSchema } from '@svelocity/app-core';

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];
		return await ctx.db
			.query('tasks')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.order('desc')
			.collect();
	}
});

export const create = mutation({
	args: { title: v.string() },
	handler: async (ctx, { title }) => {
		const userId = await requireUserId(ctx); // throws if unauthenticated
		const parsed = taskTitleSchema.safeParse(title); // never trust the client copy
		if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid title');
		return await ctx.db.insert('tasks', {
			userId,
			title: parsed.data,
			completed: false,
			updatedAt: Date.now()
		});
	}
});
```

Ownership is enforced in every mutation (`requireOwnTask` in
`packages/backend/convex/tasks.ts`) — a user can only touch their own rows.

## Real-time subscriptions in Svelte

The shells use [convex-svelte](https://github.com/get-convex/convex-svelte). Set up
the client once in the root layout/App:

```svelte
<script lang="ts">
	import { setupConvex, useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '@svelocity/backend';

	setupConvex(PUBLIC_CONVEX_URL); // once, at the root
	const client = useConvexClient();

	// Reactive subscription — re-renders on every server-side change.
	// Return 'skip' to hold the subscription until preconditions are met.
	const tasks = useQuery(api.tasks.list, () => (auth.isAuthenticated ? {} : 'skip'));

	async function createTask(title: string) {
		await client.mutation(api.tasks.create, { title });
	}
</script>

{#if tasks.isLoading}…{:else}{tasks.data?.length} tasks{/if}
```

`useQuery` is a live subscription, not a fetch — when any client mutates data, every
subscribed client updates. That's the whole real-time story; there is nothing else to
wire.

## Environment variables

| Variable                              | Where                                    | What                                                       |
| ------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `PUBLIC_CONVEX_URL`                   | each app's `.env.local`                  | Deployment URL the client connects to                      |
| `CONVEX_DEPLOYMENT`                   | `packages/backend/.env.local`            | Which deployment `convex dev` targets (written by the CLI) |
| `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` | on the deployment (`npx convex env set`) | Auth — see [authentication guide](authentication.md)       |

Client env is validated at startup by `@svelocity/env` (`parseClientEnv`) — a missing
or malformed `PUBLIC_CONVEX_URL` fails fast with instructions.

## Deploying to Convex cloud

Dev deployments are for development. For production:

```bash
cd packages/backend
npx convex deploy          # pushes functions to the production deployment
```

Then repeat the one-time auth env setup on the **production** deployment
(`npx @convex-dev/auth`, `SITE_URL` = your deployed frontend origin) and set the
production `PUBLIC_CONVEX_URL` wherever the frontend is hosted — see
[deploy-cloudflare](deploy-cloudflare.md).

## Related

- [Authentication](authentication.md) — Convex Auth setup and token flow
- [Architecture](architecture.md) — recipe for adding a function end-to-end
- `packages/backend/README.md` — package-level reference
