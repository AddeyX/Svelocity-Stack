<script lang="ts">
	import { useId } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Label from './Label.svelte';

	interface Props {
		/** Field label text. */
		label: string;
		/** Validation error message; renders below the control and links via aria-describedby. */
		error?: string;
		/** Helper text shown when there is no error. */
		hint?: string;
		/** id shared with the control; generated when omitted. */
		id?: string;
		class?: string;
		/** The control. Receives { id, describedBy, invalid } to spread onto the input. */
		children: Snippet<[{ id: string; describedBy: string | undefined; invalid: boolean }]>;
	}

	let { label, error, hint, id = useId(), class: className = '', children }: Props = $props();

	const messageId = $derived(`${id}-message`);
	const describedBy = $derived(error || hint ? messageId : undefined);
</script>

<div class="sv-field {className}">
	<Label for={id}>{label}</Label>
	{@render children({ id, describedBy, invalid: Boolean(error) })}
	{#if error}
		<p class="sv-field__error" id={messageId} role="alert">{error}</p>
	{:else if hint}
		<p class="sv-field__hint" id={messageId}>{hint}</p>
	{/if}
</div>

<style>
	.sv-field {
		display: flex;
		flex-direction: column;
		gap: var(--sv-space-1);
	}
	.sv-field__error {
		margin: 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-danger);
	}
	.sv-field__hint {
		margin: 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text-muted);
	}
</style>
