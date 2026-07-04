# Phase 2 — Shared UI + Theme

**Goal:** Build the cross-platform design system — tokens, Bits UI primitives, and reusable components that all three apps will consume.  
**Prerequisites:** Phase 1 complete  
**Priority:** Highest — blocks all app templates  
**Estimated effort:** 5–8 days

---

## Exit Criteria

- [x] `@svelocity/theme` exports semantic CSS tokens usable by all apps
- [x] `@svelocity/ui` exports a working component set built on Bits UI
- [x] Components render correctly in a Storybook-like preview or minimal test app
- [x] Loading, empty, error, and unauthorized states exist as shared components
- [x] Accessibility baseline passes for shared components (keyboard, ARIA, contrast)
- [x] Web, desktop, and mobile apps can import the same theme + UI without changes

---

## 2.1 — Theme Token Architecture

- [x] Define token categories in `packages/theme/`:
  - [x] Colors (primitive + semantic)
  - [x] Typography (font families, sizes, weights, line heights)
  - [x] Spacing scale
  - [x] Border radius
  - [x] Shadows
  - [x] Motion (duration, easing)
  - [x] Breakpoints
  - [x] Z-index scale
- [x] Create `tokens.css` with CSS custom properties
- [x] Create `tokens.ts` for programmatic access where needed
- [x] Support light mode as v1 default
- [x] Add dark mode tokens (structure now, polish in Phase 10)
- [x] Document token naming: `--sv-color-*`, `--sv-space-*`, etc.

## 2.2 — Svelocity Visual Identity

- [x] Define brand colors aligned with "bold, playful, fast" personality
- [x] Choose primary typeface(s) — web-safe + optional custom font
- [x] Define default border radius and shadow style
- [x] Create motion presets (fast, subtle transitions)
- [x] Add `packages/theme/README.md` with usage examples

## 2.3 — Bits UI Integration

- [x] Install Bits UI as dependency of `@svelocity/ui`
- [x] Audit which Bits UI primitives to wrap for v1:
  - [x] Button
  - [x] Input / Textarea
  - [x] Label
  - [x] Checkbox
  - [x] Dialog / Alert Dialog
  - [x] Dropdown Menu
  - [x] Tabs
  - [x] Toast / Sonner (or equivalent)
  - [x] Avatar
  - [x] Badge
  - [x] Card
  - [x] Separator
  - [x] Skeleton
- [x] Create wrapper pattern: Bits primitive + Svelocity tokens + consistent API
- [x] Document how to add new Bits UI components later

## 2.4 — Core Components (`@svelocity/ui`)

### Form controls

- [x] `Button.svelte` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
- [x] `Input.svelte` — with label, error state, disabled state
- [x] `Textarea.svelte`
- [x] `Checkbox.svelte`
- [x] `Label.svelte`
- [x] `FormField.svelte` — label + control + error message wrapper

### Layout

- [x] `Card.svelte` — header, body, footer slots
- [x] `Container.svelte` — max-width responsive wrapper
- [x] `Stack.svelte` — vertical spacing utility component
- [x] `Separator.svelte`

### Feedback

- [x] `Alert.svelte` — info, warning, error, success
- [x] `Badge.svelte`
- [x] `Skeleton.svelte`
- [x] `Spinner.svelte`
- [x] `Toast.svelte` or toast provider setup

### Overlays

- [x] `Dialog.svelte` — modal with title, description, actions
- [x] `AlertDialog.svelte` — destructive confirmation
- [x] `DropdownMenu.svelte`

### Navigation

- [x] `Tabs.svelte`
- [x] `NavLink.svelte` — active state styling

## 2.5 — Application State Components

These are critical for the Shared Tasks demo and production patterns.

- [x] `LoadingState.svelte` — centered spinner + optional message
- [x] `EmptyState.svelte` — icon, title, description, optional action
- [x] `ErrorState.svelte` — error message + retry action
- [x] `UnauthorizedState.svelte` — redirect/login prompt
- [x] `OfflineIndicator.svelte` — connection status banner (stub for v1)

## 2.6 — Icons and Assets (Minimal)

- [x] Choose icon strategy: Lucide Svelte or inline SVG set
- [x] Add logo placeholder SVG in theme or ui package
- [x] Export icon re-exports from `@svelocity/ui`
- [x] Defer full `packages/assets` — inline essentials only

## 2.7 — Platform Override Rules

- [x] Document which components are shared vs app-local
- [x] Add `platform.css` or token overrides for:
  - [x] Safe area insets (mobile)
  - [x] Touch target minimum size (mobile)
  - [x] Hover states (desktop/web only)
  - [x] Window chrome spacing (Electron)
- [x] Create `packages/theme/platform/` override files

## 2.8 — Component API Conventions

- [x] Standardize prop naming: `variant`, `size`, `disabled`, `class`
- [x] Use Svelte 5 runes (`$props`, `$bindable`) consistently
- [x] Export all components from `packages/ui/src/index.ts`
- [x] Add JSDoc comments on public props
- [x] No business logic in UI components — presentation only

## 2.9 — Styling Approach

- [x] Decide: Tailwind v4, vanilla CSS, or hybrid
- [x] If Tailwind: shared preset in `@svelocity/config`
- [x] Ensure tokens map to Tailwind theme extension if used
- [x] Components use semantic tokens, not hardcoded hex values
- [x] Verify tree-shaking / no duplicate CSS across apps

## 2.10 — Component Testing

- [x] Add Vitest + @testing-library/svelte for UI package
- [x] Test Button renders and handles click
- [x] Test Input binds value and shows error
- [x] Test Dialog opens/closes with keyboard (Escape)
- [x] Test LoadingState, EmptyState, ErrorState render correctly
- [ ] Add accessibility snapshot or axe check for core components

## 2.11 — Preview / Dev Sandbox

- [x] Create minimal preview app or Storybook in `packages/ui/`
- [x] Show all components with variants
- [x] Show application state components
- [x] Show theme token swatches
- [x] Run with `pnpm --filter @svelocity/ui dev` (or similar)

## 2.12 — Package Build and Exports

- [x] Configure `package.json` exports map for components
- [x] Export `@svelocity/theme/tokens.css` as subpath
- [x] Verify Svelte package compilation if publishing internally
- [x] Test import from a stub consumer:
  ```ts
  import '@svelocity/theme/tokens.css';
  import { Button, Card, LoadingState } from '@svelocity/ui';
  ```

## 2.13 — Documentation

- [x] `packages/ui/README.md` — component list, usage, adding new components
- [x] `packages/theme/README.md` — token reference
- [x] Document Bits UI customization rules
- [x] Document accessibility expectations per component

## 2.14 — Verification

- [x] All components render without console errors
- [x] Theme loads in isolation and in a consuming stub
- [x] No `@svelocity/ui` imports from apps (only from packages — apps import ui)
- [x] `pnpm --filter @svelocity/ui test` passes
- [x] Phase 3 (web app) todo reviewed and unblocked
