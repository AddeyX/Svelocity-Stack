<script lang="ts">
	import { Checkbox, useId } from 'bits-ui';

	interface Props {
		/** Bindable checked state. */
		checked?: boolean;
		/** Visible label text; also wires accessibility. */
		label?: string;
		/** Accessible name when no visible label is wanted. */
		ariaLabel?: string;
		disabled?: boolean;
		id?: string;
		class?: string;
		onCheckedChange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		label,
		ariaLabel,
		disabled = false,
		id = useId(),
		class: className = '',
		onCheckedChange
	}: Props = $props();
</script>

<div class="sv-checkbox-wrap {className}">
	<Checkbox.Root
		{id}
		bind:checked
		{disabled}
		{onCheckedChange}
		aria-label={label ? undefined : ariaLabel}
		class="sv-checkbox"
	>
		{#snippet children({ checked: isChecked })}
			{#if isChecked}
				<svg
					class="sv-checkbox__mark"
					viewBox="0 0 12 12"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M2 6.5 4.5 9 10 3" />
				</svg>
			{/if}
		{/snippet}
	</Checkbox.Root>
	{#if label}
		<label class="sv-checkbox__label" for={id}>{label}</label>
	{/if}
</div>

<style>
	.sv-checkbox-wrap {
		display: inline-flex;
		align-items: center;
		gap: var(--sv-space-2);
		min-height: var(--sv-touch-target);
	}
	:global(.sv-checkbox) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		background: var(--sv-color-surface);
		border: 2px solid var(--sv-color-border-strong);
		border-radius: var(--sv-radius-sm);
		color: var(--sv-color-text-on-primary);
		cursor: pointer;
		transition:
			background-color var(--sv-duration-fast) var(--sv-ease-out),
			border-color var(--sv-duration-fast) var(--sv-ease-out);
	}
	:global(.sv-checkbox[data-state='checked']) {
		background: var(--sv-color-primary);
		border-color: var(--sv-color-primary);
	}
	:global(.sv-checkbox:focus-visible) {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: 2px;
	}
	:global(.sv-checkbox[data-disabled]) {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.sv-checkbox__mark {
		width: 0.75rem;
		height: 0.75rem;
	}
	.sv-checkbox__label {
		font-size: var(--sv-text-md);
		color: var(--sv-color-text);
		cursor: pointer;
		user-select: none;
	}
</style>
