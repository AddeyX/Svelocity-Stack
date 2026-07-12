# Mobile (Capacitor)

The mobile shell: a Vite + Svelte SPA wrapped by Capacitor for iOS and Android. Same
shared packages, same Convex deployment as web and desktop.

## Prerequisites

| Platform | Needs                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| iOS      | macOS, Xcode 16+ (Capacitor 8 uses Swift Package Manager — no CocoaPods step) |
| Android  | Android Studio, Android SDK 35+, JDK 21                                       |

## Commands

| Command                             | Does                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm dev:mobile` (root)            | Vite dev server on `:5175` (test in a mobile-width browser)  |
| `pnpm --filter mobile build`        | Production web build → `apps/mobile/dist/`                   |
| `pnpm --filter mobile sync`         | Build + `cap sync` — copies `dist/` into `ios/` + `android/` |
| `pnpm --filter mobile open:ios`     | Open the native project in Xcode                             |
| `pnpm --filter mobile open:android` | Open the native project in Android Studio                    |
| `pnpm --filter mobile run:ios`      | Build + run on a simulator                                   |
| `pnpm --filter mobile run:android`  | Build + run on an emulator/device                            |

The loop to remember: **the WebView serves the copied `dist/`, not your dev server**
— run `pnpm --filter mobile sync` after every web-code change (unless using live
reload below).

## Environment

Copy `apps/mobile/.env.example` → `.env.local`. A device or Android emulator
**cannot reach `127.0.0.1` on your machine** — point `PUBLIC_CONVEX_URL` at your LAN
IP (`http://192.168.x.x:3210`) or a cloud deployment. The iOS simulator can use
`127.0.0.1` directly.

## Capacitor config

`apps/mobile/capacitor.config.ts`:

- `appId: 'dev.svelocity.tasks'`, `appName: 'Shared Tasks'` — change these for your app
- `webDir: 'dist'` — what `cap sync` copies
- `plugins.SplashScreen` — splash duration/color
- commented `server.url` — live reload (below)

v1 ships exactly three plugins: `@capacitor/app` (back button), `@capacitor/status-bar`,
`@capacitor/splash-screen`.

## Live reload on device

1. Uncomment `server: { url: 'http://<your-lan-ip>:5175', cleartext: true }` in
   `capacitor.config.ts`.
2. `pnpm dev:mobile`, then `pnpm --filter mobile sync` once, then run from
   Xcode/Android Studio.
3. **Remove it again before production builds** — shipping a `server.url` points the
   app at your dev machine.

## Safe areas and mobile UI

Handled by `@svelocity/theme/platform/mobile.css`:

- `viewport-fit=cover` + `env(safe-area-inset-*)` exposed as `--sv-safe-*` tokens
- Touch targets ≥ 44px (`--sv-touch-target: 2.75rem`)
- Hover-dependent styles disabled on touch (`@media (hover: hover)` in components)
- Android back button: register → login, otherwise OS default
  (`apps/mobile/src/lib/native.ts`)

## Adding a Capacitor plugin (outline)

1. `pnpm --filter mobile add @capacitor/<plugin>`
2. `pnpm --filter mobile sync` (installs the native side)
3. Wrap usage in `apps/mobile/src/lib/native.ts` behind a small function — keep raw
   plugin imports out of views so the shell stays thin and testable.
4. iOS/Android permission entries go in `ios/App/App/Info.plist` /
   `android/app/src/main/AndroidManifest.xml` per the plugin's docs.

## Release signing (manual)

- **Android:** generate an upload keystore and configure signing in
  `android/app/build.gradle` — [Android signing docs](https://developer.android.com/studio/publish/app-signing);
  build an `.aab` via Android Studio or `./gradlew bundleRelease` for
  [Play Console](https://play.google.com/console).
- **iOS:** set your team + bundle ID in Xcode, archive, and distribute via
  [App Store Connect](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).

Native packaging is deliberately not in CI (see
[CONTRIBUTING-STACK](https://github.com/AddeyX/Svelocity-Stack/blob/main/docs/CONTRIBUTING-STACK.md) in the stack repo).

## Debugging

- iOS WebView: Safari → Develop → Simulator/device
- Android WebView: Chrome → `chrome://inspect`
- Common failures (Gradle, blank WebView, unreachable Convex):
  [troubleshooting](troubleshooting.md)
