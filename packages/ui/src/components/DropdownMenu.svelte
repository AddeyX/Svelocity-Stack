<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export interface MenuItem {
		label: string;
		onSelect: () => void;
		/** Style as destructive action. */
		danger?: boolean;
		disabled?: boolean;
		/** Render a separator above this item. */
		separatorBefore?: boolean;
	}

	interface Props {
		/** Menu actions in order. */
		items: MenuItem[];
		/** Trigger content (rendered inside the trigger button). */
		trigger: Snippet;
		/** Accessible name for the trigger button. */
		triggerLabel?: string;
		align?: 'start' | 'center' | 'end';
		class?: string;
	}

	let { items, trigger, triggerLabel, align = 'end', class: className = '' }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="sv-menu-trigger {className}" aria-label={triggerLabel}>
		{@render trigger()}
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content class="sv-menu-content" {align} sideOffset={4}>
			{#each items as item (item.label)}
				{#if item.separatorBefore}
					<DropdownMenu.Separator class="sv-menu-separator" />
				{/if}
				<DropdownMenu.Item
					class="sv-menu-item {item.danger ? 'sv-menu-item--danger' : ''}"
					disabled={item.disabled}
					onSelect={item.onSelect}
				>
					{item.label}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	:global(.sv-menu-trigger) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--sv-touch-target);
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-1);
		background: transparent;
		border: none;
		border-radius: var(--sv-radius-md);
		color: var(--sv-color-text-muted);
		cursor: pointer;
	}
	@media (hover: hover) {
		:global(.sv-menu-trigger:hover) {
			background: var(--sv-color-surface-sunken);
			color: var(--sv-color-text);
		}
	}
	:global(.sv-menu-trigger:focus-visible) {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: 2px;
	}

	:global(.sv-menu-content) {
		z-index: var(--sv-z-dropdown);
		min-width: 11rem;
		padding: var(--sv-space-1);
		background: var(--sv-color-surface-raised);
		border: 1px solid var(--sv-color-border);
		border-radius: var(--sv-radius-md);
		box-shadow: var(--sv-shadow-lg);
	}
	:global(.sv-menu-item) {
		display: flex;
		align-items: center;
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-1) var(--sv-space-3);
		border-radius: var(--sv-radius-sm);
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text);
		cursor: pointer;
		outline: none;
		user-select: none;
	}
	:global(.sv-menu-item[data-highlighted]) {
		background: var(--sv-color-surface-sunken);
	}
	:global(.sv-menu-item[data-disabled]) {
		color: var(--sv-color-text-faint);
		cursor: not-allowed;
	}
	:global(.sv-menu-item--danger) {
		color: var(--sv-color-danger);
	}
	:global(.sv-menu-item--danger[data-highlighted]) {
		background: var(--sv-color-danger-soft);
	}
	:global(.sv-menu-separator) {
		height: 1px;
		margin: var(--sv-space-1) 0;
		background: var(--sv-color-border);
	}
</style>
