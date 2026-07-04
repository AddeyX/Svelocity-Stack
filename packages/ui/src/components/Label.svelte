<script lang="ts">
	import { Label } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		/** id of the control this label describes. */
		for?: string;
		class?: string;
		children?: Snippet;
	}

	let { for: forId, class: className = '', children }: Props = $props();
</script>

<Label.Root for={forId} class="sv-label {className}">
	{@render children?.()}
</Label.Root>

<style>
	:global(.sv-label) {
		display: inline-block;
		font-size: var(--sv-text-sm);
		font-weight: var(--sv-font-medium);
		color: var(--sv-color-text);
	}
</style>
