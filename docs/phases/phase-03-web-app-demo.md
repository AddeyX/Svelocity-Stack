# Phase 3 — Web App + Convex + Auth Demo

**Goal:** Build the SvelteKit web reference app with Convex backend, Convex Auth, and the Shared Tasks demo.  
**Prerequisites:** Phase 2 complete (shared UI available)  
**Estimated effort:** 7–10 days

---

## Exit Criteria

- [ ] `pnpm --filter web dev` runs Shared Tasks demo in browser
- [ ] User can register/login/logout via Convex Auth
- [ ] Tasks CRUD works with real-time sync across browser tabs
- [ ] Loading, empty, error, and unauthorized states work
- [ ] `pnpm --filter web build` produces production build
- [ ] Basic Playwright e2e: login → create task → see task
- [ ] Desktop and mobile phases can reuse `app-core` logic

---

## 3.1 — SvelteKit Web App Scaffold

- [ ] Initialize `apps/web` with SvelteKit + TypeScript + Vite
- [ ] Configure adapter: `@sveltejs/adapter-cloudflare` for deployment target
- [ ] Wire `@svelocity/config` tsconfig, eslint, vite presets
- [ ] Import `@svelocity/theme/tokens.css` in root layout
- [ ] Set up path aliases consistent with monorepo
- [ ] Add `apps/web/package.json` with workspace deps

## 3.2 — Convex Backend Setup

- [ ] Run `npx convex init` in appropriate location (app or root)
- [ ] Configure `convex/` directory structure:
  - [ ] `schema.ts`
  - [ ] `tasks.ts` (queries, mutations)
  - [ ] `users.ts` (if needed beyond auth tables)
  - [ ] `auth.ts` (auth config)
- [ ] Add Convex dev script: `pnpm --filter web convex:dev`
- [ ] Add environment variables: `CONVEX_URL`, deployment keys
- [ ] Document Convex folder ownership in `AGENTS.md` stub

## 3.3 — Convex Schema

- [ ] Define `tasks` table:
  - [ ] `_id`, `_creationTime`
  - [ ] `userId` (owner)
  - [ ] `title` (string, required)
  - [ ] `completed` (boolean)
  - [ ] `createdAt`, `updatedAt`
- [ ] Add index: `by_user` on `userId`
- [ ] Add index: `by_user_and_completed` if needed
- [ ] Validate schema with Convex schema definition

## 3.4 — Convex Auth Integration

- [ ] Install and configure `@convex-dev/auth` (or current Convex Auth package)
- [ ] Set up auth provider in `convex/auth.ts`
- [ ] Choose v1 auth method:
  - [ ] Email + password, OR
  - [ ] OAuth (GitHub/Google) — pick one for v1
- [ ] Configure auth tables via Convex Auth
- [ ] Create `packages/auth` Convex Auth client helpers:
  - [ ] `useAuth()` or equivalent store
  - [ ] `signIn()`, `signOut()` wrappers
  - [ ] Session state types
- [ ] Add route protection utilities in `packages/auth`

## 3.5 — Environment Configuration

- [ ] Implement `packages/env` with Zod schemas:
  - [ ] `PUBLIC_CONVEX_URL`
  - [ ] Auth-related public vars
  - [ ] Server-only secrets (if any)
- [ ] Create `apps/web/.env.example`
- [ ] Fail fast on missing/invalid env at startup
- [ ] Document env setup in README stub

## 3.6 — Shared Application Core (`packages/app-core`)

- [ ] Define `Task` domain type
- [ ] Create task validation schema (Zod or similar)
- [ ] Create Convex client wrappers:
  - [ ] `listTasks`
  - [ ] `createTask`
  - [ ] `updateTask`
  - [ ] `deleteTask`
  - [ ] `toggleTask`
- [ ] Create Svelte stores or reactive helpers for task state
- [ ] Keep all business logic here — apps are thin shells
- [ ] Unit test validation and utility functions

## 3.7 — Web Routes and Layout

- [ ] `src/routes/+layout.svelte` — theme, auth provider, toast
- [ ] `src/routes/+page.svelte` — redirect to /tasks or /login
- [ ] `src/routes/login/+page.svelte` — login form
- [ ] `src/routes/register/+page.svelte` — registration form (if email/password)
- [ ] `src/routes/tasks/+page.svelte` — main demo view
- [ ] `src/routes/tasks/+page.server.ts` or hooks for auth guard
- [ ] `src/hooks.server.ts` — session handling if needed

## 3.8 — Shared Tasks UI (Web)

- [ ] `TaskList.svelte` — renders tasks with real-time updates
- [ ] `TaskItem.svelte` — title, checkbox, delete button
- [ ] `TaskForm.svelte` — create new task input
- [ ] `TaskHeader.svelte` — app title, user info, logout
- [ ] Wire LoadingState while auth/tasks load
- [ ] Wire EmptyState when no tasks
- [ ] Wire ErrorState on mutation failure with retry
- [ ] Wire UnauthorizedState for unauthenticated access
- [ ] Use only `@svelocity/ui` components — no ad-hoc styling

## 3.9 — Real-Time Sync

- [ ] Use Convex reactive queries for task list
- [ ] Verify two browser tabs sync instantly on create/update/delete
- [ ] Handle optimistic UI for toggle (optional v1 enhancement)
- [ ] Show connection/sync indicator if trivial to add

## 3.10 — Auth Flows

- [ ] Login page with form validation
- [ ] Registration page (if email/password)
- [ ] Logout clears session and redirects
- [ ] Protected `/tasks` route redirects to `/login`
- [ ] Authenticated user visiting `/login` redirects to `/tasks`
- [ ] Display user email/name in header

## 3.11 — Web-Specific Concerns

- [ ] Responsive layout (mobile-width friendly even on web)
- [ ] Meta tags and favicon
- [ ] Error page `+error.svelte`
- [ ] 404 page
- [ ] SSR/hydration works with Convex client

## 3.12 — Testing

### Unit

- [ ] Test task validation in `app-core`
- [ ] Test auth helper functions in `packages/auth`

### Component

- [ ] Test TaskItem toggle behavior
- [ ] Test TaskForm submission validation

### E2E (Playwright)

- [ ] Configure Playwright for `apps/web`
- [ ] Test: visit /tasks unauthenticated → redirect to login
- [ ] Test: login → land on /tasks
- [ ] Test: create task → appears in list
- [ ] Test: toggle task → state persists
- [ ] Test: logout → session cleared

## 3.13 — Build and Deploy Prep

- [ ] `pnpm --filter web build` succeeds
- [ ] `pnpm --filter web preview` serves production build
- [ ] Document Cloudflare deploy env vars (guide stub for Phase 9)
- [ ] Verify adapter-cloudflare output structure

## 3.14 — Manifest Update

- [ ] Update `.svelocity/manifest.json` with web target enabled
- [ ] Record `ui: bits-ui`, `auth: convex-auth`, `backend: convex`

## 3.15 — Verification

- [ ] Full demo flow works manually in browser
- [ ] Real-time sync verified across tabs
- [ ] All shared state components appear in correct situations
- [ ] No business logic leaked into `apps/web` — lives in `app-core`
- [ ] `pnpm --filter web check` passes
- [ ] Phase 4 (Electron) todo reviewed and unblocked
