<script lang="ts">
	import Spinner from '../components/Spinner.svelte';

	interface Props {
		/** Optional message under the spinner. */
		message?: string;
		class?: string;
	}

	let { message, class: className = '' }: Props = $props();
</script>

<div class="sv-state {className}">
	<Spinner size="lg" label={message ?? 'Loading'} />
	{#if message}
		<p class="sv-state__description">{message}</p>
	{/if}
</div>

<style>
	.sv-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sv-space-3);
		padding: var(--sv-space-12) var(--sv-space-4);
		text-align: center;
	}
	.sv-state__description {
		margin: 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
	}
</style>
