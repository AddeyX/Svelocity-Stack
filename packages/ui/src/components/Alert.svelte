<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Semantic tone. */
		variant?: 'info' | 'success' | 'warning' | 'error';
		/** Bold first line. */
		title?: string;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'info', title, class: className = '', children }: Props = $props();

	// Errors/warnings interrupt; info/success just announce.
	const role = $derived(variant === 'error' || variant === 'warning' ? 'alert' : 'status');
</script>

<div {role} class="sv-alert sv-alert--{variant} {className}">
	{#if title}
		<p class="sv-alert__title">{title}</p>
	{/if}
	{#if children}
		<div class="sv-alert__body">{@render children()}</div>
	{/if}
</div>

<style>
	.sv-alert {
		padding: var(--sv-space-3) var(--sv-space-4);
		border: 1px solid;
		border-radius: var(--sv-radius-md);
		font-size: var(--sv-text-sm);
	}
	.sv-alert__title {
		margin: 0;
		font-weight: var(--sv-font-semibold);
	}
	.sv-alert__body {
		color: var(--sv-color-text);
	}
	.sv-alert__title + .sv-alert__body {
		margin-top: var(--sv-space-1);
	}

	.sv-alert--info {
		background: var(--sv-color-info-soft);
		border-color: var(--sv-color-info-soft-border);
	}
	.sv-alert--info .sv-alert__title {
		color: var(--sv-color-info);
	}
	.sv-alert--success {
		background: var(--sv-color-success-soft);
		border-color: var(--sv-color-success-soft-border);
	}
	.sv-alert--success .sv-alert__title {
		color: var(--sv-color-success);
	}
	.sv-alert--warning {
		background: var(--sv-color-warning-soft);
		border-color: var(--sv-color-warning-soft-border);
	}
	.sv-alert--warning .sv-alert__title {
		color: var(--sv-color-warning);
	}
	.sv-alert--error {
		background: var(--sv-color-danger-soft);
		border-color: var(--sv-color-danger-soft-border);
	}
	.sv-alert--error .sv-alert__title {
		color: var(--sv-color-danger);
	}
</style>
