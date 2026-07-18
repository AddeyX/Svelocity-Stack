# create-svelocity

Scaffolder and project tooling for the [Svelocity Stack](../../README.md).

## Bins

- `create-svelocity` - scaffold a new project (`pnpm create svelocity`)
- `svelocity` - `doctor` (static health checks) and `info` (manifest display)

## How Template Works

`scripts/build-template.mjs` snapshots the repo root into `template/` (gitignored):
excludes stack-only paths (`docs/phases`, `.github`, this package, native `ios`/`android` dirs),
renames dotfiles npm strips (`.gitignore` -> `_gitignore`), and injects
`{{PROJECT_NAME}}` / `{{DISPLAY_NAME}}` / `{{APP_ID}}` tokens. `create` reverses all of it.

The repo is the template. Fix the golden path here, rebuild, done.

## Dev Loop

```bash
pnpm --filter create-svelocity build
cd $(mktemp -d) && node <repo>/packages/create-svelocity/dist/create.js --name demo --yes --no-install
pnpm --filter create-svelocity test
CLI_INTEGRATION=1 pnpm --filter create-svelocity test -- tests/integration.spec.ts
```

Before publishing, run `npm pack --dry-run --json` and inspect package contents.
`pnpm publish` runs `prepublishOnly`, producing a fresh template and CLI bundle.
