<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Max content width. */
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		children?: Snippet;
	}

	let { size = 'md', class: className = '', children }: Props = $props();
</script>

<div class="sv-container sv-container--{size} {className}">
	{@render children?.()}
</div>

<style>
	.sv-container {
		width: 100%;
		margin-inline: auto;
		padding-inline: max(var(--sv-space-4), var(--sv-safe-left));
		padding-inline-end: max(var(--sv-space-4), var(--sv-safe-right));
	}
	.sv-container--sm {
		max-width: 40rem;
	}
	.sv-container--md {
		max-width: 56rem;
	}
	.sv-container--lg {
		max-width: 72rem;
	}
</style>
