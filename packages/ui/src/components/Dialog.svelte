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
		/** Optional explicit trigger button; otherwise control via bind:open. */
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
		<Dialog.Trigger>
			{#snippet child({ props })}
				<span {...props} class="sv-dialog-trigger">{@render trigger()}</span>
			{/snippet}
		</Dialog.Trigger>
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
	.sv-dialog-trigger {
		display: contents;
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
