# Svelocity Stack — V1 Phase Plan

**Strategy:** Option B — Golden Path  
**Status:** Active development plan  
**Last updated:** 2026-07-04

---

## V1 Locked Decisions

| Area      | V1 choice                           | Deferred to v1.1+                       |
| --------- | ----------------------------------- | --------------------------------------- |
| Platforms | Web + Electron + Capacitor          | Platform `add` CLI automation           |
| UI        | Bits UI                             | shadcn-svelte                           |
| Auth      | Convex Auth                         | Better Auth                             |
| Backend   | Convex                              | Other databases                         |
| CLI       | `create`, `doctor`, `info`          | `add`, `upgrade`, `sync`, `audit`       |
| AI        | `AGENTS.md`, Cursor rules, 3 skills | Claude/Codex-specific files, sub-agents |
| Docs      | In-repo README + guides             | Full documentation website              |

---

## Development Priority Order

Build in this sequence. Do not skip ahead without exit criteria from the prior phase.

```text
1. Phase 0 — Scope lock
2. Phase 1 — Foundation monorepo
3. Phase 2 — Shared UI + theme          ← highest product priority
4. Phase 3 — Web app + Convex + Auth demo
5. Phase 4 — Electron desktop template
6. Phase 5 — Capacitor mobile template
7. Phase 6 — Thin CLI
8. Phase 7 — AI skills + agent instructions
9. Phase 8 — Doctor, info, CI
10. Phase 9 — In-repo documentation
11. Phase 10 — Hardening + v1.0.0 release
```

---

## Phase Index

| Phase | Document                                                             | Goal                                     |
| ----- | -------------------------------------------------------------------- | ---------------------------------------- |
| 0     | [phase-00-scope-lock.md](./phase-00-scope-lock.md)                   | Lock V1 boundaries before code           |
| 1     | [phase-01-foundation-monorepo.md](./phase-01-foundation-monorepo.md) | pnpm workspace, tooling, manifest schema |
| 2     | [phase-02-shared-ui-theme.md](./phase-02-shared-ui-theme.md)         | Bits UI, tokens, shared components       |
| 3     | [phase-03-web-app-demo.md](./phase-03-web-app-demo.md)               | SvelteKit + Convex + Shared Tasks        |
| 4     | [phase-04-electron-template.md](./phase-04-electron-template.md)     | Desktop shell + shared demo              |
| 5     | [phase-05-capacitor-template.md](./phase-05-capacitor-template.md)   | Mobile shell + shared demo               |
| 6     | [phase-06-thin-cli.md](./phase-06-thin-cli.md)                       | `create`, `doctor`, `info`               |
| 7     | [phase-07-ai-skills.md](./phase-07-ai-skills.md)                     | AGENTS.md, Cursor rules, skills          |
| 8     | [phase-08-doctor-ci.md](./phase-08-doctor-ci.md)                     | Diagnostics, golden-path CI              |
| 9     | [phase-09-in-repo-docs.md](./phase-09-in-repo-docs.md)               | README, guides, troubleshooting          |
| 10    | [phase-10-hardening-release.md](./phase-10-hardening-release.md)     | Security, a11y, v1.0.0                   |

---

## V1 Success Definition

A solo developer on a prepared machine can:

1. Run `pnpm create svelocity` and get the golden-path repo
2. Start the **web** Shared Tasks demo with auth and real-time Convex sync
3. Run the **Electron** app locally with the same demo
4. Sync and compile the **Capacitor** app locally
5. Use `AGENTS.md` and Cursor rules so an AI agent respects repo boundaries
6. Run `svelocity doctor` and `pnpm -r check && pnpm -r build` cleanly
7. Deploy web to Cloudflare using in-repo guide

**Target time:** under 30 minutes for web; +15–30 minutes for desktop/mobile native tooling.

---

## How to Use These Docs

- Check off items as completed (`- [ ]` → `- [x]`)
- Do not mark a phase done until **Exit Criteria** are met
- If scope changes, update Phase 0 first, then cascade to affected phases
- Link PRs to phase + section in commit messages when possible
