<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		/** Visual style. */
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		/** Control height/padding. */
		size?: 'sm' | 'md' | 'lg';
		/** Show a spinner and disable interaction. */
		loading?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="sv-btn sv-btn--{variant} sv-btn--{size} {className}"
	disabled={disabled || loading}
	aria-busy={loading || undefined}
	{...rest}
>
	{#if loading}
		<span class="sv-btn__spinner" aria-hidden="true"></span>
	{/if}
	{@render children?.()}
</button>

<style>
	.sv-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--sv-space-2);
		min-height: var(--sv-touch-target);
		border: 1px solid transparent;
		border-radius: var(--sv-radius-md);
		font-family: var(--sv-font-sans);
		font-weight: var(--sv-font-semibold);
		cursor: pointer;
		transition:
			background-color var(--sv-duration-fast) var(--sv-ease-out),
			border-color var(--sv-duration-fast) var(--sv-ease-out),
			color var(--sv-duration-fast) var(--sv-ease-out);
	}
	.sv-btn:focus-visible {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: 2px;
	}
	.sv-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.sv-btn--sm {
		padding: var(--sv-space-1) var(--sv-space-3);
		font-size: var(--sv-text-sm);
	}
	.sv-btn--md {
		padding: var(--sv-space-2) var(--sv-space-4);
		font-size: var(--sv-text-sm);
	}
	.sv-btn--lg {
		padding: var(--sv-space-3) var(--sv-space-6);
		font-size: var(--sv-text-md);
	}

	.sv-btn--primary {
		background: var(--sv-color-primary);
		color: var(--sv-color-text-on-primary);
	}
	@media (hover: hover) {
		.sv-btn--primary:hover:not(:disabled) {
			background: var(--sv-color-primary-hover);
		}
	}
	.sv-btn--primary:active:not(:disabled) {
		background: var(--sv-color-primary-active);
	}

	.sv-btn--secondary {
		background: var(--sv-color-surface);
		border-color: var(--sv-color-border-strong);
		color: var(--sv-color-text);
	}
	@media (hover: hover) {
		.sv-btn--secondary:hover:not(:disabled) {
			background: var(--sv-color-surface-sunken);
		}
	}

	.sv-btn--ghost {
		background: transparent;
		color: var(--sv-color-text);
	}
	@media (hover: hover) {
		.sv-btn--ghost:hover:not(:disabled) {
			background: var(--sv-color-surface-sunken);
		}
	}

	.sv-btn--destructive {
		background: var(--sv-color-danger);
		color: #ffffff;
	}
	@media (hover: hover) {
		.sv-btn--destructive:hover:not(:disabled) {
			background: var(--sv-color-danger-hover);
		}
	}

	.sv-btn__spinner {
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: var(--sv-radius-full);
		animation: sv-btn-spin 0.7s linear infinite;
	}
	@keyframes sv-btn-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
