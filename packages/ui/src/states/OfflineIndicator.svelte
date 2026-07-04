<script lang="ts">
	/**
	 * Connection status banner (v1 stub — listens to browser online/offline).
	 * Renders nothing while online.
	 */
	let online = $state(true);

	$effect(() => {
		online = navigator.onLine;
		const goOnline = () => (online = true);
		const goOffline = () => (online = false);
		window.addEventListener('online', goOnline);
		window.addEventListener('offline', goOffline);
		return () => {
			window.removeEventListener('online', goOnline);
			window.removeEventListener('offline', goOffline);
		};
	});
</script>

{#if !online}
	<div class="sv-offline" role="status">You're offline — changes will sync when you reconnect.</div>
{/if}

<style>
	.sv-offline {
		position: fixed;
		top: max(var(--sv-space-2), var(--sv-safe-top));
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--sv-z-toast);
		padding: var(--sv-space-2) var(--sv-space-4);
		background: var(--sv-color-warning-soft);
		border: 1px solid var(--sv-color-warning-soft-border);
		border-radius: var(--sv-radius-full);
		font-size: var(--sv-text-sm);
		color: var(--sv-color-warning);
		box-shadow: var(--sv-shadow-md);
	}
</style>
