# Svelocity v2 — Later Backlog

Work that [ADR 0007](adr/0007-v2-defaults.md) locks as **later**. The decision
record itself, the theme-into-ui fold, the Wrangler skeleton, and the shipped
validate/deploy workflows are not items here.

This file is stack-only. `build-template.mjs` excludes it, so generated projects
do not receive the stack's internal backlog.

Do not pull these forward by deleting shells, merging more packages, or adding a
planning prompt to `create`.

---

## Required setup (not a backlog feature)

Password login does not work until **each** Convex deployment (dev and prod) has
`JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL`. That is a one-time setup step, already
required by Convex Auth, not a later project.

- Set them from `packages/backend` with `npx @convex-dev/auth`, or generate the
  key pair and `npx convex env set` each name. On prod, `SITE_URL` is the deployed
  frontend origin.
- They are Convex deployment env vars. They are not GitHub Actions secrets and
  must not be committed.
- The deploy workflow only checks that the names are present. It does not generate
  or store the keys.
- The Google recipe below must not replace this step.

---

## Skills

- [ ] **`svelocity-flow`** — bundled planning skill that fills the template's
      `VISION.md`, `DESIGN.md`, and `TASKS.md` stubs. `create` still must not
      force or block on that step.
- [ ] **`svelocity-validate-deploy`** — monorepo-aware port of `axd-validate-deploy`.
      Teaches an agent how this repo's validate and deploy workflows, Wrangler
      config, and Convex deploy fit together. The workflows themselves ship with
      the template; this skill is the guided layer on top.

## Authentication

- [ ] **Google sign-in recipe** — a guided Convex Auth Google provider walkthrough.
      Password stays the scaffold default. Do not add a provider picker to `create`.

## CLI

- [ ] **`svelocity add`** — restore a platform shell that someone removed (low
      priority). The manual guide remains `.agents/skills/svelocity-add-platform`
      until this exists. All three shells stay in the template, so this is for
      repair, not for the golden path.
- [ ] **CLI polish and integration tests** — tighten `create` / `doctor` / `info`
      and extend the gated scaffold integration test as the template surface grows
      (stubs, Wrangler, workflows). No `upgrade`, `sync`, or `generate`.

## Migration

- [ ] **Migration docs and axdstack sunset** — how an axdstack project moves onto
      `create-svelocity`, and what in the axd scaffolder, `axd-flow`, and
      `axd-validate-deploy` is now owned here so those skills can be retired.

---

## Still out of scope

Better Auth, shadcn-svelte, `svelocity upgrade`, `svelocity sync`,
`svelocity generate`, and desktop or mobile store/release automation.
