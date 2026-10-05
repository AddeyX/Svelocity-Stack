/**
 * Programmatic token access. CSS custom properties are the source of truth
 * (tokens.css); this module exposes the values JS/TS occasionally needs —
 * breakpoints (custom properties don't work in media queries), motion
 * durations for JS-driven animation, and z-index for imperative layering.
 */

export const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const durations = {
	fast: 120,
	normal: 200,
	slow: 320
} as const;

export const zIndex = {
	base: 0,
	dropdown: 50,
	sticky: 100,
	overlay: 200,
	modal: 300,
	toast: 400
} as const;

/** CSS var reference helper: cssVar('color-primary') → 'var(--sv-color-primary)'. */
export function cssVar(name: string): string {
	return `var(--sv-${name})`;
}

export type Theme = 'light' | 'dark';

/** Apply a theme by setting data-theme on <html>. Light is the default (no attribute needed). */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
	if (theme === 'dark') root.setAttribute('data-theme', 'dark');
	else root.removeAttribute('data-theme');
}
