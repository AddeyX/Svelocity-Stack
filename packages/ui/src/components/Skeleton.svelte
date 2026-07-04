<script lang="ts">
	interface Props {
		/** CSS width, e.g. '100%' or '12rem'. */
		width?: string;
		/** CSS height, e.g. '1rem'. */
		height?: string;
		/** Fully round (avatar placeholder). */
		circle?: boolean;
		class?: string;
	}

	let { width = '100%', height = '1rem', circle = false, class: className = '' }: Props = $props();
</script>

<div
	class="sv-skeleton {className}"
	class:sv-skeleton--circle={circle}
	style:width
	style:height
	aria-hidden="true"
></div>

<style>
	.sv-skeleton {
		background: var(--sv-color-surface-sunken);
		border-radius: var(--sv-radius-sm);
		animation: sv-skeleton-pulse 1.4s var(--sv-ease-in-out) infinite;
	}
	.sv-skeleton--circle {
		border-radius: var(--sv-radius-full);
	}
	@keyframes sv-skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sv-skeleton {
			animation: none;
		}
	}
</style>
