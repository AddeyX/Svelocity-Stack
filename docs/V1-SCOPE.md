# Svelocity Stack — V1 Scope (Option B)

**Status:** Locked for v1.0.0 development  
**Strategy:** Golden path — one coherent stack, not a choice matrix

---

## What V1 Is

Svelocity Stack v1 is an opinionated, AI-ready Svelte monorepo template for solo developers. It provides shared UI, a working demo app, and three platform shells (web, desktop, mobile) connected by Convex.

---

## Locked Decisions

| Decision            | V1 choice                                                 |
| ------------------- | --------------------------------------------------------- |
| **Platforms**       | Web (SvelteKit) + Desktop (Electron) + Mobile (Capacitor) |
| **UI system**       | Bits UI + Svelocity theme tokens                          |
| **Authentication**  | Convex Auth                                               |
| **Backend**         | Convex                                                    |
| **Package manager** | pnpm workspaces                                           |
| **Web deployment**  | Cloudflare (adapter-cloudflare)                           |
| **Demo app**        | Shared Tasks (auth + CRUD + real-time)                    |
| **CLI commands**    | `create`, `doctor`, `info`                                |
| **AI assets**       | `AGENTS.md`, Cursor rules, 3 skills                       |
| **Documentation**   | In-repo README + guides                                   |

---

## V1 Packages

```text
packages/config     — shared tsconfig, eslint, prettier, vite presets
packages/theme      — design tokens (CSS custom properties)
packages/ui         — shared Svelte components (Bits UI wrappers)
packages/app-core   — business logic, validation, domain types
packages/auth       — Convex Auth helpers, session types, route guards
packages/env        — typed environment parsing
packages/backend    — shared Convex schema/functions + generated API
                      (added Phase 3: one backend for all three apps;
                      keeps the "apps never import apps" rule intact)
```

**Deferred packages:** `platform`, `testing` (standalone), `assets` (inline in theme/ui for v1)

---

## V1 Apps

```text
apps/web      — SvelteKit + Convex + Shared Tasks demo
apps/desktop  — Electron SPA + shared demo
apps/mobile   — Capacitor SPA + shared demo
```

---

## V1 Skills

```text
skills/svelocity-convex/
skills/svelocity-auth/
skills/svelocity-add-platform/    # manual guide until `svelocity add` in v1.1
```

---

## V1 Success Criteria

A solo developer on a prepared machine can:

1. Run `pnpm create svelocity` and receive the golden-path repo
2. Configure Convex and env vars following in-repo guides
3. Run Shared Tasks demo in the browser with login and real-time sync
4. Run the Electron app locally with the same tasks
5. Build and sync the Capacitor app locally
6. Use `AGENTS.md` and Cursor rules so AI respects repo boundaries
7. Run `svelocity doctor` — all critical checks pass
8. Run `pnpm -r check && pnpm -r build` successfully
9. Deploy web to Cloudflare using `docs/guides/deploy-cloudflare.md`

**Time target:** under 30 minutes for web; +15–30 minutes for desktop/mobile native tooling.

---

## Explicit Non-Goals (V1)

Do not build these in v1:

- shadcn-svelte option
- Better Auth option
- `svelocity add`, `upgrade`, `sync`, `generate`, `audit` CLI commands
- Full sub-agents directory
- Documentation website
- Automated store submission or signing
- Electron auto-updater
- Offline sync / conflict resolution
- Observability (logging, error tracking)
- `packages/platform` abstraction layer
- Renovate preset (pin versions in catalog instead)
- Template generation matrix for all permutations
- Plugin marketplace or recipe registry
- Team/enterprise workflows

---

## Build Priority

```text
1. Shared UI + theme          (Phase 2)
2. Web app + Convex + Auth    (Phase 3)
3. Electron template          (Phase 4)
4. Capacitor template         (Phase 5)
5. Thin CLI                   (Phase 6)
6. AI skills + AGENTS.md      (Phase 7)
7. Doctor + CI                (Phase 8)
8. In-repo docs               (Phase 9)
9. Hardening + release        (Phase 10)
```

---

## Compatibility Targets (V1)

| Tool      | Target version                 |
| --------- | ------------------------------ |
| Node      | 22 LTS (minimum)               |
| pnpm      | 10+                            |
| Svelte    | 5.x                            |
| SvelteKit | Latest stable                  |
| Vite      | Latest stable                  |
| Convex    | Latest tested                  |
| Electron  | Latest stable (catalog-pinned) |
| Capacitor | Latest stable (catalog-pinned) |
| Bits UI   | Latest stable                  |

Exact pins live in `docs/COMPATIBILITY.md` once Phase 0 completes.
