# @svelocity/theme

Design tokens as CSS custom properties, plus per-platform override files.

## Usage

Every app imports the base tokens plus exactly one platform file in its root
layout/shell:

```ts
// apps/web/src/routes/+layout.svelte
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/web.css';
```

```ts
// apps/desktop/src/main.ts
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/desktop.css';
```

```ts
// apps/mobile/src/main.ts
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/mobile.css';
```

Programmatic values (breakpoints, durations, z-index, theme switch):

```ts
import { breakpoints, applyTheme } from '@svelocity/theme';
applyTheme('dark'); // sets data-theme="dark" on <html>
```

## Token reference

| Category           | Prefix                                                     | Examples                                                                                                                       |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Color (semantic)   | `--sv-color-*`                                             | `bg`, `surface`, `border`, `text`, `text-muted`, `primary`, `primary-hover`, `danger`, `success-soft`, `focus-ring`, `overlay` |
| Color (primitives) | `--sv-palette-*`                                           | `orange-700`, `gray-200` — components use semantic tokens, never palette directly                                              |
| Typography         | `--sv-font-*`, `--sv-text-*`, `--sv-leading-*`             | `font-sans`, `text-sm`, `leading-tight`                                                                                        |
| Spacing            | `--sv-space-*`                                             | `1`–`24` on a 4px scale                                                                                                        |
| Radius             | `--sv-radius-*`                                            | `sm`, `md`, `lg`, `xl`, `full`                                                                                                 |
| Shadow             | `--sv-shadow-*`                                            | `sm`, `md`, `lg`, `overlay`                                                                                                    |
| Motion             | `--sv-duration-*`, `--sv-ease-*`                           | `fast` (120ms), `normal`, `slow`; `ease-out`                                                                                   |
| Z-index            | `--sv-z-*`                                                 | `dropdown`, `overlay`, `modal`, `toast`                                                                                        |
| Platform hooks     | `--sv-touch-target`, `--sv-safe-*`, `--sv-titlebar-height` | overridden per platform                                                                                                        |

## Rules

- Components and apps use **semantic** tokens (`--sv-color-primary`), never palette
  primitives and never hex values.
- Dark mode: `data-theme="dark"` on `<html>`; structure ships now, polish in Phase 10.
- Brand orange `--sv-color-brand` (#ff3e00) is for logos/accents only — it fails AA
  contrast on white; interactive elements use `--sv-color-primary`.
