<script lang="ts">
	import { attemptTaskCreation } from '@svelocity/app-core';
	import { Button, ErrorState, IconPlus, Input } from '@svelocity/ui';

	interface Props {
		/** Called with a validated, trimmed title. Resolves when the mutation lands. */
		onCreate: (title: string) => Promise<void>;
	}

	let { onCreate }: Props = $props();

	let title = $state('');
	let validationError = $state('');
	let creationError = $state('');
	let pendingTitle = $state('');
	let busy = $state(false);

	async function create(rawTitle: string) {
		if (busy) return;
		validationError = '';
		creationError = '';
		busy = true;
		try {
			const result = await attemptTaskCreation(rawTitle, onCreate);
			if (result.ok) {
				title = '';
				pendingTitle = '';
			} else if (result.pendingTitle) {
				title = result.pendingTitle;
				pendingTitle = result.pendingTitle;
				creationError = result.error;
			} else {
				validationError = result.error;
			}
		} finally {
			busy = false;
		}
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		void create(title);
	}

	function retry() {
		if (pendingTitle) void create(pendingTitle);
	}
</script>

<form class="task-form" onsubmit={submit}>
	<div class="task-form__row">
		<Input
			bind:value={title}
			placeholder="What needs doing?"
			aria-label="New task title"
			error={Boolean(validationError || creationError)}
			disabled={busy}
		/>
		<Button type="submit" loading={busy} aria-label="Add task">
			<IconPlus size={16} /> Add
		</Button>
	</div>
	{#if validationError}
		<p class="task-form__error" role="alert">{validationError}</p>
	{/if}
	{#if creationError}
		<ErrorState
			class="task-form__failure"
			title="Task not created"
			message={creationError}
			retryLabel="Retry"
			onRetry={retry}
		/>
	{/if}
</form>

<style>
	.task-form__row {
		display: flex;
		gap: var(--sv-space-2);
	}
	.task-form__error {
		margin: var(--sv-space-1) 0 0;
		font-size: var(--sv-text-sm);
		color: var(--sv-color-danger);
	}
	.task-form :global(.task-form__failure) {
		padding: var(--sv-space-4);
	}
</style>
