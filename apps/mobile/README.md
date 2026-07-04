# mobile — Svelocity Mobile Shell

Capacitor app (iOS + Android) running the Shared Tasks demo from the same
shared packages and Convex deployment as web and desktop.

## Prerequisites

| Platform | Needs                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| iOS      | macOS, Xcode 16+ (Capacitor 8 uses Swift Package Manager — no CocoaPods step) |
| Android  | Android Studio, Android SDK 35+, JDK 21                                       |

## Commands

| Command                             | Does                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `pnpm --filter mobile dev`          | Vite dev server on :5175 (test in a mobile-width browser) |
| `pnpm --filter mobile build`        | Production web build → `dist/`                            |
| `pnpm --filter mobile sync`         | Build + `cap sync` into `ios/` + `android/`               |
| `pnpm --filter mobile open:ios`     | Open Xcode                                                |
| `pnpm --filter mobile open:android` | Open Android Studio                                       |
| `pnpm --filter mobile run:ios`      | Build + run on simulator                                  |
| `pnpm --filter mobile run:android`  | Build + run on emulator/device                            |

## Env

Copy `.env.example` → `.env.local`. **A device or emulator cannot reach
`127.0.0.1` on your machine** — for the local Convex backend use your LAN IP
(`http://192.168.x.x:3210`), or use a cloud deployment. The iOS simulator can
use `127.0.0.1` directly.

## Live reload on device

Uncomment `server.url` in [capacitor.config.ts](capacitor.config.ts), set it to
`http://<your-lan-ip>:5175`, run `pnpm dev`, then `cap sync` and run the app.
Remove it again for production builds.

## Mobile UX baseline (Phase 5 §5.4)

- `viewport-fit=cover` + `env(safe-area-inset-*)` via
  `@svelocity/theme/platform/mobile.css` (`--sv-safe-*` tokens)
- Touch targets ≥44px (`--sv-touch-target: 2.75rem`)
- Hover-dependent interactions disabled on touch
- Android back button: register → login, otherwise OS default (`src/lib/native.ts`)
- Status bar styled + splash screen configured (only plugins in v1:
  `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`)

## Common failures

- **Gradle sync fails:** open `android/` in Android Studio once so it downloads
  the right Gradle + SDK components; check JDK 21 is selected.
- **Blank WebView:** `pnpm sync` after every web change — the WebView serves
  the copied `dist/`, not the dev server (unless `server.url` is set).
- **Convex unreachable on device:** you're pointing at `127.0.0.1` — use LAN IP.
- **WebView debugging:** Safari → Develop → Simulator (iOS), or
  `chrome://inspect` (Android).
