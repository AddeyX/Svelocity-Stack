<script lang="ts">
	import { AlertDialog, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import '../styles/overlay.css';

	type Props = WithoutChildrenOrChild<AlertDialog.RootProps> & {
		/** Confirmation heading. */
		title: string;
		/** What is about to happen and why it matters. */
		description: string;
		/** Confirm button label. */
		confirmLabel?: string;
		/** Cancel button label. */
		cancelLabel?: string;
		/** Style the confirm button as destructive (default) or primary. */
		destructive?: boolean;
		/** Bindable open state. */
		open?: boolean;
		/** Called when the user confirms. Dialog closes after. */
		onConfirm: () => void | Promise<void>;
		/** Optional trigger element. */
		trigger?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Delete',
		cancelLabel = 'Cancel',
		destructive = true,
		onConfirm,
		trigger,
		...rest
	}: Props = $props();

	let busy = $state(false);

	async function handleConfirm() {
		busy = true;
		try {
			await onConfirm();
			open = false;
		} finally {
			busy = false;
		}
	}
</script>

<AlertDialog.Root bind:open {...rest}>
	{#if trigger}
		<AlertDialog.Trigger>
			{#snippet child({ props })}
				<span {...props} class="sv-alertdialog-trigger">{@render trigger()}</span>
			{/snippet}
		</AlertDialog.Trigger>
	{/if}
	<AlertDialog.Portal>
		<AlertDialog.Overlay class="sv-dialog-overlay" />
		<AlertDialog.Content class="sv-dialog-content">
			<AlertDialog.Title class="sv-dialog-title">{title}</AlertDialog.Title>
			<AlertDialog.Description class="sv-dialog-description">
				{description}
			</AlertDialog.Description>
			<div class="sv-alertdialog-footer">
				<AlertDialog.Cancel>
					{#snippet child({ props })}
						<span {...props} class="sv-alertdialog-trigger">
							<Button variant="secondary" disabled={busy}>{cancelLabel}</Button>
						</span>
					{/snippet}
				</AlertDialog.Cancel>
				<Button
					variant={destructive ? 'destructive' : 'primary'}
					loading={busy}
					onclick={handleConfirm}
				>
					{confirmLabel}
				</Button>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>

<style>
	.sv-alertdialog-trigger {
		display: contents;
	}
	.sv-alertdialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--sv-space-2);
		margin-top: var(--sv-space-6);
	}
</style>
