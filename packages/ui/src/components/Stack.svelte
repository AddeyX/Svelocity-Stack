<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Gap between children on the 4px token scale. */
		gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
		/** Stack direction. */
		direction?: 'vertical' | 'horizontal';
		/** Cross-axis alignment. */
		align?: 'start' | 'center' | 'end' | 'stretch';
		class?: string;
		children?: Snippet;
	}

	let {
		gap = 4,
		direction = 'vertical',
		align = 'stretch',
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class="sv-stack {className}"
	style:flex-direction={direction === 'vertical' ? 'column' : 'row'}
	style:gap="var(--sv-space-{gap})"
	style:align-items={align === 'stretch' ? 'stretch' : align}
>
	{@render children?.()}
</div>

<style>
	.sv-stack {
		display: flex;
	}
</style>
