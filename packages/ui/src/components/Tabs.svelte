<script lang="ts">
	import { Tabs } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export interface TabItem {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		/** Tab definitions in order. */
		items: TabItem[];
		/** Bindable active tab value. Defaults to the first item. */
		value?: string;
		class?: string;
		/** Panel renderer — receives the active tab value. */
		panel: Snippet<[string]>;
	}

	let {
		items,
		value = $bindable(items[0]?.value ?? ''),
		class: className = '',
		panel
	}: Props = $props();
</script>

<Tabs.Root bind:value class="sv-tabs {className}">
	<Tabs.List class="sv-tabs-list">
		{#each items as item (item.value)}
			<Tabs.Trigger class="sv-tabs-trigger" value={item.value} disabled={item.disabled}>
				{item.label}
			</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each items as item (item.value)}
		<Tabs.Content class="sv-tabs-content" value={item.value}>
			{@render panel(item.value)}
		</Tabs.Content>
	{/each}
</Tabs.Root>

<style>
	:global(.sv-tabs-list) {
		display: flex;
		gap: var(--sv-space-1);
		border-bottom: 1px solid var(--sv-color-border);
	}
	:global(.sv-tabs-trigger) {
		min-height: var(--sv-touch-target);
		padding: var(--sv-space-2) var(--sv-space-4);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		font-family: var(--sv-font-sans);
		font-size: var(--sv-text-sm);
		font-weight: var(--sv-font-medium);
		color: var(--sv-color-text-muted);
		cursor: pointer;
		transition: color var(--sv-duration-fast) var(--sv-ease-out);
	}
	@media (hover: hover) {
		:global(.sv-tabs-trigger:hover) {
			color: var(--sv-color-text);
		}
	}
	:global(.sv-tabs-trigger[data-state='active']) {
		color: var(--sv-color-primary);
		border-bottom-color: var(--sv-color-primary);
	}
	:global(.sv-tabs-trigger:focus-visible) {
		outline: 2px solid var(--sv-color-focus-ring);
		outline-offset: -2px;
	}
	:global(.sv-tabs-trigger[data-disabled]) {
		color: var(--sv-color-text-faint);
		cursor: not-allowed;
	}
	:global(.sv-tabs-content) {
		padding-top: var(--sv-space-4);
	}
</style>
