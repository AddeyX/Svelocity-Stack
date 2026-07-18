<script lang="ts">
	import { Dialog, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import '../styles/overlay.css';

	type Props = WithoutChildrenOrChild<Dialog.RootProps> & {
		/** Dialog heading (required for accessibility). */
		title: string;
		/** Supporting text under the title. */
		description?: string;
		/** Bindable open state. */
		open?: boolean;
		/** Optional trigger content rendered inside the dialog trigger button. */
		trigger?: Snippet;
		/** Dialog body. */
		children?: Snippet;
		/** Action row (buttons) at the bottom. */
		footer?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		trigger,
		children,
		footer,
		...rest
	}: Props = $props();
</script>

<Dialog.Root bind:open {...rest}>
	{#if trigger}
		<Dialog.Trigger class="sv-dialog-trigger">{@render trigger()}</Dialog.Trigger>
	{/if}
	<Dialog.Portal>
		<Dialog.Overlay class="sv-dialog-overlay" />
		<Dialog.Content class="sv-dialog-content">
			<Dialog.Title class="sv-dialog-title">{title}</Dialog.Title>
			{#if description}
				<Dialog.Description class="sv-dialog-description">{description}</Dialog.Description>
			{/if}
			{#if children}
				<div class="sv-dialog-body">{@render children()}</div>
			{/if}
			{#if footer}
				<div class="sv-dialog-footer">{@render footer()}</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global(.sv-dialog-trigger) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-2) var(--sv-space-4);
		background: var(--sv-color-primary);
		border: 1px solid transparent;
		border-radius: var(--sv-radius-md);
		font-family: var(--sv-font-sans);
		font-size: var(--sv-text-sm);
		font-weight: var(--sv-font-semibold);
		color: var(--sv-color-text-on-primary);
		cursor: pointer;
	}
	@media (hover: hover) {
		:global(.sv-dialog-trigger:hover) {
			background: var(--sv-color-primary-hover);
		}
	}
	:global(.sv-dialog-trigger:focus-visible) {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: 2px;
	}
	.sv-dialog-body {
		margin-top: var(--sv-space-4);
	}
	.sv-dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--sv-space-2);
		margin-top: var(--sv-space-6);
	}
</style>
