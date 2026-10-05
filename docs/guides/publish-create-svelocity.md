# Publish create-svelocity

`.github/workflows/publish-cli.yml` stages a release. These are the steps only a maintainer can do, and why each one exists.

The published package is `create-svelocity`. One package provides both commands: `create-svelocity` scaffolds a project, and `svelocity` runs `doctor` and `info`. The private root package `svelocity-stack` is not published. Versions below are `packages/create-svelocity/package.json`, not the root version. The first public version is `1.0.0`.

Do not add an `NPM_TOKEN` secret, and do not commit credentials.

## 1. Push `main`

```sh
git push -u origin HEAD
```

GitHub reads the workflow file from the default branch. The release job cannot stage a package until this push includes `.github/workflows/publish-cli.yml`.

## 2. Log in to npm

```sh
npm login
npm whoami
```

Approve the login with two-factor authentication. This session is how you create the package and later approve staged versions. Keep the token on your machine. This repository has no `NPM_TOKEN` secret. A long-lived publish token is the credential the [8 July 2026 npm changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/) is retiring, and trusted-publisher setup already requires an interactive two-factor prompt.

## 3. Publish `1.0.0` yourself

From a checkout of the `1.0.0` commit, at the repo root:

```sh
pnpm install --frozen-lockfile
cd packages/create-svelocity
npm publish
```

`prepublishOnly` builds the template snapshot and the CLI bundle. `prepack` rewrites this package's own dependency specifiers so the tarball has no `workspace:` or `catalog:` protocols (the private `@svelocity/config` dev dependency is omitted; default `catalog:` pins are replaced from `pnpm-workspace.yaml`). `postpack` restores the working tree. Manifests inside `template/` keep their workspace catalog specifiers. npm asks for two-factor authentication and then prints `+ create-svelocity@1.0.0`.

[Staged publishing](https://docs.npmjs.com/staged-publishing) can submit a version only after the package already exists. Trusted publishing can be attached only after that too. This direct publish is the one-time way to create `create-svelocity`.

Confirm it from outside this repository:

```sh
cd /tmp && npm view create-svelocity version --registry https://registry.npmjs.org
```

The command prints `1.0.0`.

## 4. Authorize the GitHub workflow

Open the trusted publisher settings at `https://www.npmjs.com/package/create-svelocity/access` while logged in with two-factor authentication.

Enter:

- Organization or user: `AddeyX`
- Repository: `Svelocity-Stack`
- Workflow filename: `publish-cli.yml`
- Allowed action: `npm stage publish`

Leave the environment name empty. Leave direct `npm publish` unselected. The workflow's job is to submit a tarball. You approve it before anyone can install that version. npm checks these fields only when the workflow runs, and they are case-sensitive. This is the setup in [trusted publishing](https://docs.npmjs.com/trusted-publishers).

## 5. Publish the `v1.0.0` GitHub Release

The tag must point at the same commit as `main`.

```sh
git tag v1.0.0
git push origin v1.0.0
gh release create v1.0.0 --title "v1.0.0" --notes "See CHANGELOG.md."
```

A published release, including this one, starts the workflow. A draft does not. The job sees that `1.0.0` is already on npm and skips staging, so the release record exists and the version is not submitted twice.

## 6. Approve later releases

For the next version, bump `packages/create-svelocity/package.json`, commit, and push `main`. If `pnpm install` changes `pnpm-lock.yaml`, commit that too. Tag that same commit and publish the GitHub Release.

The workflow checks out that tag, installs with pnpm, builds `create-svelocity` (template snapshot and CLI bundle), runs its check, unit tests, and the CLI integration test, then runs `npm stage publish` from `packages/create-svelocity` with OpenID Connect. `id-token: write` lets GitHub mint a short-lived token for that run. The version is still private. A version that is already on npm is skipped.

Then approve it:

```sh
npm stage list create-svelocity
npm stage view STAGE_ID
npm stage approve STAGE_ID
```

Replace `STAGE_ID` with the id from `npm stage list`. Approval prompts for two-factor authentication. The Approve button on the Staged Packages tab at npmjs.com does the same thing.

`npm stage publish` needs no two-factor prompt. Approval does, because that is the moment the version becomes public. After approval, `npm view create-svelocity@X.Y.Z` prints the new version.

If staging fails with `ENEEDAUTH`, compare the trusted publisher fields with `AddeyX`, `Svelocity-Stack`, and `publish-cli.yml`.
