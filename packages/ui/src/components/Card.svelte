<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		/** Optional header region. */
		header?: Snippet;
		/** Card body. */
		children?: Snippet;
		/** Optional footer region. */
		footer?: Snippet;
	}

	let { class: className = '', header, children, footer }: Props = $props();
</script>

<div class="sv-card {className}">
	{#if header}
		<div class="sv-card__header">{@render header()}</div>
	{/if}
	<div class="sv-card__body">{@render children?.()}</div>
	{#if footer}
		<div class="sv-card__footer">{@render footer()}</div>
	{/if}
</div>

<style>
	.sv-card {
		background: var(--sv-color-surface);
		border: 1px solid var(--sv-color-border);
		border-radius: var(--sv-radius-lg);
		box-shadow: var(--sv-shadow-sm);
		overflow: hidden;
	}
	.sv-card__header {
		padding: var(--sv-space-4) var(--sv-space-5);
		border-bottom: 1px solid var(--sv-color-border);
	}
	.sv-card__body {
		padding: var(--sv-space-5);
	}
	.sv-card__footer {
		padding: var(--sv-space-4) var(--sv-space-5);
		border-top: 1px solid var(--sv-color-border);
		background: var(--sv-color-surface-sunken);
	}
</style>
