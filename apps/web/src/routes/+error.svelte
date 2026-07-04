<script lang="ts">
	import { page } from '$app/state';
	import { Button, ErrorState } from '@svelocity/ui';
</script>

<svelte:head>
	<title>{page.status} — Shared Tasks</title>
</svelte:head>

<div class="error-page">
	<ErrorState
		title={page.status === 404 ? 'Page not found' : `Something broke (${page.status})`}
		message={page.status === 404
			? 'That page does not exist.'
			: (page.error?.message ?? 'Unexpected error.')}
	/>
	<div class="error-page__home">
		<Button variant="secondary" onclick={() => (window.location.href = '/')}>Go home</Button>
	</div>
</div>

<style>
	.error-page {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.error-page__home {
		margin-top: var(--sv-space-2);
	}
</style>
