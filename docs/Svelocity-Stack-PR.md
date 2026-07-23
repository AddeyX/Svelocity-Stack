# Svelocity Stack

## Product Vision, End-State Architecture, and Execution Plan

**Status:** Product definition draft  
**Audience:** Maintainers, contributors, AI coding agents, and future service clients  
**Primary user:** Solo developers building and maintaining Svelte-based application ecosystems  
**License direction:** Fully open source  
**Core package manager:** pnpm  
**Core build system:** Vite  
**Primary framework:** Svelte / SvelteKit  

---

## 1. Executive Summary

Svelocity Stack is a highly opinionated, AI-ready Svelte application stack for solo developers.

It gives developers one fast path to create and maintain a connected ecosystem of:

- web applications
- desktop applications
- mobile applications

A project can begin with one target and grow into the others later without rebuilding its foundation.

Svelocity is not only a starter template.

It is a maintained operating system for building Svelte products.

The stack will provide:

- fast guided setup
- a pnpm monorepo
- shared UI, themes, assets, and application logic
- Svelte web applications backed by Convex
- Electron desktop applications
- Capacitor mobile applications
- selectable UI systems
- selectable authentication systems
- AI skill files
- sub-agents
- tool-specific instructions for Claude Code, Codex, Cursor, and generic agents
- dependency management
- diagnostics
- migrations
- production guidance
- deployment documentation

The desired outcome is simple:

> A solo developer should create, run, and compile a web, desktop, and mobile application locally in less than 30 minutes.

---

## 2. Product Mission

Svelocity exists to remove repeated setup work from Svelte application development.

Solo developers often rebuild the same foundations:

- project structure
- UI setup
- authentication
- environment handling
- platform shells
- testing
- deployment configuration
- documentation
- AI instructions
- dependency maintenance

Each repeated decision creates drag.

Svelocity makes those decisions once, encodes them, and gives users a clear path forward.

The stack should let developers spend energy on product behavior rather than plumbing.

---

## 3. Core Promises

### 3.1 Fast Setup

A developer should move from an empty directory to running applications with one guided command.

The setup should:

- explain major choices
- show progress
- validate the local environment
- install dependencies
- configure selected platforms
- generate a small working application
- run final health checks
- print clear next steps

### 3.2 Do Not Repeat Yourself

Shared concerns should live in shared packages.

Examples:

- theme tokens
- UI components
- icons
- logos
- fonts
- validation schemas
- domain models
- application services
- authentication helpers
- utilities
- testing helpers
- configuration

Web, desktop, and mobile should consume the same foundation whenever platform constraints allow it.

### 3.3 AI-Ready Workflow

AI support is part of the architecture.

It is not optional decoration.

Generated repositories should include structured instructions for:

- Claude Code
- Codex
- Cursor
- generic agents through `AGENTS.md`

The stack should also provide reusable skills and sub-agents for important workflows.

### 3.4 Maintainability Over Time

Svelocity should continue helping after project creation.

It should support:

- dependency updates
- migrations
- compatibility checks
- project diagnostics
- architecture audits
- production readiness checks
- platform additions
- deployment guidance

Creation solves day one.

Maintenance solves every day after.

---

## 4. Target User

### Primary User

Solo developers who want to:

- build quickly
- avoid repetitive setup
- maintain one connected application ecosystem
- use AI coding agents effectively
- share code across platforms
- follow strong defaults without losing control

### Secondary Users

Later versions may also serve:

- small product teams
- agencies
- internal application teams
- companies hiring Svelocity consulting services

### User Characteristics

The target user likely:

- knows JavaScript or TypeScript
- prefers Svelte
- values speed
- wants guidance
- does not want endless configuration
- may rely heavily on AI coding agents
- needs a path from prototype to production

---

## 5. Opinion Level

Svelocity will use a medium opinion level.

This means:

- defaults are strong
- structure is predetermined
- recommended tools are selected
- common workflows are encoded
- optional features can be selected or omitted
- users can replace choices later
- AI skills should help users change the stack safely

Svelocity should not become a giant matrix of every possible tool.

Choice is useful.

Too much choice becomes mud.

---

## 6. Product Shape

Svelocity supports three application targets.

### 6.1 Web

Core stack:

- SvelteKit
- Vite
- TypeScript
- Convex
- selected authentication provider
- selected UI system

Primary deployment target:

- Cloudflare

