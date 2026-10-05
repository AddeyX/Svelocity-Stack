# ADR 0007 — Svelocity v2 Defaults

**Status:** Accepted
**Date:** 2026-10-05
**Supersedes:** the package inventory in [ADR 0003](./0003-monorepo-package-boundaries.md)

## Context

Svelocity v2 keeps `create-svelocity` as the source of truth and folds in the parts
of the older axd tooling that earned their place: a scaffolder, a planning flow, and
a validate/deploy flow. The v1 template already ships web, Electron, and Capacitor
from one core. v2 must not trade that away for a smaller starter, a second auth
system, or a planning gate in front of `create`.

## Decision

1. **All three platforms stay in the template.** Web (SvelteKit + Cloudflare),
   desktop (Electron), and mobile (Capacitor) are present by default. Removing a
   shell is a later, manual choice. The template does not offer a platform subset
   at scaffold time.
2. **`@svelocity/theme` folds into `@svelocity/ui`.** Token CSS, the token
   TypeScript export, and the web, desktop, and mobile platform CSS move to
   `packages/ui/tokens/`. Apps import them from `@svelocity/ui` (for example
   `@svelocity/ui/tokens.css` and `@svelocity/ui/tokens/platform/web.css`). The
   template's packages are then exactly six: `app-core`, `auth`, `backend`,
   `config`, `env`, `ui`. Nothing else is merged or deleted. `create-svelocity`
   stays the CLI in the stack repo and stays excluded from the snapshot.
3. **Password auth stays the default.** Convex Auth with the Password provider
   remains what `create` scaffolds ([ADR 0002](./0002-convex-auth-over-better-auth.md)).
   A guided Google sign-in recipe is later work. It is not a scaffold-time choice.
4. **Planning docs are stubs, not a gate.** The template ships thin `VISION.md`,
   `DESIGN.md`, and `TASKS.md` files. `create` never asks for or blocks on a
   planning step. A bundled `svelocity-flow` skill that fills those docs comes later.
5. **The template ships validate, deploy, and Wrangler.** Generated projects include
   `.github/workflows/validate.yml`, `.github/workflows/deploy.yml`, and
   `apps/web/wrangler.jsonc`. Those two workflows are copied into the snapshot when
   the template is built. They are not workflows of this stack repository, so a
   push to the stack's `main` does not deploy the stack. The stack's CI, CLI,
   end-to-end, and package-publish workflows stay out of the snapshot. Desktop and
   mobile store or release automation is out of scope.
6. **Convex Auth env is a one-time deployment setup, not a GitHub secret.** Every
   Convex deployment — dev and prod — needs `JWT_PRIVATE_KEY`, `JWKS`, and
   `SITE_URL` before password login works. From `packages/backend`, set them once
   with `npx @convex-dev/auth` (it generates the key pair and writes all three),
   or generate the keys and run `npx convex env set` for each name. Repeat on the
   production deployment with `SITE_URL` set to the deployed frontend origin, not
   the `*.convex.site` URL. These values are never committed and are not GitHub
   Actions secrets. The only client env var remains `PUBLIC_CONVEX_URL`. The
   deploy workflow checks that the three names exist on the target deployment
   before it deploys; it does not create the keys or print their values.

## Rationale

- Three shells from one core is the product. A web-only default would make the
  desktop and mobile paths a restoration project.
- Tokens are design inputs to the UI package, not a second product. One package
  keeps the export map and the dependency graph smaller without mixing tokens into
  app-core or auth.
- Password auth is the path that does not require an OAuth client. Google stays a
  recipe so the golden path does not grow a console setup. The JWT key pair and
  `SITE_URL` are still required, once per deployment, because Convex Auth will not
  issue tokens without them. They stay on the deployment so CI logs and the repo
  never hold key material.
- Forcing VISION/DESIGN/TASKS at create time front-loads planning that many users
  skip. Shipping empty stubs keeps the files where a later skill expects them.
- Validate and deploy workflows, plus a Wrangler config, are the minimum that makes
  a generated repo able to check itself and ship the web shell. They do not replace
  Convex dashboard setup or native store releases.

## Consequences

- [ADR 0003](./0003-monorepo-package-boundaries.md) remains the source for
  dependency direction (apps → packages, `ui` does not import `app-core`, no
  cross-app imports). Its v1 package list, which included a separate `theme`
  package, is superseded by decision 2 above.
- Follow-through for decisions 2, 4, and 5 is the theme fold, the starter stubs,
  the Wrangler skeleton, and the two shipped workflows. Later work — the flow
  skill, a monorepo-aware validate/deploy skill, the Google recipe, `svelocity add`,
  CLI polish, and axdstack sunset — is tracked in `docs/V2-BACKLOG.md` (stack repo
  only; not copied into generated projects).
- Out of scope for this decision: Better Auth, shadcn-svelte, `upgrade` / `sync` /
  `generate`, and store or release automation.
