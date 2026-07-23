# V1 Known Limitations

Svelocity Stack 1.0 provides one tested golden path: SvelteKit, Electron, Capacitor, Bits
UI, Convex, and Convex Auth. Following limits are intentional V1 scope boundaries.

## Stack Choices

- Bits UI is only supported component system. shadcn-svelte is planned for V1.1.
- Convex Auth is only supported authentication system. Better Auth and OAuth recipes are
  planned for V1.1.
- Convex is only supported backend.
- Dark design tokens exist, but no user-facing dark-mode toggle ships in V1.

## CLI and Upgrades

- CLI supports `create`, `doctor`, and `info`.
- `svelocity add`, `upgrade`, `sync`, `generate`, and `audit` are not available.
- Add another platform manually with bundled `svelocity-add-platform` skill.
- Update dependencies manually; V1 has no stack migration or codemod system.

## Desktop and Mobile Distribution

- Electron packaging is configured, but code signing and auto-update are not automated.
- Play Store, App Store, and TestFlight submission are not automated.
- iOS compilation requires macOS and Xcode.
- Android compilation requires Android Studio or a configured Android SDK.
- Native app icons and store metadata remain project-owner responsibilities.

## Runtime Behavior

- Task sync requires a network connection. Offline mutation queues and conflict resolution
  are not implemented.
- Sessions use Convex Auth tokens in browser/WebView local storage as documented in ADR 0002. Cross-platform sign-out does not invalidate unrelated local clients instantly.
- Observability, error tracking, analytics, and production logging integrations are not
  included.

## Operations and Documentation

- Cloudflare is documented deployment target for web; other hosts need adapter changes.
- Repository docs replace a dedicated documentation website.
- Dependency update automation such as Renovate is not included.
- `packages/platform` and shared test-fixture abstractions are deferred.
- Formal Lighthouse throttling, desktop launch-time, and emulator load-time baselines are
  environment-specific release checks and are not enforced by the V1 automated suite.

See [V1.1 backlog](V1.1-BACKLOG.md) for planned follow-up work.
