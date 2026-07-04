<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		href: string;
		/** Marks the link as the current page/section (sets aria-current). */
		active?: boolean;
		children?: Snippet;
	}

	let { href, active = false, class: className = '', children, ...rest }: Props = $props();
</script>

<a
	{href}
	class="sv-navlink {className}"
	class:sv-navlink--active={active}
	aria-current={active ? 'page' : undefined}
	{...rest}
>
	{@render children?.()}
</a>

<style>
	.sv-navlink {
		display: inline-flex;
		align-items: center;
		gap: var(--sv-space-2);
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-1) var(--sv-space-3);
		border-radius: var(--sv-radius-md);
		font-size: var(--sv-text-sm);
		font-weight: var(--sv-font-medium);
		color: var(--sv-color-text-muted);
		text-decoration: none;
		transition:
			color var(--sv-duration-fast) var(--sv-ease-out),
			background-color var(--sv-duration-fast) var(--sv-ease-out);
	}
	@media (hover: hover) {
		.sv-navlink:hover {
			color: var(--sv-color-text);
			background: var(--sv-color-surface-sunken);
		}
	}
	.sv-navlink--active {
		color: var(--sv-color-primary);
		background: var(--sv-color-primary-soft);
	}
	.sv-navlink:focus-visible {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: 2px;
	}
</style>
