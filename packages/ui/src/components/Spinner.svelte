<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		/** Accessible label announced to screen readers. */
		label?: string;
		class?: string;
	}

	let { size = 'md', label = 'Loading', class: className = '' }: Props = $props();
</script>

<span class="sv-spinner sv-spinner--{size} {className}" role="status" aria-label={label}></span>

<style>
	.sv-spinner {
		display: inline-block;
		border: 2px solid var(--sv-color-border-strong);
		border-top-color: var(--sv-color-primary);
		border-radius: var(--sv-radius-full);
		animation: sv-spin 0.7s linear infinite;
	}
	.sv-spinner--sm {
		width: 1rem;
		height: 1rem;
	}
	.sv-spinner--md {
		width: 1.5rem;
		height: 1.5rem;
		border-width: 3px;
	}
	.sv-spinner--lg {
		width: 2.25rem;
		height: 2.25rem;
		border-width: 3px;
	}
	@keyframes sv-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