Use cases:

- SaaS applications
- dashboards
- internal tools
- customer portals
- public web applications

### 6.2 Desktop

Core stack:

- Svelte
- Vite
- Electron
- TypeScript
- shared packages from the monorepo

Use cases:

- desktop productivity applications
- local-first tools
- developer utilities
- cross-platform desktop products

Supported desktop platforms should eventually include:

- macOS
- Windows
- Linux

### 6.3 Mobile

Core stack:

- Svelte
- Vite
- Capacitor
- TypeScript
- shared packages from the monorepo

Use cases:

- iOS applications
- Android applications
- companion applications
- mobile-first products

---

## 7. Monorepo Strategy

Svelocity uses a pnpm workspace.

The monorepo can support one, two, or all three application targets.

A user may begin with:

- web only
- mobile only
- desktop only
- any combination
- all three

Adding another target later should be a first-class workflow.

Example:

```bash
svelocity add mobile
svelocity add desktop
svelocity add web
```

The CLI and skills should modify the existing project safely.

---

## 8. Proposed Repository Structure

```text
svelocity-project/
├── apps/
│   ├── web/
│   ├── desktop/
│   └── mobile/
│
├── packages/
│   ├── ui/
│   ├── theme/
│   ├── assets/
│   ├── app-core/
│   ├── auth/
│   ├── env/
│   ├── config/
│   ├── testing/
│   └── platform/
│
├── skills/
│   ├── svelocity-auth/
│   ├── svelocity-add-platform/
│   ├── svelocity-convex/
│   ├── svelocity-electron/
│   ├── svelocity-capacitor/
│   ├── svelocity-deploy/
│   ├── svelocity-upgrade/
│   └── svelocity-production-audit/
│
├── agents/
│   ├── architecture-agent.md
│   ├── auth-agent.md
│   ├── release-agent.md
│   └── dependency-agent.md
│
├── docs/
│   └── local project documentation
│
├── .svelocity/
│   ├── manifest.json
│   ├── migrations/
│   └── state/
│
├── AGENTS.md
├── CLAUDE.md
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

Not every generated project must contain every directory on day one.

The shape should grow based on selected features.

---

## 9. Responsibilities by Directory

### `apps/`

Runnable applications.

Examples:

```text
apps/web
apps/desktop
apps/mobile
```

Each application owns:

- platform entry points
- routing
- platform shell
- platform-specific configuration
- platform-only UI
- deployment configuration
- native integrations

### `packages/ui/`

Shared Svelte components.

Examples:

- buttons
- form controls
- dialogs
- menus
- navigation pieces
- cards
- feedback states
- reusable layouts

Platform-specific components should stay inside the relevant app unless a clean abstraction exists.

### `packages/theme/`

Single source of truth for visual tokens.

Includes:

- colors
- typography
- spacing
- radius
- shadows
- motion
- breakpoints
- semantic tokens
- platform adjustments

### `packages/assets/`

Shared visual and static assets.

Includes:

- logos
- icons
- fonts
- illustrations
- image files
- asset manifests

### `packages/app-core/`

Shared product logic.

Includes:

- domain models
- stores
- validation
- utilities
- application services
- shared state
- common workflows
- API wrappers

### `packages/auth/`

Shared authentication contracts and helpers.

Includes:

- session models
- user models
- route guards
- provider adapters
- client helpers
- testing helpers

### `packages/env/`

Typed environment access and validation.

Includes:

- schema definitions
- environment parsing
- public/private variable separation
- platform-specific environment contracts

### `packages/config/`

Shared configuration.

Includes:

- TypeScript configuration
- ESLint rules
- Prettier configuration
- Vite presets
- test configuration
- common build settings

### `packages/testing/`

Shared test helpers.

Includes:

- fixtures
- mock data
- authentication mocks
- platform mocks
- setup files
- shared assertions

### `packages/platform/`

Common interfaces for platform capabilities.

Possible services:

- storage
- filesystem
- clipboard
- notifications
- camera
- sharing
- network state
- secure storage
- app lifecycle
- update checks

Each app provides its platform implementation.

---

## 10. Technology Decisions

### Required Defaults

- Svelte
- SvelteKit where appropriate
- Vite
- TypeScript
- pnpm
- pnpm workspaces
- Git
- ESLint
- Prettier

### Backend

Default backend:

- Convex

Convex responsibilities may include:

- database
- real-time data
- server functions
- file storage
- user-related records
- deployment environments

### UI Selection

Users choose during setup:

1. **shadcn-svelte**
2. **Bits UI**

If shadcn-svelte is selected:

- use official shadcn-svelte CLI where practical
- keep generated components inside an agreed package
- preserve easy component addition later
- document customization rules

If Bits UI is selected:

- provide lighter primitives
- include Svelocity theme tokens
- provide a smaller working component set
- give users more visual control

### Authentication Selection

Authentication should be selected during setup.

Planned initial options:

- Better Auth
- Convex Auth

The setup flow should explain tradeoffs.

The Svelocity auth skill should guide:

- provider setup
- environment variables
- user record creation
- route protection
- login
- registration
- logout
- session handling
- OAuth
- testing
- production checks

---

## 11. CLI Experience

The CLI should feel modern, guided, bold, playful, and fast.

Proposed package:

```bash
pnpm create svelocity
```

Possible direct command:

```bash
svelocity create
```

### Initial Setup Questions

The CLI may ask:

1. Project name
2. Application targets
   - web
   - desktop
   - mobile
3. UI system
   - shadcn-svelte
   - Bits UI
4. Authentication provider
   - Better Auth
   - Convex Auth
   - none
5. Convex setup
6. AI tool targets
   - Claude Code
   - Codex
   - Cursor
   - generic `AGENTS.md`
7. Recommended skills
8. Testing level
9. Demo data
10. Git initialization

### CLI Behavior

The CLI should:

- explain major decisions briefly
- show progress clearly
- avoid noisy output
- detect existing tools
- validate Node and pnpm versions
- fail with useful messages
- recover from partial failure
- print next commands
- record selected options

### Core Commands

```bash
svelocity create
svelocity add
svelocity remove
svelocity doctor
svelocity upgrade
svelocity sync
svelocity generate
svelocity audit
svelocity info
```

### Example Add Commands

```bash
svelocity add web
svelocity add mobile
svelocity add desktop
svelocity add auth
svelocity add ui
svelocity add skill
svelocity add deployment
```

---

## 12. Project DNA

Every generated project should contain a machine-readable Svelocity manifest.

Example:

```json
{
  "stackVersion": "1.0.0",
  "createdWith": "create-svelocity",
  "targets": ["web", "desktop", "mobile"],
  "ui": "shadcn-svelte",
  "auth": "better-auth",
  "backend": "convex",
  "packageManager": "pnpm",
  "aiTargets": ["claude", "codex", "cursor", "agents"],
  "skills": [
    "svelocity-auth",
    "svelocity-add-platform",
    "svelocity-production-audit"
  ]
}
```

Location:

```text
.svelocity/manifest.json
```

This lets the CLI understand the project without guessing.

---

## 13. AI Workflow Architecture

AI support should be structured, portable, and clear.

### Supported Targets

- Claude Code
- Codex
- Cursor
- generic `AGENTS.md`

### Generated Instruction Files

Possible files:

```text
AGENTS.md
CLAUDE.md
.cursor/rules/
.codex/
skills/
agents/
```

Exact formats may evolve based on tool conventions.

### Instruction Content

Agents should understand:

- repository structure
- package ownership
- architecture boundaries
- shared-code rules
- UI conventions
- auth conventions
- Convex patterns
- platform abstraction rules
- testing expectations
- dependency policy
- production safety rules
- prohibited shortcuts

### Core Rule

AI should not merely know how to write code.

AI should know the Svelocity way to change the repository.

---

## 14. Skills

Skills are reusable operating manuals for AI agents.

They should include:

- purpose
- prerequisites
- required context
- commands
- file locations
- safe sequence
- validation steps
- rollback guidance
- completion checklist
- known risks

### Planned Official Skills

#### `svelocity-auth`

Handles:

- auth provider setup
- sessions
- route guards
- user records
- login flows
- registration flows
- OAuth
- environment setup
- testing
- security review

#### `svelocity-add-platform`

Handles:

- adding web, mobile, or desktop to existing repo
- connecting shared packages
- adding scripts
- installing dependencies
- validating builds
- updating project manifest

#### `svelocity-convex`

Handles:

- Convex setup
- schema organization
- queries
- mutations
- actions
- file storage
- environment handling
- deployment environments
- testing conventions

#### `svelocity-electron`

Handles:

- secure Electron architecture
- main/preload/renderer boundaries
- safe IPC
- local storage
- packaging
- signing
- updates
- crash reporting

#### `svelocity-capacitor`

Handles:

- Capacitor setup
- Android and iOS generation
- plugin usage
- native synchronization
- permissions
- secure storage
- release preparation

#### `svelocity-deploy`

Handles:

- Cloudflare web deployment
- Electron packaging
- desktop signing
- Android release
- iOS release
- environment configuration
- release verification

#### `svelocity-upgrade`

Handles:

- dependency updates
- Svelte migrations
- Vite migrations
- Capacitor migrations
- Electron migrations
- config changes
- codemods
- project validation

#### `svelocity-production-audit`

Checks:

- security
- environment variables
- authentication
- tests
- error states
- logging
- release configuration
- dependency health
- platform permissions
- accessibility
- deployment readiness

### Recommended External Skills

The stack may recommend compatible external skills such as:

- Caveman
- Impeccable
- useful MCP configurations

These should remain optional.

---

## 15. Sub-Agents

Sub-agents should handle focused workflows.

Possible sub-agents:

### Architecture Agent

Responsibilities:

- enforce package boundaries
- detect duplicated logic
- review platform abstractions
- protect shared architecture

### Authentication Agent

Responsibilities:

- configure auth
- audit route protection
- validate user synchronization
- check session behavior

### Dependency Agent

Responsibilities:

- inspect outdated dependencies
- group related upgrades
- read migration notes
- run compatibility checks
- prepare upgrade plans

### Release Agent

Responsibilities:

- build release artifacts
- validate environment settings
- run release checklist
- prepare store or signing steps

### Production Audit Agent

Responsibilities:

- run final checks
- identify blockers
- grade readiness
- provide exact remediation steps

---

## 16. Generated Demo Application

Each generated project should contain a small working demo.

The demo should prove the stack works.

Possible demo: **Shared Tasks**

Features:

- login
- logout
- task list
- create task
- update task
- delete task
- real-time synchronization
- shared theme
- shared UI
- shared validation
- loading state
- empty state
- error state
- offline indicator
- platform information
- responsive layouts

The same core product should run in:

- browser
- Electron
- Capacitor

The demo should be small enough to remove.

It should be complete enough to teach.

---

## 17. Shared Styling Strategy

Web, desktop, and mobile should draw from one design system.

### Shared Sources

```text
packages/theme
packages/ui
packages/assets
```

### Principles

- semantic tokens over raw values
- shared components where practical
- platform shells remain local
- responsive behavior documented
- mobile-safe spacing
- desktop navigation patterns
- accessible defaults
- shared icons
- shared typography
- shared motion rules

### Theme Consumption

Each target imports the same foundation.

Example:

```ts
import "@svelocity/theme/tokens.css";
```

### Platform Overrides

Allow controlled overrides for:

- safe areas
- desktop window controls
- mobile touch targets
- hover states
- native-feeling navigation
- reduced motion
- platform typography differences

---

## 18. Visual Personality

Svelocity itself should feel:

- bold
- playful
- fast
- energetic
- clear
- modern
- technical without feeling cold

The product should visually communicate momentum.

Design ideas:

- strong typography
- sharp hierarchy
- quick motion
- compact but readable layouts
- confident prompts
- vivid progress states
- memorable command-line identity
- clear success and failure symbols

Avoid:

- corporate blandness
- excessive decoration
- slow animations
- dense setup screens
- vague language
- overlong explanations

---

## 19. Dependency Management

Dependency handling is a central product feature.

### pnpm Catalogs

Use `pnpm-workspace.yaml` as the main version registry.

Example:

```yaml
packages:
  - apps/*
  - packages/*

catalog:
  svelte: 5.x.x
  vite: 8.x.x
  typescript: 6.x.x

catalogs:
  capacitor:
    "@capacitor/core": 8.x.x
    "@capacitor/cli": 8.x.x
    "@capacitor/android": 8.x.x
    "@capacitor/ios": 8.x.x

  electron:
    electron: 40.x.x
```

Packages reference catalog entries.

### Workspace Protocol

Internal packages use:

```json
{
  "dependencies": {
    "@svelocity/ui": "workspace:*",
    "@svelocity/theme": "workspace:*"
  }
}
```

### Compatibility Matrix

Svelocity should publish tested version combinations.

Example:

```text
Svelocity 1.x
Node 24
pnpm 11
Svelte 5
Vite 8
Capacitor 8
Electron 40
Convex tested release range
```

### Update Policy

Suggested policy:

- security updates: immediate
- patch updates: grouped and frequent
- minor updates: grouped and tested
- major updates: migration release
- core ecosystem versions: tightly controlled
- small utilities: normal compatible ranges

### Renovate

Use Renovate for:

- grouped dependency pull requests
- scheduled updates
- ecosystem-specific update groups
- security updates
- automated patch merging after CI
- shared configuration preset

Suggested groups:

- Svelte
- Vite
- Convex
- Capacitor
- Electron
- UI
- testing
- linting
- TypeScript

### Lockfile

Commit `pnpm-lock.yaml`.

All continuous integration installs should use:

```bash
pnpm install --frozen-lockfile
```

---

## 20. Diagnostics and Upgrades

### `svelocity doctor`

Checks:

- Node version
- pnpm version
- workspace integrity
- dependency conflicts
- missing environment variables
- broken package links
- Convex configuration
- auth configuration
- Capacitor state
- Electron configuration
- missing native tools
- stale generated files
- manifest mismatches
- build health
- test health

Example result:

```text
Environment        PASS
Workspace          PASS
Convex             PASS
Authentication     WARNING
Electron           PASS
Capacitor          FAIL
Dependencies       WARNING
```

### `svelocity upgrade`

Should:

1. Read project manifest
2. Detect current stack version
3. Build migration plan
4. Back up affected files
5. update dependencies
6. run official migrations
7. run Svelocity codemods
8. update configurations
9. run checks
10. report manual work

### Migration Structure

```text
.svelocity/migrations/
001-theme-layout.ts
002-auth-session-contract.ts
003-capacitor-major-upgrade.ts
```

Each migration should:

- detect
- explain
- transform
- validate
- report
- avoid destructive overwrites

---

## 21. Testing Strategy

Testing should be included from the beginning.

### Default Tools

- Vitest
- Playwright
- Svelte component testing
- TypeScript checks
- ESLint
- accessibility checks

### Test Layers

#### Unit Tests

For:

- utilities
- validation
- stores
- domain logic
- platform contracts

#### Component Tests

For:

- shared UI
- forms
- loading states
- error states
- interactive controls

#### End-to-End Tests

For:

- authentication
- core demo flow
- desktop smoke test
- mobile browser-level smoke test
- web deployment build

#### Template Generation Tests

Every supported template combination should be generated in CI.

Examples:

- web only
- desktop only
- mobile only
- web + mobile
- web + desktop
- all targets
- shadcn-svelte
- Bits UI
- Better Auth
- Convex Auth
- no auth where supported

Then run:

```bash
pnpm install --frozen-lockfile
pnpm -r check
pnpm -r test
pnpm -r build
```

Template rot must be caught before release.

---

## 22. Environment Management

Svelocity should provide typed environment variables.

Needs:

- local development
- preview
- staging
- production
- public values
- secret values
- platform-specific values
- validation at startup
- example files
- clear error output

Possible structure:

```text
.env.example
.env.local
apps/web/.env.example
apps/desktop/.env.example
apps/mobile/.env.example
packages/env/
```

Secrets must never be exposed to client bundles.

---

## 23. Security Baseline

Production safety should be encoded in templates and skills.

### Web

- secure auth cookies
- validated server input
- authorization checks
- environment separation
- safe redirects
- content security guidance
- rate-limit guidance where relevant

### Electron

- context isolation
- no unsafe renderer Node access
- narrow IPC surface
- validated IPC messages
- safe storage for secrets
- signed releases
- update verification

### Capacitor

- safe native permissions
- secure credential storage
- platform configuration guidance
- deep-link validation
- release signing guidance
- plugin review

### Dependency Security

- automated vulnerability checks
- security update policy
- lockfile integrity
- dependency audit workflow
- production audit skill

---

## 24. Production Experience

Svelocity should cover common application states.

Shared patterns should exist for:

- loading
- empty
- error
- offline
- unauthorized
- forbidden
- not found
- maintenance
- update required
- syncing
- stale data
- destructive confirmation

These should exist as reusable UI and application patterns.

---

## 25. Observability

Later versions should provide optional observability setup.

Possible areas:

- structured logging
- error tracking
- performance monitoring
- Electron crash reporting
- release version tagging
- user-safe diagnostics
- debug export

Observability should be optional but easy to add.

---

## 26. Offline and Synchronization

Offline support is valuable but should not block the first release.

Future support may include:

- connection detection
- queued writes
- optimistic updates
- retry policy
- conflict resolution
- sync indicators
- offline-safe local storage
- platform-aware storage adapters

The stack must clearly distinguish:

- Convex real-time synchronization
- local application storage
- offline write synchronization
- asset synchronization

---

## 27. Deployment and Release Documentation

The documentation website should hold the user's hand from local build to release.

### Web Deployment

Primary guide:

- Cloudflare

Guide should include:

- account setup
- environment variables
- Convex deployment
- build settings
- preview deployment
- custom domain
- production verification

### Electron Release

Guide should include:

- packaging
- installers
- application icons
- versioning
- macOS signing
- notarization
- Windows signing
- Linux packaging
- auto-update setup
- release channels

### Android Release

Guide should include:

- Android Studio setup
- local build
- device testing
- package naming
- icons
- permissions
- signing keys
- Play Console
- release bundle
- store listing
- production rollout

### iOS Release

Guide should include:

- Xcode setup
- simulator testing
- device testing
- bundle identifier
- certificates
- provisioning
- App Store Connect
- TestFlight
- review submission
- production release

The stack does not need to automate every external account step.

It must make every step understandable.

---

## 28. Documentation Website

Svelocity should eventually have one complete documentation website.

Main sections:

1. Introduction
2. Installation
3. First Project
4. Repository Architecture
5. Web
6. Desktop
7. Mobile
8. Convex
9. Authentication
10. UI Systems
11. Shared Packages
12. AI Skills
13. Sub-Agents
14. Testing
15. Dependency Management
16. Upgrades
17. Deployment
18. Production Audits
19. Troubleshooting
20. Contributing

Documentation should include:

- short explanations
- exact commands
- copyable recipes
- architecture diagrams
- common failures
- completion checklists
- links between related tasks

---

## 29. Open Source and Business Direction

Svelocity will be fully open source.

Possible future business:

- implementation services
- architecture services
- company onboarding
- custom application foundations
- migration work
- production hardening
- training
- support contracts

Open source builds trust.

Services monetize expertise.

The stack should remain useful without paid access.

---

## 30. V1 Success Criteria

A solo developer should be able to:

1. Run `pnpm create svelocity` and receive the single golden-path repository
2. Configure Convex and typed environment variables from the in-repo guides
3. Run Shared Tasks in the browser with Convex Auth and real-time task sync
4. Run the same Shared Tasks experience in Electron
5. Build and sync the Capacitor shell for iOS or Android
6. Use Bits UI components through the shared `packages/ui` package
7. Use `AGENTS.md`, the Cursor rule, and five bundled Svelocity skills
8. Run `svelocity doctor` with all critical checks passing
9. Run workspace checks, tests, and builds successfully
10. Deploy the web shell to Cloudflare using the deployment guide

Target time:

> Less than 30 minutes on a properly prepared machine.

V1 deliberately ships one supported combination: Bits UI, Convex Auth, Convex, and all
three platform shells. Alternative UI/auth choices, platform-add/upgrade commands, and
automated native-store distribution are deferred until after V1.

### V1 Build Commands

The exact commands may evolve, but should feel like:

```bash
pnpm create svelocity
pnpm dev
pnpm --filter web dev
pnpm --filter desktop dev
pnpm --filter mobile dev
pnpm -r check
pnpm -r build
```

---

## 31. Non-Goals for V1

Avoid boiling ocean.

V1 should not require:

- every authentication provider
- every deployment host
- every database
- advanced offline conflict resolution
- complete store submission automation
- every Electron updater
- every Capacitor plugin
- full enterprise governance
- visual page builder
- plugin marketplace
- cloud-hosted management dashboard

V1 must prove the core road works.

---

## 32. Execution Phases

# Phase 0 — Product Definition

### Goal

Lock product boundaries before code expands.

### Deliverables

- product requirements
- architecture decision records
- supported version matrix
- CLI command map
- repository conventions
- V1 scope
- explicit non-goals
- naming conventions
- licensing decision
- contribution model

### Exit Criteria

- core stack choices approved
- V1 target combinations defined
- demo application chosen
- release definition written

---

# Phase 1 — Foundation Monorepo

### Goal

Create stable internal development foundation.

### Deliverables

- pnpm workspace
- root scripts
- TypeScript configs
- ESLint
- Prettier
- Vitest
- Playwright
- package structure
- Changesets
- CI
- Renovate
- compatibility matrix
- project manifest schema

### Initial Packages

```text
packages/config
packages/theme
packages/assets
packages/app-core
packages/testing
```

### Exit Criteria

- clean install works
- root checks pass
- internal packages build
- release tooling works
- CI validates pull requests

---

# Phase 2 — Web Reference Application

### Goal

Build best-understood target first.

### Deliverables

- SvelteKit web app
- Convex setup
- selected auth integration
- both UI paths prototyped
- shared theme
- shared assets
- shared application core
- demo application
- web tests
- Cloudflare development deployment guide

### Why First

Web has least native friction.

It becomes reference behavior for desktop and mobile.

### Exit Criteria

- demo works end to end
- auth works
- Convex works
- UI selection works
- production build works
- Cloudflare guide verified

---

# Phase 3 — Shared Design and UI System

### Goal

Make cross-platform reuse real.

### Deliverables

- token architecture
- theme package
- asset package
- shared component package
- platform override rules
- accessibility baseline
- standard application states
- component documentation
- shadcn-svelte integration path
- Bits UI integration path

### Exit Criteria

- same theme loads in all reference targets
- shared components render consistently
- platform-specific differences remain controlled
- users can add components later

---

# Phase 4 — Electron Target

### Goal

Add secure desktop application support.

### Deliverables

- Electron app
- main/preload/renderer separation
- shared UI consumption
- shared application logic
- secure IPC wrapper
- desktop storage adapter
- desktop menu
- window controls
- packaging
- smoke tests
- signing documentation
- updater architecture placeholder

### Exit Criteria

- desktop app runs locally
- desktop app compiles
- shared demo works
- security checklist passes
- packaging guide verified on at least one platform

---

# Phase 5 — Capacitor Target

### Goal

Add iOS and Android application support.

### Deliverables

- Capacitor app
- Android project
- iOS project
- shared UI consumption
- shared application logic
- safe area handling
- mobile navigation shell
- storage adapter
- lifecycle handling
- native sync scripts
- local build documentation
- permissions guidance

### Exit Criteria

- mobile app runs locally
- Android compiles
- iOS project compiles on supported macOS environment
- shared demo works
- platform setup guide verified

---

# Phase 6 — CLI

### Goal

Turn manual setup into guided product experience.

### Deliverables

- `create-svelocity`
- project questions
- progress display
- environment detection
- template composition
- manifest generation
- target selection
- UI selection
- auth selection
- AI target generation
- skill installation
- post-install checks
- useful failure recovery

### Additional Commands

- `svelocity add`
- `svelocity doctor`
- `svelocity info`

### Exit Criteria

- fresh project can be generated cleanly
- all supported combinations are tested
- failure messages are actionable
- setup time meets target

---

# Phase 7 — AI Skills and Agents

### Goal

Make repository safe and productive for AI coding.

### Deliverables

- `AGENTS.md`
- Claude instructions
- Codex instructions
- Cursor rules
- initial official skills
- initial sub-agents
- architecture guardrails
- production safety checklists
- platform addition workflow
- auth workflow
- dependency workflow

### Minimum Skills

- auth
- add platform
- Convex
- Electron
- Capacitor
- production audit

### Exit Criteria

- each supported AI tool can understand repo
- auth can be configured using skill
- a new platform can be added using skill
- production audit produces useful findings

---

# Phase 8 — Maintenance System

### Goal

Keep projects healthy after generation.

### Deliverables

- `svelocity doctor`
- `svelocity upgrade`
- migration framework
- codemods
- pnpm catalogs
- Renovate preset
- compatibility checks
- dependency grouping
- release notes
- upgrade documentation
- backup and rollback behavior

### Exit Criteria

- project can upgrade between two Svelocity versions
- dependency drift is detected
- migrations do not blindly overwrite user work
- upgrade reports manual steps clearly

---

# Phase 9 — Documentation Website

### Goal

Guide user from zero to production.

### Deliverables

- full docs site
- first-project tutorial
- architecture guide
- AI workflow guide
- auth guide
- UI guide
- web deployment guide
- Electron packaging and signing guide
- Android release guide
- iOS release guide
- troubleshooting
- production checklist

### Exit Criteria

- new user completes setup using docs only
- each deployment path has verified steps
- common errors have dedicated answers

---

# Phase 10 — Hardening and V1 Release

### Goal

Prove reliability before public launch.

### Deliverables

- full template matrix CI
- security audit
- accessibility audit
- performance baseline
- cold install testing
- Windows testing
- macOS testing
- Linux testing
- Android testing
- iOS testing
- release candidate
- public examples
- contribution guide
- launch documentation

### Exit Criteria

- all V1 success criteria pass
- fresh users complete local setup under 30 minutes
- all target builds compile
- known limitations documented
- stable release published

---

# Phase 11 — Post-V1 Expansion

### Possible Features

- observability skill
- offline synchronization
- payments
- push notifications
- file storage recipes
- update automation
- hosted diagnostics
- plugin or recipe registry
- more auth providers
- more deployment providers
- team workflows
- enterprise support
- consulting packages

These should follow real user demand.

---

## 33. Suggested Build Order

Recommended sequence:

```text
1. Product definition
2. Foundation monorepo
3. Web reference app
4. Shared theme and UI
5. Electron target
6. Capacitor target
7. CLI
8. AI skills and agents
9. Doctor and upgrade system
10. Documentation website
11. Hardening
12. Public V1
```

Do not build CLI first.

First prove manual path.

Then automate known truth.

---

## 34. Main Risks

### Risk: Scope Explosion

Three platforms, auth, backend, UI, AI, and releases create large surface.

Mitigation:

- keep V1 strict
- build web first
- keep one demo
- support limited choices
- delay advanced offline features

### Risk: Template Rot

Framework and native ecosystems change quickly.

Mitigation:

- full generation matrix in CI
- Renovate
- compatibility matrix
- migration releases
- doctor command
- official tools underneath Svelocity where possible

### Risk: False Cross-Platform Abstraction

Not every component or service should be shared.

Mitigation:

- share contracts and logic
- keep platform shells local
- allow platform-specific UI
- document abstraction boundaries

### Risk: AI Instructions Become Stale

Old skills can guide agents toward broken patterns.

Mitigation:

- version skills
- test important skill flows
- tie skill versions to stack versions
- include compatibility metadata
- audit generated instructions during releases

### Risk: Too Many Setup Choices

A large wizard weakens speed.

Mitigation:

- strong recommended defaults
- small number of meaningful selections
- advanced options hidden
- presets for common project shapes

### Risk: Native Tooling Friction

iOS, Android, Electron signing, and stores require external setup.

Mitigation:

- detect missing tools
- provide precise docs
- separate local compile success from release readiness
- give checklists and diagnostic commands

---

## 35. Core Product Rules

1. One ecosystem, not disconnected templates.
2. Shared code by default.
3. Platform-specific code only where needed.
4. AI instructions are versioned product assets.
5. Production safety lives in templates, skills, checks, and docs.
6. Svelocity should use official tooling where possible.
7. Project state must be machine-readable.
8. Upgrades must preserve user work.
9. Generated examples must compile.
10. Setup speed must not destroy maintainability.
11. Documentation must lead to finish line.
12. Open source core must remain fully useful.

---

## 36. End-State Vision

At full maturity, a developer should be able to run:

```bash
pnpm create svelocity
```

Then select:

```text
Web
Desktop
Mobile
shadcn-svelte or Bits UI
Better Auth or Convex Auth
Claude Code
Codex
Cursor
AGENTS.md
Recommended skills
```

Svelocity generates one coherent repository.

The developer gets:

- running applications
- shared UI
- shared design tokens
- shared assets
- shared logic
- Convex backend
- authentication
- testing
- AI instructions
- production skills
- dependency policy
- diagnostics
- migration support
- deployment guides

Later, the developer can run:

```bash
svelocity doctor
svelocity add mobile
svelocity upgrade
svelocity audit production
```

The stack should keep guiding project as it grows.

Fast start.

One foundation.

Many surfaces.

Less repetition.

More product.

---

## 37. Final Product Statement

Svelocity Stack is an opinionated, AI-ready Svelte monorepo system for solo developers building web, desktop, and mobile products.

It reduces setup time, prevents repeated work, shares important code across platforms, and gives AI agents clear instructions for maintaining the system safely.

Its value is not only that it starts applications quickly.

Its deeper value is that it keeps the entire application ecosystem moving in one direction.
