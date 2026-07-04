<script lang="ts">
	import Button from '../components/Button.svelte';

	interface Props {
		title?: string;
		/** Human-readable error description. */
		message?: string;
		/** Retry handler — renders a retry button when provided. */
		onRetry?: () => void;
		retryLabel?: string;
		class?: string;
	}

	let {
		title = 'Something went wrong',
		message,
		onRetry,
		retryLabel = 'Try again',
		class: className = ''
	}: Props = $props();
</script>

<div class="sv-state {className}" role="alert">
	<div class="sv-state__icon" aria-hidden="true">⚠</div>
	<h2 class="sv-state__title">{title}</h2>
	{#if message}
		<p class="sv-state__description">{message}</p>
	{/if}
	{#if onRetry}
		<div class="sv-state__action">
			<Button variant="secondary" onclick={onRetry}>{retryLabel}</Button>
		</div>
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
		color: var(--sv-color-danger);
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
