<script lang="ts">
	import { Separator } from 'bits-ui';

	interface Props {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	let { orientation = 'horizontal', class: className = '' }: Props = $props();
</script>

<Separator.Root {orientation} class="sv-separator sv-separator--{orientation} {className}" />

<style>
	:global(.sv-separator) {
		background: var(--sv-color-border);
		flex-shrink: 0;
	}
	:global(.sv-separator--horizontal) {
		height: 1px;
		width: 100%;
	}
	:global(.sv-separator--vertical) {
		width: 1px;
		align-self: stretch;
	}
</style>
