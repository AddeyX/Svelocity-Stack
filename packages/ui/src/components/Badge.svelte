<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
		class?: string;
		children?: Snippet;
	}

	let { variant = 'neutral', class: className = '', children }: Props = $props();
</script>

<span class="sv-badge sv-badge--{variant} {className}">
	{@render children?.()}
</span>

<style>
	.sv-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--sv-space-1);
		padding: 0.125rem var(--sv-space-2);
		border: 1px solid;
		border-radius: var(--sv-radius-full);
		font-size: var(--sv-text-xs);
		font-weight: var(--sv-font-semibold);
		line-height: var(--sv-leading-normal);
		white-space: nowrap;
	}
	.sv-badge--neutral {
		background: var(--sv-color-surface-sunken);
		border-color: var(--sv-color-border);
		color: var(--sv-color-text);
	}
	.sv-badge--primary {
		background: var(--sv-color-primary-soft);
		border-color: var(--sv-color-primary-soft-border);
		color: var(--sv-color-primary);
	}
	.sv-badge--success {
		background: var(--sv-color-success-soft);
		border-color: var(--sv-color-success-soft-border);
		color: var(--sv-color-success);
	}
	.sv-badge--warning {
		background: var(--sv-color-warning-soft);
		border-color: var(--sv-color-warning-soft-border);
		color: var(--sv-color-warning);
	}
	.sv-badge--danger {
		background: var(--sv-color-danger-soft);
		border-color: var(--sv-color-danger-soft-border);
		color: var(--sv-color-danger);
	}
</style>
