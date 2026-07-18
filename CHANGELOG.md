# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-07-17

### Added

- Scaffold an opinionated Svelte monorepo with web, Electron desktop, and Capacitor mobile
  shells from one command.
- Ship Shared Tasks with email/password authentication, task CRUD, ownership enforcement,
  and real-time Convex sync across platforms.
- Share strict TypeScript business logic, authentication helpers, UI components, design
  tokens, environment validation, and backend functions across every shell.
- Provide `create`, `doctor`, and `info` CLI flows with manifest-aware diagnostics.
- Include `AGENTS.md`, Cursor rules, and five bundled Svelocity workflow skills.
- Document first-project setup, architecture, Convex, authentication, UI, every platform,
  troubleshooting, and Cloudflare deployment.
- Validate manifests, generated projects, accessibility, security invariants, and live
  browser flows in repeatable release gates.

### Fixed

- Prevent pre-hydration form submissions from leaking credentials or breaking browser
  automation.
- Preserve failed task titles and offer an exact retry after network mutation failures.
- Enforce secure Electron renderer isolation, navigation handling, and external URL
  validation.
- Add web Content Security Policy and conservative response security headers.
- Correct dialog trigger focus behavior, notification semantics, and neutral badge contrast.
- Prevent live end-to-end validation from passing when Playwright silently skips tests.
- Make documented doctor commands resolve in both this repository and generated projects.

[Unreleased]: https://github.com/AddeyX/Svelocity-Stack/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/AddeyX/Svelocity-Stack/releases/tag/v1.0.0
