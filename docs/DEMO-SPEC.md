# Shared Tasks — Demo Application Spec (V1)

**Status:** Locked for v1.0.0
**Purpose:** One demo app, three platforms, zero duplicated business logic. Proves the
golden path: shared UI + shared app-core + one Convex backend.

---

## Features

| Feature        | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| Register       | Email + password sign-up via Convex Auth Password provider              |
| Login          | Email + password sign-in                                                |
| Logout         | Clears session, returns to login                                        |
| Create task    | Text input, Enter or button submits                                     |
| List tasks     | Real-time reactive list, newest first                                   |
| Toggle task    | Checkbox marks complete/incomplete                                      |
| Delete task    | Per-task delete with confirm (AlertDialog)                              |
| Real-time sync | Changes propagate instantly to every connected client on every platform |

## Auth Method (V1)

**Email + password** via `@convex-dev/auth` `Password` provider.

- No OAuth in v1 (deferred to v1.1) — removes external provider configuration from the
  golden path and keeps first-run under 30 minutes.
- Session persisted in browser/WebView storage; same flow on all three platforms.

## Convex Schema

```ts
tasks: defineTable({
	userId: v.id('users'), // owner (from Convex Auth users table)
	title: v.string(), // required, 1–200 chars (validated in app-core + mutation)
	completed: v.boolean(),
	updatedAt: v.number() // ms epoch; _creationTime covers createdAt
}).index('by_user', ['userId']);
```

Auth tables (`users`, `authSessions`, ...) come from `@convex-dev/auth` via `authTables`.

## Ownership Rules

- Every query/mutation requires an authenticated user (`getAuthUserId`).
- Users can only read/modify/delete their own tasks — enforced server-side in every
  Convex function, never trusted to the client.

## UI States

| State        | Component           | When                                     |
| ------------ | ------------------- | ---------------------------------------- |
| Loading      | `LoadingState`      | Auth resolving, or task query in flight  |
| Empty        | `EmptyState`        | Authenticated, zero tasks                |
| Error        | `ErrorState`        | Mutation/query failure; offers retry     |
| Unauthorized | `UnauthorizedState` | Unauthenticated user on a protected view |

## Shared vs Platform-Specific Boundaries

| Layer          | Location            | Contents                                                               |
| -------------- | ------------------- | ---------------------------------------------------------------------- |
| Business logic | `packages/app-core` | Task types, validation, Convex function references, task store helpers |
| Auth client    | `packages/auth`     | Sign-in/out wrappers, session state types, guard helpers               |
| UI components  | `packages/ui`       | All controls, states, task components' building blocks                 |
| Theme          | `packages/theme`    | Tokens + platform override CSS                                         |
| Web shell      | `apps/web`          | SvelteKit routing, SSR concerns, Cloudflare adapter                    |
| Desktop shell  | `apps/desktop`      | Electron main/preload, window chrome, SPA routing                      |
| Mobile shell   | `apps/mobile`       | Capacitor config, safe areas, mobile nav, SPA routing                  |

Apps compose; packages implement. An app file that exceeds routing/layout/shell duties
is a smell — logic moves down into `app-core`.

## Acceptance Criteria (per platform)

1. Fresh user can register, land on tasks view.
2. Create three tasks; they appear instantly, newest first.
3. Toggle one complete; state persists after reload.
4. Delete one task after confirm dialog.
5. Open a second client (other tab / other platform) — changes sync live both ways.
6. Logout returns to login; visiting tasks view while signed out shows unauthorized →
   redirects to login.
7. All four UI states reachable: loading (throttle network), empty (new user), error
   (kill network mid-mutation), unauthorized (signed out).

Platform additions:

- **Web:** SSR boot without hydration errors; works at 375px width.
- **Desktop:** window resize floor 360×500; hover states active; platform badge "Desktop".
- **Mobile:** safe-area insets respected on notched profile; touch targets ≥44px; hover
  interactions disabled; platform badge "Mobile".
