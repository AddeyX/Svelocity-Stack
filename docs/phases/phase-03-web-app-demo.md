# Phase 3 — Web App + Convex + Auth Demo

**Goal:** Build the SvelteKit web reference app with Convex backend, Convex Auth, and the Shared Tasks demo.  
**Prerequisites:** Phase 2 complete (shared UI available)  
**Estimated effort:** 7–10 days

---

## Exit Criteria

- [x] `pnpm --filter web dev` runs Shared Tasks demo in browser
- [x] User can register/login/logout via Convex Auth
- [x] Tasks CRUD works with real-time sync across browser tabs
- [x] Loading, empty, error, and unauthorized states work
- [x] `pnpm --filter web build` produces production build
- [x] Basic Playwright e2e: login → create task → see task
- [x] Desktop and mobile phases can reuse `app-core` logic

---

## 3.1 — SvelteKit Web App Scaffold

- [x] Initialize `apps/web` with SvelteKit + TypeScript + Vite
- [x] Configure adapter: `@sveltejs/adapter-cloudflare` for deployment target
- [x] Wire `@svelocity/config` tsconfig, eslint, vite presets
- [x] Import `@svelocity/theme/tokens.css` in root layout
- [x] Set up path aliases consistent with monorepo
- [x] Add `apps/web/package.json` with workspace deps

## 3.2 — Convex Backend Setup

- [x] Run `npx convex init` in appropriate location (app or root)
- [x] Configure `convex/` directory structure:
  - [x] `schema.ts`
  - [x] `tasks.ts` (queries, mutations)
  - [x] `users.ts` (if needed beyond auth tables)
  - [x] `auth.ts` (auth config)
- [x] Add Convex dev script: `pnpm --filter web convex:dev`
- [x] Add environment variables: `CONVEX_URL`, deployment keys
- [x] Document Convex folder ownership in `AGENTS.md` stub

## 3.3 — Convex Schema

- [x] Define `tasks` table:
  - [x] `_id`, `_creationTime`
  - [x] `userId` (owner)
  - [x] `title` (string, required)
  - [x] `completed` (boolean)
  - [x] `createdAt`, `updatedAt`
- [x] Add index: `by_user` on `userId`
- [x] Add index: `by_user_and_completed` if needed
- [x] Validate schema with Convex schema definition

## 3.4 — Convex Auth Integration

- [x] Install and configure `@convex-dev/auth` (or current Convex Auth package)
- [x] Set up auth provider in `convex/auth.ts`
- [x] Choose v1 auth method:
  - [x] Email + password, OR
  - [x] OAuth (GitHub/Google) — pick one for v1
- [x] Configure auth tables via Convex Auth
- [x] Create `packages/auth` Convex Auth client helpers:
  - [x] `useAuth()` or equivalent store
  - [x] `signIn()`, `signOut()` wrappers
  - [x] Session state types
- [x] Add route protection utilities in `packages/auth`

## 3.5 — Environment Configuration

- [x] Implement `packages/env` with Zod schemas:
  - [x] `PUBLIC_CONVEX_URL`
  - [x] Auth-related public vars
  - [x] Server-only secrets (if any)
- [x] Create `apps/web/.env.example`
- [x] Fail fast on missing/invalid env at startup
- [x] Document env setup in README stub

## 3.6 — Shared Application Core (`packages/app-core`)

- [x] Define `Task` domain type
- [x] Create task validation schema (Zod or similar)
- [x] Create Convex client wrappers:
  - [x] `listTasks`
  - [x] `createTask`
  - [x] `updateTask`
  - [x] `deleteTask`
  - [x] `toggleTask`
- [x] Create Svelte stores or reactive helpers for task state
- [x] Keep all business logic here — apps are thin shells
- [x] Unit test validation and utility functions

## 3.7 — Web Routes and Layout

- [x] `src/routes/+layout.svelte` — theme, auth provider, toast
- [x] `src/routes/+page.svelte` — redirect to /tasks or /login
- [x] `src/routes/login/+page.svelte` — login form
- [x] `src/routes/register/+page.svelte` — registration form (if email/password)
- [x] `src/routes/tasks/+page.svelte` — main demo view
- [x] `src/routes/tasks/+page.server.ts` or hooks for auth guard
- [x] `src/hooks.server.ts` — session handling if needed

## 3.8 — Shared Tasks UI (Web)

- [x] `TaskList.svelte` — renders tasks with real-time updates
- [x] `TaskItem.svelte` — title, checkbox, delete button
- [x] `TaskForm.svelte` — create new task input
- [x] `TaskHeader.svelte` — app title, user info, logout
- [x] Wire LoadingState while auth/tasks load
- [x] Wire EmptyState when no tasks
- [x] Wire ErrorState on mutation failure with retry
- [x] Wire UnauthorizedState for unauthenticated access
- [x] Use only `@svelocity/ui` components — no ad-hoc styling

## 3.9 — Real-Time Sync

- [x] Use Convex reactive queries for task list
- [x] Verify two browser tabs sync instantly on create/update/delete
- [ ] Handle optimistic UI for toggle (optional v1 enhancement)
- [ ] Show connection/sync indicator if trivial to add

## 3.10 — Auth Flows

- [x] Login page with form validation
- [x] Registration page (if email/password)
- [x] Logout clears session and redirects
- [x] Protected `/tasks` route redirects to `/login`
- [x] Authenticated user visiting `/login` redirects to `/tasks`
- [x] Display user email/name in header

## 3.11 — Web-Specific Concerns

- [x] Responsive layout (mobile-width friendly even on web)
- [x] Meta tags and favicon
- [x] Error page `+error.svelte`
- [x] 404 page
- [x] SSR/hydration works with Convex client

## 3.12 — Testing

### Unit

- [x] Test task validation in `app-core`
- [x] Test auth helper functions in `packages/auth`

### Component

- [x] Test TaskItem toggle behavior
- [x] Test TaskForm submission validation

### E2E (Playwright)

- [x] Configure Playwright for `apps/web`
- [x] Test: visit /tasks unauthenticated → redirect to login
- [x] Test: login → land on /tasks
- [x] Test: create task → appears in list
- [x] Test: toggle task → state persists
- [x] Test: logout → session cleared

## 3.13 — Build and Deploy Prep

- [x] `pnpm --filter web build` succeeds
- [x] `pnpm --filter web preview` serves production build
- [x] Document Cloudflare deploy env vars (guide stub for Phase 9)
- [x] Verify adapter-cloudflare output structure

## 3.14 — Manifest Update

- [x] Update `.svelocity/manifest.json` with web target enabled
- [x] Record `ui: bits-ui`, `auth: convex-auth`, `backend: convex`

## 3.15 — Verification

- [x] Full demo flow works manually in browser
- [x] Real-time sync verified across tabs
- [x] All shared state components appear in correct situations
- [x] No business logic leaked into `apps/web` — lives in `app-core`
- [x] `pnpm --filter web check` passes
- [x] Phase 4 (Electron) todo reviewed and unblocked
