# Shared UI (Bits UI + Theme)

How the design system works: [Bits UI](https://bits-ui.com/) headless primitives,
wrapped once in `@svelocity/ui`, styled with `@svelocity/theme` tokens, consumed by
all three shells.

## Architecture

```text
bits-ui (headless: behavior, a11y, keyboard, focus)
   └── @svelocity/ui   wraps primitives, styles with tokens, exports components
           └── @svelocity/theme   --sv-* CSS custom properties + platform overrides
                   └── apps/*     import components; never re-style primitives directly
```

Why Bits UI over shadcn-svelte: ADR
[0001](../adr/0001-bits-ui-over-shadcn.md) — headless primitives + vanilla CSS tokens,
no Tailwind dependency in shared packages. Components ship as **source** (the app's
Vite compiles them — ADR [0004](../adr/0004-shared-ui-consumption.md)).

## Available components

| Group      | Components                                                                            |
| ---------- | ------------------------------------------------------------------------------------- |
| Form       | `Button`, `Input`, `Textarea`, `Checkbox`, `Label`, `FormField`                       |
| Layout     | `Card`, `Container`, `Stack`, `Separator`                                             |
| Feedback   | `Alert`, `Badge`, `Skeleton`, `Spinner`, `Toaster` + `toast` store                    |
| Overlays   | `Dialog`, `AlertDialog`, `DropdownMenu`                                               |
| Navigation | `Tabs`, `NavLink`, `Avatar`                                                           |
| App states | `LoadingState`, `EmptyState`, `ErrorState`, `UnauthorizedState`, `OfflineIndicator`   |
| Icons      | curated Lucide re-exports (`IconCheck`, `IconPlus`, `IconTrash`, … in `src/icons.ts`) |

Browse them live: `pnpm --filter @svelocity/ui dev` → preview sandbox on `:5199`.

## Using a component

```svelte
<script lang="ts">
	import { Button, FormField, Input, toast } from '@svelocity/ui';
</script>

<FormField label="Title" error={titleError}>
	<Input bind:value={title} placeholder="What needs doing?" />
</FormField>

<Button variant="primary" size="md" loading={saving} onclick={save}>Save</Button>
```

Props are consistent across components: `variant`, `size`, `disabled`, `class`, plus
native attributes forwarded via `...rest`. `Button` for example:
`variant: 'primary' | 'secondary' | 'ghost' | 'destructive'`,
`size: 'sm' | 'md' | 'lg'`, `loading` (spinner + disabled + `aria-busy`).

Toasts are a store, not a component prop: mount `<Toaster />` once in the root layout
(already done in every shell), then `toast.success('Task deleted')` /
`toast.error(...)` from anywhere.

## Application state components

Every data-driven view composes the same four states so all platforms feel identical:

```svelte
{#if session === 'loading'}
	<LoadingState />
{:else if session === 'unauthenticated'}
	<UnauthorizedState />
{:else if tasks.error}
	<ErrorState onRetry={retry} />
{:else if sorted.length === 0}
	<EmptyState title="No tasks yet" />
{:else}
	<!-- the list -->
{/if}
```

`OfflineIndicator` sits in the root layout and shows a banner whenever the browser
reports offline.

## Adding a new component (wrap a Bits primitive)

1. Read the primitive's docs (the `bits-ui` skill or [bits-ui.com](https://bits-ui.com/)).
2. Create `packages/ui/src/components/<Name>.svelte`; wrap the primitive; keep the
   API small — expose what the demo needs, forward the rest with `...rest`.
3. Style with semantic tokens only: `var(--sv-color-primary)`, `var(--sv-space-4)` —
   **never hex values, never `--sv-palette-*` primitives**.
4. Portalled/bits-rendered DOM can't be reached by Svelte's scoping — use `sv-`
   prefixed class names with `:global(...)` (or shared CSS in `src/styles/`).
5. Hover styles go behind `@media (hover: hover)` so touch platforms stay clean.
6. Export from `src/index.ts`, add a spec file, add it to the preview sandbox.

## Theming and platform overrides

Tokens live in `packages/theme/src/tokens.css` (`--sv-color-*`, `--sv-space-*`,
`--sv-radius-*`, `--sv-text-*`, `--sv-shadow-*`, `--sv-z-*`, `--sv-duration-*`).
Each shell imports the base tokens plus exactly one override file:

```ts
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/mobile.css'; // web.css | desktop.css | mobile.css
```

Overrides adjust platform hooks — `--sv-touch-target`, `--sv-safe-*` (mobile safe
areas), `--sv-titlebar-height` — without forking components. Dark mode:
`applyTheme('dark')` from `@svelocity/theme` sets `data-theme="dark"` on `<html>`
(structure ships in v1; visual polish is Phase 10).

## Accessibility expectations

- Every interactive element: visible focus ring (`--sv-color-focus-ring`), keyboard
  operable, hit area ≥ `--sv-touch-target`.
- Dialogs: title + description wired (bits-ui enforces the ARIA); Escape closes.
- `LoadingState`/`Spinner` announce with `role="status"`; `ErrorState` with `role="alert"`.

## Do's and don'ts

- **Do** put anything used by 2+ shells in `@svelocity/ui`.
- **Don't** put business logic in components — validation, sorting, and domain rules
  live in `@svelocity/app-core`; components take props and emit events.
- **Don't** import `bits-ui` directly in apps — wrap it in `@svelocity/ui` first.
- **Don't** hardcode colors/sizes — if a token is missing, add it to the theme.
