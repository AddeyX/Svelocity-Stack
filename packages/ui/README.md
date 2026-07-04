# @svelocity/ui

Shared Svelte 5 components for all three app shells. Bits UI primitives + Svelocity
tokens, vanilla scoped CSS — no Tailwind dependency (ADR 0001).

## Usage

```svelte
<script lang="ts">
	import '@svelocity/theme/tokens.css';
	import { Button, Card, FormField, Input, LoadingState, toast, Toaster } from '@svelocity/ui';
</script>
```

Consumed as a **source package** (ADR 0004) — the app's Vite pipeline compiles it, so
every app needs `@sveltejs/vite-plugin-svelte`.

## Components

| Group      | Components                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| Form       | `Button`, `Input`, `Textarea`, `Checkbox`, `Label`, `FormField`                       |
| Layout     | `Card`, `Container`, `Stack`, `Separator`                                             |
| Feedback   | `Alert`, `Badge`, `Skeleton`, `Spinner`, `Toaster` + `toast` store                    |
| Overlays   | `Dialog`, `AlertDialog`, `DropdownMenu`                                               |
| Navigation | `Tabs`, `NavLink`, `Avatar`                                                           |
| App states | `LoadingState`, `EmptyState`, `ErrorState`, `UnauthorizedState`, `OfflineIndicator`   |
| Icons      | `IconCheck`, `IconPlus`, `IconTrash`, … (curated Lucide re-exports in `src/icons.ts`) |

## Conventions

- Props: `variant`, `size`, `disabled`, `class` — consistent across components.
- Svelte 5 runes only (`$props`, `$bindable`, `$derived`); no legacy syntax.
- Presentation only — **no business logic**; that lives in `@svelocity/app-core`.
- Styling: semantic tokens (`var(--sv-*)`) only, no hex values. Hover rules go behind
  `@media (hover: hover)` so touch platforms stay clean.
- Class names on portalled/bits-rendered elements use the `sv-` prefix with
  `:global(...)` (or shared CSS in `src/styles/`) since Svelte can't scope into
  bits-ui's DOM.

## Adding a new Bits UI wrapper

1. Read the primitive's docs (`bits-ui` skill or upstream).
2. Create `src/components/<Name>.svelte`, wrap the primitive, style with tokens.
3. Keep the API small: expose what the demo needs, forward the rest via `...rest`.
4. Export from `src/index.ts`, add a spec file, show it in `preview/Preview.svelte`.

## Accessibility expectations

- Every interactive element: visible focus ring (`--sv-color-focus-ring`), keyboard
  operable, ≥ `--sv-touch-target` hit area.
- Dialogs: title + description wired (bits-ui enforces ARIA); Escape closes (tested).
- States: `LoadingState`/`Spinner` announce via `role="status"`, `ErrorState` via
  `role="alert"`.

## Dev

```bash
pnpm --filter @svelocity/ui dev     # component preview sandbox on :5199
pnpm --filter @svelocity/ui test    # vitest + testing-library
pnpm --filter @svelocity/ui check   # svelte-check
```
