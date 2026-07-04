<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		/** Bindable textarea value. */
		value?: string;
		/** Error state — paints the border and sets aria-invalid. */
		error?: boolean;
	}

	let {
		value = $bindable(''),
		error = false,
		rows = 3,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<textarea
	class="sv-textarea {className}"
	class:sv-textarea--error={error}
	aria-invalid={error || undefined}
	{rows}
	bind:value
	{...rest}
></textarea>

<style>
	.sv-textarea {
		width: 100%;
		padding: var(--sv-space-2) var(--sv-space-3);
		background: var(--sv-color-surface);
		border: 1px solid var(--sv-color-border-strong);
		border-radius: var(--sv-radius-md);
		color: var(--sv-color-text);
		font-family: var(--sv-font-sans);
		font-size: var(--sv-text-md);
		line-height: var(--sv-leading-normal);
		resize: vertical;
		transition: border-color var(--sv-duration-fast) var(--sv-ease-out);
	}
	.sv-textarea::placeholder {
		color: var(--sv-color-text-faint);
	}
	.sv-textarea:focus-visible {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--sv-color-focus-ring);
	}
	.sv-textarea:disabled {
		background: var(--sv-color-surface-sunken);
		color: var(--sv-color-text-muted);
		cursor: not-allowed;
	}
	.sv-textarea--error {
		border-color: var(--sv-color-danger);
	}
</style>
