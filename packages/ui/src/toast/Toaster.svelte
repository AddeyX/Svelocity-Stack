<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toast } from './toast.svelte.js';

	interface Props {
		/** Screen corner for the stack. */
		position?: 'bottom-right' | 'bottom-center' | 'top-right';
	}

	let { position = 'bottom-right' }: Props = $props();
</script>

<!-- Mount once at the app root, after main content. -->
<div class="sv-toaster sv-toaster--{position}">
	{#each toast.items as item (item.id)}
		<div
			class="sv-toast sv-toast--{item.variant}"
			role="status"
			transition:fly={{ y: 12, duration: 200 }}
		>
			<span class="sv-toast__message">{item.message}</span>
			<button
				class="sv-toast__close"
				type="button"
				aria-label="Dismiss notification"
				onclick={() => toast.dismiss(item.id)}
			>
				✕
			</button>
		</div>
	{/each}
</div>

<style>
	.sv-toaster {
		position: fixed;
		z-index: var(--sv-z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--sv-space-2);
		max-width: min(24rem, calc(100vw - 2 * var(--sv-space-4)));
	}
	.sv-toaster--bottom-right {
		right: max(var(--sv-space-4), var(--sv-safe-right));
		bottom: max(var(--sv-space-4), var(--sv-safe-bottom));
	}
	.sv-toaster--bottom-center {
		left: 50%;
		transform: translateX(-50%);
		bottom: max(var(--sv-space-4), var(--sv-safe-bottom));
	}
	.sv-toaster--top-right {
		right: max(var(--sv-space-4), var(--sv-safe-right));
		top: max(var(--sv-space-4), var(--sv-safe-top));
	}

	.sv-toast {
		display: flex;
		align-items: center;
		gap: var(--sv-space-3);
		padding: var(--sv-space-3) var(--sv-space-4);
		background: var(--sv-color-surface-raised);
		border: 1px solid var(--sv-color-border);
		border-left: 3px solid var(--sv-color-info);
		border-radius: var(--sv-radius-md);
		box-shadow: var(--sv-shadow-lg);
		font-size: var(--sv-text-sm);
		color: var(--sv-color-text);
	}
	.sv-toast--success {
		border-left-color: var(--sv-color-success);
	}
	.sv-toast--error {
		border-left-color: var(--sv-color-danger);
	}
	.sv-toast__message {
		flex: 1;
	}
	.sv-toast__close {
		background: none;
		border: none;
		padding: var(--sv-space-1);
		color: var(--sv-color-text-muted);
		cursor: pointer;
		font-size: var(--sv-text-xs);
		border-radius: var(--sv-radius-sm);
	}
	.sv-toast__close:focus-visible {
		outline: 2px solid var(--sv-color-focus-ring);
	}
</style>
