# @svelocity/backend

The shared Convex backend: schema, queries/mutations, auth config, and the
generated API that all three app shells import.

> **Why a package?** (V1 scope amendment) The phase plan originally placed
> `convex/` inside `apps/web`, but web, desktop, and mobile all consume the same
> generated `api` object. A workspace package is Convex's recommended monorepo
> shape and keeps the "apps never import from apps" rule intact.

## Layout

```text
convex/
  schema.ts        — authTables + tasks (by_user index)
  auth.ts          — Convex Auth, Password provider (ADR 0002)
  auth.config.ts   — JWT issuer (CONVEX_SITE_URL)
  http.ts          — OIDC routes via auth.addHttpRoutes
  tasks.ts         — list / create / setCompleted / updateTitle / remove
  users.ts         — me (current profile)
  _generated/      — committed; refresh with `pnpm --filter @svelocity/backend gen`
```

Every function derives the user from `getAuthUserId` and enforces ownership
server-side. Title validation reuses `taskTitleSchema` from `@svelocity/app-core`
so clients and server share one rule.

## Dev

```bash
pnpm --filter @svelocity/backend dev    # convex dev (offers local anonymous deployment)
pnpm --filter @svelocity/backend gen    # regenerate convex/_generated
```

## One-time auth setup per deployment

```bash
cd packages/backend
npx @convex-dev/auth        # generates JWT_PRIVATE_KEY + JWKS
npx convex env set SITE_URL http://localhost:5173   # frontend origin, NOT *.convex.site
```

## Consuming

```ts
import { api } from '@svelocity/backend';
import type { Doc, Id } from '@svelocity/backend/dataModel';
```
