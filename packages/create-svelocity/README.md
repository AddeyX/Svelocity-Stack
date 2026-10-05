# create-svelocity

Scaffolder and project tooling for the [Svelocity Stack](../../README.md).

## Bins

- `create-svelocity` - scaffold a new project (`pnpm create svelocity`)
- `svelocity` - `doctor` (static health checks) and `info` (manifest display)

Both commands ship in this one package.

## How Template Works

`scripts/build-template.mjs` snapshots the repo root into `template/` (gitignored).
It excludes stack-only paths (`docs/phases`, the whole `.github` tree, this package,
native `ios`/`android` dirs), renames dotfiles npm strips (`.gitignore` -> `_gitignore`),
and injects `{{PROJECT_NAME}}` / `{{DISPLAY_NAME}}` / `{{APP_ID}}` tokens. It then copies
`assets/workflows/validate.yml` and `assets/workflows/deploy.yml` into the snapshot's
`.github/workflows/`. A generated project gets those two workflows and none of the stack's
CI, CLI, e2e, or publish workflows. `create` reverses the dotfile renames and the tokens.

The repo is the template. Fix the golden path here, rebuild, done.

## Dev Loop

```bash
pnpm --filter create-svelocity build
cd $(mktemp -d) && node <repo>/packages/create-svelocity/dist/create.js --name demo --yes --no-install
pnpm --filter create-svelocity test
CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts
```

## Publishing

Maintainer steps, including the one-time first publish and trusted publishing, are in
[`docs/guides/publish-create-svelocity.md`](../../docs/guides/publish-create-svelocity.md).
Do not add an `NPM_TOKEN` secret. Later releases are staged with `npm stage publish`.

`prepack` rewrites this package's own `package.json` so the tarball has no `workspace:`
or `catalog:` specifiers, then `postpack` restores the file. Manifests inside `template/`
keep theirs. Before a release, build and inspect a pack:

```bash
pnpm --filter create-svelocity build
cd packages/create-svelocity && npm pack
```

The tarball includes `dist/` and `template/`. Its own `package.json` has `publishConfig`
and no `workspace:` or `catalog:` specifiers.
