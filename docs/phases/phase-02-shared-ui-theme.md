# Phase 2 — Shared UI + Theme

**Goal:** Build the cross-platform design system — tokens, Bits UI primitives, and reusable components that all three apps will consume.  
**Prerequisites:** Phase 1 complete  
**Priority:** Highest — blocks all app templates  
**Estimated effort:** 5–8 days

---

## Exit Criteria

- [ ] `@svelocity/theme` exports semantic CSS tokens usable by all apps
- [ ] `@svelocity/ui` exports a working component set built on Bits UI
- [ ] Components render correctly in a Storybook-like preview or minimal test app
- [ ] Loading, empty, error, and unauthorized states exist as shared components
- [ ] Accessibility baseline passes for shared components (keyboard, ARIA, contrast)
- [ ] Web, desktop, and mobile apps can import the same theme + UI without changes

---

## 2.1 — Theme Token Architecture

- [ ] Define token categories in `packages/theme/`:
  - [ ] Colors (primitive + semantic)
  - [ ] Typography (font families, sizes, weights, line heights)
  - [ ] Spacing scale
  - [ ] Border radius
  - [ ] Shadows
  - [ ] Motion (duration, easing)
  - [ ] Breakpoints
  - [ ] Z-index scale
- [ ] Create `tokens.css` with CSS custom properties
- [ ] Create `tokens.ts` for programmatic access where needed
- [ ] Support light mode as v1 default
- [ ] Add dark mode tokens (structure now, polish in Phase 10)
- [ ] Document token naming: `--sv-color-*`, `--sv-space-*`, etc.

## 2.2 — Svelocity Visual Identity

- [ ] Define brand colors aligned with "bold, playful, fast" personality
- [ ] Choose primary typeface(s) — web-safe + optional custom font
- [ ] Define default border radius and shadow style
- [ ] Create motion presets (fast, subtle transitions)
- [ ] Add `packages/theme/README.md` with usage examples

## 2.3 — Bits UI Integration

- [ ] Install Bits UI as dependency of `@svelocity/ui`
- [ ] Audit which Bits UI primitives to wrap for v1:
  - [ ] Button
  - [ ] Input / Textarea
  - [ ] Label
  - [ ] Checkbox
  - [ ] Dialog / Alert Dialog
  - [ ] Dropdown Menu
  - [ ] Tabs
  - [ ] Toast / Sonner (or equivalent)
  - [ ] Avatar
  - [ ] Badge
  - [ ] Card
  - [ ] Separator
  - [ ] Skeleton
- [ ] Create wrapper pattern: Bits primitive + Svelocity tokens + consistent API
- [ ] Document how to add new Bits UI components later

## 2.4 — Core Components (`@svelocity/ui`)

### Form controls

- [ ] `Button.svelte` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
- [ ] `Input.svelte` — with label, error state, disabled state
- [ ] `Textarea.svelte`
- [ ] `Checkbox.svelte`
- [ ] `Label.svelte`
- [ ] `FormField.svelte` — label + control + error message wrapper

### Layout

- [ ] `Card.svelte` — header, body, footer slots
- [ ] `Container.svelte` — max-width responsive wrapper
- [ ] `Stack.svelte` — vertical spacing utility component
- [ ] `Separator.svelte`

### Feedback

- [ ] `Alert.svelte` — info, warning, error, success
- [ ] `Badge.svelte`
- [ ] `Skeleton.svelte`
- [ ] `Spinner.svelte`
- [ ] `Toast.svelte` or toast provider setup

### Overlays

- [ ] `Dialog.svelte` — modal with title, description, actions
- [ ] `AlertDialog.svelte` — destructive confirmation
- [ ] `DropdownMenu.svelte`

### Navigation

- [ ] `Tabs.svelte`
- [ ] `NavLink.svelte` — active state styling

## 2.5 — Application State Components

These are critical for the Shared Tasks demo and production patterns.

- [ ] `LoadingState.svelte` — centered spinner + optional message
- [ ] `EmptyState.svelte` — icon, title, description, optional action
- [ ] `ErrorState.svelte` — error message + retry action
- [ ] `UnauthorizedState.svelte` — redirect/login prompt
- [ ] `OfflineIndicator.svelte` — connection status banner (stub for v1)

## 2.6 — Icons and Assets (Minimal)

- [ ] Choose icon strategy: Lucide Svelte or inline SVG set
- [ ] Add logo placeholder SVG in theme or ui package
- [ ] Export icon re-exports from `@svelocity/ui`
- [ ] Defer full `packages/assets` — inline essentials only

## 2.7 — Platform Override Rules

- [ ] Document which components are shared vs app-local
- [ ] Add `platform.css` or token overrides for:
  - [ ] Safe area insets (mobile)
  - [ ] Touch target minimum size (mobile)
  - [ ] Hover states (desktop/web only)
  - [ ] Window chrome spacing (Electron)
- [ ] Create `packages/theme/platform/` override files

## 2.8 — Component API Conventions

- [ ] Standardize prop naming: `variant`, `size`, `disabled`, `class`
- [ ] Use Svelte 5 runes (`$props`, `$bindable`) consistently
- [ ] Export all components from `packages/ui/src/index.ts`
- [ ] Add JSDoc comments on public props
- [ ] No business logic in UI components — presentation only

## 2.9 — Styling Approach

- [ ] Decide: Tailwind v4, vanilla CSS, or hybrid
- [ ] If Tailwind: shared preset in `@svelocity/config`
- [ ] Ensure tokens map to Tailwind theme extension if used
- [ ] Components use semantic tokens, not hardcoded hex values
- [ ] Verify tree-shaking / no duplicate CSS across apps

## 2.10 — Component Testing

- [ ] Add Vitest + @testing-library/svelte for UI package
- [ ] Test Button renders and handles click
- [ ] Test Input binds value and shows error
- [ ] Test Dialog opens/closes with keyboard (Escape)
- [ ] Test LoadingState, EmptyState, ErrorState render correctly
- [ ] Add accessibility snapshot or axe check for core components

## 2.11 — Preview / Dev Sandbox

- [ ] Create minimal preview app or Storybook in `packages/ui/`
- [ ] Show all components with variants
- [ ] Show application state components
- [ ] Show theme token swatches
- [ ] Run with `pnpm --filter @svelocity/ui dev` (or similar)

## 2.12 — Package Build and Exports

- [ ] Configure `package.json` exports map for components
- [ ] Export `@svelocity/theme/tokens.css` as subpath
- [ ] Verify Svelte package compilation if publishing internally
- [ ] Test import from a stub consumer:
  ```ts
  import '@svelocity/theme/tokens.css';
  import { Button, Card, LoadingState } from '@svelocity/ui';
  ```

## 2.13 — Documentation

- [ ] `packages/ui/README.md` — component list, usage, adding new components
- [ ] `packages/theme/README.md` — token reference
- [ ] Document Bits UI customization rules
- [ ] Document accessibility expectations per component

## 2.14 — Verification

- [ ] All components render without console errors
- [ ] Theme loads in isolation and in a consuming stub
- [ ] No `@svelocity/ui` imports from apps (only from packages — apps import ui)
- [ ] `pnpm --filter @svelocity/ui test` passes
- [ ] Phase 3 (web app) todo reviewed and unblocked
