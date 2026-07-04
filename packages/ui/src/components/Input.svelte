<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		/** Bindable input value. */
		value?: string;
		/** Error state — paints the border and sets aria-invalid. */
		error?: boolean;
	}

	let { value = $bindable(''), error = false, class: className = '', ...rest }: Props = $props();
</script>

<input
	class="sv-input {className}"
	class:sv-input--error={error}
	aria-invalid={error || undefined}
	bind:value
	{...rest}
/>

<style>
	.sv-input {
		width: 100%;
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-2) var(--sv-space-3);
		background: var(--sv-color-surface);
		border: 1px solid var(--sv-color-border-strong);
		border-radius: var(--sv-radius-md);
		color: var(--sv-color-text);
		font-family: var(--sv-font-sans);
		font-size: var(--sv-text-md);
		transition: border-color var(--sv-duration-fast) var(--sv-ease-out);
	}
	.sv-input::placeholder {
		color: var(--sv-color-text-faint);
	}
	.sv-input:focus-visible {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--sv-color-focus-ring);
	}
	.sv-input:disabled {
		background: var(--sv-color-surface-sunken);
		color: var(--sv-color-text-muted);
		cursor: not-allowed;
	}
	.sv-input--error {
		border-color: var(--sv-color-danger);
	}
	.sv-input--error:focus-visible {
		outline-color: var(--sv-color-danger);
		border-color: var(--sv-color-danger);
	}
</style>
