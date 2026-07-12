# Troubleshooting

Symptom → cause → fix, for the failures people actually hit. Run
`pnpm doctor` first — it catches most environment problems and
`--fix` handles the common one (missing `.env.local`).

## Install and environment

### `pnpm install` fails

- **`ERR_PNPM_UNSUPPORTED_ENGINE`** → Node or pnpm too old. This repo needs Node ≥ 22
  and pnpm ≥ 10 (`node --version`, `pnpm --version`); `pnpm doctor`
  checks both. Upgrade via your version manager; `corepack enable` gets you the
  pinned pnpm.
- **Lockfile conflicts / `ERR_PNPM_OUTDATED_LOCKFILE`** → you edited a `package.json`
  by hand. Run plain `pnpm install` to refresh the lockfile; never `--no-frozen-lockfile`
  in CI (policy: [CONTRIBUTING-STACK](https://github.com/AddeyX/Svelocity-Stack/blob/main/docs/CONTRIBUTING-STACK.md) in the stack repo).
- **Native module build errors (Electron)** → usually a Node major mismatch. Check
  `node --version` is 22.x, then remove `node_modules` and reinstall.

### Wrong Node/pnpm version

Symptom: `engines` warnings, weird syntax errors in dependencies, or doctor failing
its version checks. Fix: install Node 22 LTS and pnpm 10; verify with
`pnpm doctor`. Version pins live in `pnpm-workspace.yaml`
(catalog) — trust them over whatever an agent or tutorial suggests.

## Convex

### `[svelocity/env] Invalid environment: PUBLIC_CONVEX_URL …`

Cause: `.env.local` missing or the URL is malformed (must be `https://…`, or
`http://127.0.0.1`/`localhost` in dev).
Fix: `cp apps/web/.env.example apps/web/.env.local` and set the URL —
`http://127.0.0.1:3210` for the local anonymous backend, or your
`https://<name>.convex.cloud` URL. (`doctor --fix` does the copy for you.)

### App loads but data never appears / WebSocket errors in console

Cause: the backend isn't running, or the app points at the wrong deployment.
Fix: `pnpm dev:backend` in its own terminal; wait for `Convex functions ready`;
confirm the URL in `.env.local` matches the deployment the backend is serving.

### `Not authenticated` errors from queries that should work

Cause: auth env not set on this deployment (each deployment needs it once).
Fix: `cd packages/backend && npx @convex-dev/auth && npx convex env set SITE_URL http://localhost:5173`.

## Auth

### Sign-in always says "Invalid email or password" (even for new accounts)

Cause: `JWT_PRIVATE_KEY`/`JWKS` missing on the deployment, so token issuance fails
and surfaces as a credentials error.
Fix: the one-time auth setup above, then restart `convex dev`.

### Auth session not persisting across reloads

Tokens live in `localStorage` (`svelocity_auth_token`). If sessions vanish:

- Private/incognito windows drop `localStorage` — expected.
- Desktop: the packaged app uses a `file://` origin — its session is **separate**
  from your browser and from `pnpm dev:desktop` (different origin). Sign in again.
- If the token is there but you land on `/login`, the refresh flow failed —
  check backend logs; a deleted/expired refresh token forces a fresh sign-in.

## Desktop (Electron)

### Blank window on `pnpm dev:desktop`

- Vite on `:5174` not up yet — the dev script waits, but if Electron opened early,
  reload (Cmd/Ctrl+R).
- Check the DevTools console: a CSP or `connect-src` violation means
  `PUBLIC_CONVEX_URL` isn't in the allowed connect sources (`index.html` CSP).
- `.env.local` missing → the env parser throws before mount; the window stays blank.
  Copy `.env.example`.

### Blank window in the packaged app

`dist/`/`dist-electron/` stale or missing — `pnpm --filter desktop package` runs the
full build first; if you're using `start`, run `pnpm --filter desktop build` before it.

## Mobile (Capacitor)

### `cap sync` fails or the app shows stale UI

The WebView serves the **copied** `dist/`, not your dev server. Run
`pnpm --filter mobile sync` after every web change (or set up live reload —
[mobile guide](mobile.md)). If sync itself fails, delete `apps/mobile/dist` and
rebuild.

### Convex unreachable on a device/emulator

`127.0.0.1` on the device is the device, not your machine. Use your LAN IP
(`http://192.168.x.x:3210`) or a cloud deployment in `apps/mobile/.env.local`,
then re-run `sync`. iOS **simulator** is the exception — it shares the host loopback.

### Android Gradle errors

- First open: let Android Studio download the matching Gradle + SDK components —
  open `android/` in Android Studio once rather than fighting the CLI.
- Check JDK 21 is selected (Settings → Build Tools → Gradle → Gradle JDK).
- SDK 35 must be installed (SDK Manager).

### iOS build errors

Capacitor 8 uses Swift Package Manager — there is **no `pod install` step**; ignore
CocoaPods advice from older tutorials. Ensure Xcode 16+, then in Xcode:
File → Packages → Resolve Package Versions if packages look broken.

## Real-time sync

### Two windows don't sync

- Both clients must point at the **same** `PUBLIC_CONVEX_URL` — a desktop `.env.local`
  pointing at cloud while web points at local looks exactly like "sync is broken".
- Same account? Tasks are per-user (`by_user` index) — two different accounts never
  see each other's tasks.
- Check the backend terminal for function errors — a throwing mutation updates
  nothing anywhere.

## CI

### Build passes locally but fails in CI

- **Lockfile**: CI uses `--frozen-lockfile`; commit `pnpm-lock.yaml` changes.
- **E2E**: CI runs against a fresh anonymous local backend with per-run generated
  auth keys (`.github/workflows/e2e.yml`) — a spec that accidentally depends on your
  local data will fail there. The suite also **fails if zero tests run or any test
  skips** (anti-silent-skip guard), so a "skipped locally" spec is a CI failure.
- **Ports**: CI has nothing on `5173`; locally another dev server squatting there can
  make Playwright test the wrong app — set `E2E_PORT` or stop the other server.
- **Node-only APIs** in web server code fail on the Cloudflare adapter/workerd even
  when `vite dev` (Node) was happy.

Full testing reference: [docs/TESTING-GUIDE.md](../TESTING-GUIDE.md).
