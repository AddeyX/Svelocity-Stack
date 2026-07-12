# Your First Project

Zero to the Shared Tasks demo running on web, desktop, and mobile. Budget ~30 minutes
for web, plus 15–30 minutes each for desktop and mobile.

## Prerequisites

- [ ] [Node](https://nodejs.org/en/download) >= 22 (`node --version`)
- [ ] [pnpm](https://pnpm.io/installation) >= 10 (`pnpm --version`)
- [ ] [Git](https://git-scm.com/downloads)
- [ ] Desktop only: nothing extra — Electron installs with `pnpm install`
- [ ] Mobile only: Xcode 16+ (iOS) and/or Android Studio + SDK 35 + JDK 21 (Android)

## 1. Create the project

```bash
pnpm create svelocity my-app   # until published: pnpm dlx ./packages/create-svelocity my-app
cd my-app
pnpm install
```

**You should see:** the CLI scaffolds the monorepo and prints next steps, and
`pnpm install` finishes without errors. Verify the environment any time with:

```bash
pnpm exec svelocity doctor
```

## 2. Start the Convex backend

Convex is the database + functions + real-time layer shared by all three shells.

```bash
pnpm dev:backend
```

On first run `convex dev` asks how to provision a deployment:

- **Local anonymous deployment** — no account needed; runs on your machine at
  `http://127.0.0.1:3210`. Best for a first look.
- **Cloud deployment** — sign in (GitHub) and Convex creates a free dev deployment
  with a `https://<name>.convex.cloud` URL.

Leave this terminal running. **You should see:** `Convex functions ready` in the log.

## 3. One-time auth setup

Convex Auth needs JWT keys and your frontend origin on the deployment (once per
deployment):

```bash
cd packages/backend
npx @convex-dev/auth                                 # generates JWT_PRIVATE_KEY + JWKS
npx convex env set SITE_URL http://localhost:5173    # your frontend origin, NOT *.convex.site
cd ../..
```

More detail: [authentication guide](authentication.md).

## 4. Environment variables

Point the web app at your deployment:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```bash
# local anonymous backend:
PUBLIC_CONVEX_URL=http://127.0.0.1:3210
# or cloud:
# PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Desktop and mobile read the same variable — copy their `.env.example` files the same
way when you get to steps 6–7.

## 5. Run the web demo

In a second terminal:

```bash
pnpm dev
```

**You should see:** the app at `http://localhost:5173` redirect to `/login`. Create an
account (any email + password ≥ 8 chars), land on `/tasks`, and add a task. Open the
same URL in a second browser window — the task list syncs in real time.

## 6. Run the desktop demo

```bash
cp apps/desktop/.env.example apps/desktop/.env.local   # same PUBLIC_CONVEX_URL
pnpm dev:desktop
```

**You should see:** a Vite server on `:5174`, then an Electron window titled
"Shared Tasks". Sign in with the account from step 5 — tasks created in the browser
appear live in the desktop window and vice versa.

## 7. Build and sync mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
pnpm --filter mobile sync        # builds the web assets + copies into ios/ + android/
pnpm --filter mobile open:ios    # or open:android
```

> A physical device or Android emulator cannot reach `127.0.0.1` on your machine.
> Use your LAN IP (`http://192.168.x.x:3210`) or a cloud deployment URL in
> `.env.local`. The iOS simulator can use `127.0.0.1` directly.

**You should see:** Xcode (or Android Studio) opens the native project; run it on a
simulator/emulator and the same Shared Tasks app appears, synced with web and desktop.

## Where to next

- [Architecture](architecture.md) — how the monorepo fits together
- [Convex](convex.md) — add your own tables and functions
- [Deploy to Cloudflare](deploy-cloudflare.md) — ship the web app
- [Troubleshooting](troubleshooting.md) — if any step above didn't match
