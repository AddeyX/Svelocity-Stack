<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		/** Optional icon area (emoji, svg, lucide icon). */
		icon?: Snippet;
		/** Optional call-to-action (usually a Button). */
		action?: Snippet;
		class?: string;
	}

	let { title, description, icon, action, class: className = '' }: Props = $props();
</script>

<div class="sv-state {className}">
	{#if icon}
		<div class="sv-state__icon">{@render icon()}</div>
	{/if}
	<h2 class="sv-state__title">{title}</h2>
	{#if description}
		<p class="sv-state__description">{description}</p>
	{/if}
	{#if action}
		<div class="sv-state__action">{@render action()}</div>
	{/if}
</div>

<style>
	.sv-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sv-space-2);
		padding: var(--sv-space-12) var(--sv-space-4);
		text-align: center;
	}
	.sv-state__icon {
		font-size: var(--sv-text-3xl);
		color: var(--sv-color-text-faint);
	}
	.sv-state__title {
		margin: 0;
		font-size: var(--sv-text-lg);
		font-weight: var(--sv-font-semibold);
		color: var(--sv-color-text);
	}
	.sv-state__description {
		margin: 0;
		max-width: 28rem;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
	}
	.sv-state__action {
		margin-top: var(--sv-space-2);
	}
</style>
